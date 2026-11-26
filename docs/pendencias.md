# Pendências

Feito: banco no Supabase (`supera-fju`, São Paulo), RLS, 107 jovens importados, app React, login por
e-mail e senha, função `acessos` (admin cria e troca senhas), conta oficial da FJU como admin.

## Para colocar no ar
- [ ] Publicar na Vercel e ajustar o Supabase: roteiro pronto em [claude-no-chrome.md](claude-no-chrome.md).

## Equipe
- [x] Acessos criados com senha provisória (troca obrigatória no primeiro login): Guilherme Suzuki (admin),
      FJU Universitários (admin), Júlia Souza e Obr Gabriel Bulhões (voluntários).
- [ ] Mandar para cada um o link do site + e-mail + senha provisória (botão Convite na aba Equipe).
- [ ] A conta oficial da Força Jovem usa a mesma senha da provisória e **não** pede troca. Trocar a senha
      dela em "Minha conta" depois que todos tiverem entrado.

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
