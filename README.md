# Noite na Vila

Jogo de assassino, vítima e detetive inspirado no Wolvesville, para jogar em **um celular só**
passando pela roda.

**Jogar:** https://gryphondevspins.github.io/noite-na-vila/

No Android, o botão de tela cheia fica no topo, ao lado do som. No iPhone, o mesmo botão ensina a
adicionar o jogo à Tela de Início; aberto pelo ícone, ele roda sem as barras do Safari.

## Publicar

Cada `git push` na branch `main` roda os testes, compila e publica no GitHub Pages
(`.github/workflows/pages.yml`). Se um teste falhar, a versão no ar não muda.

## Como rodar

Precisa do [Node.js](https://nodejs.org) instalado.

```bash
npm install        # só na primeira vez
npm run celular    # compila e abre o jogo na rede
```

O terminal mostra um endereço `Network`, como `http://192.168.0.10:4173`. Com o celular no
**mesmo Wi-Fi** do computador, abra esse endereço no navegador. Se o Windows pedir permissão no
firewall, libere para redes privadas.

Por esse endereço o computador precisa continuar ligado. Para instalar o jogo no celular e
**jogar sem internet**, use o endereço publicado e depois "Adicionar à tela inicial".

## Regras

- De 4 a 16 jogadores, cadastrados na ordem da roda.
- As funções de todos são sorteadas de uma vez, antes de qualquer pessoa olhar a sua.
- **Primeira rodada:** ninguém morre e não há votação. Vidente e detetive já investigam.
- Ataques e proteções são resolvidos depois que todos jogaram.
- Quem morre ou é eliminado revela a função.
- Na votação, o mais votado sai. Empate não elimina ninguém. Dá para pular o voto.
- A vila vence quando não sobra nenhum matador (Assassino ou Incendiário). Um matador vence
  quando é o único e sobra só ele e mais uma pessoa. Se todos morrerem, ninguém vence.
- Proteção segura ataque, tiro e veneno. Fogo e água benta passam por qualquer proteção.
- Poderes de uso único podem ser guardados para outra noite.
- Na primeira noite não há mortes: só agem as funções que não matam nem protegem.
- Recados secretos (par apaixonado, alvo, troca de função, pão) aparecem só na vez da pessoa.

São 25 funções. Há sempre 1 assassino e pelo menos 1 vítima (sem poder; discute e vota).
Todas as outras podem ser ligadas ou desligadas. A partida começa com Detetive, Médico e,
com 5 ou mais pessoas, a Vidente.

| Grupo | Função | O que faz |
| --- | --- | --- |
| Descobrem | Detetive | Compara duas pessoas: mesmo time ou não |
| | Vidente | Vê a função exata de uma pessoa |
| | Vidente de Aura | Vê se a aura é boa, má (matadores) ou desconhecida (Bobo e Caçador) |
| | Aprendiz de Vidente | Herda a função do Detetive ou das videntes que morrer |
| Protegem e atacam | Médico | Protege outra pessoa por noite |
| | Guarda-costas | Protege alguém e morre no lugar |
| | Bruxa | Uma cura e um veneno, no máximo um por noite |
| | Justiceiro | Uma única bala |
| | Padre | Água benta, uma vez: mata um matador; em inocente, morre o Padre |
| | Dama de Vermelho | Sai de casa e escapa de ataques; morre se visitar matador ou atacado |
| | Durão | Aguenta o primeiro golpe da noite |
| Mandam no dia | Prefeito | Voto vale dois, em segredo |
| | Padeiro | Dá um voto a mais para alguém no dia seguinte |
| | Vovó Rabugenta | Deixa alguém sem falar nem votar no dia seguinte |
| | Criança das Flores | Uma vez, salva alguém da votação |
| Reviravoltas | Cupido | Une um casal na primeira noite; se um morre, o outro também |
| | Vingador | Leva junto quem marcou |
| | Fofoqueiro | Ao morrer, revela a função de quem escolheu |
| | Ritualista | Uma vez, revive um morto |
| | Ladrão de Túmulos | Fica com a função do primeiro morto da vila que tiver poder |
| Por conta própria | Bobo | Vence se for eliminado na votação |
| | Caçador de Cabeças | Vence se o alvo sorteado for eliminado na votação |
| | Incendiário | Encharca até duas pessoas por noite ou queima todas as encharcadas |

Os nomes vêm do `functions.json`; várias habilidades foram adaptadas para um aparelho só.

## Estrutura (monorepo com npm workspaces)

```
functions.json      catálogo de papéis do Wolvesville
packages/roles      lê o functions.json e define as funções do jogo
packages/engine     regras da partida, sem nenhuma tela
packages/assets     ilustrações em SVG e gerador dos ícones
apps/web            o aplicativo (React + Vite, instalável como PWA)
```

## Comandos

| Comando             | O que faz                                          |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Modo de desenvolvimento, com atualização na hora   |
| `npm test`          | Roda os testes                                     |
| `npm run typecheck` | Confere os tipos                                   |
| `npm run build`     | Gera a versão final em `apps/web/dist`             |
| `npm run celular`   | Gera a versão final e a serve na rede local        |
| `npm run icons`     | Recria os ícones PNG a partir do logotipo          |

## Para adicionar uma função nova

O `functions.json` descreve as habilidades só em texto, então cada função nova precisa de:

1. uma entrada em `packages/roles/src/index.ts`;
2. a regra em `packages/engine/src` (comece pelo teste; poderes da noite ficam em `night.ts`,
   efeitos de morte em `death.ts`);
3. uma ilustração em `packages/assets/src/arcana.ts`, registrada em `tarot.ts`;
4. a pergunta e a confirmação em `apps/web/src/screens/NightTurn.tsx`, se ela agir à noite.
