"""Gera o SQL de carga dos jovens a partir da planilha de acompanhamento.

Uso:  python3 scripts/planilha_para_sql.py JOVENS_SUPERA_ACOMPANHAMENTO.xlsx > supabase/seed.sql
Depois rode o seed.sql no SQL Editor do Supabase (ou peça ao Claude para rodar).

Colunas esperadas (aba 1, linha 1 = cabeçalho):
  A Nome | B Aula que frequenta | C Responsável | D..H respostas (ignoradas, exceto D e E)
"Inglês B e Informática" e "Francês/DEV" viram duas aulas; "Inglês B 2" vira "Inglês B"
(o texto original fica em jovens.aula_original para conferência).
O arquivo gerado tem nomes de jovens: NÃO faça commit dele (já está no .gitignore).
"""
import re
import sys

import openpyxl

q = lambda s: "'" + str(s).replace("'", "''") + "'"
SN = {'sim': 'sim', 'não': 'nao', 'nao': 'nao'}


def aulas(txt):
    return [re.sub(r'^(Inglês [BI]) \d$', r'\1', p.strip()) for p in re.split(r'\s+e\s+|/', txt.strip()) if p.strip()]


def main(caminho):
    ws = openpyxl.load_workbook(caminho, read_only=True).worksheets[0]
    linhas = [r for r in ws.iter_rows(min_row=2, values_only=True) if r and r[0]]
    todas = sorted({a for r in linhas for a in aulas(str(r[1] or ''))})
    resps = sorted({str(r[2]).strip() for r in linhas if r[2]})
    print('-- gerado por scripts/planilha_para_sql.py — não versionar')
    print('insert into public.aulas (nome) values ' + ', '.join(f'({q(a)})' for a in todas) + ' on conflict (nome) do nothing;')
    print('insert into public.responsaveis (nome) select v.nome from (values ' + ', '.join(f'({q(r)})' for r in resps)
          + ') v(nome) where not exists (select 1 from public.responsaveis r where r.nome = v.nome);')
    print('with dados (nome, aula_original, responsavel, contato, respondeu) as (values')
    print(',\n'.join(
        f"  ({q(str(r[0]).strip())}, {q(str(r[1] or '').strip())}, {q(str(r[2] or '').strip())}, "
        f"{q(SN[str(r[3]).strip().lower()]) if r[3] else 'null'}, {q(SN[str(r[4]).strip().lower()]) if len(r) > 4 and r[4] else 'null'})"
        for r in linhas))
    print('), ins as (')
    print('  insert into public.jovens (nome, aula_original, responsavel_id)')
    print('  select d.nome, d.aula_original, (select id from public.responsaveis r where r.nome = d.responsavel limit 1) from dados d')
    print('  returning id, nome, aula_original')
    print('), aulas_ins as (')
    print("  insert into public.jovem_aulas (jovem_id, aula_id)")
    print("  select distinct ins.id, a.id from ins")
    print("  cross join lateral regexp_split_to_table(ins.aula_original, '\\s+e\\s+|/') as p(parte)")
    print("  join public.aulas a on a.nome = regexp_replace(trim(p.parte), '^(Inglês [BI]) \\d$', '\\1')")
    print('  returning 1')
    print(')')
    print('insert into public.acompanhamentos (jovem_id, contato, respondeu)')
    print('select ins.id, d.contato, d.respondeu from ins join dados d on d.nome = ins.nome and d.aula_original = ins.aula_original')
    print('where d.contato is not null or d.respondeu is not null on conflict (jovem_id) do nothing;')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
