import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const botao = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0',
  {
    variants: {
      variante: {
        primario: 'bg-brand-600 text-white shadow-1 hover:bg-brand-700',
        suave: 'bg-tint text-tint-ink hover:bg-[color-mix(in_oklab,var(--tint),var(--brand-600)_12%)]',
        contorno: 'border border-line-strong bg-surface text-ink hover:border-brand-600 hover:text-tint-ink',
        fantasma: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        claro: 'bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25',
      },
      tamanho: {
        sm: 'h-9 px-3 text-[13px]',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-5 text-[15px]',
        icone: 'size-10',
      },
    },
    defaultVariants: { variante: 'primario', tamanho: 'md' },
  },
);

export function Button({
  className,
  variante,
  tamanho,
  type = 'button',
  ...props
}: ComponentProps<'button'> & VariantProps<typeof botao>) {
  return <button type={type} className={cn(botao({ variante, tamanho }), className)} {...props} />;
}
