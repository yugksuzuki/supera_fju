# Ajustes finais no Supabase (roteiro para o Claude no Chrome)

O app já está no ar em **https://supera-fju.vercel.app** (Vercel configurada, publicação automática a
cada push na branch `claude/vibrant-pascal-56waqf`). Falta só um reforço de segurança no Supabase, que
não dá para fazer pela API que o Claude Code usa. Cole o bloco abaixo no Claude no Chrome, logado no Supabase.

---

Abra https://supabase.com/dashboard/project/xqchheolsazkonyyleki e faça, sem alterar mais nada:

1. Authentication → **Sign In / Providers** → Email:
   - deixe "Enable Email provider" **ligado**;
   - **desligue** "Allow new users to sign up";
   - salve.
2. Authentication → **URL Configuration**:
   - Site URL = `https://supera-fju.vercel.app`
   - Redirect URLs: adicione `https://supera-fju.vercel.app/**`
   - salve.
3. Me mostre a tela de cada passo salvo.

---

Por que: o banco já recusa cadastro de e-mail fora da equipe; desligar o cadastro aberto fecha a porta
também na tela de autenticação. A URL só importa se um dia o login por e-mail for usado.
