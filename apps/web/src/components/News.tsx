import { playerById, type GameState } from '@vila/engine'
import { ROLES } from '@vila/roles'

/** O que a roda inteira fica sabendo sobre os vivos. */
export function News({ game }: { game: GameState }) {
  const player = (id: string) => playerById(game, id)
  const revived = game.revived.map((id) => `${player(id).name} voltou dos mortos.`)
  const exposed = game.exposed.map(
    (id) => `A fofoca se espalhou: ${player(id).name} é ${ROLES[player(id).role].name}.`,
  )
  // O castigo acaba quando a votação termina.
  const silenced = (game.phase === 'voteResult' ? [] : game.silenced)
    .filter((id) => player(id).alive)
    .map((id) => `${player(id).name} está de castigo: hoje não fala nem vota.`)

  const lines = [...revived, ...exposed, ...new Set(silenced)]
  if (lines.length === 0) return null
  return (
    <ul className="notes">
      {lines.map((line) => (
        <li key={line} className="notice">
          {line}
        </li>
      ))}
    </ul>
  )
}
