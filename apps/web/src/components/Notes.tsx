import { playerById, type GameState, type Note } from '@vila/engine'
import { ROLES } from '@vila/roles'

function describe(game: GameState, note: Note): string {
  const nameOf = (id: string) => playerById(game, id).name

  switch (note.type) {
    case 'changed':
      return `Sua função mudou. Antes você era ${ROLES[note.from].name}.`
    case 'lover':
      return `Seu coração é de ${nameOf(note.partnerId)}. Se um morrer, o outro morre junto.`
    case 'hunt':
      return `Seu alvo é ${nameOf(note.targetId)}. Faça a votação eliminar essa pessoa.`
    case 'doused':
      return `Já encharcados: ${note.ids.map(nameOf).join(', ')}.`
    case 'bread':
      return 'Você ganhou pão: hoje seu voto vale um a mais.'
    case 'doubleVote':
      return 'Seu voto vale dois.'
  }
}

/** Recados secretos. Só podem aparecer depois que a pessoa abre a própria vez. */
export function Notes({ game, notes }: { game: GameState; notes: Note[] }) {
  if (notes.length === 0) return null
  return (
    <ul className="notes">
      {notes.map((note) => (
        <li key={note.type} className="notice">
          {describe(game, note)}
        </li>
      ))}
    </ul>
  )
}
