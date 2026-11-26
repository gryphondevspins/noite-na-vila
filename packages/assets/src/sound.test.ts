// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createSound, MUTE_KEY, type Cue } from './sound'

const CUES: Cue[] = ['flip', 'bell', 'finale']

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe('som', () => {
  test('funciona em silêncio onde não há áudio', () => {
    vi.stubGlobal('AudioContext', undefined)
    const sound = createSound()

    expect(() => {
      sound.unlock()
      CUES.forEach((cue) => sound.play(cue))
      sound.setMuted(true)
      sound.setMuted(false)
    }).not.toThrow()
  })

  test('um áudio bloqueado pelo navegador não derruba o jogo', () => {
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('bloqueado')
        }
      },
    )
    const sound = createSound()

    expect(() => {
      sound.unlock()
      sound.play('bell')
    }).not.toThrow()
  })

  test('começa com som e lembra de ter sido silenciado', () => {
    const sound = createSound()
    expect(sound.isMuted()).toBe(false)

    sound.setMuted(true)

    expect(localStorage.getItem(MUTE_KEY)).toBe('1')
    expect(createSound().isMuted()).toBe(true)
  })

  test('avisa quem escuta quais sons foram pedidos, mesmo sem áudio', () => {
    const sound = createSound()
    const heard: Cue[] = []
    const stop = sound.onCue((cue) => heard.push(cue))

    sound.play('flip')
    stop()
    sound.play('bell')

    expect(heard).toEqual(['flip'])
  })
})
