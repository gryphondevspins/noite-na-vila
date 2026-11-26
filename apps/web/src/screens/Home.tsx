import { LOGO } from '@vila/assets'
import { Candle } from '../components/Candle'
import { Page } from '../components/Page'
import { TarotCard } from '../components/TarotCard'

const FAN = ['doctor', 'detective', 'assassin', 'seer', 'villager'] as const

interface Props {
  onNew: () => void
  onContinue: (() => void) | null
  onRoles: () => void
  onHelp: () => void
}

export function Home({ onNew, onContinue, onRoles, onHelp }: Props) {
  return (
    <Page name="home">
      <div className="home">
        <div className="home__intro">
          <div className="altar altar--logo">
            <Candle className="candle--tall" />
            <img className="logo" src={LOGO} alt="" />
            <Candle className="candle--tall" delay={-0.5} />
          </div>
          <h1 className="title">Noite na Vila</h1>
          <p className="lead">Um grimório, a roda de amigos e um assassino entre vocês.</p>
          <nav className="actions">
            {onContinue && (
              <button type="button" className="primary" onClick={onContinue}>
                Continuar partida
              </button>
            )}
            <button type="button" className={onContinue ? 'secondary' : 'primary'} onClick={onNew}>
              Novo jogo
            </button>
            <div className="row">
              <button type="button" className="secondary" onClick={onRoles}>
                Funções
              </button>
              <button type="button" className="secondary" onClick={onHelp}>
                Como jogar
              </button>
            </div>
          </nav>
        </div>
        <div className="fan" aria-hidden="true">
          {FAN.map((role, i) => (
            <div key={role} className="fan__card" style={{ ['--i' as string]: i - 2 }}>
              <TarotCard role={role} flip delay={350 + i * 160} />
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}
