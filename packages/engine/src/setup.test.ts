import { describe, expect, test } from 'vitest'
import { OPTIONAL_ROLE_IDS, type RoleId } from '@vila/roles'
import { createGame, defaultSetup, maxAssassinsFor, validateGame } from './index'
import type { DrawRules, RoleSetup } from './index'
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
  ])('recusa %s', (_label, players, setup, message) => {
    expect(validateGame(players)).toMatch(message)
    expect(() => createGame(players, setup, seeded(1))).toThrow(message)
  })

  test('aceita uma partida válida', () => {
    expect(validateGame(names(8))).toBeNull()
  })
})

const allRoles: RoleSetup = Object.fromEntries(OPTIONAL_ROLE_IDS.map((role) => [role, true]))

const count = (roles: RoleId[], role: RoleId) => roles.filter((r) => r === role).length

/** As funções de muitos sorteios diferentes da mesma mesa. */
const draws = (players: number, setup: RoleSetup, rules?: DrawRules): RoleId[][] =>
  Array.from({ length: 300 }, (_, seed) =>
    createGame(names(players), setup, seeded(seed * 7919 + 1), rules).players.map((p) => p.role),
  )

describe('mais cartas ligadas do que vagas', () => {
  test.each<[string, RoleSetup]>([
    ['todas as funções', allRoles],
    ['três funções para duas vagas', everyone],
    ['só o aprendiz, sem ninguém para substituir', { apprentice: true }],
  ])('nada impede a partida com %s', (_label, setup) => {
    expect(() => createGame(names(4), setup, seeded(1))).not.toThrow()
  })

  test('sempre há 1 assassino e 1 vítima; o resto é sorteado entre as ligadas', () => {
    for (const roles of draws(4, everyone)) {
      expect(count(roles, 'assassin')).toBe(1)
      expect(count(roles, 'villager')).toBe(1)
      const others = roles.filter((r) => r !== 'assassin' && r !== 'villager')
      expect(new Set(others).size).toBe(2)
      for (const role of others) expect(['detective', 'seer', 'doctor']).toContain(role)
    }
  })

  test('toda carta ligada tem chance de entrar', () => {
    const seen = new Set(draws(4, allRoles).flat())

    for (const role of OPTIONAL_ROLE_IDS) expect(seen, role).toContain(role)
  })

  test('quem recebe cada função também é sorteado', () => {
    const seats = new Set(draws(5, everyone).map((roles) => roles.indexOf('assassin')))

    expect(seats.size).toBe(5)
  })

  test('sem repetição, o máximo de assassinos não vale', () => {
    for (const roles of draws(9, allRoles, { repeat: false, maxAssassins: 4 })) {
      expect(count(roles, 'assassin')).toBe(1)
      expect(new Set(roles).size).toBe(9)
    }
  })
})

describe('funções repetidas', () => {
  test.each([
    [4, 1],
    [5, 1],
    [6, 2],
    [7, 2],
    [8, 3],
    [16, 7],
  ])('com %i pessoas cabem no máximo %i assassinos', (players, max) => {
    expect(maxAssassinsFor(players)).toBe(max)
  })

  test('o número de assassinos varia entre 1 e o máximo escolhido', () => {
    const seen = draws(10, allRoles, { repeat: true, maxAssassins: 3 }).map((roles) =>
      count(roles, 'assassin'),
    )

    expect([...new Set(seen)].sort()).toEqual([1, 2, 3])
  })

  test('um máximo grande demais é reduzido', () => {
    for (const roles of draws(7, {}, { repeat: true, maxAssassins: 7 })) {
      expect(count(roles, 'assassin')).toBeLessThanOrEqual(2)
    }
  })

  test('mesmo com o máximo de assassinos, o primeiro ataque não encerra a partida', () => {
    for (let players = 6; players <= 16; players++) {
      expect(maxAssassinsFor(players) * 2).toBeLessThan(players - 1)
    }
  })

  test('sem escolher o máximo, há um só assassino', () => {
    for (const roles of draws(10, allRoles, { repeat: true })) {
      expect(count(roles, 'assassin')).toBe(1)
    }
  })

  test('uma função pode sair para várias pessoas, e sempre sobra uma vítima', () => {
    const results = draws(8, { doctor: true }, { repeat: true })

    expect(results.some((roles) => count(roles, 'doctor') >= 3)).toBe(true)
    for (const roles of results) {
      expect(count(roles, 'villager')).toBeGreaterThanOrEqual(1)
      expect(count(roles, 'doctor') + count(roles, 'villager')).toBe(7)
    }
  })

  test('Cupido e Incendiário nunca se repetem', () => {
    for (const roles of draws(12, { cupid: true, arsonist: true }, { repeat: true })) {
      expect(count(roles, 'cupid')).toBeLessThanOrEqual(1)
      expect(count(roles, 'arsonist')).toBeLessThanOrEqual(1)
    }
  })

  test('cada caçador de cabeças ganha um alvo da vila', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const game = createGame(names(8), { headhunter: true }, seeded(seed * 31), { repeat: true })
      for (const hunter of game.players.filter((p) => p.role === 'headhunter')) {
        const target = game.players.find((p) => p.id === game.targets[hunter.id])
        expect(target?.role).toBe('villager')
      }
    }
  })
})
