import { useSessao } from '@/hooks/sessao';
import { Button } from '@/components/ui/button';
import { Selo } from '@/components/Selo';

export function SemAcesso() {
  const { sessao, sair } = useSessao();
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4">
      <div className="max-w-[400px] text-center">
        <Selo className="mx-auto size-20" />
        <h1 className="mt-5 text-xl font-bold">Seu acesso ainda não foi liberado</h1>
        <p className="mt-2 text-sm text-ink-2">
          Você entrou como <strong className="text-ink">{sessao?.user.email}</strong>, mas esse e-mail não está ativo na
          equipe. Peça ao responsável pelo sistema para conferir o seu cadastro.
        </p>
        <Button variante="contorno" className="mt-6" onClick={sair}>
          Sair e tentar outro e-mail
        </Button>
      </div>
    </main>
  );
}
