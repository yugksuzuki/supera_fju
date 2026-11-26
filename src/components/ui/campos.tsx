import type { ComponentProps, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const base =
  'w-full rounded-xl border border-line-strong bg-surface text-ink text-[15px] transition-[border-color,box-shadow] duration-150 hover:border-[color-mix(in_oklab,var(--line-strong),var(--ink-2)_30%)] focus:border-brand-600 focus:outline-none focus:ring-3 focus:ring-[color-mix(in_oklab,var(--ring)_22%,transparent)] disabled:opacity-60';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(base, 'h-11 px-3.5', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(base, 'min-h-24 resize-y px-3.5 py-3 leading-relaxed', className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select className={cn(base, 'h-11 appearance-none pl-3.5 pr-9', className)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-2"
      />
    </div>
  );
}

export function Rotulo({ children, htmlFor, dica }: { children: ReactNode; htmlFor?: string; dica?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-ink">
      {children}
      {dica ? <span className="ml-1 font-normal text-ink-2">{dica}</span> : null}
    </label>
  );
}
