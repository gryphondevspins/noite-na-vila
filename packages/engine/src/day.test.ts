import { describe, expect, test } from 'vitest'
import {
  continueAfterDawn,
  continueAfterVote,
  currentPlayer,
  endDiscussion,
  submitVote,
} from './index'
import { isAlive, playNight, playVote, table } from './testing'

const circle = {
  Ana: 'seer',
  Bia: 'doctor',
  Caio: 'villager',
  Dani: 'detective',
  Gui: 'assassin',
} as const

const discussion = (round: number, choices: Record<string, string[]> = {}) =>
  continueAfterDawn(playNight(table(circle, round), choices))

const voting = () => endDiscussion(discussion(2, { Gui: ['Caio'], Bia: ['Ana'] }))

describe('dia', () => {
  test('depois do amanhecer vem a discussão', () => {
    expect(discussion(1).phase).toBe('discussion')
  })

  test('na primeira rodada não há votação: já começa a segunda noite', () => {
    const next = endDiscussion(discussion(1))

    expect(next.phase).toBe('night')
    expect(next.round).toBe(2)
    expect(next.players.every((p) => p.alive)).toBe(true)
    expect(next.actions).toEqual({})
    expect(next.turnIndex).toBe(0)
  })

  test('da segunda rodada em diante há votação só entre os vivos', () => {
    const state = voting()

    expect(state.phase).toBe('voting')
    expect(state.turnOrder).toEqual(['Ana', 'Bia', 'Dani', 'Gui'])
  })

  test('o mais votado é eliminado', () => {
    const result = playVote(voting(), { Ana: 'Bia', Bia: 'Ana', Dani: 'Bia', Gui: 'Bia' })

    expect(result.phase).toBe('voteResult')
    expect(result.voteOutcome).toEqual({ eliminatedId: 'Bia', tally: { Bia: 3, Ana: 1 } })
    expect(isAlive(result, 'Bia')).toBe(false)
  })

  test('empate não elimina ninguém', () => {
    const result = playVote(voting(), { Ana: 'Bia', Bia: 'Ana', Dani: 'Bia', Gui: 'Ana' })

    expect(result.voteOutcome!.eliminatedId).toBeNull()
    expect(result.players.filter((p) => p.alive)).toHaveLength(4)
  })

  test('se todos pularem o voto, ninguém sai', () => {
    expect(playVote(voting(), {}).voteOutcome).toEqual({ eliminatedId: null, tally: {} })
  })

  test('não se vota em si mesmo nem em quem morreu', () => {
    expect(currentPlayer(voting()).id).toBe('Ana')
    expect(() => submitVote(voting(), 'Ana')).toThrow()
    expect(() => submitVote(voting(), 'Caio')).toThrow()
  })

  test('a vila vence ao eliminar o assassino', () => {
    const result = playVote(voting(), { Ana: 'Gui', Bia: 'Gui', Dani: 'Gui' })

    expect(result.winner).toBe('village')
    expect(continueAfterVote(result).phase).toBe('gameOver')
  })

  test('sem vencedor, a votação leva à próxima noite', () => {
    const next = continueAfterVote(playVote(voting(), {}))

    expect(next.phase).toBe('night')
    expect(next.round).toBe(3)
    expect(next.votes).toEqual({})
    expect(next.voteOutcome).toBeNull()
    expect(next.deaths).toEqual([])
    expect(next.turnOrder).toEqual(['Ana', 'Bia', 'Dani', 'Gui'])
  })

  test('se a noite decidir a partida, o amanhecer leva ao fim de jogo', () => {
    const state = table({ Gui: 'assassin', Bia: 'villager', Caio: 'villager' }, 2)

    expect(continueAfterDawn(playNight(state, { Gui: ['Bia'] })).phase).toBe('gameOver')
  })

  test('não é possível pular fases', () => {
    expect(() => endDiscussion(table(circle))).toThrow()
    expect(() => continueAfterDawn(table(circle))).toThrow()
    expect(() => submitVote(table(circle), null)).toThrow()
    expect(() => continueAfterVote(table(circle))).toThrow()
  })
})
