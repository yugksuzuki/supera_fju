# SUPERA · Acompanhamento de Jovens

Sistema da Força Jovem Universal para a equipe do SUPERA acompanhar cada jovem: contato,
resposta, frequência nas aulas, repasse ao cabeça de tribo e observações com data e autor.

Substitui o arquivo HTML que salvava no navegador e era juntado por WhatsApp: agora todos
gravam no mesmo banco (Supabase), em tempo real.

## Como funciona
- **Entrar:** e-mail e senha. A coordenação cria o acesso na aba Equipe (função `acessos`);
  cada pessoa troca a própria senha clicando no nome, no topo.
- **Voluntário:** vê e preenche só os jovens atribuídos a ele.
- **Admin:** vê todos, acompanha o painel por responsável e por aula, baixa a planilha (CSV,
  mesmo formato da planilha original), cadastra jovens, aulas e equipe.

## Stack (cuoncient-web-stack · React)
React 19 · Vite 7 · TypeScript · Tailwind 4 · wouter · Supabase (Postgres + Auth + Realtime) ·
lucide-react · sonner · Poppins (@fontsource). Deploy na Vercel (`vercel.json` com headers de
segurança e `noindex`).

## Rodar
```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Banco
- `supabase/migrations/` — esquema, RLS e gatilhos (aplicado no projeto `supera-fju`).
- `scripts/planilha_para_sql.py` — gera a carga dos jovens a partir da planilha `.xlsx`.
  O SQL gerado tem dados pessoais e **não** vai para o repositório (ele é público).
- `supabase/functions/acessos/` — Edge Function que só admin chama para criar ou trocar senhas.

Regras de acesso (RLS): voluntário só lê/escreve os seus jovens; admin tudo; usuário anônimo
nada. Um cadastro novo em `auth.users` só é aceito se o e-mail estiver em `responsaveis`.

O que falta para ir ao ar: [docs/pendencias.md](docs/pendencias.md). Roteiro de publicação: [docs/claude-no-chrome.md](docs/claude-no-chrome.md).
