import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { gsap, useGSAP, semMovimento } from '@/lib/movimento';

/*
  A serra do selo SUPERA usada como barra de progresso: a equipe "sobe" conforme os
  jovens são acompanhados, e a bandeira no cume só fica cheia em 100%.
  Anima a div que embrulha o SVG (clip-path), nunca o SVG.
*/
const SERRA =
  'M0 60V55L34 47L52 51L88 39L106 44L146 30L166 36L210 21L230 28L276 12L294 19L338 4L352 9L364 3L400 18V60Z';
const MASTRO = 'M364 3V-17';
const BANDEIRA = 'M365 -17L380 -12L365 -7Z';

function Desenho({ className }: { className?: string }) {
  return (
    <svg viewBox="0 -18 400 78" preserveAspectRatio="none" aria-hidden className={cn('size-full', className)}>
      <path d={SERRA} />
      <path d={MASTRO} strokeWidth={2} fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <path d={BANDEIRA} />
    </svg>
  );
}

export function Cume({ pct, rotulo, className }: { pct: number; rotulo: string; className?: string }) {
  const p = Math.max(0, Math.min(100, pct));
  const cheio = useRef<HTMLDivElement>(null);

  // A subida acompanha o progresso: cresce devagar até o novo ponto.
  useGSAP(
    () => {
      const alvo = `inset(0 ${100 - p}% 0 0)`;
      if (semMovimento()) gsap.set(cheio.current, { clipPath: alvo });
      else gsap.to(cheio.current, { clipPath: alvo, duration: 1.2, ease: 'expo.out' });
    },
    { dependencies: [p] },
  );

  return (
    <div
      role="progressbar"
      aria-valuenow={p}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={rotulo}
      className={cn('relative', className)}
    >
      <Desenho className="fill-white/22 stroke-white/40" />
      <div ref={cheio} className="absolute inset-0" style={{ clipPath: 'inset(0 100% 0 0)' }}>
        <Desenho className="fill-white stroke-white" />
      </div>
    </div>
  );
}

/** Borda inferior da faixa vermelha no login: a mesma serra, na cor do fundo. */
export function SerraBorda({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 44" preserveAspectRatio="none" aria-hidden className={cn('block w-full fill-bg', className)}>
      <path d="M0 44V30L30 36L58 24L84 31L118 14L150 26L186 8L214 20L250 2L284 22L318 12L350 28L378 18L400 26V44Z" />
    </svg>
  );
}
