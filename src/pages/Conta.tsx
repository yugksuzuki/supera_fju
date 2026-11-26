import { toast } from 'sonner';
import { useSessao } from '@/hooks/sessao';
import { Button } from '@/components/ui/button';
import { FormTrocarSenha } from '@/components/FormTrocarSenha';

export default function Conta() {
  const { perfil, sair } = useSessao();
  return (
    <main className="mx-auto max-w-[480px] px-4 py-6 md:py-8">
      <h1 className="text-xl font-bold">Minha conta</h1>
      <p className="mt-1 text-sm text-ink-2">
        {perfil?.nome}, {perfil?.email}
      </p>
      <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-4 text-base font-bold">Trocar senha</h2>
        <FormTrocarSenha aoTrocar={() => toast.success('Senha trocada. Use a nova no próximo acesso.')} />
      </section>
      <Button variante="contorno" className="mt-6 sm:hidden" onClick={sair}>
        Sair
      </Button>
    </main>
  );
}
