import { OPTIONAL_ROLE_IDS } from '@vila/roles'
import { expect, test } from 'vitest'
import {
  continueAfterDawn,
  continueAfterVote,
  createGame,
  currentPlayer,
  endDiscussion,
  endNightTurn,
  nightPrompt,
  nightResult,
  privateNotes,
  submitNightAction,
  submitVote,
  winners,
  type GameState,
  type NightOption,
  type RoleSetup,
  type Rng,
} from './index'
import { names, seeded } from './testing'

const pick = <T>(items: T[], rng: Rng): T => items[Math.floor(rng() * items.length)]!

function sample<T>(items: T[], count: number, rng: Rng): T[] {
  const pool = [...items]
  return Array.from({ length: count }, () => pool.splice(Math.floor(rng() * pool.length), 1)[0]!)
}

function step(state: GameState, rng: Rng): GameState {
  switch (state.phase) {
    case 'night': {
      const { id } = currentPlayer(state)
      privateNotes(state, id)
      const prompt = nightPrompt(state, id)
      const options: NightOption[] = [prompt, prompt.alternative].filter((o) => o !== undefined)
      if (prompt.skippable) options.push({ kind: 'skip', count: 0, candidates: [] })
      const option = pick(options, rng)
      const targets = sample(option.candidates, option.count, rng)
      const acted = submitNightAction(state, targets, option.kind)
      nightResult(acted, id)
      return endNightTurn(acted)
    }
    case 'dawn':
      return continueAfterDawn(state)
    case 'discussion':
      return endDiscussion(state)
    case 'voting': {
      const voter = currentPlayer(state)
      const others = state.players.filter((p) => p.alive && p.id !== voter.id).map((p) => p.id)
      return submitVote(state, pick([...others, null], rng))
    }
    case 'voteResult':
      return continueAfterVote(state)
    default:
      return state
  }
}

test('milhares de partidas com sorteios aleatórios chegam ao fim sem erro', () => {
  const endings = new Set<string>()

  for (let seed = 1; seed <= 3000; seed++) {
    const rng = seeded(seed * 7919)
    const players = 4 + Math.floor(rng() * 13)
    const setup: RoleSetup = {}
    const wanted = sample(
      [...OPTIONAL_ROLE_IDS],
      Math.floor(rng() * (OPTIONAL_ROLE_IDS.length + 1)),
      rng,
    )
    for (const role of wanted) setup[role] = true
    // Metade das partidas com funções repetidas e vários assassinos.
    const rules = { repeat: seed % 2 === 0, maxAssassins: 1 + Math.floor(rng() * 7) }

    let state = createGame(names(players), setup, rng, rules)
    for (let steps = 0; state.phase !== 'gameOver'; steps++) {
      expect(steps, `partida ${seed} não termina`).toBeLessThan(5000)
      state = step(state, rng)
      // O jogo é salvo no aparelho: o estado precisa sobreviver ao JSON.
      expect(JSON.parse(JSON.stringify(state))).toEqual(state)
    }

    endings.add(state.winner!)
    for (const id of winners(state)) expect(state.players.map((p) => p.id)).toContain(id)
    if (state.winner !== 'nobody') expect(winners(state).length).toBeGreaterThan(0)
  }

  expect([...endings].sort()).toEqual(
    ['arsonist', 'assassin', 'fool', 'headhunter', 'lovers', 'nobody', 'village'],
  )
}, 60_000)
