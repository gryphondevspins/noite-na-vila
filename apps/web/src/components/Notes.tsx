import { playerById, privateNotes, type GameState, type Note } from '@vila/engine'
import { ROLES } from '@vila/roles'

function describe(game: GameState, playerId: string, note: Note): string {
  const nameOf = (id: string) => playerById(game, id).name

  switch (note.type) {
    case 'allies':
      return `Também são assassinos: ${note.ids.map(nameOf).join(', ')}. Vocês vencem juntos.`
    case 'plan': {
      const picks = note.picks.map((p) => `${nameOf(p.allyId)} quer atacar ${nameOf(p.targetId)}`)
      return `${picks.join('; ')}. É um golpe só por noite: vale a maioria e, no empate, quem joga por último.`
    }
    case 'changed':
      return `Sua função mudou. Antes você era ${ROLES[note.from].name}.`
    case 'lover':
      return `Seu coração é de ${nameOf(note.partnerId)}. Se um morrer, o outro morre junto.`
    case 'hunt':
      return `Seu alvo é ${nameOf(note.targetId)}. Faça a votação eliminar essa pessoa.`
    case 'doused':
      return `Já encharcados: ${note.ids.map(nameOf).join(', ')}.`
    case 'bread': {
      const breads = game.bread.filter((id) => id === playerId).length
      return `Você ganhou pão: hoje seu voto vale ${breads > 1 ? breads : 'um'} a mais.`
    }
    case 'doubleVote':
      return 'Seu voto vale dois.'
  }
}

/** Recados secretos. Só podem aparecer depois que a pessoa abre a própria vez. */
export function Notes({ game, playerId }: { game: GameState; playerId: string }) {
  const notes = privateNotes(game, playerId)
  if (notes.length === 0) return null
  return (
    <ul className="notes">
      {notes.map((note) => (
        <li key={note.type} className="notice">
          {describe(game, playerId, note)}
        </li>
      ))}
    </ul>
  )
}
