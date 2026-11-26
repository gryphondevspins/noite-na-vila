# Design: o grimório (novo visual do jogo inteiro)

## Intenção

Os amigos precisam sentir uma **atmosfera sombria** ao jogar. O visual anterior tinha "cara de IA"
e, no computador, era a tela do celular centralizada. Direção escolhida: **grimório satânico de
tarô**.

## Objetivos

- Restilizar todas as telas, com um layout próprio para computador e outro para celular.
- Interatividade e animações fluidas.
- Artes mais bonitas, no estilo de gravura de tarô.
- Som ambiente e de eventos, com botão de silenciar.

**Fora do escopo:** mudar regras, adicionar funções, jogo online.

**Fracasso, mesmo funcionando:** um efeito (visual, sonoro ou de tempo) entregar a função de alguém.

## Abordagens consideradas

| Direção | Troca | Escolha |
| --- | --- | --- |
| A. Grimório de tarô | Símbolos em gravura ficam refinados em SVG; pegada ocultista | **Escolhida** |
| B. Floresta de sombras | Suspense silencioso; depende de cenários, menos identidade nas cartas | Não |
| C. Arquivo noir | Combina com o detetive; perde o sobrenatural | Não |

## Decisões

- **Cartas** (200 x 344): papel envelhecido, tinta, vermelho sangue. Um símbolo por função:
  vidente = olho na mão (II); assassino = punhal atravessando a lua (XIII); detetive = lanterna e
  lente (IX); médico = máscara da peste (XIV); vítima = vela se apagando (XII).
- **Verso:** cabeça de bode no pentagrama invertido, igual para todos.
- **Fontes:** Pirata One (títulos) e EB Garamond (texto), embutidas para funcionar sem internet.
- **Computador (a partir de 900 x 560):** mesa de ritual. A roda fica em dois arcos nas laterais,
  quem está com o aparelho em destaque, carta no centro. Age-se clicando em quem está na roda.
- **Celular:** mesmo estilo, em coluna, com a roda em grade.
- **Texto:** o aparelho passa a ser chamado de "grimório", que serve para celular e notebook.
- **Animações:** virada de carta, brilho que segue o mouse, velas, brasas, fumaça, círculo ritual,
  cronômetro em forma de vela, cenas de amanhecer, morte, votação e vitória.
- **Som:** gerado no próprio aparelho (sem arquivos): vento e estalos ao fundo, virada de carta,
  sino nas mortes, acorde no fim. Silenciar fica salvo.

## Regras de segredo

1. A tela de passagem não tem nome, arte nem texto de função.
2. Nos turnos secretos, verso, virada, luz e duração são iguais para todas as funções.
3. Nos turnos secretos, os únicos sons são o de abrir e o de fechar a carta. Escolher alvos não
   faz som, porque o detetive escolhe dois e os outros escolhem um.
4. Telas secretas somem na hora: só há animação de entrada, nunca de saída.
5. A trava de 900 ms no botão "Sou …" continua.

A carta aberta é mais clara que o fundo: esconder a tela continua sendo responsabilidade de quem
joga.

## Restrições

Sem gerador de imagens: toda arte é SVG desenhado em código. Sem biblioteca de animação.
Com "reduzir movimento" ligado no sistema, nada se mexe e nada some.
