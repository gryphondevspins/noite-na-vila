import { MAX_PLAYERS, MIN_PLAYERS } from '@vila/engine'
import { ROLE_GROUPS, ROLE_IDS, ROLES } from '@vila/roles'
import { Page } from '../components/Page'
import { TarotCard } from '../components/TarotCard'

interface Props {
  onBack: () => void
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
                  <p className="eyebrow">
                    {ROLES[id].team === 'village' ? 'Time da vila' : 'Joga sozinho'}
                  </p>
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
            <b>Sorteio.</b> Todas as funções são definidas de uma vez, antes de qualquer pessoa
            olhar.
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
          <b>Um matador vence</b> quando é o único e sobra só ele e mais uma pessoa. O Bobo, o
          Caçador de Cabeças e os apaixonados têm vitórias próprias, escritas nas cartas.
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
