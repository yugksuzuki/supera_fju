import { lazy, Suspense } from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { Toaster } from 'sonner';
import { SessaoProvider, useSessao } from '@/hooks/sessao';
import { FichasProvider } from '@/hooks/fichas';
import { Topo } from '@/components/Topo';
import { Transicao } from '@/components/Transicao';
import { Entrar } from '@/pages/Entrar';
import { SemAcesso } from '@/pages/SemAcesso';
import { PrimeiraSenha } from '@/pages/PrimeiraSenha';
import { Acompanhamento } from '@/pages/Acompanhamento';
import { Esqueleto } from '@/components/ui/esqueleto';

const Painel = lazy(() => import('@/pages/Painel'));
const Jovens = lazy(() => import('@/pages/Jovens'));
const Equipe = lazy(() => import('@/pages/Equipe'));
const Conta = lazy(() => import('@/pages/Conta'));

function Carregando() {
  return (
    <div className="mx-auto grid max-w-[1240px] gap-4 p-4 md:grid-cols-[376px_1fr] md:p-6">
      <Esqueleto className="h-[60vh] rounded-2xl" />
      <Esqueleto className="hidden h-[60vh] rounded-2xl md:block" />
    </div>
  );
}

function Rotas() {
  const { carregando, sessao, perfil, admin } = useSessao();
  if (carregando) return <Carregando />;
  if (!sessao) return <Entrar />;
  if (!perfil || !perfil.ativo) return <SemAcesso />;
  if (perfil.trocar_senha) return <PrimeiraSenha />;

  return (
    <FichasProvider>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-lg bg-surface px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Pular para o conteúdo
      </a>
      <Topo />
      <div id="conteudo" tabIndex={-1} className="outline-none">
        <Suspense fallback={<Carregando />}>
          <Transicao>
            <Switch>
              <Route path="/" component={Acompanhamento} />
              <Route path="/jovem/:id" component={Acompanhamento} />
              <Route path="/conta" component={Conta} />
              {admin ? <Route path="/painel" component={Painel} /> : null}
              {admin ? <Route path="/jovens" component={Jovens} /> : null}
              {admin ? <Route path="/equipe" component={Equipe} /> : null}
              <Route>
                <Redirect to="/" />
              </Route>
            </Switch>
          </Transicao>
        </Suspense>
      </div>
    </FichasProvider>
  );
}

export function App() {
  return (
    <SessaoProvider>
      <Rotas />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            borderColor: 'var(--line)',
          },
        }}
      />
    </SessaoProvider>
  );
}
