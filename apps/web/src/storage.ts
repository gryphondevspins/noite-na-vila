import type { DrawRules, GameState, RoleSetup } from '@vila/engine'

export const SAVE_KEY = 'noite-na-vila:partida'
const TABLE_KEY = 'noite-na-vila:roda'
// A partida e a roda têm versões separadas: mudar as regras não apaga os nomes.
const MATCH_VERSION = 2
const TABLE_VERSION = 1

export interface Match {
  game: GameState
  setup: RoleSetup
  rules?: DrawRules
  discussionMinutes: number
}

export interface TablePrefs {
  names: string[]
  setup: RoleSetup
  rules?: DrawRules
  discussionMinutes: number
}

// O armazenamento pode estar bloqueado ou cheio; o jogo continua sem salvar.
function read(key: string, version: number): any {
  try {
    const data = JSON.parse(localStorage.getItem(key) ?? 'null')
    return data?.version === version ? data : null
  } catch {
    return null
  }
}

function write(key: string, version: number, value: object): void {
  try {
    localStorage.setItem(key, JSON.stringify({ version, ...value }))
  } catch {
    // sem armazenamento disponível
  }
}

export const saveMatch = (match: Match): void => write(SAVE_KEY, MATCH_VERSION, match)

export function loadMatch(): Match | null {
  const data = read(SAVE_KEY, MATCH_VERSION)
  if (!Array.isArray(data?.game?.players)) return null
  const { game, setup, rules, discussionMinutes } = data
  return { game, setup, rules, discussionMinutes }
}

export const saveTable = (prefs: TablePrefs): void => write(TABLE_KEY, TABLE_VERSION, prefs)

export function loadTable(): TablePrefs | null {
  const data = read(TABLE_KEY, TABLE_VERSION)
  if (!Array.isArray(data?.names)) return null
  const { names, setup, rules, discussionMinutes } = data
  return { names, setup, rules, discussionMinutes }
}
