export type SimNao = 'sim' | 'nao';
export type Repassado = SimNao | 'na';
export type Situacao = 'finalizado' | 'recontatar';
export type Status = 'pendente' | 'andamento' | 'concluido';
export type Papel = 'admin' | 'voluntario';

export interface Responsavel {
  id: string;
  nome: string;
  email: string | null;
  user_id: string | null;
  papel: Papel;
  ativo: boolean;
}

export interface Aula {
  id: number;
  nome: string;
}

/** Linha da view public.fichas */
export interface Ficha {
  id: string;
  nome: string;
  telefone: string | null;
  ativo: boolean;
  responsavel_id: string | null;
  responsavel_nome: string | null;
  aulas: string[];
  contato: SimNao | null;
  respondeu: SimNao | null;
  frequentando: SimNao | null;
  repassado: Repassado | null;
  situacao: Situacao | null;
  atualizado_em: string | null;
  total_notas: number;
  status: Status;
}

export type CampoAcompanhamento = 'contato' | 'respondeu' | 'frequentando' | 'repassado' | 'situacao';

export interface Nota {
  id: string;
  jovem_id: string;
  autor_id: string | null;
  texto: string;
  criado_em: string;
  autor?: { nome: string } | null;
}
