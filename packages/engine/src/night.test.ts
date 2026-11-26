import { describe, expect, test } from 'vitest'
import {
  currentPlayer,
  endNightTurn,
  nightPrompt,
  nightResult,
  submitNightAction,
} from './index'
import { isAlive, playNight, table } from './testing'

const circle = {
  Ana: 'seer',
  Bia: 'doctor',
  Caio: 'villager',
  Dani: 'detective',
  Edu: 'villager',
  Gui: 'assassin',
} as const

describe('turnos da noite', () => {
  test('a vidente, mesmo sendo a primeira, vê a função de quem ainda não jogou', () => {
    const state = submitNightAction(table(circle), ['Gui'])

    expect(currentPlayer(state).id).toBe('Ana')
    expect(nightResult(state, 'Ana')).toEqual({ type: 'role', targetId: 'Gui', role: 'assassin' })
  })

  test.each([
    [['Caio', 'Edu'], true],
    [['Caio', 'Gui'], false],
  ])('o detetive compara %j e recebe mesmo time = %s', (targets, sameTeam) => {
    const state = submitNightAction({ ...table(circle), turnIndex: 3 }, targets)

    expect(nightResult(state, 'Dani')).toEqual({ type: 'team', targetIds: targets, sameTeam })
  })

  test('cada função escolhe só entre outros jogadores vivos', () => {
    const state = table(circle, 2)
    state.players.find((p) => p.id === 'Edu')!.alive = false

    expect(nightPrompt(state, 'Ana')).toEqual({
      kind: 'inspect',
      count: 1,
      candidates: ['Bia', 'Caio', 'Dani', 'Gui'],
    })
    expect(nightPrompt(state, 'Bia').kind).toBe('protect')
    expect(nightPrompt(state, 'Caio').kind).toBe('suspect')
    expect(nightPrompt(state, 'Dani')).toMatchObject({ kind: 'compare', count: 2 })
    expect(nightPrompt(state, 'Gui')).toMatchObject({ kind: 'attack', count: 1 })
  })

  test.each([
    ['em si mesmo', ['Ana']],
    ['em ninguém', []],
    ['em gente demais', ['Bia', 'Caio']],
    ['em quem não existe', ['Zeca']],
  ])('recusa ação %s', (_label, targets) => {
    expect(() => submitNightAction(table(circle), targets)).toThrow()
  })

  test('o detetive não pode comparar a mesma pessoa com ela mesma', () => {
    const state = { ...table(circle), turnIndex: 3 }

    expect(() => submitNightAction(state, ['Gui', 'Gui'])).toThrow()
  })

  test('ninguém age duas vezes no mesmo turno', () => {
    const state = submitNightAction(table(circle), ['Gui'])

    expect(() => submitNightAction(state, ['Bia'])).toThrow()
  })

  test('o turno só passa depois da ação', () => {
    expect(() => endNightTurn(table(circle))).toThrow()
    expect(currentPlayer(endNightTurn(submitNightAction(table(circle), ['Gui']))).id).toBe('Bia')
  })

  test('as ações não alteram o estado anterior', () => {
    const before = table(circle)
    submitNightAction(before, ['Gui'])

    expect(before.actions).toEqual({})
  })
})

describe('primeira noite', () => {
  test('o assassino não ataca e o médico não protege', () => {
    expect(nightPrompt(table(circle), 'Gui')).toMatchObject({ kind: 'rest', count: 1 })
    expect(nightPrompt(table(circle), 'Bia')).toMatchObject({ kind: 'rest', count: 1 })
  })

  test('ninguém morre', () => {
    const dawn = playNight(table(circle), { Gui: ['Ana'] })

    expect(dawn.phase).toBe('dawn')
    expect(dawn.deaths).toEqual([])
    expect(dawn.players.every((p) => p.alive)).toBe(true)
    expect(dawn.winner).toBeNull()
  })
})

describe('resolução da noite a partir da segunda rodada', () => {
  test('a vítima atacada morre quando amanhece', () => {
    const dawn = playNight(table(circle, 2), { Gui: ['Caio'], Bia: ['Edu'] })

    expect(dawn.deaths).toEqual(['Caio'])
    expect(isAlive(dawn, 'Caio')).toBe(false)
  })

  test('o médico salva mesmo jogando depois do assassino', () => {
    const order = { Gui: 'assassin', Bia: 'doctor', Caio: 'villager', Edu: 'villager' } as const

    const dawn = playNight(table(order, 2), { Gui: ['Caio'], Bia: ['Caio'] })

    expect(dawn.deaths).toEqual([])
    expect(isAlive(dawn, 'Caio')).toBe(true)
  })

  test('quem é atacado ainda joga o próprio turno naquela noite', () => {
    let state = table({ Gui: 'assassin', Ana: 'seer', Bia: 'villager', Caio: 'villager' }, 2)
    state = endNightTurn(submitNightAction(state, ['Ana']))

    expect(currentPlayer(state).id).toBe('Ana')
    expect(nightResult(submitNightAction(state, ['Gui']), 'Ana')).toMatchObject({
      role: 'assassin',
    })
  })

  test('o assassino vence quando sobra só mais uma pessoa', () => {
    const state = table({ Gui: 'assassin', Bia: 'villager', Caio: 'villager' }, 2)

    expect(playNight(state, { Gui: ['Bia'] }).winner).toBe('assassin')
  })
})
