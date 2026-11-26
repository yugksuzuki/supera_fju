import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSessao } from '@/hooks/sessao';
import { Button } from '@/components/ui/button';
import { Input, Rotulo } from '@/components/ui/campos';

export default function Conta() {
  const { perfil, sair } = useSessao();
  const [senha, setSenha] = useState('');
  const [repetir, setRepetir] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function trocar(e: FormEvent) {
    e.preventDefault();
    if (senha.length < 8) return setErro('A senha precisa ter pelo menos 8 caracteres.');
    if (senha !== repetir) return setErro('As duas senhas não são iguais.');
    setErro(null);
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) {
      return setErro(
        /same|different/i.test(error.message)
          ? 'A nova senha precisa ser diferente da atual.'
          : 'Não foi possível trocar a senha. Tente de novo.',
      );
    }
    setSenha('');
    setRepetir('');
    toast.success('Senha trocada. Use a nova no próximo acesso.');
  }

  return (
    <main className="mx-auto max-w-[480px] px-4 py-6 md:py-8">
      <h1 className="text-xl font-bold">Minha conta</h1>
      <p className="mt-1 text-sm text-ink-2">
        {perfil?.nome}, {perfil?.email}
      </p>

      <form onSubmit={trocar} className="mt-6 space-y-4 rounded-2xl border border-line bg-surface p-5" noValidate>
        <h2 className="text-base font-bold">Trocar senha</h2>
        <div>
          <Rotulo htmlFor="c-senha" dica="(mínimo 8 caracteres)">
            Nova senha
          </Rotulo>
          <Input
            id="c-senha"
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        <div>
          <Rotulo htmlFor="c-repetir">Repita a nova senha</Rotulo>
          <Input
            id="c-repetir"
            type="password"
            autoComplete="new-password"
            value={repetir}
            onChange={(e) => setRepetir(e.target.value)}
          />
        </div>
        {erro ? (
          <p role="alert" className="rounded-xl bg-tint px-3.5 py-3 text-sm text-tint-ink">
            {erro}
          </p>
        ) : null}
        <Button type="submit" disabled={salvando}>
          {salvando ? <Loader2 className="animate-spin" /> : null}
          Trocar senha
        </Button>
      </form>

      <Button variante="contorno" className="mt-6 sm:hidden" onClick={sair}>
        Sair
      </Button>
    </main>
  );
}
