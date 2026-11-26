import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
gsap.defaults({ ease: 'expo.out', duration: 0.32 });

export { gsap, useGSAP };

/** Quem pediu "reduzir movimento" no aparelho não recebe animação. */
export const semMovimento = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/*
  Direção da próxima troca de jovem: 1 = próximo (entra pela direita), -1 = anterior,
  0 = escolhido na lista (só aparece). Quem navega define antes de trocar a rota.
*/
let direcao: -1 | 0 | 1 = 0;
export const definirDirecao = (d: -1 | 0 | 1) => {
  direcao = d;
};
export const consumirDirecao = () => {
  const d = direcao;
  direcao = 0;
  return d;
};
