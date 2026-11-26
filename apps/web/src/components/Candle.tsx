import type { CSSProperties } from 'react'

interface Props {
  /** Quanto da vela ainda resta, de 0 a 1. */
  wax?: number
  /** Apagada: sem chama. */
  out?: boolean
  delay?: number
  className?: string
}

export function Candle({ wax = 1, out = false, delay = 0, className = '' }: Props) {
  return (
    <span
      className={`candle ${out ? 'candle--out' : ''} ${className}`}
      style={{ '--wax': wax, '--delay': `${delay}s` } as CSSProperties}
      aria-hidden="true"
    >
      <span className="candle__top">
        <span className="candle__glow" />
        <span className="candle__flame" />
        <span className="candle__wick" />
      </span>
      <span className="candle__wax" />
      <span className="candle__dish" />
    </span>
  )
}
