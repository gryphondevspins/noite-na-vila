import type { Player } from '@vila/engine'
import { useEffect, useState, type CSSProperties } from 'react'
import { Candle } from './Candle'
import { Page } from './Page'
import { Ritual } from './Ritual'
import { TarotCard } from './TarotCard'

// Este botão fica onde estava o "Esconder" da tela anterior. A espera impede que
// um toque duplo abra a função da próxima pessoa.
const ARM_DELAY_MS = 900

interface Props {
  players: Player[]
  player: Player
  tag: string
  progress: string
  hint: string
  onReveal: () => void
  onHome: () => void
}

/** Tela neutra entre um jogador e outro: não pode mostrar nada secreto. */
export function Handoff({ players, player, tag, progress, hint, onReveal, onHome }: Props) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setArmed(true), ARM_DELAY_MS)
    return () => clearTimeout(id)
  }, [])

  return (
    <Page name="game" tag={tag} back={{ label: 'Menu', onClick: onHome }}>
      <Ritual
        variant="handoff"
        players={players}
        current={player.id}
        top={
          <>
            <p className="eyebrow">{progress}</p>
            <p className="lead">Entreguem o grimório a</p>
            <h1 className="big-name">{player.name}</h1>
            <div className="altar">
              <Candle className="candle--tall" />
              <Candle delay={-0.4} />
              <TarotCard className="tarot--floating" />
              <Candle delay={-0.7} />
              <Candle className="candle--tall" delay={-0.2} />
            </div>
            <p className="muted">{hint}</p>
          </>
        }
        bottom={
          <button
            type="button"
            className={armed ? 'primary' : 'primary arming'}
            style={{ '--arm': `${ARM_DELAY_MS}ms` } as CSSProperties}
            disabled={!armed}
            onClick={onReveal}
          >
            Sou {player.name}
          </button>
        }
      />
    </Page>
  )
}
