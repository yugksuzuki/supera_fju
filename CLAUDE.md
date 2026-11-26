# SUPERA · Acompanhamento — contexto para o Claude

- Cliente/frente: Força Jovem Universal (FJU), programa SUPERA. Dono: Gui (conta pessoal).
- Supabase: projeto `supera-fju`, ref `xqchheolsazkonyyleki`, região sa-east-1.
- Stack: cuoncient-web-stack (React). pnpm, nunca npm. Design: impeccable, modo Operate; ver DESIGN.md.
- **Repositório público:** nunca commitar nomes, telefones ou planilhas de jovens. Carga de dados só
  via `scripts/planilha_para_sql.py` rodando o SQL direto no banco.
- Mudança de esquema: novo arquivo em `supabase/migrations/` + aplicar no projeto + rodar os advisors.
- Acesso: `privado.sou_admin()`, `privado.meu_responsavel_id()`, `privado.posso_ver_jovem()` (security definer).
  A view `public.fichas` é `security_invoker` e alimenta lista, painel e CSV.
- Pendências de go-live: `docs/pendencias.md`.
