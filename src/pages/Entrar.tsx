import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input, Rotulo } from '@/components/ui/campos';
import { Selo } from '@/components/Selo';
import { SerraBorda } from '@/components/Cume';

function traduzirErro(msg: string, status?: number) {
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos. Confira e tente de novo.';
  if (/email not confirmed/i.test(msg)) return 'Esse acesso ainda não foi liberado. Fale com a coordenação.';
  if (status === 429 || /rate limit|too many/i.test(msg))
    return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.';
  return 'Não foi possível entrar. Confira a internet e tente de novo.';
}

export function Entrar() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email.trim())) return setErro('Digite o e-mail completo, como voce@gmail.com.');
    if (!senha) return setErro('Digite a sua senha.');
    setErro(null);
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setEnviando(false);
    if (error) setErro(traduzirErro(error.message, error.status));
  }

  return (
    <main className="min-h-dvh bg-bg">
      <div className="safe-top bg-[linear-gradient(160deg,#dd1b37_0%,#b01026_100%)] text-white">
        <div className="mx-auto flex max-w-[420px] flex-col items-center px-4 pb-6 pt-10 text-center md:pt-14">
          <Selo className="size-24 md:size-28" />
          <blockquote className="mt-5">
            <p className="text-[19px] font-semibold leading-snug md:text-xl">“Apascenta as minhas ovelhas.”</p>
            <footer className="mt-1 text-[13px] text-white/80">João 21:16</footer>
          </blockquote>
        </div>
        <SerraBorda className="h-10 md:h-14" />
      </div>

      <div className="mx-auto max-w-[400px] px-4 pb-12">
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.015em]">Acompanhamento dos jovens</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-2">
          Entre com o e-mail e a senha que a coordenação passou para você.
        </p>

        <form onSubmit={entrar} className="mt-6 space-y-4" noValidate>
          <div>
            <Rotulo htmlFor="email">E-mail</Rotulo>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              spellCheck={false}
              placeholder="voce@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? 'erro-login' : undefined}
            />
          </div>
          <div>
            <Rotulo htmlFor="senha">Senha</Rotulo>
            <div className="relative">
              <Input
                id="senha"
                name="senha"
                type={ver ? 'text' : 'password'}
                autoComplete="current-password"
                spellCheck={false}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="pr-12"
                aria-invalid={erro ? true : undefined}
                aria-describedby={erro ? 'erro-login' : undefined}
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

          {erro ? (
            <p id="erro-login" role="alert" className="rounded-xl bg-tint px-3.5 py-3 text-sm text-tint-ink">
              {erro}
            </p>
          ) : null}

          <Button type="submit" tamanho="lg" className="w-full" disabled={enviando}>
            {enviando ? <Loader2 className="animate-spin" /> : null}
            {enviando ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-5 text-[13px] text-ink-2">
          Esqueceu a senha? A coordenação cria uma nova para você na aba Equipe.
        </p>
      </div>
    </main>
  );
}
