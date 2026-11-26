import type { Cue } from '@vila/assets'
import type { GameState } from '@vila/engine'

/** Sons de acontecimentos que a roda inteira pode ouvir. */
export function cueFor(previous: GameState, next: GameState): Cue | null {
  if (next.phase === previous.phase) return null
  if (next.phase === 'gameOver') return 'finale'
  const someoneLeft =
    (next.phase === 'dawn' && next.deaths.length > 0) ||
    (next.phase === 'voteResult' && next.voteOutcome?.eliminatedId != null)
  return someoneLeft ? 'bell' : null
}
