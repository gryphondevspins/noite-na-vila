import { winners, type GameState, type Winner } from '@vila/engine'
import { ROLES } from '@vila/roles'
import { Page } from '../components/Page'
import { TarotCard } from '../components/TarotCard'

const TITLES: Record<Winner, string> = {
  village: 'A vila venceu!',
  assassin: 'O assassino venceu!',
  arsonist: 'O Incendiário venceu!',
  fool: 'O Bobo venceu!',
  headhunter: 'O Caçador de Cabeças venceu!',
  lovers: 'Os apaixonados venceram!',
  nobody: 'Ninguém venceu.',
}

interface Props {
  game: GameState
  onHome: () => void
  onRematch: () => void
}

export function GameOver({ game, onHome, onRematch }: Props) {
  const winnerIds = winners(game)
  const title =
    game.winner === 'assassin' && winnerIds.length > 1
      ? 'Os assassinos venceram!'
      : TITLES[game.winner!]
  return (
    <Page name="gameover">
      <div className="verdict">
        <p className="eyebrow">O ritual terminou</p>
        <h1 className="title">{title}</h1>
      </div>
      <ul className="spread" data-count={game.players.length}>
        {game.players.map((player, i) => {
          const won = winnerIds.includes(player.id)
          const previous = game.changed[player.id]
          return (
            <li key={player.id} className={won ? 'spread__item spread__item--won' : 'spread__item'}>
              {/* As cartas viram uma a uma, na ordem da roda. */}
              <TarotCard role={player.role} flip delay={500 + i * 220} />
              <p className="spread__name">{player.name}</p>
              {previous && <p className="muted">era {ROLES[previous].name}</p>}
              {game.lovers.includes(player.id) && <p className="muted">apaixonado</p>}
              {!player.alive && <p className="muted">fora do jogo</p>}
            </li>
          )
        })}
      </ul>
      <div className="actions">
        <button type="button" className="primary" onClick={onRematch}>
          Jogar de novo com a mesma roda
        </button>
        <button type="button" className="secondary" onClick={onHome}>
          Voltar ao início
        </button>
      </div>
    </Page>
  )
}
