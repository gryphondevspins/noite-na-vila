import type { GameState } from '@vila/engine'
import type { Match } from '../storage'
import { Dawn, Discussion, VoteResult } from './Day'
import { GameOver } from './GameOver'
import { NightTurn } from './NightTurn'
import { VoteTurn } from './VoteTurn'

interface Props {
  match: Match
  onChange: (game: GameState) => void
  onHome: () => void
  onRematch: () => void
}

export function Game({ match, onChange, onHome, onRematch }: Props) {
  const { game } = match
  const common = { game, onChange, onHome }
  // A chave faz cada turno começar escondido, na tela de passagem.
  const turn = `${game.round}-${game.turnIndex}`

  switch (game.phase) {
    case 'night':
      return <NightTurn key={turn} {...common} />
    case 'dawn':
      return <Dawn {...common} />
    case 'discussion':
      return <Discussion key={game.round} {...common} minutes={match.discussionMinutes} />
    case 'voting':
      return <VoteTurn key={turn} {...common} />
    case 'voteResult':
      return <VoteResult {...common} />
    case 'gameOver':
      return <GameOver game={game} onHome={onHome} onRematch={onRematch} />
  }
}
