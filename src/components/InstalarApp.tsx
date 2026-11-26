import { useEffect, useState } from 'react';
import { Download, Share, SquarePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromptInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// O navegador avisa uma vez só que o app pode ser instalado; guardamos o aviso no módulo.
let promptGuardado: PromptInstalacao | null = null;
const ouvintes = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptGuardado = e as PromptInstalacao;
    ouvintes.forEach((f) => f());
  });
  window.addEventListener('appinstalled', () => {
    promptGuardado = null;
    ouvintes.forEach((f) => f());
  });
}

const instalado = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
const ehIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function useInstalacao() {
  const [, forcar] = useState(0);
  useEffect(() => {
    const f = () => forcar((n) => n + 1);
    ouvintes.add(f);
    return () => {
      ouvintes.delete(f);
    };
  }, []);
  return {
    jaInstalado: instalado(),
    ios: ehIOS(),
    podeInstalar: promptGuardado !== null,
    instalar: async () => {
      if (!promptGuardado) return;
      await promptGuardado.prompt();
      await promptGuardado.userChoice;
      promptGuardado = null;
      forcar((n) => n + 1);
    },
  };
}

function PassosIOS() {
  return (
    <ol className="mt-2 space-y-1.5 text-[13.5px] leading-snug">
      <li className="flex items-start gap-2">
        <Share className="mt-0.5 size-4 shrink-0 text-tint-ink" aria-hidden />
        <span>
          No Safari, toque em <strong>Compartilhar</strong> (o quadrado com a seta).
        </span>
      </li>
      <li className="flex items-start gap-2">
        <SquarePlus className="mt-0.5 size-4 shrink-0 text-tint-ink" aria-hidden />
        <span>
          Escolha <strong>Adicionar à Tela de Início</strong> e toque em Adicionar.
        </span>
      </li>
    </ol>
  );
}

/** Cartão completo, para a página Minha conta. */
export function CartaoInstalar() {
  const { jaInstalado, ios, podeInstalar, instalar } = useInstalacao();
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-base font-bold">App no celular</h2>
      {jaInstalado ? (
        <p className="mt-1 text-sm text-ink-2">Você já está usando o app instalado.</p>
      ) : ios ? (
        <>
          <p className="mt-1 text-sm text-ink-2">Coloque o SUPERA na tela inicial do iPhone:</p>
          <PassosIOS />
        </>
      ) : podeInstalar ? (
        <>
          <p className="mt-1 text-sm text-ink-2">Coloque o SUPERA na tela inicial, como um aplicativo.</p>
          <Button className="mt-3" onClick={instalar}>
            <Download /> Instalar app
          </Button>
        </>
      ) : (
        <p className="mt-1 text-sm text-ink-2">
          No Android, abra este site no Chrome, toque nos três pontinhos e escolha <strong>Instalar app</strong> ou{' '}
          <strong>Adicionar à tela inicial</strong>.
        </p>
      )}
    </section>
  );
}

const CHAVE = 'supera.instalar.dispensado';

/** Aviso discreto no celular, até a pessoa instalar ou fechar. */
export function AvisoInstalar({ className }: { className?: string }) {
  const { jaInstalado, ios, podeInstalar, instalar } = useInstalacao();
  const [fechado, setFechado] = useState(() => {
    try {
      return localStorage.getItem(CHAVE) === '1';
    } catch {
      return false;
    }
  });
  if (jaInstalado || fechado || !(ios || podeInstalar)) return null;
  const fechar = () => {
    setFechado(true);
    try {
      localStorage.setItem(CHAVE, '1');
    } catch {
      /* ignora */
    }
  };
  return (
    <div
      className={cn('relative rounded-2xl border border-line bg-tint/60 p-4 pr-11 md:hidden', className)}
      role="region"
      aria-label="Instalar o app"
    >
      <p className="text-[14px] font-semibold text-ink">Use o SUPERA como app</p>
      {ios ? (
        <PassosIOS />
      ) : (
        <>
          <p className="mt-0.5 text-[13.5px] text-ink-2">Fica na tela inicial e abre direto, sem procurar o link.</p>
          <Button tamanho="sm" className="mt-2.5" onClick={instalar}>
            <Download /> Instalar app
          </Button>
        </>
      )}
      <button
        type="button"
        onClick={fechar}
        aria-label="Fechar aviso"
        className="absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-surface hover:text-ink"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
