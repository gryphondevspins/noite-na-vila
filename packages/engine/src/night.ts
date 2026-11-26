import type { RoleId } from '@vila/roles'
import { die } from './death'
import {
  assertPhase,
  currentPlayer,
  findWinner,
  isAliveId,
  isKiller,
  otherAliveIds,
  playerById,
  sideOf,
} from './players'
import type {
  ActionKind,
  Aura,
  GameState,
  NightAction,
  NightOption,
  NightPrompt,
  NightResult,
} from './types'

/** Os poderes de cada função, na ordem em que aparecem na tela. */
const POWERS: Partial<Record<RoleId, ActionKind[]>> = {
  assassin: ['attack'],
  detective: ['compare'],
  seer: ['inspect'],
  auraSeer: ['aura'],
  doctor: ['protect'],
  bodyguard: ['guard'],
  witch: ['heal', 'poison'],
  vigilante: ['shoot'],
  priest: ['water'],
  redLady: ['visit'],
  baker: ['bread'],
  grandma: ['silence'],
  flowerChild: ['pardon'],
  cupid: ['link'],
  avenger: ['avenge'],
  loudmouth: ['gossip'],
  ritualist: ['revive'],
  arsonist: ['douse', 'ignite'],
}

/** Poderes que só podem ser usados uma vez por partida. */
const ONCE: ActionKind[] = ['heal', 'poison', 'shoot', 'water', 'pardon', 'revive']

/** Os que não matam nem protegem, e por isso valem já na primeira rodada. */
const PEACEFUL: ActionKind[] = [
  'inspect',
  'compare',
  'aura',
  'silence',
  'link',
  'avenge',
  'gossip',
  'douse',
]

/** Na primeira rodada não há mortes. */
export const isPeacefulRound = (state: GameState): boolean => state.round === 1

/** O poder com seus alvos, ou `null` se não der para usá-lo nesta noite. */
function optionFor(state: GameState, playerId: string, kind: ActionKind): NightOption | null {
  if (state.used[playerId]?.includes(kind)) return null
  const others = otherAliveIds(state, playerId)
  const living = state.doused.filter((id) => isAliveId(state, id))

  switch (kind) {
    case 'ignite':
      return living.length > 0 ? { kind, count: 0, candidates: [] } : null
    case 'douse': {
      const dry = others.filter((id) => !state.doused.includes(id))
      return dry.length > 0 ? { kind, count: Math.min(2, dry.length), candidates: dry } : null
    }
    case 'revive': {
      const dead = state.players.filter((p) => !p.alive).map((p) => p.id)
      return dead.length > 0 ? { kind, count: 1, candidates: dead } : null
    }
    case 'link':
      return state.round === 1 && state.lovers.length === 0 && others.length >= 2
        ? { kind, count: 2, candidates: others }
        : null
    case 'compare':
      return { kind, count: 2, candidates: others }
    default:
      return { kind, count: 1, candidates: others }
  }
}

export function nightPrompt(state: GameState, playerId: string): NightPrompt {
  const powers = POWERS[playerById(state, playerId).role] ?? []
  const allowed = isPeacefulRound(state) ? powers.filter((k) => PEACEFUL.includes(k)) : powers
  const [first, second] = allowed.flatMap((kind) => optionFor(state, playerId, kind) ?? [])

  if (!first) {
    const heldBack = allowed.length < powers.length && !powers.some((k) => PEACEFUL.includes(k))
    return {
      kind: heldBack ? 'rest' : 'suspect',
      count: 1,
      candidates: otherAliveIds(state, playerId),
    }
  }

  const prompt: NightPrompt = { ...first }
  if (second) prompt.alternative = second
  if (ONCE.includes(first.kind) || first.kind === 'ignite') prompt.skippable = true
  return prompt
}

export function submitNightAction(
  state: GameState,
  targets: string[],
  kind?: ActionKind,
): GameState {
  assertPhase(state, 'night')
  const player = currentPlayer(state)
  if (state.actions[player.id]) throw new Error('Este jogador já agiu nesta noite')

  const prompt = nightPrompt(state, player.id)
  const chosen = kind ?? prompt.kind
  const option: NightOption | undefined =
    chosen === 'skip'
      ? prompt.skippable
        ? { kind: 'skip', count: 0, candidates: [] }
        : undefined
      : [prompt, prompt.alternative].find((o) => o?.kind === chosen)
  if (!option) throw new Error('Este poder não está disponível')

  const valid =
    targets.length === option.count &&
    new Set(targets).size === option.count &&
    targets.every((id) => option.candidates.includes(id))
  if (!valid) throw new Error('Alvos inválidos')

  const action: NightAction = { kind: chosen, targets: [...targets] }
  return { ...state, actions: { ...state.actions, [player.id]: action } }
}

function auraOf(role: RoleId): Aura {
  if (isKiller(role)) return 'evil'
  return role === 'fool' || role === 'headhunter' ? 'unknown' : 'good'
}

/** O que o jogador descobriu com a ação desta noite. */
export function nightResult(state: GameState, playerId: string): NightResult {
  const action = state.actions[playerId]
  if (!action) return { type: 'none' }
  const { kind, targets } = action
  const targetId = targets[0]!

  if (kind === 'inspect') {
    return { type: 'role', targetId, role: playerById(state, targetId).role }
  }
  if (kind === 'aura') {
    return { type: 'aura', targetId, aura: auraOf(playerById(state, targetId).role) }
  }
  if (kind === 'compare') {
    const [first, second] = targets.map((id) => sideOf(playerById(state, id).role))
    return { type: 'team', targetIds: targets, sameTeam: first === second }
  }
  return { type: 'none' }
}

/** Guarda o que dura além desta noite: poderes gastos, marcas e efeitos do dia. */
function applyMarks(state: GameState): GameState {
  const next: GameState = {
    ...state,
    used: { ...state.used },
    avengeMarks: { ...state.avengeMarks },
    gossipMarks: { ...state.gossipMarks },
    silenced: [],
    bread: [],
    pardoned: [],
  }
  for (const [actorId, { kind, targets }] of Object.entries(state.actions)) {
    const target = targets[0]!
    if (ONCE.includes(kind)) next.used[actorId] = [...(next.used[actorId] ?? []), kind]
    if (kind === 'link') next.lovers = [...targets]
    if (kind === 'avenge') next.avengeMarks[actorId] = target
    if (kind === 'gossip') next.gossipMarks[actorId] = target
    if (kind === 'silence') next.silenced.push(target)
    if (kind === 'bread') next.bread.push(target)
    if (kind === 'pardon') next.pardoned.push(target)
    if (kind === 'douse') next.doused = [...new Set([...next.doused, ...targets])]
  }
  return next
}

/** Quem morre pelo que foi feito nesta noite, antes das mortes em cadeia. */
function nightVictims(state: GameState): { victims: string[]; hardened: string[] } {
  const actions = Object.entries(state.actions).map(([actorId, a]) => ({ actorId, ...a }))
  const using = (...kinds: ActionKind[]) => actions.filter((a) => kinds.includes(a.kind))
  const roleOf = (id: string) => playerById(state, id).role

  const shielded = using('protect', 'heal').map((a) => a.targets[0]!)
  const attacks = using('attack', 'shoot', 'poison')
  const visits = using('visit')
  const awayFromHome = visits.map((a) => a.actorId)
  const victims: string[] = []
  const hardened = [...state.hardened]

  for (const attack of attacks) {
    const target = attack.targets[0]!
    if (awayFromHome.includes(target) || shielded.includes(target)) continue

    const guard = using('guard').find((a) => a.targets[0] === target)
    const victim = guard ? guard.actorId : target
    if (shielded.includes(victim)) continue

    if (roleOf(victim) === 'toughGuy' && !hardened.includes(victim)) hardened.push(victim)
    else victims.push(victim)
  }

  const attacked = attacks.map((a) => a.targets[0]!)
  for (const { actorId, targets } of visits) {
    const host = targets[0]!
    if (isKiller(roleOf(host)) || attacked.includes(host)) victims.push(actorId)
  }

  // Água benta e fogo ignoram qualquer proteção.
  for (const { actorId, targets } of using('water')) {
    const target = targets[0]!
    victims.push(isKiller(roleOf(target)) ? target : actorId)
  }
  if (using('ignite').length > 0) victims.push(...state.doused)

  return { victims: [...new Set(victims)], hardened }
}

/** Tudo vale só aqui, para a ordem da roda não influenciar. */
function resolveNight(state: GameState): GameState {
  const { victims, hardened } = nightVictims(state)
  const burned = Object.values(state.actions).some((a) => a.kind === 'ignite')
  const revived = Object.values(state.actions)
    .filter((a) => a.kind === 'revive')
    .map((a) => a.targets[0]!)

  const marked = applyMarks(state)
  const dawn: GameState = {
    ...marked,
    phase: 'dawn',
    hardened,
    doused: burned ? [] : marked.doused,
  }
  const { state: after, died } = die(dawn, victims)
  const risen: GameState = {
    ...after,
    deaths: died,
    revived,
    players: after.players.map((p) => (revived.includes(p.id) ? { ...p, alive: true } : p)),
  }
  return { ...risen, winner: findWinner(risen) }
}

export function endNightTurn(state: GameState): GameState {
  assertPhase(state, 'night')
  if (!state.actions[currentPlayer(state).id]) throw new Error('A ação ainda não foi feita')

  const turnIndex = state.turnIndex + 1
  return turnIndex < state.turnOrder.length ? { ...state, turnIndex } : resolveNight(state)
}
