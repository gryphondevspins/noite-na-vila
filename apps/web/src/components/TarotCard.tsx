import { CARD_BACK, ROLE_ART, TAROT_NUMERAL } from '@vila/assets'
import { ROLES, type RoleId } from '@vila/roles'
import type { CSSProperties, PointerEvent } from 'react'

interface Props {
  /** Sem função, mostra só o verso. */
  role?: RoleId
  /** Entra virando do verso para a frente. */
  flip?: boolean
  /** Atraso da virada, em milissegundos. */
  delay?: number
  /** Elemento usado para o nome na carta. */
  titleAs?: 'h1' | 'h2' | 'h3' | 'span'
  className?: string
}

/** A carta se inclina e o brilho acompanha o mouse. No toque não há efeito. */
function tilt(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== 'mouse') return
  const card = event.currentTarget
  const box = card.getBoundingClientRect()
  const x = (event.clientX - box.left) / box.width
  const y = (event.clientY - box.top) / box.height
  card.style.setProperty('--ry', `${(x - 0.5) * 18}deg`)
  card.style.setProperty('--rx', `${(0.5 - y) * 14}deg`)
  card.style.setProperty('--gx', `${x * 100}%`)
  card.style.setProperty('--gy', `${y * 100}%`)
}

function settle(event: PointerEvent<HTMLDivElement>) {
  for (const name of ['--rx', '--ry', '--gx', '--gy']) event.currentTarget.style.removeProperty(name)
}

export function TarotCard({ role, flip, delay = 0, titleAs: Title = 'span', className }: Props) {
  const classes = ['tarot', flip && 'tarot--flip', !role && 'tarot--back-only', className]

  return (
    <div
      className={classes.filter(Boolean).join(' ')}
      style={{ '--delay': `${delay}ms` } as CSSProperties}
      onPointerMove={tilt}
      onPointerLeave={settle}
    >
      <div className="tarot__tilt">
        <div className="tarot__inner">
          {role && (
            <div className="tarot__face tarot__face--front">
              <img src={ROLE_ART[role]} alt="" draggable={false} />
              <span className="tarot__numeral" aria-hidden="true">
                {TAROT_NUMERAL[role]}
              </span>
              <Title
                className={
                  ROLES[role].name.length > 13 ? 'tarot__name tarot__name--long' : 'tarot__name'
                }
              >
                {ROLES[role].name}
              </Title>
              <span className="tarot__gleam" />
            </div>
          )}
          {(!role || flip) && (
            <div className="tarot__face tarot__face--back" aria-hidden="true">
              <img src={CARD_BACK} alt="" draggable={false} />
              <span className="tarot__numeral">Noite</span>
              <span className="tarot__name">na Vila</span>
              <span className="tarot__gleam" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
