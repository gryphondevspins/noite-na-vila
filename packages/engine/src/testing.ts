// Utilitários usados apenas pelos testes.
import type { RoleId } from '@vila/roles'
import {
  currentPlayer,
  endNightTurn,
  nightPrompt,
  submitNightAction,
  submitVote,
} from './index'
import type { ActionKind, GameState, Rng } from './index'
import { newGame } from './setup'

export const names = (n: number): string[] => Array.from({ length: n }, (_, i) => `J${i + 1}`)

export function seeded(seed: number): Rng {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/** Partida com as funções fixadas na ordem da roda; o id de cada jogador é o próprio nome. */
export function table(roles: Record<string, RoleId>, round = 1): GameState {
  const players = Object.entries(roles).map(([name, role]) => ({
    id: name,
    name,
    role,
    alive: true,
  }))
  return { ...newGame(players), round }
}

type Choice = string[] | { kind: ActionKind; targets: string[] }

/** Escolhe um poder que não é o primeiro oferecido no turno. */
export const use = (kind: ActionKind, ...targets: string[]): Choice => ({ kind, targets })

/**
 * Joga a noite inteira. Quem não estiver em `choices` guarda o poder, se puder,
 * ou escolhe os primeiros alvos válidos.
 */
export function playNight(game: GameState, choices: Record<string, Choice> = {}): GameState {
  let state = game
  while (state.phase === 'night') {
    const player = currentPlayer(state)
    const prompt = nightPrompt(state, player.id)
    const choice =
      choices[player.id] ??
      (prompt.skippable ? use('skip') : prompt.candidates.slice(0, prompt.count))
    const { kind, targets } = Array.isArray(choice)
      ? { kind: prompt.kind, targets: choice }
      : choice
    state = endNightTurn(submitNightAction(state, targets, kind))
  }
  return state
}

export function playVote(game: GameState, votes: Record<string, string | null>): GameState {
  let state = game
  while (state.phase === 'voting') {
    const choice = votes[currentPlayer(state).id] ?? null
    state = submitVote(state, choice)
  }
  return state
}

export const roleOf = (state: GameState, id: string): RoleId =>
  state.players.find((p) => p.id === id)!.role

export const isAlive = (state: GameState, id: string): boolean =>
  state.players.find((p) => p.id === id)!.alive
