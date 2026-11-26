# Publicar o SUPERA Acompanhamento (roteiro para o Claude no Chrome)

Cole tudo abaixo no Claude no Chrome, já logado na Vercel e no Supabase com a conta do Gui.

---

Você vai publicar um app que já está pronto. Não altere código. Siga na ordem e me mostre a tela
antes de qualquer botão que apague algo ou que cobre dinheiro.

## 1. Vercel: criar o projeto
1. Abra https://vercel.com/new
2. Em "Import Git Repository", escolha **yugksuzuki/supera_fju**.
   Se o repositório não aparecer, clique em "Adjust GitHub App Permissions" e libere esse repositório.
3. Configure:
   - Project Name: `supera-fju`
   - Framework Preset: **Vite**
   - Install Command: `pnpm install`
   - Build Command: `pnpm build`
   - Output Directory: `dist`
4. Em "Environment Variables", adicione as duas (são chaves públicas, pode colar):
   - `VITE_SUPABASE_URL` = `https://xqchheolsazkonyyleki.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_vb0YyjWu5EDQmgq5GQTjsA_-3ZfuLBj`
5. Clique em **Deploy** e espere terminar.
6. Anote o endereço final (algo como `https://supera-fju.vercel.app`).
7. Em Settings → Git, confira se a Production Branch é `claude/vibrant-pascal-56waqf`
   (é a branch padrão do repositório hoje). Se não for, troque para ela.

## 2. Supabase: fechar cadastro e apontar o endereço
Projeto: https://supabase.com/dashboard/project/xqchheolsazkonyyleki

1. Authentication → **Sign In / Providers** → Email:
   - deixe "Enable Email provider" **ligado**;
   - **desligue** "Allow new users to sign up" (só a coordenação cria acessos, pelo próprio app);
   - salve.
2. Authentication → **URL Configuration**:
   - Site URL = o endereço anotado no passo 1.6;
   - em Redirect URLs, adicione o mesmo endereço com `/**` no final;
   - salve.

## 3. Testar
1. Abra o endereço da Vercel numa aba anônima.
2. Deve aparecer o selo do SUPERA com "Apascenta as minhas ovelhas".
3. Entre com o e-mail da conta oficial da Força Jovem (a senha o Gui passa para você na hora,
   não grave em lugar nenhum).
4. Confira se aparecem as abas Acompanhar, Painel, Jovens e Equipe e a lista com 107 jovens.
5. Me diga o endereço final e se o login funcionou.

---

Observações para o Gui:
- O plano Hobby da Vercel é para uso pessoal e não comercial. Se a FJU quiser ficar formal, o Pro custa US$ 20/mês.
- Depois de publicado, cadastre a equipe na aba **Equipe** (nome, e-mail, senha) e use o botão
  **Convite** para mandar pelo WhatsApp.
