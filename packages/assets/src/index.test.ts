// @vitest-environment jsdom
import { ROLE_IDS } from '@vila/roles'
import { describe, expect, test } from 'vitest'
import { CARD_BACK, LOGO, ROLE_ART, TAROT_NUMERAL, VILLAGE } from './index'

const PREFIX = 'data:image/svg+xml,'

function parse(url: string) {
  const source = decodeURIComponent(url.slice(PREFIX.length))
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml')
  return { source, doc }
}

describe('assets', () => {
  test('cada função tem uma carta própria', () => {
    expect(new Set(ROLE_IDS.map((id) => ROLE_ART[id])).size).toBe(ROLE_IDS.length)
  })

  test.each([...ROLE_IDS, 'verso' as const])('a carta %s é um SVG válido e sem texto', (id) => {
    const url = id === 'verso' ? CARD_BACK : ROLE_ART[id]
    expect(url.startsWith(PREFIX)).toBe(true)

    const { source, doc } = parse(url)
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0)
    expect(doc.documentElement.getAttribute('viewBox')).toBe('0 0 200 344')
    // Imagens SVG não carregam as fontes da página: os nomes ficam no HTML.
    expect(source).not.toContain('<text')
  })

  test('toda referência interna de uma carta existe nela mesma', () => {
    for (const url of [...Object.values(ROLE_ART), CARD_BACK]) {
      const { source, doc } = parse(url)
      const refs = [...source.matchAll(/(?:url\(#|href="#)([\w-]+)/g)].map((m) => m[1]!)
      for (const ref of refs) expect(doc.getElementById(ref), ref).not.toBeNull()
    }
  })

  test('cada carta tem um número de tarô só dela', () => {
    expect(new Set(ROLE_IDS.map((id) => TAROT_NUMERAL[id])).size).toBe(ROLE_IDS.length)
    for (const id of ROLE_IDS) expect(TAROT_NUMERAL[id], id).toMatch(/^(0|[IVX]+)$/)
    expect(TAROT_NUMERAL).toMatchObject({
      seer: 'II',
      assassin: 'XIII',
      detective: 'IX',
      doctor: 'XIV',
      villager: 'XII',
    })
  })

  test('há logotipo e cenário', () => {
    expect([LOGO, VILLAGE].every(Boolean)).toBe(true)
  })
})
