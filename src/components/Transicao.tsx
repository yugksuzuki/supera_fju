import { useRef, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { gsap, useGSAP, semMovimento } from '@/lib/movimento';

/** Seção atual: /jovem/:id faz parte de "Acompanhar" (a ficha cuida da própria transição). */
const secao = (caminho: string) => (caminho.startsWith('/jovem/') ? '/' : caminho);

/** Troca de aba é fade: não há relação espacial entre as abas, então nada desliza. */
export function Transicao({ children }: { children: ReactNode }) {
  const [local] = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const chave = secao(local);

  useGSAP(
    () => {
      if (semMovimento()) return;
      gsap.fromTo(ref.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24, ease: 'power1.out' });
    },
    { dependencies: [chave], scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
