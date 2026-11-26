import type { CampoAcompanhamento, Ficha, Status } from './tipos';

export type Tom = 'ok' | 'nao' | 'neutro' | 'aviso';
export interface Opcao {
  valor: string;
  rotulo: string;
  tom: Tom;
}
export interface Pergunta {
  campo: CampoAcompanhamento;
  rotulo: string;
  opcoes: Opcao[];
}

const simNao: Opcao[] = [
  { valor: 'sim', rotulo: 'Sim', tom: 'ok' },
  { valor: 'nao', rotulo: 'Não', tom: 'nao' },
];

/** As mesmas perguntas da planilha, na mesma ordem. */
export const PERGUNTAS: Pergunta[] = [
  { campo: 'contato', rotulo: 'Já entrou em contato?', opcoes: simNao },
  { campo: 'respondeu', rotulo: 'O jovem respondeu?', opcoes: simNao },
  { campo: 'frequentando', rotulo: 'Está frequentando as aulas?', opcoes: simNao },
  {
    campo: 'repassado',
    rotulo: 'Caso repassado ao cabeça de tribo?',
    opcoes: [...simNao, { valor: 'na', rotulo: 'Não se aplica', tom: 'neutro' }],
  },
  {
    campo: 'situacao',
    rotulo: 'Situação do acompanhamento',
    opcoes: [
      { valor: 'finalizado', rotulo: 'Finalizado', tom: 'ok' },
      { valor: 'recontatar', rotulo: 'Entrar em contato de novo', tom: 'aviso' },
    ],
  },
];

export const ROTULO: Record<string, string> = {
  sim: 'Sim',
  nao: 'Não',
  na: 'N/A',
  finalizado: 'Finalizado',
  recontatar: 'Entrar em contato novamente',
};

export const STATUS_ROTULO: Record<Status, string> = {
  pendente: 'Não iniciado',
  andamento: 'Em andamento',
  concluido: 'Concluído',
};

/** Recalcula o status no cliente (mesma regra da view) para atualização otimista. */
export const calcularStatus = (f: Ficha): Status => {
  if (f.situacao === 'finalizado') return 'concluido';
  const algum = f.contato || f.respondeu || f.frequentando || f.repassado || f.situacao;
  return algum || f.total_notas > 0 ? 'andamento' : 'pendente';
};
