import { OPTIONAL_ROLE_IDS, ROLES, type RoleId } from '@vila/roles'
import { INFORMERS } from './death'
import type { GameState, Player, RoleSetup, Rng } from './types'

export const MIN_PLAYERS = 4
export const MAX_PLAYERS = 16

export function defaultSetup(playerCount: number): RoleSetup {
  return { detective: true, seer: playerCount >= 5, doctor: true }
}

function specialRoles(setup: RoleSetup): RoleId[] {
  return ['assassin', ...OPTIONAL_ROLE_IDS.filter((role) => setup[role])]
}

/** Devolve o motivo pelo qual a partida não pode começar, ou `null` se estiver tudo certo. */
export function validateGame(names: string[], setup: RoleSetup): string | null {
  if (names.length < MIN_PLAYERS) return `São necessários pelo menos ${MIN_PLAYERS} jogadores.`
  if (names.length > MAX_PLAYERS) return `São no máximo ${MAX_PLAYERS} jogadores.`

  const normalized = names.map((name) => name.trim().toLocaleLowerCase('pt-BR'))
  if (normalized.some((name) => name === '')) return 'Há um jogador sem nome.'
  if (new Set(normalized).size !== normalized.length) return 'Há um nome repetido.'

  const specials = specialRoles(setup)
  if (specials.length >= names.length) {
    return 'Precisa sobrar pelo menos uma vítima. Desligue alguma função.'
  }
  if (specials.includes('apprentice') && !specials.some((role) => INFORMERS.includes(role))) {
    const informers = INFORMERS.map((role) => ROLES[role].name).join(', ')
    return `O ${ROLES.apprentice.name} precisa de alguém para substituir: ligue ${informers}.`
  }
  return null
}

export const secureRandom: Rng = () => {
  const [value] = crypto.getRandomValues(new Uint32Array(1))
  return value! / 4294967296
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

/** O começo de uma partida, com as funções já definidas. */
export function newGame(players: Player[]): GameState {
  return {
    players,
    round: 1,
    phase: 'night',
    turnOrder: players.map((p) => p.id),
    turnIndex: 0,
    actions: {},
    votes: {},
    deaths: [],
    voteOutcome: null,
    winner: null,
    used: {},
    lovers: [],
    avengeMarks: {},
    gossipMarks: {},
    doused: [],
    hardened: [],
    targets: {},
    changed: {},
    silenced: [],
    bread: [],
    pardoned: [],
    revived: [],
    exposed: [],
  }
}

/** Cada caçador de cabeças recebe alguém da vila como alvo. */
function huntTargets(players: Player[], rng: Rng): Record<string, string> {
  const village = players.filter((p) => ROLES[p.role].team === 'village')
  return Object.fromEntries(
    players
      .filter((p) => p.role === 'headhunter')
      .map((hunter) => [hunter.id, village[Math.floor(rng() * village.length)]!.id]),
  )
}

/** Sorteia a função de todos de uma vez, antes de qualquer pessoa olhar a sua. */
export function createGame(names: string[], setup: RoleSetup, rng: Rng = secureRandom): GameState {
  const problem = validateGame(names, setup)
  if (problem) throw new Error(problem)

  const specials = specialRoles(setup)
  const villagers = Array<RoleId>(names.length - specials.length).fill('villager')
  const deck = shuffle([...specials, ...villagers], rng)

  const players = names.map((name, i) => ({
    id: `p${i + 1}`,
    name: name.trim(),
    role: deck[i]!,
    alive: true,
  }))

  return { ...newGame(players), targets: huntTargets(players, rng) }
}
