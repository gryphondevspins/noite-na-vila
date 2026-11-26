// @vitest-environment jsdom
import { ROLE_ART, sound, type Cue } from '@vila/assets'
import { currentPlayer, nightPrompt, type GameState } from '@vila/engine'
import { OPTIONAL_ROLE_IDS, ROLES, type RoleId } from '@vila/roles'
import { act as flush, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { playNight as runNight, table, use } from '../../../packages/engine/src/testing'
import { App } from './App'
import { SAVE_KEY, saveMatch } from './storage'

const NAMES = ['Ana', 'Bia', 'Caio', 'Gui']

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const text = () => document.body.textContent ?? ''
const saved = (): GameState => JSON.parse(localStorage.getItem(SAVE_KEY)!).game
const byRole = (role: RoleId) => saved().players.find((p) => p.role === role)!

function addPlayers(names: string[]) {
  for (const name of names) {
    fireEvent.change(screen.getByLabelText('Nome do jogador'), { target: { value: name } })
    click('Adicionar')
  }
}

function startGame() {
  render(<App />)
  click('Novo jogo')
  addPlayers(NAMES)
  click('Sortear funções e começar')
}

const wait = (ms: number) => flush(() => void vi.advanceTimersByTime(ms))

function reveal() {
  wait(1000)
  click(`Sou ${currentPlayer(saved()).name}`)
}

/** Escolhe os alvos na tela. `wanted` tem prioridade sobre os primeiros da lista. */
function act(wanted: string[] = []) {
  const game = saved()
  const { count, candidates } = nightPrompt(game, currentPlayer(game).id)
  const ids = [...wanted.filter((id) => candidates.includes(id)), ...candidates]
  const targets = [...new Set(ids)].slice(0, count)
  const list = within(screen.getByRole('group', { name: 'Jogadores' }))
  for (const id of targets) {
    const { name } = game.players.find((p) => p.id === id)!
    fireEvent.click(list.getByRole('button', { name }))
  }
  click('Confirmar')
}

function playNight(choices: Partial<Record<RoleId, string>> = {}) {
  while (saved().phase === 'night') {
    const player = currentPlayer(saved())
    reveal()
    const wanted = choices[player.role]
    act(wanted ? [wanted] : [])
    click('Esconder e passar o grimório')
  }
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  sound.setMuted(false)
  vi.useRealTimers()
})

describe('aplicativo', () => {
  test('não deixa começar sem jogadores suficientes', () => {
    render(<App />)
    click('Novo jogo')
    addPlayers(['Ana', 'Bia', 'Caio'])

    expect(screen.getByRole('button', { name: 'Sortear funções e começar' })).toHaveProperty(
      'disabled',
      true,
    )
    expect(text()).toContain('pelo menos 4')
  })

  test('sorteia tudo no começo e a tela de passagem não revela nada', () => {
    startGame()

    expect(saved().players.map((p) => p.role)).toHaveLength(4)
    expect(text()).toContain('Entreguem o grimório a')
    expect(text()).toContain('Ana')
    for (const role of Object.values(ROLES)) expect(text()).not.toContain(role.name)
  })

  test('a tela de passagem não carrega a arte de nenhuma função', () => {
    startGame()
    const sources = [...document.images].map((img) => img.getAttribute('src'))

    for (const art of Object.values(ROLE_ART)) expect(sources).not.toContain(art)
  })

  test('todo turno secreto soa igual, seja qual for a função', () => {
    startGame()
    const heard: Cue[] = []
    const stop = sound.onCue((cue) => heard.push(cue))

    for (let turn = 0; turn < NAMES.length; turn++) {
      heard.length = 0
      reveal()
      act()
      click('Esconder e passar o grimório')
      expect(heard).toEqual(['flip', 'flip'])
    }
    stop()
  })

  test('dá para silenciar, e a escolha fica salva', () => {
    render(<App />)
    click('Silenciar')
    cleanup()

    render(<App />)

    expect(sound.isMuted()).toBe(true)
    click('Ativar som')
    expect(sound.isMuted()).toBe(false)
  })

  test('um toque duplo ao passar o celular não revela a próxima função', () => {
    startGame()
    reveal()
    act()
    click('Esconder e passar o grimório')

    click('Sou Bia')
    expect(screen.queryByText('Você é')).toBeNull()

    wait(1000)
    click('Sou Bia')
    expect(screen.getByText('Você é')).toBeTruthy()
  })

  test('cada pessoa vê a função que foi sorteada no começo', () => {
    startGame()
    const drawn = saved().players

    for (const player of drawn) {
      reveal()
      expect(screen.getByRole('heading', { name: ROLES[player.role].name })).toBeTruthy()
      act()
      click('Esconder e passar o grimório')
    }
  })

  test('recarregar volta à tela de passagem e não deixa refazer a ação', () => {
    startGame()
    reveal()
    act()
    cleanup()

    render(<App />)
    click('Continuar partida')
    expect(screen.queryByRole('heading', { name: ROLES[byRole('assassin').role].name })).toBeNull()
    reveal()

    expect(screen.queryByRole('button', { name: 'Confirmar' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Esconder e passar o grimório' })).toBeTruthy()
  })

  test('a primeira rodada não tem mortes nem votação', () => {
    startGame()
    playNight()

    expect(text()).toContain('Ninguém morreu')
    click('Começar a discussão')
    expect(screen.queryByRole('button', { name: 'Ir para a votação' })).toBeNull()
    click('Começar a segunda noite')

    expect(saved()).toMatchObject({ phase: 'night', round: 2 })
    expect(saved().players.every((p) => p.alive)).toBe(true)
  })

  test('uma partida completa termina quando a vila elimina o assassino', () => {
    const heard: Cue[] = []
    const stop = sound.onCue((cue) => heard.push(cue))
    startGame()
    playNight()
    expect(heard).not.toContain('bell')
    click('Começar a discussão')
    click('Começar a segunda noite')

    const assassin = byRole('assassin')
    const victim = byRole('villager')
    playNight({ assassin: victim.id, doctor: assassin.id })

    expect(text()).toContain(`${victim.name} morreu`)
    expect(heard.filter((cue) => cue === 'bell')).toHaveLength(1)
    click('Começar a discussão')
    click('Ir para a votação')

    while (saved().phase === 'voting') {
      const voter = currentPlayer(saved())
      reveal()
      if (voter.id === assassin.id) click('Pular voto')
      else {
        const list = within(screen.getByRole('group', { name: 'Jogadores' }))
        fireEvent.click(list.getByRole('button', { name: assassin.name }))
        click('Confirmar voto')
      }
    }

    expect(text()).toContain(`${assassin.name} saiu do jogo`)
    click('Ver o resultado')
    expect(text()).toContain('A vila venceu')
    expect(heard.filter((cue) => cue === 'bell')).toHaveLength(2)
    expect(heard.at(-1)).toBe('finale')
    stop()

    click('Jogar de novo com a mesma roda')
    expect(saved()).toMatchObject({ phase: 'night', round: 1 })
    expect(saved().players.map((p) => p.name)).toEqual(NAMES)
  })

  test('lembra os nomes da roda no próximo jogo', () => {
    startGame()
    cleanup()

    render(<App />)
    click('Novo jogo')

    for (const name of NAMES) expect(text()).toContain(name)
  })

  test('a tela de funções mostra o texto do functions.json', () => {
    render(<App />)
    click('Funções')

    expect(text()).toContain(ROLES.seer.description)
  })
})

/** Abre o aplicativo numa partida já montada. */
function resume(game: GameState) {
  saveMatch({ game, setup: {}, discussionMinutes: 3 })
  render(<App />)
  click('Continuar partida')
}

const seat = (name: string) =>
  within(screen.getByRole('group', { name: 'Jogadores' })).getByRole('button', { name })

const roles = (cast: Parameters<typeof table>[0], round = 2) =>
  table({ ...cast, Bia: 'villager', Caio: 'villager', Davi: 'villager' }, round)

describe('funções novas nas telas', () => {
  test('dá para ligar qualquer uma das funções opcionais', () => {
    render(<App />)
    click('Novo jogo')

    for (const id of OPTIONAL_ROLE_IDS) {
      expect(screen.getByRole('checkbox', { name: ROLES[id].name })).toBeTruthy()
    }
  })

  test('a bruxa troca de poção antes de confirmar', () => {
    resume(roles({ Wanda: 'witch', Gui: 'assassin' }))
    reveal()

    click('Veneno')
    fireEvent.click(seat('Bia'))
    click('Confirmar')

    expect(saved().actions.Wanda).toEqual({ kind: 'poison', targets: ['Bia'] })
  })

  test('um poder de uso único pode ser guardado', () => {
    resume(roles({ Jo: 'vigilante', Gui: 'assassin' }))
    reveal()

    click('Guardar para depois')

    expect(saved().actions.Jo).toEqual({ kind: 'skip', targets: [] })
    expect(text()).toContain('guardado')
  })

  test('o fogo não pede alvo', () => {
    resume({ ...roles({ Pyro: 'arsonist', Gui: 'assassin' }), doused: ['Bia'] })
    reveal()
    expect(text()).toContain('Já encharcados: Bia')

    click('Pôr fogo')
    click('Confirmar')

    expect(saved().actions.Pyro).toEqual({ kind: 'ignite', targets: [] })
  })

  test('o recado só aparece depois que a pessoa abre a própria vez', () => {
    resume({ ...roles({ Hugo: 'headhunter', Gui: 'assassin' }), targets: { Hugo: 'Bia' } })
    expect(text()).not.toContain('Seu alvo')

    wait(1000)
    click('Sou Hugo')

    expect(text()).toContain('Seu alvo é Bia')
  })

  test('a vidente de aura lê a aura no pergaminho', () => {
    resume(roles({ Ada: 'auraSeer', Gui: 'assassin' }))
    reveal()

    fireEvent.click(seat('Gui'))
    click('Confirmar')

    expect(text()).toContain('A aura de Gui é má')
  })

  test('o amanhecer anuncia castigo, fofoca e quem voltou', () => {
    const start = roles({ Zuzu: 'grandma', Rita: 'ritualist', Fafa: 'loudmouth', Gui: 'assassin' })
    start.players.find((p) => p.id === 'Davi')!.alive = false
    start.turnOrder = start.turnOrder.filter((id) => id !== 'Davi')

    resume(
      runNight(start, {
        Gui: ['Fafa'],
        Zuzu: ['Bia'],
        Rita: use('revive', 'Davi'),
        Fafa: ['Zuzu'],
      }),
    )

    expect(text()).toContain('Davi voltou dos mortos')
    expect(text()).toContain('Bia está de castigo')
    expect(text()).toContain('Zuzu é Vovó Rabugenta')
  })

  test('quem está de castigo não vota, mas pode receber voto', () => {
    const dawn = runNight(roles({ Zuzu: 'grandma', Gui: 'assassin' }), {
      Gui: ['Davi'],
      Zuzu: ['Bia'],
    })
    resume(dawn)
    click('Começar a discussão')
    click('Ir para a votação')
    reveal()

    expect(saved().turnOrder).not.toContain('Bia')
    expect(seat('Bia')).toBeTruthy()
  })

  test.each([
    ['fool', 'O Bobo venceu'],
    ['headhunter', 'O Caçador de Cabeças venceu'],
    ['arsonist', 'O Incendiário venceu'],
    ['lovers', 'Os apaixonados venceram'],
    ['nobody', 'Ninguém venceu'],
  ] as const)('o fim de jogo anuncia a vitória de %s', (winner, title) => {
    const game = roles({ Gui: 'assassin' })
    // A partida encerrada não aparece em "Continuar": chega-se a ela pelo veredito.
    resume({ ...game, phase: 'voteResult', winner, voteOutcome: { eliminatedId: null, tally: {} } })
    click('Ver o resultado')

    expect(text()).toContain(title)
  })
})
