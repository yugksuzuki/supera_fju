import { Link, useLocation } from 'wouter';
import { LogOut } from 'lucide-react';
import { useSessao } from '@/hooks/sessao';
import { useFichas } from '@/hooks/fichas';
import { Selo } from './Selo';
import { Cume } from './Cume';
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
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-3 px-4 pt-3 md:px-6 md:pt-4">
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl outline-offset-4 focus-visible:outline-white md:flex-none"
        >
          <Selo className="size-12 md:size-14" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-bold tracking-[0.01em] md:text-lg">
              <span translate="no">SUPERA</span> Acompanhamento
            </span>
            <span className="block truncate text-xs text-white/85 md:text-[12.5px]">Força Jovem Universal</span>
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:order-last">
          <Link
            href="/conta"
            className="hidden max-w-[200px] truncate rounded-lg px-2 py-1.5 text-[13px] text-white/90 underline-offset-4 hover:text-white hover:underline focus-visible:outline-white sm:block"
            title="Minha conta"
          >
            {perfil?.nome}
          </Link>
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

        <div className="w-full md:ml-auto md:w-auto md:min-w-[280px] md:max-w-[400px] md:flex-1" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3 text-[12.5px] text-white/90">
            <span className="tabular">
              {carregando ? 'Carregando…' : `${iniciados} de ${total} jovens já acompanhados`}
            </span>
            <span className="tabular whitespace-nowrap">
              <strong className="font-semibold text-white">{pct}%</strong>
              {concluidos ? `, ${concluidos} concluídos` : ''}
            </span>
          </div>
          <Cume pct={pct} rotulo="Jovens com acompanhamento iniciado" className="mt-1 h-10" />
        </div>
      </div>

      {abas.length > 1 ? (
        <div className="mx-auto mt-2 flex max-w-[1240px] items-end px-1.5 md:px-4">
          <nav aria-label="Seções" className="-mb-px flex overflow-x-auto">
            {abas.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                aria-current={ativa(a.href) ? 'page' : undefined}
                className={cn(
                  'relative shrink-0 rounded-t-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-white sm:px-4',
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
