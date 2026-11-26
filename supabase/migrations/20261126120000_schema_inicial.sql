-- SUPERA · Acompanhamento de Jovens — esquema inicial
create extension if not exists citext with schema extensions;

-- Equipe: quem acompanha os jovens. Só entra no sistema quem estiver aqui com e-mail.
create table public.responsaveis (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null check (length(trim(nome)) > 0),
  email       extensions.citext unique,
  user_id     uuid unique references auth.users (id) on delete set null,
  papel       text not null default 'voluntario' check (papel in ('admin', 'voluntario')),
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);

create table public.aulas (
  id    smallint generated always as identity primary key,
  nome  text not null unique check (length(trim(nome)) > 0)
);

create table public.jovens (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null check (length(trim(nome)) > 0),
  responsavel_id  uuid references public.responsaveis (id) on delete set null,
  telefone        text,
  aula_original   text, -- texto como veio da planilha, para conferência
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now()
);
create index jovens_responsavel_idx on public.jovens (responsavel_id);

create table public.jovem_aulas (
  jovem_id  uuid not null references public.jovens (id) on delete cascade,
  aula_id   smallint not null references public.aulas (id) on delete cascade,
  primary key (jovem_id, aula_id)
);
create index jovem_aulas_aula_idx on public.jovem_aulas (aula_id);

-- Estado atual do acompanhamento (uma linha por jovem). null = ainda não respondido.
create table public.acompanhamentos (
  jovem_id        uuid primary key references public.jovens (id) on delete cascade,
  contato         text check (contato in ('sim', 'nao')),
  respondeu       text check (respondeu in ('sim', 'nao')),
  frequentando    text check (frequentando in ('sim', 'nao')),
  repassado       text check (repassado in ('sim', 'nao', 'na')),
  situacao        text check (situacao in ('finalizado', 'recontatar')),
  atualizado_por  uuid references public.responsaveis (id) on delete set null,
  atualizado_em   timestamptz not null default now()
);

-- Observações em linha do tempo: cada anotação tem autor e data.
create table public.notas (
  id         uuid primary key default gen_random_uuid(),
  jovem_id   uuid not null references public.jovens (id) on delete cascade,
  autor_id   uuid references public.responsaveis (id) on delete set null,
  texto      text not null check (length(trim(texto)) > 0),
  criado_em  timestamptz not null default now()
);
create index notas_jovem_idx on public.notas (jovem_id, criado_em desc);
create index notas_autor_idx on public.notas (autor_id);
create index acompanhamentos_atualizado_por_idx on public.acompanhamentos (atualizado_por);

-- ---------------------------------------------------------------- helpers
create schema if not exists privado;
grant usage on schema privado to authenticated, supabase_auth_admin;

create or replace function privado.meu_responsavel_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select id from public.responsaveis where user_id = (select auth.uid()) and ativo
$$;

create or replace function privado.sou_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.responsaveis
    where user_id = (select auth.uid()) and ativo and papel = 'admin'
  )
$$;

create or replace function privado.posso_ver_jovem(j uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select privado.sou_admin() or exists (
    select 1 from public.jovens
    where id = j and responsavel_id = privado.meu_responsavel_id()
  )
$$;

revoke execute on all functions in schema privado from public, anon;
grant execute on function privado.meu_responsavel_id(), privado.sou_admin(), privado.posso_ver_jovem(uuid) to authenticated;

-- Carimba autor e data em cada alteração de acompanhamento.
create or replace function privado.carimbar_acompanhamento()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.atualizado_por := coalesce(privado.meu_responsavel_id(), new.atualizado_por);
  new.atualizado_em := now();
  return new;
end $$;

create trigger acompanhamentos_carimbo
before insert or update on public.acompanhamentos
for each row execute function privado.carimbar_acompanhamento();

create or replace function privado.carimbar_nota()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.autor_id := coalesce(privado.meu_responsavel_id(), new.autor_id);
  return new;
end $$;

create trigger notas_carimbo
before insert on public.notas
for each row execute function privado.carimbar_nota();

-- Lista de convidados: um cadastro em auth.users só é aceito se o e-mail
-- estiver em responsaveis (ativo). Assim ninguém de fora cria conta.
create or replace function privado.vincular_usuario()
returns trigger language plpgsql security definer set search_path = '' as $$
declare r uuid;
begin
  select id into r from public.responsaveis
  where email = new.email::extensions.citext and ativo and user_id is null
  limit 1;
  if r is null then
    raise exception 'email_nao_cadastrado';
  end if;
  update public.responsaveis set user_id = new.id where id = r;
  return new;
end $$;

create trigger ao_criar_usuario
after insert on auth.users
for each row execute function privado.vincular_usuario();

-- Se o admin cadastra (ou corrige) o e-mail de alguém que já tem conta, vincula na hora.
create or replace function privado.vincular_por_email()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.email is distinct from old.email then
    new.user_id := null; -- e-mail trocado: a conta antiga deixa de valer
  end if;
  if new.email is not null and new.user_id is null then
    select u.id into new.user_id from auth.users u
    where u.email::extensions.citext = new.email
      and not exists (select 1 from public.responsaveis r where r.user_id = u.id and r.id <> new.id)
    limit 1;
  end if;
  return new;
end $$;

create trigger responsaveis_vincular
before insert or update of email on public.responsaveis
for each row execute function privado.vincular_por_email();

revoke execute on function privado.carimbar_acompanhamento(), privado.carimbar_nota(),
  privado.vincular_usuario(), privado.vincular_por_email() from public, anon, authenticated;

-- ---------------------------------------------------------------- RLS
alter table public.responsaveis    enable row level security;
alter table public.aulas           enable row level security;
alter table public.jovens          enable row level security;
alter table public.jovem_aulas     enable row level security;
alter table public.acompanhamentos enable row level security;
alter table public.notas           enable row level security;

-- responsaveis: admin vê todos; voluntário vê a si mesmo
create policy responsaveis_select on public.responsaveis for select to authenticated
  using (privado.sou_admin() or user_id = (select auth.uid()));
create policy responsaveis_admin_insert on public.responsaveis for insert to authenticated
  with check (privado.sou_admin());
create policy responsaveis_admin_update on public.responsaveis for update to authenticated
  using (privado.sou_admin()) with check (privado.sou_admin());
create policy responsaveis_admin_delete on public.responsaveis for delete to authenticated
  using (privado.sou_admin());

-- aulas: qualquer membro da equipe lê; admin edita
create policy aulas_select on public.aulas for select to authenticated
  using (privado.meu_responsavel_id() is not null);
create policy aulas_admin_insert on public.aulas for insert to authenticated
  with check (privado.sou_admin());
create policy aulas_admin_update on public.aulas for update to authenticated
  using (privado.sou_admin()) with check (privado.sou_admin());
create policy aulas_admin_delete on public.aulas for delete to authenticated
  using (privado.sou_admin());

-- jovens: cada um vê os seus; admin vê e edita todos
create policy jovens_select on public.jovens for select to authenticated
  using (privado.sou_admin() or responsavel_id = privado.meu_responsavel_id());
create policy jovens_admin_insert on public.jovens for insert to authenticated
  with check (privado.sou_admin());
create policy jovens_admin_update on public.jovens for update to authenticated
  using (privado.sou_admin()) with check (privado.sou_admin());
create policy jovens_admin_delete on public.jovens for delete to authenticated
  using (privado.sou_admin());

create policy jovem_aulas_select on public.jovem_aulas for select to authenticated
  using (privado.posso_ver_jovem(jovem_id));
create policy jovem_aulas_admin_insert on public.jovem_aulas for insert to authenticated
  with check (privado.sou_admin());
create policy jovem_aulas_admin_delete on public.jovem_aulas for delete to authenticated
  using (privado.sou_admin());

-- acompanhamentos: quem vê o jovem preenche
create policy acompanhamentos_select on public.acompanhamentos for select to authenticated
  using (privado.posso_ver_jovem(jovem_id));
create policy acompanhamentos_insert on public.acompanhamentos for insert to authenticated
  with check (privado.posso_ver_jovem(jovem_id));
create policy acompanhamentos_update on public.acompanhamentos for update to authenticated
  using (privado.posso_ver_jovem(jovem_id)) with check (privado.posso_ver_jovem(jovem_id));

-- notas: quem vê o jovem lê e escreve; só o autor (ou admin) apaga
create policy notas_select on public.notas for select to authenticated
  using (privado.posso_ver_jovem(jovem_id));
create policy notas_insert on public.notas for insert to authenticated
  with check (privado.posso_ver_jovem(jovem_id));
create policy notas_delete on public.notas for delete to authenticated
  using (privado.sou_admin() or autor_id = privado.meu_responsavel_id());

-- ---------------------------------------------------------------- view da lista
create view public.fichas with (security_invoker = true) as
select
  j.id,
  j.nome,
  j.telefone,
  j.ativo,
  j.responsavel_id,
  r.nome as responsavel_nome,
  coalesce(
    (select array_agg(a.nome order by a.nome)
       from public.jovem_aulas ja join public.aulas a on a.id = ja.aula_id
      where ja.jovem_id = j.id),
    '{}'
  ) as aulas,
  ac.contato, ac.respondeu, ac.frequentando, ac.repassado, ac.situacao,
  ac.atualizado_em,
  (select count(*) from public.notas n where n.jovem_id = j.id)::int as total_notas,
  case
    when ac.situacao = 'finalizado' then 'concluido'
    when coalesce(ac.contato, ac.respondeu, ac.frequentando, ac.repassado, ac.situacao) is not null
      or exists (select 1 from public.notas n where n.jovem_id = j.id) then 'andamento'
    else 'pendente'
  end as status
from public.jovens j
left join public.responsaveis r on r.id = j.responsavel_id
left join public.acompanhamentos ac on ac.jovem_id = j.id;

revoke all on public.fichas from anon;
grant select on public.fichas to authenticated;

-- tempo real para o painel
alter publication supabase_realtime add table public.acompanhamentos, public.notas;
