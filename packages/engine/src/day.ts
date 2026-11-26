import { die } from './death'
import { isPeacefulRound } from './night'
import {
  alivePlayers,
  assertPhase,
  currentPlayer,
  findWinner,
  isAliveId,
  otherAliveIds,
  playerById,
} from './players'
import type { GameState, VoteOutcome, Winner } from './types'

const aliveIds = (state: GameState): string[] => alivePlayers(state).map((p) => p.id)

function startNight(state: GameState): GameState {
  return {
    ...state,
    round: state.round + 1,
    phase: 'night',
    turnOrder: aliveIds(state),
    turnIndex: 0,
    actions: {},
    votes: {},
    deaths: [],
    voteOutcome: null,
    silenced: [],
    bread: [],
    pardoned: [],
    revived: [],
    exposed: [],
  }
}

export function continueAfterDawn(state: GameState): GameState {
  assertPhase(state, 'dawn')
  return { ...state, phase: state.winner ? 'gameOver' : 'discussion' }
}

/** Na primeira rodada não há votação: a discussão leva direto à segunda noite. */
export function endDiscussion(state: GameState): GameState {
  assertPhase(state, 'discussion')
  if (isPeacefulRound(state)) return startNight(state)
  const voters = aliveIds(state).filter((id) => !state.silenced.includes(id))
  return { ...state, phase: 'voting', turnOrder: voters, turnIndex: 0, votes: {} }
}

const voteWeight = (state: GameState, voterId: string): number =>
  1 +
  (playerById(state, voterId).role === 'mayor' ? 1 : 0) +
  state.bread.filter((id) => id === voterId).length

/** O mais votado sai; em caso de empate, ninguém sai. */
function countVotes(state: GameState, votes: GameState['votes']): VoteOutcome {
  const tally: Record<string, number> = {}
  for (const [voterId, targetId] of Object.entries(votes)) {
    if (targetId) tally[targetId] = (tally[targetId] ?? 0) + voteWeight(state, voterId)
  }
  const most = Math.max(0, ...Object.values(tally))
  const leaders = Object.keys(tally).filter((id) => tally[id] === most)
  const leader = leaders.length === 1 ? leaders[0]! : null

  if (leader && state.pardoned.includes(leader)) {
    return { eliminatedId: null, tally, sparedId: leader }
  }
  return { eliminatedId: leader, tally }
}

/** Há quem vença só por esta pessoa ter sido eliminada pela votação. */
function lynchWinner(before: GameState, eliminatedId: string): Winner | null {
  if (playerById(before, eliminatedId).role === 'fool') return 'fool'
  const hunted = alivePlayers(before).some(
    (p) => p.role === 'headhunter' && before.targets[p.id] === eliminatedId,
  )
  return hunted && isAliveId(before, eliminatedId) ? 'headhunter' : null
}

/** `null` é voto pulado. */
export function submitVote(state: GameState, targetId: string | null): GameState {
  assertPhase(state, 'voting')
  const voter = currentPlayer(state)
  if (targetId !== null && !otherAliveIds(state, voter.id).includes(targetId)) {
    throw new Error('Voto inválido')
  }

  const votes = { ...state.votes, [voter.id]: targetId }
  const turnIndex = state.turnIndex + 1
  if (turnIndex < state.turnOrder.length) return { ...state, votes, turnIndex }

  const outcome = countVotes(state, votes)
  const result: GameState = {
    ...state,
    votes,
    voteOutcome: outcome,
    phase: 'voteResult',
    exposed: [],
  }
  const { eliminatedId } = outcome
  if (!eliminatedId) return { ...result, winner: findWinner(result) }

  const { state: after, died } = die(result, [eliminatedId], eliminatedId)
  const alsoDied = died.filter((id) => id !== eliminatedId)
  return {
    ...after,
    voteOutcome: alsoDied.length > 0 ? { ...outcome, alsoDied } : outcome,
    winner: lynchWinner(result, eliminatedId) ?? findWinner(after),
  }
}

export function continueAfterVote(state: GameState): GameState {
  assertPhase(state, 'voteResult')
  return state.winner ? { ...state, phase: 'gameOver' } : startNight(state)
}
