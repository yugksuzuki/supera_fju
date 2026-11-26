import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSessao } from '@/hooks/sessao';
import { Button } from '@/components/ui/button';
import { Input, Rotulo } from '@/components/ui/campos';

/** Troca a senha da pessoa logada e avisa o banco que a senha provisória deixou de valer. */
export function FormTrocarSenha({
  aoTrocar,
  rotuloBotao = 'Trocar senha',
}: {
  aoTrocar?: () => void;
  rotuloBotao?: string;
}) {
  const { senhaTrocada } = useSessao();
  const [senha, setSenha] = useState('');
  const [repetir, setRepetir] = useState('');
  const [ver, setVer] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function trocar(e: FormEvent) {
    e.preventDefault();
    if (senha.length < 8) return setErro('A senha precisa ter pelo menos 8 caracteres.');
    if (senha !== repetir) return setErro('As duas senhas não são iguais. Digite de novo.');
    setErro(null);
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setSalvando(false);
      return setErro(
        /same|different/i.test(error.message)
          ? 'A nova senha precisa ser diferente da provisória.'
          : /weak|short|characters/i.test(error.message)
            ? 'Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.'
            : 'Não foi possível trocar a senha. Tente de novo.',
      );
    }
    await supabase.rpc('confirmar_troca_de_senha');
    setSalvando(false);
    setSenha('');
    setRepetir('');
    senhaTrocada();
    aoTrocar?.();
  }

  return (
    <form onSubmit={trocar} className="space-y-4" noValidate>
      <div>
        <Rotulo htmlFor="nova-senha" dica="(mínimo 8 caracteres)">
          Nova senha
        </Rotulo>
        <div className="relative">
          <Input
            id="nova-senha"
            type={ver ? 'text' : 'password'}
            autoComplete="new-password"
            spellCheck={false}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? 'Esconder senha' : 'Mostrar senha'}
            aria-pressed={ver}
            className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            {ver ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        </div>
      </div>
      <div>
        <Rotulo htmlFor="repetir-senha">Repita a nova senha</Rotulo>
        <Input
          id="repetir-senha"
          type={ver ? 'text' : 'password'}
          autoComplete="new-password"
          spellCheck={false}
          value={repetir}
          onChange={(e) => setRepetir(e.target.value)}
        />
      </div>
      {erro ? (
        <p role="alert" className="rounded-xl bg-tint px-3.5 py-3 text-sm text-tint-ink">
          {erro}
        </p>
      ) : null}
      <Button type="submit" tamanho="lg" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="animate-spin" /> : null}
        {salvando ? 'Salvando…' : rotuloBotao}
      </Button>
    </form>
  );
}
