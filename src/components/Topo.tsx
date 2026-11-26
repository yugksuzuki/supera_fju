import { Link, useLocation } from 'wouter';
import { LogOut } from 'lucide-react';
import { useSessao } from '@/hooks/sessao';
import { useFichas } from '@/hooks/fichas';
import { Selo } from './Selo';
import { cn } from '@/lib/utils';

const ABAS = [
  { href: '/', rotulo: 'Acompanhar', admin: false },
  { href: '/painel', rotulo: 'Painel', admin: true },
  { href: '/jovens', rotulo: 'Jovens', admin: true },
  { href: '/equipe', rotulo: 'Equipe', admin: true },
];

export function Topo() {
  const { perfil, admin, sair } = useSessao();
  const { fichas, carregando } = useFichas();
  const [local] = useLocation();
  const ativos = fichas.filter((f) => f.ativo);
  const total = ativos.length;
  const concluidos = ativos.filter((f) => f.status === 'concluido').length;
  const iniciados = ativos.filter((f) => f.status !== 'pendente').length;
  const pct = total ? Math.round((iniciados / total) * 100) : 0;
  const abas = ABAS.filter((a) => admin || !a.admin);
  const ativa = (href: string) =>
    href === '/' ? local === '/' || local.startsWith('/jovem/') : local.startsWith(href);

  return (
    <header className="safe-top bg-[linear-gradient(135deg,#dd1b37_0%,#b01026_100%)] text-white">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-5 gap-y-3 px-4 pb-0 pt-3 md:px-6 md:pt-4">
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl md:flex-none outline-offset-4 focus-visible:outline-white"
        >
          <Selo className="size-12 md:size-14" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-bold tracking-[0.02em] md:text-lg">
              <span translate="no">SUPERA</span> · Acompanhamento
            </span>
            <span className="block truncate text-xs text-white/85 md:text-[12.5px]">
              Força Jovem Universal · João 21:16
            </span>
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:order-last">
          <span
            className="hidden max-w-[180px] truncate text-[13px] text-white/90 sm:block"
            title={perfil?.email ?? ''}
          >
            {perfil?.nome}
          </span>
          <button
            type="button"
            onClick={sair}
            className="inline-flex size-9 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-white"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="size-[18px]" />
          </button>
        </div>

        <div className="flex w-full items-center gap-4 md:ml-auto md:w-auto md:min-w-[260px] md:max-w-[380px] md:flex-1">
          <div className="flex-1" aria-live="polite">
            <div className="flex items-baseline justify-between text-[12.5px] text-white/90">
              <span className="tabular">
                {carregando ? 'Carregando…' : `${concluidos} concluídos · ${iniciados} de ${total} iniciados`}
              </span>
              <span className="tabular font-semibold text-white">{pct}%</span>
            </div>
            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Jovens com acompanhamento iniciado"
            >
              <div
                className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {abas.length > 1 ? (
        <div className="mx-auto mt-3 flex max-w-[1240px] items-end px-1.5 md:px-4">
          <nav aria-label="Seções" className="-mb-px flex overflow-x-auto">
            {abas.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                aria-current={ativa(a.href) ? 'page' : undefined}
                className={cn(
                  'relative shrink-0 rounded-t-xl px-3 py-2.5 text-sm sm:px-4 font-semibold transition-colors duration-150 focus-visible:outline-white',
                  ativa(a.href) ? 'bg-bg text-tint-ink' : 'text-white/85 hover:bg-white/10 hover:text-white',
                )}
              >
                {a.rotulo}
              </Link>
            ))}
          </nav>
        </div>
      ) : (
        <div className="h-4" />
      )}
    </header>
  );
}
