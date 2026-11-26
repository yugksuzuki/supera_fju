-- Senha provisória: quem recebe uma senha do admin precisa trocá-la no primeiro acesso.
alter table public.responsaveis add column trocar_senha boolean not null default false;

-- Chamada pelo app depois que a pessoa troca a senha (ela não tem permissão de editar responsaveis).
create or replace function public.confirmar_troca_de_senha()
returns void language sql security definer set search_path = '' as $$
  update public.responsaveis set trocar_senha = false where user_id = (select auth.uid());
$$;
revoke execute on function public.confirmar_troca_de_senha() from public, anon;
grant execute on function public.confirmar_troca_de_senha() to authenticated;
