import { LOGO, sound } from '@vila/assets'
import {
  alivePlayers,
  currentPlayer,
  playerById,
  privateNotes,
  submitVote,
  type GameState,
} from '@vila/engine'
import { useState } from 'react'
import { Handoff } from '../components/Handoff'
import { Notes } from '../components/Notes'
import { Page } from '../components/Page'
import { Ritual } from '../components/Ritual'

interface Props {
  game: GameState
  onChange: (game: GameState) => void
  onHome: () => void
}

export function VoteTurn({ game, onChange, onHome }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const voter = currentPlayer(game)
  const tag = `Votação ${game.round}`

  if (!revealed) {
    return (
      <Handoff
        players={game.players}
        player={voter}
        tag={tag}
        progress={`Voto ${game.turnIndex + 1} de ${game.turnOrder.length}`}
        hint="O voto é secreto."
        onReveal={() => {
          sound.play('flip')
          setRevealed(true)
        }}
        onHome={onHome}
      />
    )
  }

  function vote(targetId: string | null) {
    sound.play('flip')
    onChange(submitVote(game, targetId))
  }

  const chosen = selected[0]

  return (
    <Page name="game" tag={tag}>
      <Ritual
        variant="secret"
        players={game.players}
        current={voter.id}
        picking={{
          candidates: alivePlayers(game)
            .map((p) => p.id)
            .filter((id) => id !== voter.id),
          selected,
          max: 1,
          onChange: setSelected,
        }}
        top={
          <>
            <img className="sigil" src={LOGO} alt="" />
            <h1>{voter.name}, quem deve sair?</h1>
            <Notes game={game} notes={privateNotes(game, voter.id)} />
          </>
        }
        bottom={
          <>
            <p className="question" aria-live="polite">
              {chosen ? `Seu dedo aponta para ${playerById(game, chosen).name}.` : 'Aponte alguém na roda.'}
            </p>
            <button
              type="button"
              className="primary"
              disabled={!chosen}
              onClick={() => vote(chosen!)}
            >
              Confirmar voto
            </button>
            <button type="button" className="secondary" onClick={() => vote(null)}>
              Pular voto
            </button>
          </>
        }
      />
    </Page>
  )
}
