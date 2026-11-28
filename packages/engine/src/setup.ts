import { OPTIONAL_ROLE_IDS, ROLES, UNIQUE_ROLE_IDS, type RoleId } from '@vila/roles'
import type { DrawRules, GameState, Player, RoleSetup, Rng } from './types'

export const MIN_PLAYERS = 4
export const MAX_PLAYERS = 16

export function defaultSetup(playerCount: number): RoleSetup {
  return { detective: true, seer: playerCount >= 5, doctor: true }
}

/**
 * A primeira rodada não tem votação. Para a vila chegar a votar, os assassinos precisam
 * continuar em minoria depois do primeiro ataque.
 */
export const maxAssassinsFor = (playerCount: number): number =>
  Math.max(1, Math.floor((playerCount - 2) / 2))

/** Devolve o motivo pelo qual a partida não pode começar, ou `null` se estiver tudo certo. */
export function validateGame(names: string[]): string | null {
  if (names.length < MIN_PLAYERS) return `São necessários pelo menos ${MIN_PLAYERS} jogadores.`
  if (names.length > MAX_PLAYERS) return `São no máximo ${MAX_PLAYERS} jogadores.`

  const normalized = names.map((name) => name.trim().toLocaleLowerCase('pt-BR'))
  if (normalized.some((name) => name === '')) return 'Há um jogador sem nome.'
  if (new Set(normalized).size !== normalized.length) return 'Há um nome repetido.'
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

const pick = <T>(items: T[], rng: Rng): T => items[Math.floor(rng() * items.length)]!

const times = (count: number, role: RoleId): RoleId[] => Array<RoleId>(count).fill(role)

/** Cada carta ligada entra no máximo uma vez. O que sobrar de vaga vira vítima. */
function singleDeck(count: number, enabled: RoleId[], rng: Rng): RoleId[] {
  const others = shuffle(enabled, rng).slice(0, count - 2)
  return ['assassin', 'villager', ...others, ...times(count - 2 - others.length, 'villager')]
}

/**
 * Primeiro sorteia quantos assassinos haverá, de 1 até o máximo. Cada vaga que sobra é
 * sorteada entre as cartas ligadas e a vítima.
 */
function repeatedDeck(count: number, enabled: RoleId[], max: number, rng: Rng): RoleId[] {
  const limit = Math.min(Math.max(1, max), maxAssassinsFor(count))
  const deck: RoleId[] = [...times(1 + Math.floor(rng() * limit), 'assassin'), 'villager']
  let pool: RoleId[] = [...enabled, 'villager']
  while (deck.length < count) {
    const role = pick(pool, rng)
    deck.push(role)
    if (UNIQUE_ROLE_IDS.includes(role)) pool = pool.filter((other) => other !== role)
  }
  return deck
}

/** As cartas da partida. Há sempre pelo menos 1 assassino e 1 vítima. */
function drawDeck(count: number, setup: RoleSetup, rules: DrawRules, rng: Rng): RoleId[] {
  const enabled = OPTIONAL_ROLE_IDS.filter((role) => setup[role])
  const deck = rules.repeat
    ? repeatedDeck(count, enabled, rules.maxAssassins ?? 1, rng)
    : singleDeck(count, enabled, rng)
  return shuffle(deck, rng)
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
    players.filter((p) => p.role === 'headhunter').map((hunter) => [hunter.id, pick(village, rng).id]),
  )
}

/** Sorteia a função de todos de uma vez, antes de qualquer pessoa olhar a sua. */
export function createGame(
  names: string[],
  setup: RoleSetup,
  rng: Rng = secureRandom,
  rules: DrawRules = {},
): GameState {
  const problem = validateGame(names)
  if (problem) throw new Error(problem)

  const deck = drawDeck(names.length, setup, rules, rng)

  const players = names.map((name, i) => ({
    id: `p${i + 1}`,
    name: name.trim(),
    role: deck[i]!,
    alive: true,
  }))

  return { ...newGame(players), targets: huntTargets(players, rng) }
}
