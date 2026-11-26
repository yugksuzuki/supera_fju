import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Loader2, X, ShieldCheck, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useFichas } from '@/hooks/fichas';
import { useSessao } from '@/hooks/sessao';
import type { Papel, Responsavel } from '@/lib/tipos';
import { Button } from '@/components/ui/button';
import { Input, Rotulo, Select } from '@/components/ui/campos';
import { cn } from '@/lib/utils';

interface Rascunho {
  id: string | null;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  senha: string;
}

export default function Equipe() {
  const { perfil } = useSessao();
  const { fichas, recarregar } = useFichas();
  const [equipe, setEquipe] = useState<Responsavel[] | null>(null);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from('responsaveis').select('id, nome, email, user_id, papel, ativo').order('nome');
    setEquipe((data as Responsavel[]) ?? []);
  }, []);
  useEffect(() => {
    carregar();
  }, [carregar]);

  const jovensPor = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of fichas)
      if (f.ativo && f.responsavel_id) m.set(f.responsavel_id, (m.get(f.responsavel_id) ?? 0) + 1);
    return m;
  }, [fichas]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!rascunho) return;
    const eu = rascunho.id === perfil?.id;
    if (eu && (rascunho.papel !== 'admin' || !rascunho.ativo)) {
      return toast.error('Você não pode tirar o seu próprio acesso de admin. Peça a outro admin.');
    }
    const senha = rascunho.senha;
    if (senha && senha.length < 8) return toast.error('A senha precisa ter pelo menos 8 caracteres.');
    if (senha && !rascunho.email.trim()) return toast.error('Para criar a senha, preencha o e-mail.');
    setSalvando(true);
    const dados = {
      nome: rascunho.nome.trim(),
      email: rascunho.email.trim().toLowerCase() || null,
      papel: rascunho.papel,
      ativo: rascunho.ativo,
    };
    const { data: salvo, error } = rascunho.id
      ? await supabase.from('responsaveis').update(dados).eq('id', rascunho.id).select('id').single()
      : await supabase.from('responsaveis').insert(dados).select('id').single();
    if (error || !salvo) {
      setSalvando(false);
      return toast.error(error?.code === '23505' ? 'Esse e-mail já está na equipe.' : 'Não foi possível salvar.');
    }
    if (senha) {
      const { error: erroSenha } = await supabase.functions.invoke('acessos', {
        body: { responsavel_id: salvo.id, senha },
      });
      if (erroSenha) {
        setSalvando(false);
        carregar();
        return toast.error('O cadastro foi salvo, mas a senha não. Abra a pessoa e tente definir a senha de novo.');
      }
    }
    setSalvando(false);
    toast.success(
      senha
        ? `Senha de ${dados.nome.split(' ')[0]} definida. Copie o convite e mande junto com a senha.`
        : rascunho.id
          ? 'Cadastro atualizado.'
          : `${dados.nome} foi adicionado à equipe. Defina uma senha para liberar o acesso.`,
    );
    setRascunho(null);
    carregar();
    recarregar();
  }

  const convite = (r: Responsavel) =>
    `Olá, ${r.nome.split(' ')[0]}! Você já pode registrar o acompanhamento dos jovens do SUPERA em ${window.location.origin}. Entre com o e-mail ${r.email} e a senha que eu te passei. Depois, se quiser, troque a senha clicando no seu nome lá em cima.`;

  return (
    <main className="mx-auto grid max-w-[1240px] items-start gap-5 px-4 py-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-2xl border border-line bg-surface shadow-1">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 md:px-5">
          <div className="mr-auto">
            <h1 className="text-xl font-bold">Equipe</h1>
            <p className="mt-0.5 text-sm text-ink-2">Só entra no sistema quem está aqui, ativo, com e-mail e senha.</p>
          </div>
          <Button
            onClick={() => setRascunho({ id: null, nome: '', email: '', papel: 'voluntario', ativo: true, senha: '' })}
          >
            <Plus /> Adicionar pessoa
          </Button>
        </div>
        <ul className="divide-y divide-line">
          {(equipe ?? []).map((r) => (
            <li
              key={r.id}
              className={cn(
                'flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 md:px-5',
                !r.ativo && 'opacity-60',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {r.nome}
                  {r.papel === 'admin' ? (
                    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-tint px-2 text-[11.5px] font-semibold text-tint-ink">
                      <ShieldCheck className="size-3.5" aria-hidden /> Admin
                    </span>
                  ) : null}
                  {!r.ativo ? <span className="text-xs font-normal text-ink-2">(sem acesso)</span> : null}
                </p>
                <p className="flex flex-wrap gap-x-3 text-[13px] text-ink-2">
                  <span className="truncate">{r.email ?? 'Sem e-mail: ainda não consegue entrar'}</span>
                  <span className="tabular">{jovensPor.get(r.id) ?? 0} jovens</span>
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold',
                  r.user_id ? 'bg-ok-tint text-ok' : 'bg-surface-2 text-ink-2',
                )}
              >
                {r.user_id ? 'Com acesso' : 'Sem senha'}
              </span>
              <div className="flex gap-1.5">
                {r.email && r.user_id && r.ativo && r.id !== perfil?.id ? (
                  <Button
                    variante="fantasma"
                    tamanho="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(convite(r)).then(
                        () => toast.success('Convite copiado. Cole no WhatsApp da pessoa.'),
                        () => toast.error('Não foi possível copiar.'),
                      )
                    }
                  >
                    <Copy /> Convite
                  </Button>
                ) : null}
                <Button
                  variante="contorno"
                  tamanho="sm"
                  onClick={() =>
                    setRascunho({
                      id: r.id,
                      nome: r.nome,
                      email: r.email ?? '',
                      papel: r.papel,
                      ativo: r.ativo,
                      senha: '',
                    })
                  }
                >
                  Editar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className={cn('lg:sticky lg:top-4', rascunho ? 'order-first lg:order-none' : 'hidden lg:block')}>
        {rascunho ? (
          <form onSubmit={salvar} className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">{rascunho.id ? 'Editar pessoa' : 'Adicionar pessoa'}</h2>
              <Button variante="fantasma" tamanho="icone" aria-label="Fechar" onClick={() => setRascunho(null)}>
                <X />
              </Button>
            </div>
            <div>
              <Rotulo htmlFor="e-nome">Nome</Rotulo>
              <Input
                id="e-nome"
                required
                autoFocus
                value={rascunho.nome}
                onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
              />
            </div>
            <div>
              <Rotulo htmlFor="e-email" dica="(é o login da pessoa)">
                E-mail
              </Rotulo>
              <Input
                id="e-email"
                type="email"
                inputMode="email"
                autoComplete="off"
                spellCheck={false}
                value={rascunho.email}
                onChange={(e) => setRascunho({ ...rascunho, email: e.target.value })}
              />
            </div>
            <div>
              <Rotulo
                htmlFor="e-senha"
                dica={rascunho.id ? '(deixe vazio para manter a atual)' : '(mínimo 8 caracteres)'}
              >
                {rascunho.id ? 'Nova senha' : 'Senha'}
              </Rotulo>
              <Input
                id="e-senha"
                type="text"
                autoComplete="new-password"
                spellCheck={false}
                value={rascunho.senha}
                onChange={(e) => setRascunho({ ...rascunho, senha: e.target.value })}
              />
            </div>
            <div>
              <Rotulo htmlFor="e-papel">Acesso</Rotulo>
              <Select
                id="e-papel"
                value={rascunho.papel}
                onChange={(e) => setRascunho({ ...rascunho, papel: e.target.value as Papel })}
              >
                <option value="voluntario">Voluntário: vê só os próprios jovens</option>
                <option value="admin">Admin: vê todos e cuida dos cadastros</option>
              </Select>
            </div>
            {rascunho.id ? (
              <label className="flex items-start gap-2.5 rounded-xl bg-surface-2 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={!rascunho.ativo}
                  onChange={(e) => setRascunho({ ...rascunho, ativo: !e.target.checked })}
                  className="mt-0.5 size-4 accent-brand-600"
                />
                <span>
                  <span className="font-semibold">Bloquear acesso</span>
                  <span className="block text-ink-2">A pessoa não entra mais. O que ela registrou continua salvo.</span>
                </span>
              </label>
            ) : null}
            <Button type="submit" className="w-full" disabled={salvando || !rascunho.nome.trim()}>
              {salvando ? <Loader2 className="animate-spin" /> : null}
              {rascunho.id ? 'Salvar alterações' : 'Adicionar à equipe'}
            </Button>
          </form>
        ) : (
          <div className="space-y-2 rounded-2xl border border-dashed border-line-strong p-6 text-sm text-ink-2">
            <p>
              Para liberar alguém: adicione a pessoa com o e-mail e uma senha, depois copie o convite e mande no
              WhatsApp junto com a senha. Ela pode trocar a senha depois, clicando no próprio nome.
            </p>
            <p>Para passar jovens de uma pessoa para outra, use a aba Jovens.</p>
          </div>
        )}
      </aside>
    </main>
  );
}
