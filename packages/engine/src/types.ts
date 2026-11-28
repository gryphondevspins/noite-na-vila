import type { OptionalRoleId, RoleId } from '@vila/roles'

/** Devolve um número em [0, 1). */
export type Rng = () => number

export interface Player {
  id: string
  name: string
  role: RoleId
  alive: boolean
}

/** Funções ligadas na partida. O que não aparece está desligado. */
export type RoleSetup = Partial<Record<OptionalRoleId, boolean>>

export interface DrawRules {
  /** A mesma função pode sair para mais de uma pessoa. */
  repeat?: boolean
  /** Só vale com repetição: o sorteio põe de 1 até esta quantidade. */
  maxAssassins?: number
}

export type Phase = 'night' | 'dawn' | 'discussion' | 'voting' | 'voteResult' | 'gameOver'

export type Winner =
  | 'village'
  | 'assassin'
  | 'arsonist'
  | 'fool'
  | 'headhunter'
  | 'lovers'
  | 'nobody'

export interface VoteOutcome {
  eliminatedId: string | null
  tally: Record<string, number>
  /** Quem seria eliminado, mas foi salvo. */
  sparedId?: string
  /** Quem morreu junto com o eliminado. */
  alsoDied?: string[]
}

/**
 * `rest` e `suspect` não têm efeito. Existem para que todo turno seja parecido
 * e ninguém descubra uma função pelo tempo com o aparelho. `skip` guarda um poder.
 */
export type ActionKind =
  | 'attack'
  | 'protect'
  | 'inspect'
  | 'compare'
  | 'aura'
  | 'guard'
  | 'heal'
  | 'poison'
  | 'shoot'
  | 'water'
  | 'visit'
  | 'bread'
  | 'silence'
  | 'pardon'
  | 'link'
  | 'avenge'
  | 'gossip'
  | 'revive'
  | 'douse'
  | 'ignite'
  | 'skip'
  | 'suspect'
  | 'rest'

export interface NightAction {
  kind: ActionKind
  targets: string[]
}

/** Estado completo da partida. É JSON puro, para poder ser salvo no aparelho. */
export interface GameState {
  /** Na ordem da roda. */
  players: Player[]
  round: number
  phase: Phase
  /** Quem pega o aparelho na noite ou na votação atual. */
  turnOrder: string[]
  turnIndex: number
  /** O que cada jogador fez nesta noite. */
  actions: Record<string, NightAction>
  votes: Record<string, string | null>
  /** Quem morreu na última noite. */
  deaths: string[]
  voteOutcome: VoteOutcome | null
  winner: Winner | null

  /** Poderes de uso único que cada jogador já gastou. */
  used: Record<string, ActionKind[]>
  lovers: string[]
  /** Alvo atual de cada vingador. */
  avengeMarks: Record<string, string>
  /** Alvo atual de cada fofoqueiro. */
  gossipMarks: Record<string, string>
  doused: string[]
  /** Durões que já aguentaram o golpe. */
  hardened: string[]
  /** Alvo de cada caçador de cabeças. */
  targets: Record<string, string>
  /** Quem trocou de função, e qual era a anterior. */
  changed: Record<string, RoleId>

  // Valem do amanhecer até a noite seguinte.
  silenced: string[]
  bread: string[]
  pardoned: string[]
  revived: string[]
  /** Funções reveladas pela fofoca no último acontecimento. */
  exposed: string[]
}

export interface NightOption {
  kind: ActionKind
  count: number
  candidates: string[]
}

export interface NightPrompt extends NightOption {
  /** O poder pode ser guardado para outra noite. */
  skippable?: boolean
  /** Um segundo poder, que pode ser usado no lugar do primeiro. */
  alternative?: NightOption
}

export type Aura = 'good' | 'evil' | 'unknown'

export type NightResult =
  | { type: 'role'; targetId: string; role: RoleId }
  | { type: 'team'; targetIds: string[]; sameTeam: boolean }
  | { type: 'aura'; targetId: string; aura: Aura }
  | { type: 'none' }

/** Recado que só a própria pessoa lê, na vez dela. */
export type Note =
  | { type: 'allies'; ids: string[] }
  /** Quem os aliados que já jogaram nesta noite querem atacar. */
  | { type: 'plan'; picks: { allyId: string; targetId: string }[] }
  | { type: 'lover'; partnerId: string }
  | { type: 'hunt'; targetId: string }
  | { type: 'changed'; from: RoleId }
  | { type: 'doused'; ids: string[] }
  | { type: 'bread' }
  | { type: 'doubleVote' }
