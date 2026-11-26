import { VILLAGE } from '@vila/assets'
import type { CSSProperties } from 'react'

export type Tone = 'night' | 'day'

const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 53 + 7) % 100}%`,
  animationDelay: `${-((i * 1.7) % 11)}s`,
  animationDuration: `${8 + ((i * 3) % 7)}s`,
  '--drift': `${((i % 5) - 2) * 3}vw`,
}))

/**
 * O cenário atrás de tudo. Depende só de ser noite ou dia, nunca de quem está jogando,
 * e continua no lugar quando as telas trocam.
 */
export function Atmosphere({ tone }: { tone: Tone }) {
  return (
    <div className={`atmosphere atmosphere--${tone}`} aria-hidden="true">
      <div className="atmosphere__dawn" />
      <div className="atmosphere__candlelight" />
      <svg className="atmosphere__circle" viewBox="-100 -100 200 200" fill="none">
        <g className="atmosphere__ring">
          <circle r="96" strokeWidth=".35" />
          <circle r="92" strokeWidth="2.4" strokeDasharray=".25 2.6" />
          <circle r="86" strokeWidth=".2" />
        </g>
        <g className="atmosphere__ring atmosphere__ring--reverse">
          <circle r="64" strokeWidth=".25" strokeDasharray="1 2.4" />
          <circle r="60" strokeWidth=".15" />
        </g>
        <path
          className="atmosphere__star"
          pathLength="1"
          d="M0 86L-50.5-69.6 81.8 26.6H-81.8L50.5-69.6Z"
          strokeWidth=".4"
        />
      </svg>
      <div className="atmosphere__village" style={{ backgroundImage: `url("${VILLAGE}")` }} />
      <div className="atmosphere__smoke" />
      {EMBERS.map((style, i) => (
        <i key={i} className="ember" style={style as CSSProperties} />
      ))}
      <div className="atmosphere__vignette" />
    </div>
  )
}
