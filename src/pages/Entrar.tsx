import { useState, type FormEvent } from 'react';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input, Rotulo } from '@/components/ui/campos';
import { Selo } from '@/components/Selo';

function traduzirErro(msg: string, status?: number) {
  if (/database error saving new user/i.test(msg) || /signups not allowed/i.test(msg))
    return 'Este e-mail não está na equipe do SUPERA. Peça ao responsável pelo sistema para cadastrar você.';
  if (status === 429 || /rate limit|security purposes/i.test(msg))
    return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.';
  if (/expired|invalid/i.test(msg)) return 'Código inválido ou vencido. Confira os números ou peça um novo código.';
  return 'Algo deu errado. Confira a internet e tente de novo.';
}

export function Entrar() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function pedirCodigo(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
    });
    setEnviando(false);
    if (error) return setErro(traduzirErro(error.message, error.status));
    setEtapa('codigo');
  }

  async function confirmar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: codigo.trim(), type: 'email' });
    setEnviando(false);
    if (error) setErro(traduzirErro(error.message, error.status));
  }

  return (
    <main className="min-h-dvh bg-bg">
      <div className="safe-top h-44 bg-[linear-gradient(135deg,#dd1b37_0%,#b01026_100%)] md:h-56" />
      <div className="mx-auto -mt-24 max-w-[420px] px-4 pb-10 md:-mt-28">
        <div className="flex flex-col items-center text-center text-white">
          <Selo className="size-24 md:size-28" />
        </div>
        <div className="mt-5 rounded-3xl border border-line bg-surface p-6 shadow-2 md:p-8">
          <h1 className="text-center text-[22px] font-bold leading-tight text-ink">Acompanhamento SUPERA</h1>
          <p className="mx-auto mt-1.5 max-w-[34ch] text-center text-sm text-ink-2">
            {etapa === 'email'
              ? 'Entre com o e-mail que você passou para a coordenação.'
              : `Enviamos um código para ${email}. Digite abaixo ou toque no link do e-mail.`}
          </p>

          {etapa === 'email' ? (
            <form onSubmit={pedirCodigo} className="mt-6 space-y-4" noValidate>
              <div>
                <Rotulo htmlFor="email">E-mail</Rotulo>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  name="email"
                  autoFocus
                  required
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={erro ? true : undefined}
                  aria-describedby={erro ? 'erro-login' : undefined}
                />
              </div>
              <Button type="submit" tamanho="lg" className="w-full" disabled={enviando || !/\S+@\S+\.\S+/.test(email)}>
                {enviando ? <Loader2 className="animate-spin" /> : <Mail />}
                {enviando ? 'Enviando…' : 'Receber código por e-mail'}
              </Button>
            </form>
          ) : (
            <form onSubmit={confirmar} className="mt-6 space-y-4" noValidate>
              <div>
                <Rotulo htmlFor="codigo">Código</Rotulo>
                <Input
                  id="codigo"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  spellCheck={false}
                  name="codigo"
                  autoFocus
                  maxLength={10}
                  placeholder="000000"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  className="h-14 text-center text-2xl font-semibold tracking-[0.3em] tabular"
                  aria-invalid={erro ? true : undefined}
                  aria-describedby={erro ? 'erro-login' : undefined}
                />
              </div>
              <Button type="submit" tamanho="lg" className="w-full" disabled={enviando || codigo.length < 6}>
                {enviando ? <Loader2 className="animate-spin" /> : null}
                {enviando ? 'Confirmando…' : 'Entrar'}
              </Button>
              <Button
                variante="fantasma"
                className="w-full"
                onClick={() => {
                  setEtapa('email');
                  setCodigo('');
                  setErro(null);
                }}
              >
                <ArrowLeft /> Usar outro e-mail
              </Button>
            </form>
          )}

          {erro ? (
            <p id="erro-login" role="alert" className="mt-4 rounded-xl bg-tint px-3.5 py-3 text-sm text-tint-ink">
              {erro}
            </p>
          ) : null}
        </div>
        <p className="mt-6 text-center text-xs text-ink-2">Formando jovens visionários</p>
      </div>
    </main>
  );
}
