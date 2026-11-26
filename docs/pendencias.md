# Pendências para colocar no ar

Feito: banco no Supabase (`supera-fju`, São Paulo), RLS, 107 jovens importados, app React.

## 1. E-mail (bloqueia o login dos voluntários)
O e-mail padrão do Supabase só entrega para membros da organização no Supabase e tem limite de
poucos envios por hora. Para os voluntários receberem o código:
- [ ] Criar conta no Resend (grátis até 3 mil e-mails/mês) e verificar um domínio.
- [ ] Supabase → Authentication → Emails → SMTP Settings: preencher com os dados do Resend.
- [ ] Supabase → Authentication → Emails → Templates → **Magic Link**: colar
      `supabase/templates/codigo-de-acesso.html` (é ele que mostra o código de 6 dígitos).

## 2. Endereço do site
- [ ] Publicar na Vercel (projeto novo ligado a este repositório; variáveis do `.env.example`).
- [ ] Supabase → Authentication → URL Configuration: **Site URL** = endereço da Vercel,
      e o mesmo endereço em **Redirect URLs** (senão o link do e-mail aponta para localhost).

## 3. Equipe
- [ ] Na aba Equipe, colocar o e-mail da Júlia Souza e do Obr Gabriel Bulhões e mandar o convite.

## 4. Conferir dados da planilha
- [ ] 11 contatos aparecem como "Jovem (sem nome salvo)": trocar pelo nome real na aba Jovens.
- [ ] "Sss (nome estilizado, conferir)": corrigir o nome.
- [ ] "Inglês B 2", "Inglês B 3" e "Inglês I 2" foram tratados como Inglês B / Inglês I.
      Se forem turmas diferentes, criar a aula na aba Jovens e reatribuir.
- [ ] Nenhum jovem tem telefone ainda; com telefone, a ficha ganha o botão de WhatsApp.
