import { isAliveId, playerById } from './players'
import type { GameState, Note } from './types'

/** Os recados que só esta pessoa deve ler, na vez dela. */
export function privateNotes(state: GameState, playerId: string): Note[] {
  const { role } = playerById(state, playerId)
  const notes: Note[] = []

  const previous = state.changed[playerId]
  if (previous) notes.push({ type: 'changed', from: previous })

  const partnerId = state.lovers.includes(playerId)
    ? state.lovers.find((id) => id !== playerId)
    : undefined
  if (partnerId && isAliveId(state, partnerId)) notes.push({ type: 'lover', partnerId })

  const targetId = state.targets[playerId]
  if (role === 'headhunter' && targetId) notes.push({ type: 'hunt', targetId })

  const doused = state.doused.filter((id) => isAliveId(state, id))
  if (role === 'arsonist' && doused.length > 0) notes.push({ type: 'doused', ids: doused })

  if (state.phase === 'voting') {
    if (state.bread.includes(playerId)) notes.push({ type: 'bread' })
    if (role === 'mayor') notes.push({ type: 'doubleVote' })
  }
  return notes
}
