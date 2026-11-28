import { ROLES, type RoleId } from '@vila/roles'
import type { GameState, Player, Winner } from './types'

export function playerById(state: GameState, id: string): Player {
  const player = state.players.find((p) => p.id === id)
  if (!player) throw new Error(`Jogador desconhecido: ${id}`)
  return player
}

export const isAliveId = (state: GameState, id: string): boolean => playerById(state, id).alive

export const alivePlayers = (state: GameState): Player[] => state.players.filter((p) => p.alive)

export const otherAliveIds = (state: GameState, id: string): string[] =>
  alivePlayers(state)
    .filter((p) => p.id !== id)
    .map((p) => p.id)

export function currentPlayer(state: GameState): Player {
  const id = state.turnOrder[state.turnIndex]
  if (id === undefined) throw new Error('Não há ninguém na vez')
  return playerById(state, id)
}

export function kill(state: GameState, ids: string[]): GameState {
  return {
    ...state,
    players: state.players.map((p) => (ids.includes(p.id) ? { ...p, alive: false } : p)),
  }
}

/** Quem mata sozinho e precisa cair para a vila vencer. */
export const isKiller = (role: RoleId): role is 'assassin' | 'arsonist' =>
  role === 'assassin' || role === 'arsonist'

/** Quem joga sozinho forma um time próprio. */
export const sideOf = (role: RoleId): string => (ROLES[role].team === 'solo' ? role : ROLES[role].team)

/**
 * Os assassinos vencem quando não há outro matador e eles já são pelo menos metade dos vivos.
 * Um matador sozinho vence quando sobra só ele e mais uma pessoa.
 */
export function findWinner(state: GameState): Winner | null {
  const alive = alivePlayers(state)
  if (alive.length === 0) return 'nobody'

  const onlyTheCouple = alive.length === 2 && alive.every((p) => state.lovers.includes(p.id))
  if (onlyTheCouple && sideOf(alive[0]!.role) !== sideOf(alive[1]!.role)) return 'lovers'

  const killers = alive.map((p) => p.role).filter(isKiller)
  if (killers.length === 0) return 'village'
  const onlyAssassins = killers.every((role) => role === 'assassin')
  if (onlyAssassins && killers.length * 2 >= alive.length) return 'assassin'
  return killers.length === 1 && alive.length <= 2 ? killers[0]! : null
}

/** Quem ganhou a partida. */
export function winners(state: GameState): string[] {
  const idsWhere = (test: (p: Player) => boolean) => state.players.filter(test).map((p) => p.id)
  const eliminated = state.voteOutcome?.eliminatedId

  switch (state.winner) {
    case 'village':
      return idsWhere((p) => ROLES[p.role].team === 'village')
    case 'assassin':
    case 'arsonist':
      return idsWhere((p) => p.role === state.winner)
    case 'fool':
      return eliminated ? [eliminated] : []
    case 'headhunter':
      return idsWhere((p) => p.role === 'headhunter' && state.targets[p.id] === eliminated)
    case 'lovers':
      return [...state.lovers]
    default:
      return []
  }
}

export function assertPhase(state: GameState, phase: GameState['phase']): void {
  if (state.phase !== phase) {
    throw new Error(`Ação fora de hora: a fase atual é "${state.phase}", não "${phase}"`)
  }
}
