import { describe, expect, test } from 'vitest'
import { endNightTurn, nightPrompt, privateNotes, submitNightAction, winners } from './index'
import { findWinner } from './players'
import { isAlive, playNight, table, use } from './testing'

const duo = () =>
  table(
    {
      Gui: 'assassin',
      Rai: 'assassin',
      Bia: 'villager',
      Caio: 'villager',
      Davi: 'villager',
      Edu: 'villager',
    },
    2,
  )

describe('vários assassinos', () => {
  test('cada um sabe quem são os outros, e só eles', () => {
    expect(privateNotes(duo(), 'Gui')).toContainEqual({ type: 'allies', ids: ['Rai'] })
    expect(privateNotes(duo(), 'Rai')).toContainEqual({ type: 'allies', ids: ['Gui'] })
    expect(privateNotes(duo(), 'Bia')).toEqual([])
  })

  test('um assassino sozinho não recebe recado, nem depois que o aliado morre', () => {
    const game = duo()
    game.players.find((p) => p.id === 'Rai')!.alive = false

    expect(privateNotes(game, 'Gui')).toEqual([])
  })

  test('um não pode atacar o outro', () => {
    expect(nightPrompt(duo(), 'Gui')).toMatchObject({
      kind: 'attack',
      candidates: ['Bia', 'Caio', 'Davi', 'Edu'],
    })
  })

  test('juntos, dão um só golpe por noite', () => {
    const after = playNight(duo(), { Gui: ['Bia'], Rai: ['Bia'] })

    expect(after.deaths).toEqual(['Bia'])
    expect(after.winner).toBeNull()
  })

  test('quem joga depois vê a escolha do aliado', () => {
    const game = endNightTurn(submitNightAction(duo(), ['Bia']))

    expect(privateNotes(game, 'Rai')).toContainEqual({
      type: 'plan',
      picks: [{ allyId: 'Gui', targetId: 'Bia' }],
    })
    expect(privateNotes(game, 'Bia')).toEqual([])
  })

  test('se discordarem, vale a escolha de quem jogou por último', () => {
    const after = playNight(duo(), { Gui: ['Bia'], Rai: ['Caio'] })

    expect(after.deaths).toEqual(['Caio'])
    expect(isAlive(after, 'Bia')).toBe(true)
  })

  test('com três, vale a escolha da maioria', () => {
    const game = duo()
    game.players.find((p) => p.id === 'Edu')!.role = 'assassin'

    const after = playNight(game, { Gui: ['Bia'], Rai: ['Bia'], Edu: ['Caio'] })

    expect(after.deaths).toEqual(['Bia'])
  })

  test('quem não foi escolhido não conta como atacado', () => {
    const game = duo()
    game.players.find((p) => p.id === 'Davi')!.role = 'redLady'

    const after = playNight(game, { Gui: ['Bia'], Rai: ['Caio'], Davi: use('visit', 'Bia') })

    expect(isAlive(after, 'Davi')).toBe(true)
  })

  test('vencem juntos quando passam a ser metade dos vivos', () => {
    const game = duo()
    game.players.find((p) => p.id === 'Edu')!.alive = false
    game.turnOrder = game.turnOrder.filter((id) => id !== 'Edu')

    const after = playNight(game, { Gui: ['Bia'], Rai: ['Bia'] })

    expect(after.winner).toBe('assassin')
    expect(winners(after)).toEqual(['Gui', 'Rai'])
  })

  test('com o Incendiário vivo, os assassinos ainda não venceram', () => {
    const game = table({ Gui: 'assassin', Rai: 'assassin', Pyro: 'arsonist' }, 2)

    expect(findWinner(game)).toBeNull()
  })

  test('a vila só vence quando todos os assassinos caem', () => {
    const game = duo()
    game.players.find((p) => p.id === 'Gui')!.alive = false
    expect(findWinner(game)).toBeNull()

    game.players.find((p) => p.id === 'Rai')!.alive = false
    expect(findWinner(game)).toBe('village')
  })
})
