// @vitest-environment jsdom
import { createGame, defaultSetup } from '@vila/engine'
import { beforeEach, describe, expect, test } from 'vitest'
import { loadMatch, loadTable, SAVE_KEY, saveMatch, type Match } from './storage'

const match = (): Match => ({
  game: createGame(['Ana', 'Bia', 'Caio', 'Gui'], defaultSetup(4)),
  setup: defaultSetup(4),
  discussionMinutes: 3,
})

beforeEach(() => localStorage.clear())

describe('partida salva no aparelho', () => {
  test('volta igual depois de salvar', () => {
    const original = match()
    saveMatch(original)

    expect(loadMatch()).toEqual(original)
  })

  test.each([
    ['nada salvo', null],
    ['texto quebrado', '{nao é json'],
    ['formato antigo', JSON.stringify({ version: 0, game: {} })],
    ['sem jogadores', JSON.stringify({ version: 2 })],
    [
      'partida de antes das funções novas',
      JSON.stringify({ version: 1, game: { players: [] }, setup: {}, discussionMinutes: 3 }),
    ],
  ])('ignora %s', (_label, raw) => {
    if (raw !== null) localStorage.setItem(SAVE_KEY, raw)

    expect(loadMatch()).toBeNull()
  })

  test('os nomes da roda salvos antes continuam valendo', () => {
    const prefs = { names: ['Ana'], setup: { seer: true }, discussionMinutes: 5 }
    localStorage.setItem('noite-na-vila:roda', JSON.stringify({ version: 1, ...prefs }))

    expect(loadTable()).toEqual(prefs)
  })
})
