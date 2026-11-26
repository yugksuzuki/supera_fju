import { useSessao } from '@/hooks/sessao';
import { Selo } from '@/components/Selo';
import { SerraBorda } from '@/components/Cume';
import { FormTrocarSenha } from '@/components/FormTrocarSenha';

/** Aparece no primeiro acesso de quem recebeu senha provisória. Não dá para pular. */
export function PrimeiraSenha() {
  const { perfil, sair } = useSessao();
  const nome = perfil?.nome.replace(/^Obr\.?\s+/, '').split(' ')[0];
  return (
    <main className="min-h-dvh bg-bg">
      <div className="safe-top bg-[linear-gradient(160deg,#dd1b37_0%,#b01026_100%)] text-white">
        <div className="mx-auto flex max-w-[420px] justify-center px-4 pb-4 pt-8">
          <Selo className="size-20" />
        </div>
        <SerraBorda className="h-8 md:h-12" />
      </div>
      <div className="mx-auto max-w-[400px] px-4 pb-12">
        <h1 className="text-[24px] font-bold leading-tight tracking-[-0.015em]">Olá, {nome}! Crie a sua senha</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-2">
          Você entrou com a senha provisória que a coordenação passou. Escolha uma senha só sua para continuar.
        </p>
        <div className="mt-6">
          <FormTrocarSenha rotuloBotao="Salvar e continuar" />
        </div>
        <button
          type="button"
          onClick={sair}
          className="mt-5 rounded-md text-[13px] text-ink-2 underline underline-offset-4 hover:text-ink"
        >
          Sair sem trocar
        </button>
      </div>
    </main>
  );
}
