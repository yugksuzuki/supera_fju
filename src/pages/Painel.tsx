import { useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useFichas } from '@/hooks/fichas';
import { supabase } from '@/lib/supabase';
import { baixar, fichasParaCsv } from '@/lib/csv';
import { STATUS_ROTULO } from '@/lib/perguntas';
import type { Ficha, Status } from '@/lib/tipos';
import { Button } from '@/components/ui/button';
import { PontoStatus } from '@/components/ui/status';
import { cn, relativo } from '@/lib/utils';
import { gsap, useGSAP, semMovimento } from '@/lib/movimento';

const ORDEM: Status[] = ['concluido', 'andamento', 'pendente'];
const BARRA: Record<Status, string> = { concluido: 'bg-ok', andamento: 'bg-warn-dot', pendente: 'bg-idle' };

type Contagem = Record<Status, number> & { total: number };
const contar = (lista: Ficha[]): Contagem => {
  const c = { pendente: 0, andamento: 0, concluido: 0, total: lista.length };
  for (const f of lista) c[f.status]++;
  return c;
};

export default function Painel() {
  const { fichas, carregando } = useFichas();
  const [exportando, setExportando] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Ao abrir o painel, as barras crescem da esquerda: mostra o tamanho de cada grupo.
  useGSAP(
    () => {
      if (semMovimento() || carregando) return;
      gsap.from('[data-barra]', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.9,
        stagger: 0.035,
        ease: 'expo.out',
        clearProps: 'transform',
      });
    },
    { scope: ref, dependencies: [carregando] },
  );
  const ativos = useMemo(() => fichas.filter((f) => f.ativo), [fichas]);
  const geral = useMemo(() => contar(ativos), [ativos]);

  const porResp = useMemo(() => agrupar(ativos, (f) => [f.responsavel_nome ?? 'Sem responsável']), [ativos]);
  const porAula = useMemo(() => agrupar(ativos, (f) => (f.aulas.length ? f.aulas : ['Sem aula'])), [ativos]);

  const atencao = useMemo(
    () =>
      ativos
        .filter(
          (f) =>
            f.situacao !== 'finalizado' &&
            (f.situacao === 'recontatar' || f.respondeu === 'nao' || f.frequentando === 'nao'),
        )
        .sort((a, b) => (a.atualizado_em ?? '').localeCompare(b.atualizado_em ?? '')),
    [ativos],
  );

  async function exportar() {
    setExportando(true);
    const { data, error } = await supabase
      .from('notas')
      .select('jovem_id, texto, criado_em')
      .order('criado_em', { ascending: true });
    setExportando(false);
    if (error) return toast.error('Não foi possível gerar a planilha agora.');
    const notas = new Map<string, string>();
    for (const n of data ?? []) {
      const linha = `${new Date(n.criado_em).toLocaleDateString('pt-BR')}: ${n.texto}`;
      notas.set(n.jovem_id, notas.has(n.jovem_id) ? `${notas.get(n.jovem_id)}\n${linha}` : linha);
    }
    const hoje = new Date().toISOString().slice(0, 10).split('-').reverse().join('');
    baixar(`JOVENS_SUPERA_ACOMPANHAMENTO_${hoje}.csv`, fichasParaCsv(ativos, notas), 'text/csv;charset=utf-8');
  }

  return (
    <main ref={ref} className="mx-auto max-w-[1240px] space-y-5 px-4 py-5 md:px-6">
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-1 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Andamento geral</h1>
            <p className="mt-0.5 text-sm text-ink-2">
              <span className="tabular">{geral.total}</span> jovens ativos. Atualiza sozinho quando a equipe marca algo.
            </p>
          </div>
          <Button variante="contorno" onClick={exportar} disabled={exportando || carregando}>
            {exportando ? <Loader2 className="animate-spin" /> : <Download />}
            Baixar planilha (CSV)
          </Button>
        </div>
        <BarraEmpilhada c={geral} className="mt-5 h-3.5" />
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
          {ORDEM.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <PontoStatus status={s} />
              <span className="text-ink-2">{STATUS_ROTULO[s]}</span>
              <span className="tabular font-semibold">{geral[s]}</span>
              <span className="tabular text-ink-2">({pct(geral[s], geral.total)}%)</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Tabela titulo="Por responsável" linhas={porResp} />
        <Tabela titulo="Por aula" linhas={porAula} />
      </div>

      <section className="rounded-2xl border border-line bg-surface shadow-1">
        <div className="border-b border-line px-5 py-4 md:px-6">
          <h2 className="text-base font-bold">Precisam de atenção</h2>
          <p className="mt-0.5 text-sm text-ink-2">
            Não responderam, não estão frequentando ou ficaram para novo contato.
          </p>
        </div>
        {atencao.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-2 md:px-6">Ninguém nessa situação agora.</p>
        ) : (
          <ul className="divide-y divide-line">
            {atencao.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/jovem/${f.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 transition-colors hover:bg-surface-2 md:px-6"
                >
                  <span className="min-w-[12ch] flex-1 font-semibold">{f.nome}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {f.respondeu === 'nao' ? <Etiqueta>Não respondeu</Etiqueta> : null}
                    {f.frequentando === 'nao' ? <Etiqueta>Não está frequentando</Etiqueta> : null}
                    {f.situacao === 'recontatar' ? <Etiqueta tom="aviso">Novo contato</Etiqueta> : null}
                  </span>
                  <span className="w-full text-[12.5px] text-ink-2 sm:w-auto">
                    {f.responsavel_nome}
                    {f.atualizado_em ? ` · ${relativo(f.atualizado_em)}` : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function agrupar(lista: Ficha[], chaves: (f: Ficha) => string[]) {
  const m = new Map<string, Ficha[]>();
  for (const f of lista) for (const k of chaves(f)) m.set(k, [...(m.get(k) ?? []), f]);
  return [...m.entries()].map(([nome, l]) => ({ nome, c: contar(l) })).sort((a, b) => b.c.total - a.c.total);
}

const pct = (n: number, t: number) => (t ? Math.round((n / t) * 100) : 0);

function BarraEmpilhada({ c, className }: { c: Contagem; className?: string }) {
  return (
    <div
      data-barra
      className={cn('flex overflow-hidden rounded-full bg-surface-2', className)}
      role="img"
      aria-label={ORDEM.map((s) => `${STATUS_ROTULO[s]}: ${c[s]}`).join(', ')}
    >
      {ORDEM.map((s) =>
        c[s] ? (
          <div
            key={s}
            className={cn('h-full transition-[width] duration-500 ease-out', BARRA[s])}
            style={{ width: `${(c[s] / c.total) * 100}%` }}
          />
        ) : null,
      )}
    </div>
  );
}

function Tabela({ titulo, linhas }: { titulo: string; linhas: { nome: string; c: Contagem }[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-1">
      <h2 className="border-b border-line px-5 py-4 text-base font-bold md:px-6">{titulo}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[12px] text-ink-2">
              <th scope="col" className="px-5 py-2.5 font-semibold md:pl-6">
                Nome
              </th>
              <th scope="col" className="w-[38%] px-2 py-2.5 font-semibold">
                Andamento
              </th>
              <th scope="col" className="px-2 py-2.5 text-right font-semibold" title="Concluídos">
                Concl.
              </th>
              <th scope="col" className="px-5 py-2.5 text-right font-semibold md:pr-6">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="tabular">
            {linhas.map(({ nome, c }) => (
              <tr key={nome} className="border-t border-line">
                <th scope="row" className="max-w-[22ch] truncate px-5 py-3 text-left font-semibold md:pl-6">
                  {nome}
                </th>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2.5">
                    <BarraEmpilhada c={c} className="h-2 flex-1" />
                    <span className="w-9 text-right text-[12.5px] text-ink-2">
                      {pct(c.total - c.pendente, c.total)}%
                    </span>
                  </div>
                </td>
                <td className="px-2 py-3 text-right">{c.concluido}</td>
                <td className="px-5 py-3 text-right text-ink-2 md:pr-6">{c.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Etiqueta({ children, tom = 'nao' }: { children: string; tom?: 'nao' | 'aviso' }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2 text-[11.5px] font-semibold',
        tom === 'aviso' ? 'bg-warn-tint text-warn' : 'bg-tint text-tint-ink',
      )}
    >
      {children}
    </span>
  );
}
