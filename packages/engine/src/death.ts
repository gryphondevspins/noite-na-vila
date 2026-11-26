import { ROLES, type RoleId } from '@vila/roles'
import { isAliveId, kill, playerById } from './players'
import type { GameState } from './types'

/** Funções que o aprendiz sabe substituir. */
export const INFORMERS: RoleId[] = ['seer', 'auraSeer', 'detective']

function becomes(state: GameState, id: string, role: RoleId): GameState {
  return {
    ...state,
    changed: { ...state.changed, [id]: playerById(state, id).role },
    players: state.players.map((p) => (p.id === id ? { ...p, role } : p)),
  }
}

/** Quem muda de função por causa das mortes que acabaram de acontecer. */
function inherit(state: GameState, died: string[], lynchedId: string | null): GameState {
  const fallen = died.map((id) => playerById(state, id).role)
  const informer = fallen.find((role) => INFORMERS.includes(role))
  const powerful = fallen.find(
    (role) => ROLES[role].team === 'village' && role !== 'villager' && role !== 'graveRobber',
  )

  return state.players
    .filter((p) => p.alive)
    .reduce((next, { id, role }) => {
      if (role === 'apprentice' && informer) return becomes(next, id, informer)
      if (role === 'graveRobber' && powerful) return becomes(next, id, powerful)
      const target = role === 'headhunter' ? state.targets[id] : undefined
      // O alvo eliminado pela votação é a vitória do caçador, não a perda dele.
      if (target && target !== lynchedId && !isAliveId(state, target)) {
        return becomes(next, id, 'villager')
      }
      return next
    }, state)
}

/**
 * Mata os jogadores e tudo o que vem em cadeia: o par apaixonado, a marca do vingador,
 * a revelação do fofoqueiro e as trocas de função.
 */
export function die(
  state: GameState,
  ids: string[],
  lynchedId: string | null = null,
): { state: GameState; died: string[] } {
  const queue = [...ids]
  const died: string[] = []
  const gossip: string[] = []

  while (queue.length > 0) {
    const id = queue.shift()!
    if (died.includes(id) || !isAliveId(state, id)) continue
    died.push(id)

    const { role } = playerById(state, id)
    if (state.lovers.includes(id)) queue.push(...state.lovers.filter((other) => other !== id))
    const avenged = state.avengeMarks[id]
    if (role === 'avenger' && avenged) queue.push(avenged)
    const talkedAbout = state.gossipMarks[id]
    if (role === 'loudmouth' && talkedAbout) gossip.push(talkedAbout)
  }

  const after = kill(state, died)
  // Quem morreu já tem a função revelada.
  const exposed = [...new Set(gossip)].filter((id) => isAliveId(after, id))
  return { state: inherit({ ...after, exposed }, died, lynchedId), died }
}
