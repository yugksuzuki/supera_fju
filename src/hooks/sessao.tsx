import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Responsavel } from '@/lib/tipos';

interface Sessao {
  carregando: boolean;
  sessao: Session | null;
  perfil: Responsavel | null;
  admin: boolean;
  sair: () => Promise<void>;
}

const Ctx = createContext<Sessao | null>(null);

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Responsavel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const userId = sessao?.user.id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      if (!data.session) setCarregando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSessao(s);
      if (!s) {
        setPerfil(null);
        setCarregando(false);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let vivo = true;
    setCarregando(true);
    supabase
      .from('responsaveis')
      .select('id, nome, email, user_id, papel, ativo')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!vivo) return;
        setPerfil((data as Responsavel | null) ?? null);
        setCarregando(false);
      });
    return () => {
      vivo = false;
    };
  }, [userId]);

  const valor: Sessao = {
    carregando,
    sessao,
    perfil,
    admin: perfil?.papel === 'admin' && perfil.ativo,
    sair: async () => {
      await supabase.auth.signOut();
    },
  };
  return <Ctx value={valor}>{children}</Ctx>;
}

export function useSessao() {
  const v = use(Ctx);
  if (!v) throw new Error('useSessao fora do SessaoProvider');
  return v;
}
