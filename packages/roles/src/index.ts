import catalog from '../../../functions.json'

/** Funções que podem ser ligadas ou desligadas, na ordem em que aparecem no jogo. */
export const OPTIONAL_ROLE_IDS = [
  // descobrem
  'detective',
  'seer',
  'auraSeer',
  'apprentice',
  // protegem e atacam
  'doctor',
  'bodyguard',
  'witch',
  'vigilante',
  'priest',
  'redLady',
  'toughGuy',
  // mandam no dia
  'mayor',
  'baker',
  'grandma',
  'flowerChild',
  // reviravoltas
  'cupid',
  'avenger',
  'loudmouth',
  'ritualist',
  'graveRobber',
  // jogam por conta própria
  'fool',
  'headhunter',
  'arsonist',
] as const

export type OptionalRoleId = (typeof OPTIONAL_ROLE_IDS)[number]
export type RoleId = 'assassin' | OptionalRoleId | 'villager'

/** `solo` joga sozinho: cada um desses é um time próprio. */
export type Team = 'village' | 'assassin' | 'solo'

export type RoleGroup = 'info' | 'guard' | 'day' | 'twist' | 'solo'

export const ROLE_GROUPS: { id: RoleGroup; name: string }[] = [
  { id: 'info', name: 'Descobrem segredos' },
  { id: 'guard', name: 'Protegem e atacam' },
  { id: 'day', name: 'Mandam no dia' },
  { id: 'twist', name: 'Reviravoltas' },
  { id: 'solo', name: 'Jogam por conta própria' },
]

export interface Role {
  id: RoleId
  /** Nome do papel dentro do functions.json. */
  source: string
  name: string
  team: Team
  /** Sem grupo, a função está sempre no jogo. */
  group?: RoleGroup
  /** Descrição curta mostrada no catálogo e na carta. */
  description: string
}

interface CatalogEntry {
  nome: string
  traducao: string
  descricao: string
}

const entries: CatalogEntry[] = [
  ...catalog.equipes.vila,
  ...catalog.equipes.lobisomens,
  ...catalog.equipes.solo_votacao,
  ...catalog.equipes.solo_assassinos,
  ...catalog.equipes.sem_time,
]

function fromCatalog(
  id: RoleId,
  source: string,
  team: Team,
  overrides: Partial<Pick<Role, 'name' | 'description' | 'group'>> = {},
): Role {
  const entry = entries.find((e) => e.nome === source)
  if (!entry) throw new Error(`Papel "${source}" não encontrado no functions.json`)
  return { id, source, team, name: entry.traducao, description: entry.descricao, ...overrides }
}

// Várias descrições são reescritas: o catálogo foi feito para um jogo online, com lobos e
// chats secretos, e aqui há um aparelho só.
export const ROLES: Record<RoleId, Role> = {
  assassin: fromCatalog('assassin', 'Serial Killer', 'assassin', {
    name: 'Assassino',
    description: 'Mata um jogador por noite. Vence sozinho.',
  }),

  detective: fromCatalog('detective', 'Detective', 'village', { group: 'info' }),
  seer: fromCatalog('seer', 'Seer', 'village', { group: 'info' }),
  auraSeer: fromCatalog('auraSeer', 'Aura Seer', 'village', { group: 'info' }),
  apprentice: fromCatalog('apprentice', 'Seer Apprentice', 'village', {
    group: 'info',
    description:
      'Quando a Vidente, a Vidente de Aura ou o Detetive morre, herda a função de quem caiu.',
  }),

  doctor: fromCatalog('doctor', 'Doctor', 'village', { group: 'guard' }),
  bodyguard: fromCatalog('bodyguard', 'Bodyguard', 'village', {
    group: 'guard',
    description: 'Protege um jogador por noite. Se atacarem o protegido, morre no lugar dele.',
  }),
  witch: fromCatalog('witch', 'Witch', 'village', {
    group: 'guard',
    description: 'Tem uma poção que protege e uma que mata. Usa no máximo uma por noite.',
  }),
  vigilante: fromCatalog('vigilante', 'Vigilante', 'village', {
    group: 'guard',
    description: 'Tem uma única bala. Pode atirar em alguém durante uma noite.',
  }),
  priest: fromCatalog('priest', 'Priest', 'village', {
    group: 'guard',
    description:
      'Uma vez, joga água benta em alguém: se for um assassino, ele morre; se não for, morre o Padre.',
  }),
  redLady: fromCatalog('redLady', 'Red Lady', 'village', {
    group: 'guard',
    description:
      'Visita alguém à noite e não é achada em casa. Morre se visitar um matador ou quem foi atacado.',
  }),
  toughGuy: fromCatalog('toughGuy', 'Tough Guy', 'village', {
    group: 'guard',
    description: 'Aguenta o primeiro golpe que receber durante a noite.',
  }),

  mayor: fromCatalog('mayor', 'Mayor', 'village', {
    group: 'day',
    description: 'O voto dele vale por dois, em segredo.',
  }),
  baker: fromCatalog('baker', 'Baker', 'village', {
    group: 'day',
    description: 'Manda um pão a alguém à noite: essa pessoa ganha um voto a mais no dia seguinte.',
  }),
  grandma: fromCatalog('grandma', 'Grumpy Grandma', 'village', {
    group: 'day',
    description: 'Põe alguém de castigo: no dia seguinte, essa pessoa não pode falar nem votar.',
  }),
  flowerChild: fromCatalog('flowerChild', 'Flower Child', 'village', {
    group: 'day',
    description: 'Uma vez por partida, salva alguém de ser eliminado na votação do dia seguinte.',
  }),

  cupid: fromCatalog('cupid', 'Cupid', 'village', {
    group: 'twist',
    description:
      'Na primeira noite, une dois apaixonados: se um morre, o outro também. Se o casal for de times diferentes e só sobrarem os dois, eles vencem.',
  }),
  avenger: fromCatalog('avenger', 'Avenger', 'village', {
    group: 'twist',
    description: 'Marca alguém. Quando o Vingador morrer, a pessoa marcada morre junto.',
  }),
  loudmouth: fromCatalog('loudmouth', 'Loudmouth', 'village', {
    group: 'twist',
    description: 'Escolhe alguém. Quando o Fofoqueiro morrer, a função dessa pessoa vem a público.',
  }),
  ritualist: fromCatalog('ritualist', 'Ritualist', 'village', {
    group: 'twist',
    description: 'Uma vez por partida, traz um morto de volta à vida.',
  }),
  graveRobber: fromCatalog('graveRobber', 'Grave Robber', 'village', {
    group: 'twist',
    description: 'Fica com a função do primeiro morto da vila que tiver algum poder.',
  }),

  fool: fromCatalog('fool', 'Fool', 'solo', {
    group: 'solo',
    description: 'Vence sozinho se for eliminado pela votação.',
  }),
  headhunter: fromCatalog('headhunter', 'Headhunter', 'solo', {
    group: 'solo',
    description:
      'Recebe um alvo e vence sozinho se ele for eliminado pela votação. Se o alvo morrer de outro jeito, vira Vítima.',
  }),
  arsonist: fromCatalog('arsonist', 'Arsonist', 'solo', {
    group: 'solo',
    description:
      'Encharca até duas pessoas por noite ou põe fogo em todas as encharcadas. O fogo ignora proteção. Vence sozinho.',
  }),

  villager: fromCatalog('villager', 'Villager', 'village', { name: 'Vítima' }),
}

export const ROLE_IDS = Object.keys(ROLES) as RoleId[]
