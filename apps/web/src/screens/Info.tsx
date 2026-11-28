import { MAX_PLAYERS, MIN_PLAYERS } from '@vila/engine'
import { ROLE_GROUPS, ROLE_IDS, ROLES, type Team } from '@vila/roles'
import { Page } from '../components/Page'
import { TarotCard } from '../components/TarotCard'

interface Props {
  onBack: () => void
}

const TEAMS: Record<Team, string> = {
  village: 'Time da vila',
  assassin: 'Time dos assassinos',
  solo: 'Joga sozinho',
}

export function RoleGuide({ onBack }: Props) {
  const sections = [{ id: undefined, name: 'Sempre no jogo' }, ...ROLE_GROUPS]

  return (
    <Page name="guide" back={{ label: 'Voltar', onClick: onBack }}>
      <h1 className="display">Os arcanos</h1>
      {sections.map((section) => (
        <section key={section.name} className="guide-group">
          <h2>{section.name}</h2>
          <ul className="gallery">
            {ROLE_IDS.filter((id) => ROLES[id].group === section.id).map((id, i) => (
              <li key={id} className="gallery__item">
                <TarotCard role={id} titleAs="h3" flip delay={150 + i * 110} />
                <div>
                  <p>{ROLES[id].description}</p>
                  <p className="eyebrow">{TEAMS[ROLES[id].team]}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Page>
  )
}

export function HowToPlay({ onBack }: Props) {
  return (
    <Page name="help" back={{ label: 'Voltar', onClick: onBack }}>
      <h1 className="display">Como jogar</h1>
      <div className="parchment scroll">
        <p>
          De {MIN_PLAYERS} a {MAX_PLAYERS} pessoas e um aparelho só. Cadastrem os nomes na ordem em
          que vocês estão sentados.
        </p>
        <ol className="steps">
          <li>
            <b>Sorteio.</b> Há sempre pelo menos um assassino e uma vítima. As outras vagas são
            sorteadas entre as cartas ligadas, de uma vez, antes de qualquer pessoa olhar.
          </li>
          <li>
            <b>Noite.</b> O grimório passa pela roda. Cada pessoa vê sua função e age em segredo.
            Quem não tem poder também faz uma escolha, para ninguém se entregar.
          </li>
          <li>
            <b>Amanhecer.</b> Ataques e proteções são resolvidos juntos, então a ordem da roda não
            muda nada.
          </li>
          <li>
            <b>Discussão.</b> Conversem em voz alta enquanto a vela queima.
          </li>
          <li>
            <b>Votação.</b> Cada um vota em segredo. O mais votado sai e revela a função. Empate
            não elimina ninguém.
          </li>
        </ol>
        <p className="notice">Na primeira rodada não há mortes e não há votação.</p>
        <p>
          <b>A vila vence</b> quando não sobra nenhum matador (Assassino ou Incendiário).{' '}
          <b>Um matador vence</b> quando é o único e sobra só ele e mais uma pessoa.{' '}
          <b>Vários assassinos vencem juntos</b> quando são pelo menos metade dos vivos e o
          Incendiário já caiu. O Bobo, o Caçador de Cabeças e os apaixonados têm vitórias
          próprias, escritas nas cartas.
        </p>
        <p>
          <b>Proteção</b> segura ataque, tiro e veneno. Fogo e água benta passam por qualquer
          proteção.
        </p>
        <p>
          Poderes de uso único podem ser guardados para outra noite. Recados secretos, como o nome
          do seu amor ou do seu alvo, aparecem só na sua vez.
        </p>
        <p>Quem sai do jogo não deve mais falar sobre a partida.</p>
      </div>
    </Page>
  )
}
