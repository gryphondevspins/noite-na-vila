// As cores das cartas.
export const INK = '#1d130c'
export const BLOOD = '#7d1812'
export const BONE = '#e9dab2'
export const LIGHT = '#f4e9c8'
export const GOLD = '#a8863f'

/** Desenha o elemento `id` e o reflexo dele no outro lado da carta. */
export const mirrored = (id: string) =>
  `<use href="#${id}"/><use href="#${id}" transform="translate(200 0) scale(-1 1)"/>`
