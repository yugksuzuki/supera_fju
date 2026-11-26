import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useFichas } from '@/hooks/fichas';
import type { Aula, Ficha, Responsavel } from '@/lib/tipos';
import { Button } from '@/components/ui/button';
import { Input, Rotulo, Select } from '@/components/ui/campos';
import { PontoStatus } from '@/components/ui/status';
import { cn, semAcento } from '@/lib/utils';

interface Rascunho {
  id: string | null;
  nome: string;
  telefone: string;
  responsavel_id: string;
  aulas: number[];
  ativo: boolean;
}

const vazio: Rascunho = { id: null, nome: '', telefone: '', responsavel_id: '', aulas: [], ativo: true };

export default function Jovens() {
  const { fichas, recarregar } = useFichas();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [equipe, setEquipe] = useState<Responsavel[]>([]);
  const [q, setQ] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [novaAula, setNovaAula] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('aulas').select('id, nome').order('nome'),
      supabase.from('responsaveis').select('id, nome, email, user_id, papel, ativo, trocar_senha').order('nome'),
    ]).then(([a, r]) => {
      setAulas((a.data as Aula[]) ?? []);
      setEquipe((r.data as Responsavel[]) ?? []);
    });
  }, []);

  const lista = useMemo(() => {
    const t = semAcento(q.trim());
    return fichas.filter((f) => (mostrarInativos || f.ativo) && (!t || semAcento(f.nome).includes(t)));
  }, [fichas, q, mostrarInativos]);

  const abrir = (f: Ficha) =>
    setRascunho({
      id: f.id,
      nome: f.nome,
      telefone: f.telefone ?? '',
      responsavel_id: f.responsavel_id ?? '',
      aulas: aulas.filter((a) => f.aulas.includes(a.nome)).map((a) => a.id),
      ativo: f.ativo,
    });

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!rascunho || !rascunho.nome.trim()) return;
    setSalvando(true);
    const dados = {
      nome: rascunho.nome.trim(),
      telefone: rascunho.telefone.trim() || null,
      responsavel_id: rascunho.responsavel_id || null,
      ativo: rascunho.ativo,
    };
    const res = rascunho.id
      ? await supabase.from('jovens').update(dados).eq('id', rascunho.id).select('id').single()
      : await supabase.from('jovens').insert(dados).select('id').single();
    if (res.error || !res.data) {
      setSalvando(false);
      return toast.error('Não foi possível salvar o jovem.');
    }
    const id = res.data.id as string;
    const del = await supabase.from('jovem_aulas').delete().eq('jovem_id', id);
    const ins = rascunho.aulas.length
      ? await supabase.from('jovem_aulas').insert(rascunho.aulas.map((aula_id) => ({ jovem_id: id, aula_id })))
      : { error: null };
    setSalvando(false);
    if (del.error || ins.error) toast.error('O jovem foi salvo, mas as aulas não. Abra e salve de novo.');
    else toast.success(rascunho.id ? 'Dados atualizados.' : 'Jovem cadastrado.');
    setRascunho(null);
    recarregar();
  }

  async function criarAula() {
    const nome = novaAula.trim();
    if (!nome) return;
    const { data, error } = await supabase.from('aulas').insert({ nome }).select('id, nome').single();
    if (error || !data)
      return toast.error(error?.code === '23505' ? 'Essa aula já existe.' : 'Não foi possível criar a aula.');
    setAulas((a) => [...a, data as Aula].sort((x, y) => x.nome.localeCompare(y.nome)));
    setRascunho((r) => (r ? { ...r, aulas: [...r.aulas, (data as Aula).id] } : r));
    setNovaAula('');
  }

  return (
    <main className="mx-auto grid max-w-[1240px] items-start gap-5 px-4 py-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <section className="rounded-2xl border border-line bg-surface shadow-1">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 md:px-5">
          <h1 className="mr-auto text-xl font-bold">Jovens</h1>
          <Button onClick={() => setRascunho({ ...vazio })}>
            <Plus /> Novo jovem
          </Button>
          <div className="relative w-full">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-2"
            />
            <Input
              type="search"
              aria-label="Buscar"
              placeholder="Buscar pelo nome…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={mostrarInativos}
              onChange={(e) => setMostrarInativos(e.target.checked)}
              className="size-4 accent-brand-600"
            />
            Mostrar quem saiu do acompanhamento
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[12px] text-ink-2">
                <th scope="col" className="px-4 py-2.5 font-semibold md:pl-5">
                  Nome
                </th>
                <th scope="col" className="px-2 py-2.5 font-semibold">
                  Aulas
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold md:pr-5">
                  Responsável
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((f) => (
                <tr
                  key={f.id}
                  className={cn(
                    'cv-auto cursor-pointer border-t border-line transition-colors hover:bg-surface-2',
                    rascunho?.id === f.id && 'bg-tint hover:bg-tint',
                    !f.ativo && 'text-ink-2',
                  )}
                  onClick={() => abrir(f)}
                >
                  <th scope="row" className="px-4 py-2.5 text-left font-semibold md:pl-5">
                    <button type="button" className="flex items-center gap-2.5 text-left" onClick={() => abrir(f)}>
                      <PontoStatus status={f.status} />
                      {f.nome}
                      {!f.ativo ? <span className="text-xs font-normal">(inativo)</span> : null}
                    </button>
                  </th>
                  <td className="px-2 py-2.5 text-ink-2">{f.aulas.join(', ') || '—'}</td>
                  <td className="px-4 py-2.5 text-ink-2 md:pr-5">{f.responsavel_nome ?? 'Sem responsável'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {lista.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-2">Nenhum jovem encontrado.</p>
          ) : null}
        </div>
      </section>

      <aside className={cn('lg:sticky lg:top-4', rascunho ? 'order-first lg:order-none' : 'hidden lg:block')}>
        {rascunho ? (
          <form onSubmit={salvar} className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">{rascunho.id ? 'Editar jovem' : 'Novo jovem'}</h2>
              <Button variante="fantasma" tamanho="icone" aria-label="Fechar" onClick={() => setRascunho(null)}>
                <X />
              </Button>
            </div>
            <div>
              <Rotulo htmlFor="j-nome">Nome</Rotulo>
              <Input
                id="j-nome"
                required
                autoFocus
                value={rascunho.nome}
                onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
              />
            </div>
            <div>
              <Rotulo htmlFor="j-tel" dica="(com DDD, para abrir o WhatsApp)">
                Telefone
              </Rotulo>
              <Input
                id="j-tel"
                type="tel"
                inputMode="tel"
                placeholder="(11) 91234-5678"
                value={rascunho.telefone}
                onChange={(e) => setRascunho({ ...rascunho, telefone: e.target.value })}
              />
            </div>
            <div>
              <Rotulo htmlFor="j-resp">Responsável</Rotulo>
              <Select
                id="j-resp"
                value={rascunho.responsavel_id}
                onChange={(e) => setRascunho({ ...rascunho, responsavel_id: e.target.value })}
              >
                <option value="">Sem responsável</option>
                {equipe
                  .filter((r) => r.ativo || r.id === rascunho.responsavel_id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nome}
                    </option>
                  ))}
              </Select>
            </div>
            <fieldset>
              <legend className="mb-1.5 text-[13px] font-semibold">Aulas</legend>
              <div className="flex flex-wrap gap-1.5">
                {aulas.map((a) => {
                  const on = rascunho.aulas.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setRascunho({
                          ...rascunho,
                          aulas: on ? rascunho.aulas.filter((x) => x !== a.id) : [...rascunho.aulas, a.id],
                        })
                      }
                      className={cn(
                        'h-8 rounded-full border px-3 text-[13px] font-semibold transition-colors',
                        on
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-line-strong text-ink hover:border-brand-600',
                      )}
                    >
                      {a.nome}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2.5 flex gap-2">
                <Input
                  aria-label="Nova aula"
                  placeholder="Outra aula…"
                  value={novaAula}
                  onChange={(e) => setNovaAula(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      criarAula();
                    }
                  }}
                  className="h-9 text-sm"
                />
                <Button variante="suave" tamanho="sm" onClick={criarAula} disabled={!novaAula.trim()}>
                  Criar
                </Button>
              </div>
            </fieldset>
            {rascunho.id ? (
              <label className="flex items-start gap-2.5 rounded-xl bg-surface-2 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={!rascunho.ativo}
                  onChange={(e) => setRascunho({ ...rascunho, ativo: !e.target.checked })}
                  className="mt-0.5 size-4 accent-brand-600"
                />
                <span>
                  <span className="font-semibold">Tirar do acompanhamento</span>
                  <span className="block text-ink-2">Some da lista da equipe, mas o histórico fica guardado.</span>
                </span>
              </label>
            ) : null}
            <Button type="submit" className="w-full" disabled={salvando || !rascunho.nome.trim()}>
              {salvando ? <Loader2 className="animate-spin" /> : null}
              {rascunho.id ? 'Salvar alterações' : 'Cadastrar jovem'}
            </Button>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-line-strong p-6 text-sm text-ink-2">
            Clique em um jovem para corrigir o nome, colocar o telefone, trocar o responsável ou as aulas.
          </div>
        )}
      </aside>
    </main>
  );
}
