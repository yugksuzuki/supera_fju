import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Search, X, RefreshCw } from 'lucide-react';
import { useFichas } from '@/hooks/fichas';
import { useSessao } from '@/hooks/sessao';
import { Input, Select } from '@/components/ui/campos';
import { Button } from '@/components/ui/button';
import { Esqueleto } from '@/components/ui/esqueleto';
import { PontoStatus } from '@/components/ui/status';
import { FichaJovem } from '@/components/FichaJovem';
import { STATUS_ROTULO } from '@/lib/perguntas';
import type { Ficha, Status } from '@/lib/tipos';
import { cn, semAcento } from '@/lib/utils';

interface Filtros {
  q: string;
  resp: string;
  aula: string;
  status: '' | Status;
}

const CHAVE = 'supera.filtros.v1';
const lerFiltros = (): Filtros => {
  try {
    const f = JSON.parse(sessionStorage.getItem(CHAVE) || 'null');
    if (f && typeof f === 'object') return { q: '', resp: '', aula: '', status: '', ...f };
  } catch {
    /* sem armazenamento: segue com o padrão */
  }
  return { q: '', resp: '', aula: '', status: '' };
};

const STATUS_ORDEM: Status[] = ['pendente', 'andamento', 'concluido'];

export function Acompanhamento() {
  const { fichas, carregando, erro, recarregar } = useFichas();
  const { admin } = useSessao();
  const [, params] = useRoute<{ id: string }>('/jovem/:id');
  const [, navegar] = useLocation();
  const [filtros, setFiltrosBruto] = useState<Filtros>(lerFiltros);
  const busca = useDeferredValue(filtros.q);
  const idAtual = params?.id ?? null;

  const setFiltros = (patch: Partial<Filtros>) =>
    setFiltrosBruto((f) => {
      const novo = { ...f, ...patch };
      try {
        sessionStorage.setItem(CHAVE, JSON.stringify(novo));
      } catch {
        /* ignora */
      }
      return novo;
    });

  const ativos = useMemo(() => fichas.filter((f) => f.ativo), [fichas]);
  const responsaveis = useMemo(
    () => [...new Set(ativos.map((f) => f.responsavel_nome).filter(Boolean) as string[])].sort(),
    [ativos],
  );
  const aulas = useMemo(() => [...new Set(ativos.flatMap((f) => f.aulas))].sort(), [ativos]);

  // Filtro sem status, para os contadores de cada status refletirem os outros filtros.
  const base = useMemo(() => {
    const q = semAcento(busca.trim());
    return ativos.filter(
      (f) =>
        (!q || semAcento(f.nome).includes(q)) &&
        (!filtros.resp || f.responsavel_nome === filtros.resp) &&
        (!filtros.aula || f.aulas.includes(filtros.aula)),
    );
  }, [ativos, busca, filtros.resp, filtros.aula]);

  const contagem = useMemo(() => {
    const c: Record<Status, number> = { pendente: 0, andamento: 0, concluido: 0 };
    for (const f of base) c[f.status]++;
    return c;
  }, [base]);

  const visiveis = useMemo(
    () => (filtros.status ? base.filter((f) => f.status === filtros.status) : base),
    [base, filtros.status],
  );

  const atual = idAtual ? (fichas.find((f) => f.id === idAtual) ?? null) : null;
  // Anterior/próximo seguem a lista filtrada; se o jovem saiu do filtro, segue a lista completa.
  const ordem = atual && visiveis.some((f) => f.id === atual.id) ? visiveis : ativos;
  const pos = atual ? ordem.findIndex((f) => f.id === atual.id) : -1;
  const vizinho = (d: number) => (pos < 0 || !ordem.length ? null : ordem[(pos + d + ordem.length) % ordem.length]);
  const proximoPendente = visiveis.find((f) => f.status === 'pendente') ?? visiveis[0];
  const temFiltro = Boolean(filtros.q || filtros.resp || filtros.aula || filtros.status);

  return (
    <main className="mx-auto grid max-w-[1240px] items-start gap-4 px-0 pb-6 md:grid-cols-[376px_minmax(0,1fr)] md:gap-5 md:px-6 md:pt-5">
      <section
        aria-label="Lista de jovens"
        className={cn(
          'flex flex-col bg-surface md:sticky md:top-4 md:max-h-[calc(100dvh-2rem)] md:rounded-2xl md:border md:border-line md:shadow-1',
          idAtual ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="space-y-2.5 border-b border-line p-3.5">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-2"
            />
            <Input
              type="search"
              aria-label="Buscar jovem pelo nome"
              placeholder="Buscar jovem pelo nome…"
              value={filtros.q}
              onChange={(e) => setFiltros({ q: e.target.value })}
              className="pl-10"
            />
          </div>
          <div className={cn('grid gap-2', admin && responsaveis.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
            {admin && responsaveis.length > 1 ? (
              <Select
                aria-label="Filtrar por responsável"
                value={filtros.resp}
                onChange={(e) => setFiltros({ resp: e.target.value })}
              >
                <option value="">Responsáveis</option>
                {responsaveis.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            ) : null}
            <Select
              aria-label="Filtrar por aula"
              value={filtros.aula}
              onChange={(e) => setFiltros({ aula: e.target.value })}
            >
              <option value="">Aulas</option>
              {aulas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </Select>
          </div>
          <div role="group" aria-label="Filtrar por situação" className="flex flex-wrap gap-1.5">
            {STATUS_ORDEM.map((s) => {
              const on = filtros.status === s;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFiltros({ status: on ? '' : s })}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-semibold transition-colors duration-150',
                    on
                      ? 'border-brand-600 bg-tint text-tint-ink'
                      : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink',
                  )}
                >
                  <PontoStatus status={s} className="size-2" />
                  {STATUS_ROTULO[s]}
                  <span className="tabular font-medium opacity-80">{contagem[s]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between px-3.5 pb-1 pt-2.5 text-[12.5px] text-ink-2">
          <span className="tabular" aria-live="polite">
            {carregando ? 'Carregando…' : `${visiveis.length} ${visiveis.length === 1 ? 'jovem' : 'jovens'}`}
          </span>
          {temFiltro ? (
            <button
              type="button"
              onClick={() => setFiltros({ q: '', resp: '', aula: '', status: '' })}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-tint-ink hover:bg-tint"
            >
              <X className="size-3.5" /> Limpar filtros
            </button>
          ) : null}
        </div>

        <ul className="flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 pb-3">
          {carregando ? (
            Array.from({ length: 9 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-2.5 py-2.5">
                <Esqueleto className="size-2.5 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Esqueleto className="h-3.5 w-2/3" />
                  <Esqueleto className="h-3 w-1/3" />
                </div>
              </li>
            ))
          ) : erro ? (
            <li className="px-3 py-8 text-center text-sm text-ink-2">
              <p>{erro}</p>
              <Button variante="contorno" tamanho="sm" className="mt-3" onClick={recarregar}>
                <RefreshCw /> Tentar de novo
              </Button>
            </li>
          ) : visiveis.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-ink-2">
              {ativos.length === 0
                ? 'Nenhum jovem foi atribuído a você ainda. Fale com a coordenação.'
                : 'Nenhum jovem com esses filtros.'}
            </li>
          ) : (
            visiveis.map((f) => (
              <ItemLista
                key={f.id}
                ficha={f}
                mostrarResp={admin}
                ativo={f.id === idAtual}
                onAbrir={() => navegar(`/jovem/${f.id}`)}
              />
            ))
          )}
        </ul>
      </section>

      <section aria-label="Ficha do jovem" className={cn('min-w-0', idAtual ? 'block' : 'hidden md:block')}>
        {atual ? (
          <FichaJovem
            key={atual.id}
            ficha={atual}
            posicao={pos >= 0 ? { atual: pos + 1, total: ordem.length } : null}
            anterior={vizinho(-1)}
            proximo={vizinho(1)}
          />
        ) : idAtual && !carregando ? (
          <Vazio titulo="Jovem não encontrado" texto="Ele pode ter sido removido ou não estar na sua lista.">
            <Button variante="contorno" onClick={() => navegar('/')}>
              Voltar para a lista
            </Button>
          </Vazio>
        ) : carregando ? (
          <Esqueleto className="h-[70vh] rounded-2xl" />
        ) : (
          <Vazio
            titulo="Escolha um jovem na lista"
            texto="Marque as respostas conforme for conversando com ele. Tudo é salvo na hora, e a coordenação vê o andamento ao vivo."
          >
            {proximoPendente ? (
              <Button onClick={() => navegar(`/jovem/${proximoPendente.id}`)}>
                Começar por {proximoPendente.nome.split(' ')[0]}
              </Button>
            ) : null}
          </Vazio>
        )}
      </section>
    </main>
  );
}

function ItemLista({
  ficha,
  ativo,
  mostrarResp,
  onAbrir,
}: {
  ficha: Ficha;
  ativo: boolean;
  mostrarResp: boolean;
  onAbrir: () => void;
}) {
  return (
    <li className="cv-auto">
      <button
        type="button"
        onClick={onAbrir}
        aria-current={ativo ? 'true' : undefined}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-150',
          ativo ? 'border-brand-600 bg-tint' : 'border-transparent hover:bg-surface-2',
        )}
      >
        <PontoStatus status={ficha.status} />
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-[14.5px] font-semibold', ativo ? 'text-tint-ink' : 'text-ink')}>
            {ficha.nome}
          </span>
          <span className="flex min-w-0 gap-2.5 text-[12.5px] text-ink-2">
            <span className="truncate">{ficha.aulas.join(', ') || 'Sem aula'}</span>
            {mostrarResp && ficha.responsavel_nome ? (
              <span className="shrink-0 text-ink-2/80">
                {ficha.responsavel_nome
                  .replace(/^Obr\.?\s+/, 'Obr ')
                  .split(' ')
                  .slice(0, 2)
                  .join(' ')}
              </span>
            ) : null}
          </span>
        </span>
        {ficha.total_notas > 0 ? (
          <span
            className="tabular shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11.5px] font-semibold text-ink-2"
            title="Anotações"
          >
            {ficha.total_notas}
          </span>
        ) : null}
      </button>
    </li>
  );
}

function Vazio({ titulo, texto, children }: { titulo: string; texto: string; children?: ReactNode }) {
  return (
    <div className="grid min-h-[60vh] place-items-center rounded-2xl border border-dashed border-line-strong bg-surface/60 p-8 text-center">
      <div className="max-w-[40ch]">
        <h2 className="text-lg font-bold">{titulo}</h2>
        <p className="mt-1.5 text-sm text-ink-2">{texto}</p>
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </div>
  );
}
