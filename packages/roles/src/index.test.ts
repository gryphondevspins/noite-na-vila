import { describe, expect, test } from 'vitest'
import { OPTIONAL_ROLE_IDS, ROLE_GROUPS, ROLE_IDS, ROLES } from './index'

describe('catálogo de funções', () => {
  test('tem as 25 funções do jogo, sem repetir papel nem nome', () => {
    expect(ROLE_IDS).toHaveLength(25)
    expect(new Set(ROLE_IDS.map((id) => ROLES[id].source)).size).toBe(25)
    expect(new Set(ROLE_IDS.map((id) => ROLES[id].name)).size).toBe(25)
    expect([...ROLE_IDS].sort()).toEqual(['assassin', 'villager', ...OPTIONAL_ROLE_IDS].sort())
    for (const id of ROLE_IDS) expect(ROLES[id].id).toBe(id)
  })

  test('usa a descrição que está no functions.json', () => {
    expect(ROLES.seer.description).toBe('Descobre o papel exato de um jogador por noite.')
    expect(ROLES.detective.description).toBe(
      'Compara dois jogadores por noite e descobre se estão no mesmo time.',
    )
    expect(ROLES.doctor.source).toBe('Doctor')
  })

  test('nenhuma descrição menciona lobos, que não existem neste jogo', () => {
    expect(ROLES.assassin.source).toBe('Serial Killer')
    for (const id of ROLE_IDS) expect(ROLES[id].description, id).not.toMatch(/lob[oi]/i)
  })

  test('só o assassino e os solitários ficam fora do time da vila', () => {
    const outsiders = ROLE_IDS.filter((id) => ROLES[id].team !== 'village')
    expect(outsiders).toEqual(['assassin', 'fool', 'headhunter', 'arsonist'])
  })

  test('toda função opcional pertence a um grupo que existe', () => {
    const groups = ROLE_GROUPS.map((g) => g.id)
    for (const id of OPTIONAL_ROLE_IDS) expect(groups, id).toContain(ROLES[id].group)
    expect(ROLES.assassin.group).toBeUndefined()
    expect(ROLES.villager.group).toBeUndefined()
  })
})
