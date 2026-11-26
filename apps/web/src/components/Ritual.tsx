import type { Player } from '@vila/engine'
import { ROLES } from '@vila/roles'
import type { CSSProperties, ReactNode } from 'react'
import { seatPlacement } from './seating'

export interface Picking {
  candidates: string[]
  selected: string[]
  /** Quantos podem ficar marcados ao mesmo tempo. */
  max: number
  onChange: (selected: string[]) => void
}

interface Props {
  /** A roda inteira, na ordem em que estão sentados. */
  players: Player[]
  top: ReactNode
  bottom: ReactNode
  variant?: 'secret' | 'handoff' | 'public'
  /** Quem está com o aparelho. */
  current?: string
  picking?: Picking
  /** Mostra a função de quem saiu. Só em telas que todos podem ver. */
  revealFallen?: boolean
  note?: (player: Player) => string | null
}

/**
 * A mesa do ritual. No computador a roda cerca o centro; no celular ela vira uma grade
 * entre o topo e os botões. É o mesmo HTML nos dois casos.
 */
export function Ritual(props: Props) {
  const { players, top, bottom, variant = 'public', current, picking, revealFallen, note } = props

  function toggle(id: string) {
    if (!picking) return
    const { selected, max, onChange } = picking
    if (selected.includes(id)) onChange(selected.filter((other) => other !== id))
    // Ao passar do limite, a escolha mais antiga sai.
    else onChange([...selected, id].slice(-max))
  }

  return (
    <div className={`ritual ritual--${variant}${picking ? ' ritual--picking' : ''}`}>
      <div className="ritual__top">{top}</div>
      <div className="seats" role="group" aria-label={picking ? 'Jogadores' : 'Situação da roda'}>
        {players.map((player, index) => {
          const { side, t, bulge } = seatPlacement(index, players.length)
          const style = { '--t': t, '--bulge': bulge, '--order': index } as CSSProperties
          const classes = [
            'seat',
            `seat--${side}`,
            player.id === current && 'seat--current',
            !player.alive && 'seat--out',
          ]
          const badge = note?.(player)
          const content = (
            <>
              <span className="seat__sigil" aria-hidden="true">
                {player.name.charAt(0).toLocaleUpperCase('pt-BR')}
              </span>
              <span className="seat__label">
                <span className="seat__name">{player.name}</span>
                {revealFallen && !player.alive && <small>{ROLES[player.role].name}</small>}
              </span>
              {badge && <span className="seat__badge">{badge}</span>}
            </>
          )

          if (picking?.candidates.includes(player.id)) {
            return (
              <button
                key={player.id}
                type="button"
                className={classes.filter(Boolean).join(' ')}
                style={style}
                aria-pressed={picking.selected.includes(player.id)}
                onClick={() => toggle(player.id)}
              >
                {content}
              </button>
            )
          }
          return (
            <div
              key={player.id}
              className={[...classes, 'seat--idle'].filter(Boolean).join(' ')}
              style={style}
            >
              {content}
            </div>
          )
        })}
      </div>
      <div className="ritual__bottom">{bottom}</div>
    </div>
  )
}
