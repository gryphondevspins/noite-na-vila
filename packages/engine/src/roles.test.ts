import { describe, expect, test } from 'vitest'
import {
  continueAfterDawn,
  continueAfterVote,
  createGame,
  currentPlayer,
  endDiscussion,
  nightPrompt,
  nightResult,
  privateNotes,
  submitNightAction,
  validateGame,
  winners,
  type GameState,
} from './index'
import { isAlive, names, playNight, playVote, roleOf, seeded, table, use } from './testing'

type Roles = Parameters<typeof table>[0]

/** Na ordem da roda, com três vítimas no fim. */
const cast = (roles: Roles, round = 2) =>
  table({ ...roles, V1: 'villager', V2: 'villager', V3: 'villager' }, round)

const turnOf = (state: GameState, id: string): GameState => ({
  ...state,
  turnIndex: state.turnOrder.indexOf(id),
})

const toVote = (state: GameState) => endDiscussion(continueAfterDawn(state))

/** Uma noite em que o assassino se volta contra V3, salvo outra escolha. */
const calm = (state: GameState, choices: Parameters<typeof playNight>[1] = {}) =>
  playNight(state, { Gui: ['V3'], ...choices })

/** Passa o dia sem ninguém votar. */
const nextNight = (dawn: GameState) => continueAfterVote(playVote(toVote(dawn), {}))

describe('guarda-costas', () => {
  test('morre no lugar de quem protege', () => {
    const dawn = playNight(cast({ Gui: 'assassin', Leo: 'bodyguard' }), {
      Gui: ['V1'],
      Leo: ['V1'],
    })

    expect(dawn.deaths).toEqual(['Leo'])
    expect(isAlive(dawn, 'V1')).toBe(true)
  })

  test('se o médico proteger o alvo, ninguém morre', () => {
    const state = cast({ Gui: 'assassin', Leo: 'bodyguard', Bia: 'doctor' })

    expect(playNight(state, { Gui: ['V1'], Leo: ['V1'], Bia: ['V1'] }).deaths).toEqual([])
  })
})

describe('bruxa', () => {
  const state = () => cast({ Gui: 'assassin', Wanda: 'witch' })

  test('escolhe entre curar, envenenar ou guardar', () => {
    const prompt = nightPrompt(state(), 'Wanda')

    expect(prompt).toMatchObject({ kind: 'heal', skippable: true })
    expect(prompt.alternative?.kind).toBe('poison')
  })

  test('a cura salva o alvo e só existe uma vez', () => {
    const dawn = playNight(state(), { Gui: ['V1'], Wanda: ['V1'] })

    expect(dawn.deaths).toEqual([])
    expect(nightPrompt(nextNight(dawn), 'Wanda')).toMatchObject({ kind: 'poison' })
    expect(nightPrompt(nextNight(dawn), 'Wanda').alternative).toBeUndefined()
  })

  test('o veneno mata, e sem poções ela só desconfia', () => {
    const first = calm(state(), { Wanda: use('poison', 'V1') })
    expect(first.deaths.sort()).toEqual(['V1', 'V3'])

    const second = playNight(nextNight(first), { Gui: ['V2'], Wanda: ['V2'] })
    expect(nightPrompt(nextNight(second), 'Wanda').kind).toBe('suspect')
  })

  test('guardar não gasta nada', () => {
    const dawn = calm(state(), { Wanda: use('skip') })

    expect(nightPrompt(nextNight(dawn), 'Wanda').alternative?.kind).toBe('poison')
  })
})

describe('justiceiro e padre', () => {
  test('o justiceiro atira uma vez só', () => {
    const dawn = calm(cast({ Gui: 'assassin', Jo: 'vigilante' }), { Jo: ['V1'] })

    expect(dawn.deaths.sort()).toEqual(['V1', 'V3'])
    expect(nightPrompt(nextNight(dawn), 'Jo').kind).toBe('suspect')
  })

  test('a água benta mata o assassino, mesmo protegido', () => {
    const state = cast({ Gui: 'assassin', Pio: 'priest', Bia: 'doctor' })

    const dawn = calm(state, { Pio: ['Gui'], Bia: ['Gui'] })

    expect(isAlive(dawn, 'Gui')).toBe(false)
    expect(dawn.winner).toBe('village')
  })

  test('a água benta em inocente mata o próprio padre', () => {
    const dawn = calm(cast({ Gui: 'assassin', Pio: 'priest' }), { Pio: ['V1'] })

    expect(isAlive(dawn, 'V1')).toBe(true)
    expect(isAlive(dawn, 'Pio')).toBe(false)
  })
})

describe('dama de vermelho', () => {
  const state = () => cast({ Gui: 'assassin', Rubi: 'redLady' })

  test('quem sai de casa escapa do ataque', () => {
    expect(playNight(state(), { Gui: ['Rubi'], Rubi: ['V1'] }).deaths).toEqual([])
  })

  test('morre se visitar o assassino', () => {
    expect(calm(state(), { Rubi: ['Gui'] }).deaths).toContain('Rubi')
  })

  test('morre se visitar quem foi atacado', () => {
    expect(calm(state(), { Rubi: ['V3'] }).deaths.sort()).toEqual(['Rubi', 'V3'])
  })
})

describe('durão', () => {
  test('aguenta o primeiro ataque e morre no segundo', () => {
    const first = playNight(cast({ Gui: 'assassin', Tito: 'toughGuy' }), { Gui: ['Tito'] })
    expect(first.deaths).toEqual([])

    expect(playNight(nextNight(first), { Gui: ['Tito'] }).deaths).toEqual(['Tito'])
  })
})

describe('informantes', () => {
  test.each([
    ['assassin', 'evil'],
    ['arsonist', 'evil'],
    ['fool', 'unknown'],
    ['headhunter', 'unknown'],
    ['witch', 'good'],
  ] as const)('a vidente de aura vê %s como %s', (role, aura) => {
    const state = cast({ Ada: 'auraSeer', Alvo: role })

    expect(nightResult(submitNightAction(state, ['Alvo']), 'Ada')).toEqual({
      type: 'aura',
      targetId: 'Alvo',
      aura,
    })
  })

  test('para o detetive, cada solitário é um time diferente', () => {
    const state = cast({ Dani: 'detective', Beto: 'fool', Pyro: 'arsonist' })

    expect(nightResult(submitNightAction(state, ['Beto', 'Pyro']), 'Dani')).toMatchObject({
      sameTeam: false,
    })
  })

  test('o aprendiz herda a função da vidente morta', () => {
    const dawn = playNight(cast({ Gui: 'assassin', Ana: 'seer', Nino: 'apprentice' }), {
      Gui: ['Ana'],
    })

    expect(roleOf(dawn, 'Nino')).toBe('seer')
    expect(privateNotes(dawn, 'Nino')).toContainEqual({ type: 'changed', from: 'apprentice' })
  })

  test('o ladrão de túmulos fica com a função do primeiro morto da vila', () => {
    const dawn = playNight(cast({ Gui: 'assassin', Bia: 'doctor', Rato: 'graveRobber' }), {
      Gui: ['Bia'],
    })

    expect(roleOf(dawn, 'Rato')).toBe('doctor')
  })

  test('o aprendiz exige alguém para substituir', () => {
    expect(validateGame(names(6), { apprentice: true })).toMatch(/Aprendiz/)
    expect(validateGame(names(6), { apprentice: true, auraSeer: true })).toBeNull()
  })
})

describe('mortes em cadeia', () => {
  test('o vingador leva junto quem marcou', () => {
    const dawn = playNight(cast({ Gui: 'assassin', Vini: 'avenger' }), {
      Gui: ['Vini'],
      Vini: ['V1'],
    })

    expect(dawn.deaths).toEqual(['Vini', 'V1'])
  })

  test('o fofoqueiro, ao morrer, expõe a função de quem escolheu', () => {
    const dawn = playNight(cast({ Gui: 'assassin', Fafa: 'loudmouth' }), {
      Gui: ['Fafa'],
      Fafa: ['Gui'],
    })

    expect(dawn.exposed).toEqual(['Gui'])
    expect(nextNight(dawn).exposed).toEqual([])
  })

  test('o cupido liga duas pessoas na primeira noite, e depois não mais', () => {
    const first = cast({ Gui: 'assassin', Edu: 'cupid' }, 1)
    expect(nightPrompt(first, 'Edu')).toMatchObject({ kind: 'link', count: 2 })

    const dawn = playNight(first, { Edu: ['V1', 'V2'] })
    expect(dawn.lovers).toEqual(['V1', 'V2'])
    expect(privateNotes(dawn, 'V2')).toContainEqual({ type: 'lover', partnerId: 'V1' })

    const second = endDiscussion(continueAfterDawn(dawn))
    expect(nightPrompt(second, 'Edu').kind).toBe('suspect')
    expect(playNight(second, { Gui: ['V1'] }).deaths).toEqual(['V1', 'V2'])
  })

  test('apaixonados de times diferentes vencem se sobrarem só os dois', () => {
    const state = table({ Gui: 'assassin', Bia: 'villager', Caio: 'villager' }, 2)

    const dawn = playNight({ ...state, lovers: ['Gui', 'Bia'] }, { Gui: ['Caio'] })

    expect(dawn.winner).toBe('lovers')
    expect(winners(dawn).sort()).toEqual(['Bia', 'Gui'])
  })
})

describe('o dia', () => {
  test('o voto do prefeito vale dois', () => {
    const vote = toVote(calm(cast({ Gui: 'assassin', Max: 'mayor' })))

    const result = playVote(vote, { Max: 'V1', V2: 'Gui' })

    expect(result.voteOutcome).toMatchObject({ eliminatedId: 'V1', tally: { V1: 2, Gui: 1 } })
    expect(privateNotes(vote, 'Max')).toContainEqual({ type: 'doubleVote' })
  })

  test('o pão do padeiro dá um voto a mais naquele dia', () => {
    const vote = toVote(calm(cast({ Gui: 'assassin', Pao: 'baker' }), { Pao: ['V2'] }))
    expect(privateNotes(vote, 'V2')).toContainEqual({ type: 'bread' })

    const result = playVote(vote, { V2: 'V1', V1: 'Gui' })

    expect(result.voteOutcome!.tally).toEqual({ V1: 2, Gui: 1 })
    expect(continueAfterVote(result).bread).toEqual([])
  })

  test('quem a vovó põe de castigo não vota naquele dia', () => {
    const vote = toVote(calm(cast({ Gui: 'assassin', Zuzu: 'grandma' }), { Zuzu: ['V1'] }))

    expect(vote.silenced).toEqual(['V1'])
    expect(vote.turnOrder).not.toContain('V1')
  })

  test('a criança das flores salva da forca uma vez', () => {
    const dawn = calm(cast({ Gui: 'assassin', Flor: 'flowerChild' }), { Flor: ['Gui'] })

    const result = playVote(toVote(dawn), { V1: 'Gui', V2: 'Gui' })

    expect(result.voteOutcome).toMatchObject({ eliminatedId: null, sparedId: 'Gui' })
    expect(isAlive(result, 'Gui')).toBe(true)
    expect(nightPrompt(continueAfterVote(result), 'Flor').kind).toBe('suspect')
  })

  test('as mortes em cadeia da votação aparecem no veredito', () => {
    const dawn = calm(cast({ Gui: 'assassin', Vini: 'avenger' }), { Vini: ['V1'] })

    const result = playVote(toVote(dawn), { V1: 'Vini', V2: 'Vini' })

    expect(result.voteOutcome).toMatchObject({ eliminatedId: 'Vini', alsoDied: ['V1'] })
  })

  test('o ritualista traz um morto de volta, uma vez', () => {
    const second = nextNight(calm(cast({ Gui: 'assassin', Rita: 'ritualist' })))
    expect(nightPrompt(second, 'Rita')).toEqual({
      kind: 'revive',
      count: 1,
      candidates: ['V3'],
      skippable: true,
    })

    const dawn = playNight(second, { Gui: ['V2'], Rita: ['V3'] })

    expect(dawn.revived).toEqual(['V3'])
    expect(isAlive(dawn, 'V3')).toBe(true)
    expect(nightPrompt(nextNight(dawn), 'Rita').kind).toBe('suspect')
  })

  test('sem mortos, o ritualista só desconfia', () => {
    expect(nightPrompt(cast({ Rita: 'ritualist' }), 'Rita').kind).toBe('suspect')
  })
})

describe('os do contra', () => {
  test('o bobo vence ao ser eliminado pela votação', () => {
    const dawn = calm(cast({ Gui: 'assassin', Beto: 'fool' }))

    const result = playVote(toVote(dawn), { V1: 'Beto', V2: 'Beto' })

    expect(result.winner).toBe('fool')
    expect(winners(result)).toEqual(['Beto'])
  })

  test('o caçador de cabeças recebe no sorteio um alvo da vila', () => {
    const game = createGame(names(6), { headhunter: true, fool: true }, seeded(4))
    const hunter = game.players.find((p) => p.role === 'headhunter')!
    const targetId = game.targets[hunter.id]!

    expect(roleOf(game, targetId)).toBe('villager')
    expect(privateNotes(game, hunter.id)).toContainEqual({ type: 'hunt', targetId })
  })

  test('o caçador vence se o alvo sair na votação', () => {
    const base = cast({ Gui: 'assassin', Hugo: 'headhunter' })
    const dawn = calm({ ...base, targets: { Hugo: 'V1' } })

    const result = playVote(toVote(dawn), { Gui: 'V1', V2: 'V1' })

    expect(result.winner).toBe('headhunter')
    expect(winners(result)).toEqual(['Hugo'])
  })

  test('se o alvo morrer de outro jeito, o caçador vira vítima', () => {
    const state = cast({ Gui: 'assassin', Hugo: 'headhunter' })

    const dawn = playNight({ ...state, targets: { Hugo: 'V1' } }, { Gui: ['V1'] })

    expect(roleOf(dawn, 'Hugo')).toBe('villager')
  })

  test('o incendiário encharca duas pessoas na primeira noite', () => {
    const state = cast({ Gui: 'assassin', Pyro: 'arsonist' }, 1)
    expect(nightPrompt(state, 'Pyro')).toMatchObject({ kind: 'douse', count: 2 })
    expect(nightPrompt(state, 'Pyro').alternative).toBeUndefined()

    expect(playNight(state, { Pyro: ['V1', 'V2'] }).doused).toEqual(['V1', 'V2'])
  })

  test('o fogo mata todos os encharcados, ignorando proteção', () => {
    const state = cast({ Gui: 'assassin', Pyro: 'arsonist', Bia: 'doctor' })
    const doused = { ...state, doused: ['V1', 'V2'] }
    expect(nightPrompt(doused, 'Pyro').alternative).toEqual({
      kind: 'ignite',
      count: 0,
      candidates: [],
    })

    const burned = calm(doused, { Pyro: use('ignite'), Bia: ['V1'] })

    expect(burned.deaths.sort()).toEqual(['V1', 'V2', 'V3'])
    expect(burned.doused).toEqual([])
  })

  test('com o assassino morto e o incendiário vivo, a partida continua', () => {
    const state = cast({ Gui: 'assassin', Pyro: 'arsonist', Pio: 'priest' })

    const dawn = calm(state, { Pio: ['Gui'], Pyro: ['V1', 'V2'] })

    expect(isAlive(dawn, 'Gui')).toBe(false)
    expect(dawn.winner).toBeNull()
  })

  test('o incendiário vence quando é o único matador entre os dois últimos', () => {
    const state = table({ Pyro: 'arsonist', Bia: 'villager', Caio: 'villager' }, 2)

    const dawn = playNight({ ...state, doused: ['Bia'] }, { Pyro: use('ignite') })

    expect(dawn.winner).toBe('arsonist')
  })

  test('se todos morrerem, ninguém vence', () => {
    const state = table({ Gui: 'assassin', Pyro: 'arsonist' }, 2)

    const dawn = playNight({ ...state, doused: ['Gui'] }, { Gui: ['Pyro'], Pyro: use('ignite') })

    expect(dawn.winner).toBe('nobody')
    expect(winners(dawn)).toEqual([])
  })
})

describe('regras gerais das funções novas', () => {
  test.each([
    'bodyguard',
    'witch',
    'vigilante',
    'redLady',
    'priest',
    'baker',
    'flowerChild',
  ] as const)('na primeira noite, %s não age', (role) => {
    expect(nightPrompt(cast({ X: role }, 1), 'X')).toMatchObject({ kind: 'rest', count: 1 })
  })

  test('só dá para guardar ou trocar de poder quando o turno oferece', () => {
    const state = turnOf(cast({ Gui: 'assassin' }), 'Gui')

    expect(() => submitNightAction(state, [], 'skip')).toThrow()
    expect(() => submitNightAction(state, ['V1'], 'poison')).toThrow()
    expect(currentPlayer(state).id).toBe('Gui')
  })
})
