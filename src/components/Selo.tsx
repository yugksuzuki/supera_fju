import { cn } from '@/lib/utils';

/** Selo circular do SUPERA, sempre sobre fundo branco como no original. */
export function Selo({ className }: { className?: string }) {
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-full bg-white p-[3px] shadow-2', className)}>
      <img
        src="/logo.webp"
        alt="SUPERA · Força Jovem Universal"
        width={256}
        height={256}
        className="size-full rounded-full"
      />
    </span>
  );
}
