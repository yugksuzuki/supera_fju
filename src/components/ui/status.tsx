import { STATUS_ROTULO } from '@/lib/perguntas';
import type { Status } from '@/lib/tipos';
import { cn } from '@/lib/utils';

const COR: Record<Status, string> = {
  pendente: 'bg-idle',
  andamento: 'bg-warn-dot',
  concluido: 'bg-ok',
};

export function PontoStatus({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      role="img"
      aria-label={STATUS_ROTULO[status]}
      title={STATUS_ROTULO[status]}
      className={cn('inline-block size-2.5 shrink-0 rounded-full', COR[status], className)}
    />
  );
}

const SELO: Record<Status, string> = {
  pendente: 'bg-surface-2 text-ink-2 ring-line',
  andamento: 'bg-warn-tint text-warn ring-[color-mix(in_oklab,var(--warn)_25%,transparent)]',
  concluido: 'bg-ok-tint text-ok ring-[color-mix(in_oklab,var(--ok)_25%,transparent)]',
};

export function SeloStatus({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ring-1',
        SELO[status],
      )}
    >
      <PontoStatus status={status} className="size-2" />
      {STATUS_ROTULO[status]}
    </span>
  );
}
