import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Minus,
  Flag,
  RotateCcw,
  MessageCircle,
  Trash2,
  Loader2,
  BookOpen,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useFichas } from '@/hooks/fichas';
import { useSessao } from '@/hooks/sessao';
import { PERGUNTAS, type Opcao, type Pergunta } from '@/lib/perguntas';
import type { Ficha, Nota } from '@/lib/tipos';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/campos';
import { SeloStatus } from '@/components/ui/status';
import { Esqueleto } from '@/components/ui/esqueleto';
import { cn, dataHora, iniciais, relativo, telefoneWhats } from '@/lib/utils';
import { gsap, useGSAP, semMovimento, definirDirecao, consumirDirecao } from '@/lib/movimento';

interface Props {
  ficha: Ficha;
  posicao: { atual: number; total: number } | null;
  anterior: Ficha | null;
  proximo: Ficha | null;
}

export function FichaJovem({ ficha, posicao, anterior, proximo }: Props) {
  const { responder } = useFichas();
  const [, navegar] = useLocation();
  const whats = telefoneWhats(ficha.telefone);
  const ref = useRef<HTMLElement>(null);
  const irPara = (f: Ficha | null, d: -1 | 1) => {
    if (!f) return;
    definirDirecao(d);
    navegar(`/jovem/${f.id}`);
  };

  // Anterior/próximo desliza na direção do botão; vindo da lista, só aparece
  // (no celular entra pela direita, porque a lista fica "atrás").
  useGSAP(
    () => {
      if (semMovimento()) return;
      const d = consumirDirecao();
      const celular = window.matchMedia('(max-width: 767px)').matches;
      const dx = d !== 0 ? d * 28 : celular ? 36 : 0;
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, x: dx },
        { autoAlpha: 1, x: 0, duration: 0.36, clearProps: 'transform' },
      );
      if (d === 0) {
        gsap.from('[data-linha]', {
          autoAlpha: 0,
          y: 8,
          duration: 0.4,
          stagger: 0.035,
          delay: 0.05,
          clearProps: 'transform',
        });
      }
    },
    { scope: ref },
  );

  // Atalhos: Alt+← / Alt+→ trocam de jovem sem tirar a mão do teclado.
  useEffect(() => {
    const tecla = (e: globalThis.KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === 'ArrowLeft') irPara(anterior, -1);
      if (e.key === 'ArrowRight') irPara(proximo, 1);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [anterior, proximo, navegar]);

  return (
    <article ref={ref} className="bg-surface md:rounded-2xl md:border md:border-line md:shadow-1">
      <div className="flex items-center gap-2 border-b border-line px-2 py-2 md:hidden">
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          <ArrowLeft className="size-[18px]" /> Lista
        </Link>
        {posicao ? (
          <span className="tabular ml-auto pr-2 text-[12.5px] text-ink-2">
            {posicao.atual} de {posicao.total}
          </span>
        ) : null}
      </div>

      <header className="flex flex-wrap items-start gap-4 px-4 pb-4 pt-5 md:px-7 md:pt-7">
        <div
          aria-hidden
          className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-600 text-lg font-bold text-white shadow-1"
        >
          {iniciais(ficha.nome)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[22px] font-bold leading-tight md:text-2xl">{ficha.nome}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ficha.aulas.map((a) => (
              <span
                key={a}
                className="inline-flex h-7 items-center gap-1.5 rounded-full bg-tint px-2.5 text-xs font-semibold text-tint-ink"
              >
                <BookOpen className="size-3.5" aria-hidden />
                {a}
              </span>
            ))}
            {ficha.responsavel_nome ? (
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 px-2.5 text-xs font-semibold text-ink-2">
                <UserRound className="size-3.5" aria-hidden />
                {ficha.responsavel_nome}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-col sm:items-end">
          <SeloStatus status={ficha.status} />
          {whats ? (
            <a
              href={`https://wa.me/${whats}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-xl border border-line-strong px-3 text-[13px] font-semibold text-ink hover:border-ok hover:text-ok sm:ml-0"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          ) : null}
        </div>
      </header>

      <div className="px-4 md:px-7">
        {PERGUNTAS.map((p) => (
          <PerguntaLinha
            key={p.campo}
            pergunta={p}
            valor={ficha[p.campo]}
            onEscolher={(v) => responder(ficha.id, p.campo, v)}
          />
        ))}
      </div>

      <Anotacoes jovemId={ficha.id} />

      {ficha.atualizado_em ? (
        <p className="px-4 pb-1 text-[12.5px] text-ink-2 md:px-7" title={dataHora(ficha.atualizado_em)}>
          Respostas atualizadas {relativo(ficha.atualizado_em)}.
        </p>
      ) : null}

      <nav
        aria-label="Navegar entre jovens"
        className="safe-bottom sticky bottom-0 mt-4 flex items-center gap-2 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:static md:rounded-b-2xl md:px-7"
      >
        <Button
          variante="contorno"
          disabled={!anterior}
          onClick={() => irPara(anterior, -1)}
          aria-label={anterior ? `Anterior: ${anterior.nome}` : 'Anterior'}
          title="Anterior (Alt + ←)"
        >
          <ChevronLeft /> <span className="max-w-[16ch] truncate">Anterior</span>
        </Button>
        {posicao ? (
          <span className="tabular mx-auto hidden text-[13px] text-ink-2 md:block">
            {posicao.atual} de {posicao.total}
          </span>
        ) : null}
        <Button
          className="ml-auto md:ml-0"
          disabled={!proximo}
          onClick={() => irPara(proximo, 1)}
          aria-label={proximo ? `Próximo: ${proximo.nome}` : 'Próximo'}
          title="Próximo (Alt + →)"
        >
          <span className="max-w-[16ch] truncate">
            {proximo ? `Próximo: ${proximo.nome.split(' ')[0]}` : 'Próximo'}
          </span>
          <ChevronRight />
        </Button>
      </nav>
    </article>
  );
}

const ICONE: Record<string, typeof Check> = { sim: Check, nao: X, na: Minus, finalizado: Flag, recontatar: RotateCcw };

const LIGADO: Record<Opcao['tom'], string> = {
  ok: 'border-ok bg-ok text-on-ok',
  nao: 'border-brand-600 bg-brand-600 text-white',
  aviso: 'border-warn-dot bg-warn-dot text-[#3b1d00]',
  neutro: 'border-ink-2 bg-ink-2 text-surface',
};

function PerguntaLinha({
  pergunta,
  valor,
  onEscolher,
}: {
  pergunta: Pergunta;
  valor: string | null;
  onEscolher: (v: string | null) => void;
}) {
  const id = `p-${pergunta.campo}`;
  const idx = pergunta.opcoes.findIndex((o) => o.valor === valor);

  // Setas movem a escolha dentro do grupo, como um grupo de rádio nativo.
  const teclas = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const n = pergunta.opcoes.length;
    const prox = pergunta.opcoes[((idx < 0 ? (d > 0 ? -1 : 0) : idx) + d + n) % n];
    onEscolher(prox.valor);
    const alvo = e.currentTarget.querySelector<HTMLButtonElement>(`[data-valor="${prox.valor}"]`);
    alvo?.focus();
  };

  return (
    <div
      data-linha
      className="grid gap-2.5 border-t border-line py-4 first:border-t-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:items-center md:gap-6"
    >
      <span id={id} className="text-[14.5px] font-semibold">
        {pergunta.rotulo}
      </span>
      <div role="radiogroup" aria-labelledby={id} onKeyDown={teclas} className="flex gap-2">
        {pergunta.opcoes.map((o, i) => {
          const on = valor === o.valor;
          const Icone = ICONE[o.valor];
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={on}
              data-valor={o.valor}
              tabIndex={on || (idx < 0 && i === 0) ? 0 : -1}
              onClick={(e) => {
                onEscolher(on ? null : o.valor);
                if (!semMovimento()) {
                  gsap.fromTo(
                    e.currentTarget,
                    { scale: 0.93 },
                    { scale: 1, duration: 0.42, ease: 'back.out(3)', clearProps: 'transform' },
                  );
                }
              }}
              title={on ? 'Toque de novo para desmarcar' : undefined}
              className={cn(
                'inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-[1.5px] px-3 py-2 text-sm font-semibold leading-tight transition-[background-color,border-color,color] duration-150 ease-out',
                on ? LIGADO[o.tom] : 'border-line-strong bg-surface text-ink hover:border-brand-600',
              )}
            >
              {Icone ? <Icone className="size-4 shrink-0" aria-hidden /> : null}
              {o.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Anotacoes({ jovemId }: { jovemId: string }) {
  const { perfil, admin } = useSessao();
  const { ajustarNotas } = useFichas();
  const [notas, setNotas] = useState<Nota[] | null>(null);
  const [texto, setTexto] = useState('');
  const [salvando, setSalvando] = useState(false);
  const pendente = texto.trim().length > 0;

  // Avisa antes de fechar a aba com uma observação escrita e não salva.
  useEffect(() => {
    if (!pendente) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [pendente]);

  useEffect(() => {
    let vivo = true;
    const carregar = () =>
      supabase
        .from('notas')
        .select('id, jovem_id, autor_id, texto, criado_em, autor:responsaveis(nome)')
        .eq('jovem_id', jovemId)
        .order('criado_em', { ascending: false })
        .then(({ data }) => vivo && setNotas((data as unknown as Nota[]) ?? []));
    carregar();
    const canal = supabase
      .channel(`notas-${jovemId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notas', filter: `jovem_id=eq.${jovemId}` },
        carregar,
      )
      .subscribe();
    return () => {
      vivo = false;
      supabase.removeChannel(canal);
    };
  }, [jovemId]);

  async function adicionar(e?: FormEvent) {
    e?.preventDefault();
    const t = texto.trim();
    if (!t || salvando) return;
    setSalvando(true);
    const { data, error } = await supabase
      .from('notas')
      .insert({ jovem_id: jovemId, texto: t })
      .select('id, jovem_id, autor_id, texto, criado_em')
      .single();
    setSalvando(false);
    if (error || !data) {
      toast.error('A anotação não foi salva. Seu texto continua aqui; tente de novo.');
      return;
    }
    setNotas((n) => [{ ...(data as Nota), autor: perfil ? { nome: perfil.nome } : null }, ...(n ?? [])]);
    ajustarNotas(jovemId, 1);
    setTexto('');
  }

  async function apagar(n: Nota) {
    if (!window.confirm('Apagar esta anotação? Não dá para desfazer.')) return;
    const { error } = await supabase.from('notas').delete().eq('id', n.id);
    if (error) return toast.error('Não foi possível apagar.');
    setNotas((l) => (l ?? []).filter((x) => x.id !== n.id));
    ajustarNotas(jovemId, -1);
  }

  return (
    <section aria-labelledby="titulo-notas" className="mx-4 mt-2 border-t border-line pb-4 pt-5 md:mx-7">
      <h3 id="titulo-notas" className="text-[15px] font-bold">
        Observações
      </h3>
      <form onSubmit={adicionar} className="mt-3">
        <Textarea
          aria-label="Nova observação"
          placeholder="O que foi conversado? Ex.: respondeu no WhatsApp, volta às aulas na terça."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) adicionar();
          }}
          maxLength={2000}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="hidden text-xs text-ink-2 sm:block">Ctrl + Enter para salvar</span>
          <Button type="submit" variante="suave" tamanho="sm" className="ml-auto" disabled={!texto.trim() || salvando}>
            {salvando ? <Loader2 className="animate-spin" /> : null}
            Salvar observação
          </Button>
        </div>
      </form>

      <ol className="mt-4 space-y-3">
        {notas === null ? (
          <li>
            <Esqueleto className="h-16 rounded-xl" />
          </li>
        ) : notas.length === 0 ? (
          <li className="text-sm text-ink-2">
            Nenhuma observação ainda. A primeira conversa fica registrada aqui, com data e autor.
          </li>
        ) : (
          notas.map((n) => {
            const minha = n.autor_id === perfil?.id;
            return (
              <li key={n.id} className="group rounded-xl bg-surface-2 px-3.5 py-3">
                <div className="flex items-center gap-2 text-xs text-ink-2">
                  <span className="font-semibold text-ink">{minha ? 'Você' : (n.autor?.nome ?? 'Coordenação')}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={n.criado_em} title={dataHora(n.criado_em)}>
                    {relativo(n.criado_em)}
                  </time>
                  {minha || admin ? (
                    <button
                      type="button"
                      onClick={() => apagar(n)}
                      aria-label="Apagar anotação"
                      className="ml-auto rounded-md p-1 text-ink-2 opacity-70 transition-opacity hover:bg-surface hover:text-tint-ink hover:opacity-100 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  ) : null}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[14.5px] leading-relaxed">{n.texto}</p>
              </li>
            );
          })
        )}
      </ol>
    </section>
  );
}
