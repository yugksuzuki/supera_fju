# Pendências

Feito: banco no Supabase (`supera-fju`, São Paulo), RLS, 107 jovens importados, app React, login por
e-mail e senha, função `acessos` (admin cria e troca senhas), conta oficial da FJU como admin.

## Para colocar no ar
- [ ] Publicar na Vercel e ajustar o Supabase: roteiro pronto em [claude-no-chrome.md](claude-no-chrome.md).

## Equipe
- [ ] Entrar com a conta da FJU, aba Equipe: colocar e-mail e senha da Júlia Souza e do Obr Gabriel
      Bulhões e mandar o convite pelo WhatsApp.
- [ ] O cadastro "Guilherme Suzuki" (admin) ainda não tem senha: definir na aba Equipe se for usar.

## Conferir dados da planilha
- [ ] 11 contatos aparecem como "Jovem (sem nome salvo)": trocar pelo nome real na aba Jovens.
- [ ] "Sss (nome estilizado, conferir)": corrigir o nome.
- [ ] Aulas oficiais confirmadas (9): Desafiando o ENEM, Informática, Inglês Básico, Inglês Intermediário,
      Francês, DEV, Espanhol, Motiva, Supera. Os 3 contatos "Inglês B 2/B 3/I 2" (sem nome, da Júlia)
      foram para Inglês Básico/Intermediário; o número parecia só diferenciar contatos repetidos.
- [ ] Nenhum jovem tem telefone ainda; com telefone, a ficha ganha o botão de WhatsApp.

## Depois (opcional)
- [ ] "Esqueci minha senha" por e-mail: exige SMTP próprio (Resend) no Supabase. Hoje o admin troca a senha
      pela aba Equipe e cada um troca a sua clicando no próprio nome.
