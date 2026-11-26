import { ROTULO } from './perguntas';
import type { Ficha } from './tipos';

const celula = (v: unknown) => '"' + String(v ?? '').replace(/"/g, '""') + '"';

/** Planilha no mesmo formato do arquivo original (separador ; para abrir direto no Excel BR). */
export function fichasParaCsv(fichas: Ficha[], notas: Map<string, string>) {
  const cab = [
    'Nome',
    'Aula que frequenta',
    'Responsável',
    'Já entrou em contato?',
    'Jovem respondeu?',
    'Frequentando as aulas?',
    'Observações',
    'Caso repassado ao cabeça de tribo?',
    'Situação',
  ];
  const linhas = fichas.map((f) =>
    [
      f.nome,
      f.aulas.join(' e '),
      f.responsavel_nome,
      ROTULO[f.contato ?? ''],
      ROTULO[f.respondeu ?? ''],
      ROTULO[f.frequentando ?? ''],
      notas.get(f.id),
      ROTULO[f.repassado ?? ''],
      ROTULO[f.situacao ?? ''],
    ]
      .map(celula)
      .join(';'),
  );
  return '﻿' + [cab.map(celula).join(';'), ...linhas].join('\r\n');
}

export function baixar(nome: string, conteudo: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.append(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 500);
}
