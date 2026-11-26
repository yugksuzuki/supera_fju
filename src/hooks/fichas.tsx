import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { calcularStatus } from '@/lib/perguntas';
import type { CampoAcompanhamento, Ficha } from '@/lib/tipos';

interface Fichas {
  fichas: Ficha[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
  responder: (jovemId: string, campo: CampoAcompanhamento, valor: string | null) => Promise<void>;
  ajustarNotas: (jovemId: string, delta: number) => void;
}

const Ctx = createContext<Fichas | null>(null);

export function FichasProvider({ children }: { children: ReactNode }) {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recarregar = useCallback(async () => {
    const { data, error } = await supabase.from('fichas').select('*').order('nome');
    if (error) {
      setErro('Não foi possível carregar os jovens. Verifique a internet e tente de novo.');
    } else {
      setErro(null);
      setFichas(data as Ficha[]);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    recarregar();
    // Tempo real: quando alguém da equipe muda algo, a lista se atualiza sozinha.
    const agendar = () => {
      if (espera.current) clearTimeout(espera.current);
      espera.current = setTimeout(recarregar, 600);
    };
    const canal = supabase
      .channel('fichas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'acompanhamentos' }, agendar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notas' }, agendar)
      .subscribe();
    const aoVoltar = () => document.visibilityState === 'visible' && agendar();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      supabase.removeChannel(canal);
      document.removeEventListener('visibilitychange', aoVoltar);
      if (espera.current) clearTimeout(espera.current);
    };
  }, [recarregar]);

  const responder = useCallback(async (jovemId: string, campo: CampoAcompanhamento, valor: string | null) => {
    let anterior: Ficha | undefined;
    setFichas((lista) =>
      lista.map((f) => {
        if (f.id !== jovemId) return f;
        anterior = f;
        const nova = { ...f, [campo]: valor, atualizado_em: new Date().toISOString() } as Ficha;
        return { ...nova, status: calcularStatus(nova) };
      }),
    );
    const { error } = await supabase
      .from('acompanhamentos')
      .upsert({ jovem_id: jovemId, [campo]: valor }, { onConflict: 'jovem_id' });
    if (error) {
      if (anterior) {
        const volta = anterior;
        setFichas((lista) => lista.map((f) => (f.id === jovemId ? volta : f)));
      }
      toast.error('Não salvou. Confira a conexão e marque de novo.');
    }
  }, []);

  const ajustarNotas = useCallback((jovemId: string, delta: number) => {
    setFichas((lista) =>
      lista.map((f) => {
        if (f.id !== jovemId) return f;
        const nova = { ...f, total_notas: Math.max(0, f.total_notas + delta) };
        return { ...nova, status: calcularStatus(nova) };
      }),
    );
  }, []);

  return <Ctx value={{ fichas, carregando, erro, recarregar, responder, ajustarNotas }}>{children}</Ctx>;
}

export function useFichas() {
  const v = use(Ctx);
  if (!v) throw new Error('useFichas fora do FichasProvider');
  return v;
}
