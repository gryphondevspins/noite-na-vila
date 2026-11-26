export interface SeatPlacement {
  side: 'left' | 'right'
  /** Altura na mesa, de 0 (topo) a 1 (base). */
  t: number
  /** Quanto o lugar se afasta do centro para formar o arco, de 0 a 1. */
  bulge: number
}

/** Distribui a roda em dois arcos: desce pela esquerda e sobe pela direita. */
export function seatPlacement(index: number, count: number): SeatPlacement {
  const leftCount = Math.ceil(count / 2)
  const isLeft = index < leftCount
  const sideCount = isLeft ? leftCount : count - leftCount
  const position = isLeft ? index : sideCount - 1 - (index - leftCount)
  const t = (position + 0.5) / sideCount
  return { side: isLeft ? 'left' : 'right', t, bulge: Math.sin(Math.PI * t) }
}
