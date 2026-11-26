# DESIGN — SUPERA Acompanhamento

Modo: **Operate** (ferramenta de tarefa, usada no celular durante as ligações e no computador pela coordenação).
Refinamento da identidade do esboço original, não um visual novo.

## Identidade
- Selo circular SUPERA sempre sobre branco (`public/logo.webp`).
- Topo em gradiente vermelho 135° `#dd1b37 → #b01026` (o do esboço, escurecido para texto branco passar AA).
- Fonte única: Poppins 400/500/600/700, só subset latino.

## Tokens (`src/index.css`)
| Token | Claro | Uso |
|---|---|---|
| `--brand-400` `#ff2a44` | vermelho do selo | só destaque, nunca fundo de texto branco (3,7:1) |
| `--brand-600` `#d91a36` | botão primário, "Não" marcado | branco em cima: 5,1:1 |
| `--bg` `#fff8f7` / `--surface` `#fff` / `--surface-2` | rosado quente | fundo, cartões, segunda camada |
| `--ink` / `--ink-2` | `#2a1215` / `#6f5156` | texto / texto secundário (6,7:1) |
| `--ok` / `--warn-dot` / `--idle` | verde / âmbar / rosado acinzentado | concluído / em andamento / não iniciado |

Modo escuro por `prefers-color-scheme` ou `data-theme="dark"`.

## Elemento marcante (frontend-design: ousadia em um lugar só)
- **O cume:** a serra do selo vira a barra de progresso do topo; a parte branca sobe conforme os jovens são
  acompanhados e a bandeira fica no pico (100%). A mesma serra fecha a faixa vermelha do login.
- Login abre com o versículo do programa, João 21:16, por extenso.
- Fora isso, tudo quieto: sem textos de meta com "·", sem seta em botão, sem sombra repetida em todo cartão.

## Regras
- Status sempre com cor **e** rótulo (bolinha + texto, ou `aria-label`).
- Respostas Sim/Não são grupos de rádio (setas do teclado funcionam); tocar de novo desmarca.
- Ícones lucide, nunca emoji. Números com `tabular-nums`.
- Sem modais para tarefas: formulários de cadastro abrem em painel lateral.
- Movimento (GSAP, `src/lib/movimento.ts`) só para mostrar o que mudou; `prefers-reduced-motion` desliga tudo:
  - troca de aba: fade 240 ms (abas não têm relação espacial, nada desliza);
  - anterior/próximo jovem: desliza na direção do botão; lista → ficha no celular entra pela direita;
  - resposta marcada: "toque" de escala no botão; painel: barras crescem da esquerda; topo: o cume sobe e o % conta.
- Three.js só no login (`src/components/Montanhas3D.tsx`, carregado sob demanda): a serra facetada do selo com a
  bandeira no cume, paralaxe leve com mouse/dedo, pausa fora da tela. É o único momento "de palco" do app.
