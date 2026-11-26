import { describe, expect, test } from 'vitest'
import { seatPlacement } from './seating'

const table = (count: number) => Array.from({ length: count }, (_, i) => seatPlacement(i, count))

describe('lugares na mesa do computador', () => {
  test('a roda desce pela esquerda e sobe pela direita', () => {
    const seats = table(16)
    const left = seats.slice(0, 8)
    const right = seats.slice(8)

    expect(left.every((s) => s.side === 'left')).toBe(true)
    expect(right.every((s) => s.side === 'right')).toBe(true)
    expect(left.map((s) => s.t)).toEqual([...left.map((s) => s.t)].sort((a, b) => a - b))
    expect(right.map((s) => s.t)).toEqual([...right.map((s) => s.t)].sort((a, b) => b - a))
  })

  test('com número ímpar, a esquerda fica com um a mais', () => {
    expect(table(5).map((s) => s.side)).toEqual(['left', 'left', 'left', 'right', 'right'])
  })

  test.each([4, 5, 9, 16])('com %i pessoas, ninguém ocupa o mesmo lugar', (count) => {
    const seats = table(count)

    expect(new Set(seats.map((s) => `${s.side}:${s.t.toFixed(4)}`)).size).toBe(count)
    for (const { t, bulge } of seats) {
      expect(t).toBeGreaterThan(0)
      expect(t).toBeLessThan(1)
      expect(bulge).toBeGreaterThanOrEqual(0)
      expect(bulge).toBeLessThanOrEqual(1)
    }
  })

  test('o meio do arco se afasta mais do centro que as pontas', () => {
    const [top, middle] = table(6)

    expect(middle!.bulge).toBeGreaterThan(top!.bulge)
  })
})
