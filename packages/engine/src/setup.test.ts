import { describe, expect, test } from 'vitest'
import { createGame, defaultSetup, validateGame } from './index'
import { names, seeded } from './testing'

const everyone = { detective: true, seer: true, doctor: true }

describe('novo jogo', () => {
  test('sorteia a função de todos antes de qualquer turno', () => {
    const game = createGame(names(6), everyone, seeded(1))

    expect(game.players).toHaveLength(6)
    expect(game.players.map((p) => p.role).sort()).toEqual(
      ['assassin', 'detective', 'doctor', 'seer', 'villager', 'villager'].sort(),
    )
    expect(game.turnIndex).toBe(0)
    expect(game.round).toBe(1)
    expect(game.phase).toBe('night')
  })

  test('mantém os jogadores na ordem da roda', () => {
    const game = createGame(['Ana', 'Bia', 'Caio', 'Gui'], defaultSetup(4), seeded(2))

    expect(game.players.map((p) => p.name)).toEqual(['Ana', 'Bia', 'Caio', 'Gui'])
    expect(game.turnOrder).toEqual(game.players.map((p) => p.id))
  })

  test('sorteios diferentes dão funções diferentes para a mesma roda', () => {
    const draws = new Set(
      Array.from({ length: 20 }, (_, seed) =>
        createGame(names(6), everyone, seeded(seed + 1)).players.map((p) => p.role).join(),
      ),
    )

    expect(draws.size).toBeGreaterThan(5)
  })

  test('funções desligadas viram vítimas', () => {
    const game = createGame(names(5), { detective: true, seer: false, doctor: false }, seeded(3))

    expect(game.players.filter((p) => p.role === 'villager')).toHaveLength(3)
    expect(game.players.some((p) => p.role === 'seer' || p.role === 'doctor')).toBe(false)
  })

  test('4 jogadores começam sem vidente; 5 ou mais com todas as funções', () => {
    expect(defaultSetup(4)).toEqual({ detective: true, seer: false, doctor: true })
    expect(defaultSetup(5)).toEqual(everyone)
  })

  test.each([
    ['poucos jogadores', names(3), defaultSetup(4), /pelo menos 4/],
    ['jogadores demais', names(17), everyone, /no máximo 16/],
    ['nome vazio', ['Ana', ' ', 'Caio', 'Gui'], defaultSetup(4), /sem nome/],
    ['nome repetido', ['Ana', 'ana ', 'Caio', 'Gui'], defaultSetup(4), /repetido/],
    ['nenhuma vítima', names(4), everyone, /pelo menos uma vítima/],
  ])('recusa %s', (_label, players, setup, message) => {
    expect(validateGame(players, setup)).toMatch(message)
    expect(() => createGame(players, setup, seeded(1))).toThrow(message)
  })

  test('aceita uma partida válida', () => {
    expect(validateGame(names(8), everyone)).toBeNull()
  })
})
