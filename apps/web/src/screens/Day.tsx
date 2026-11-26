import {
  continueAfterDawn,
  continueAfterVote,
  endDiscussion,
  isPeacefulRound,
  playerById,
  type GameState,
} from '@vila/engine'
import { ROLES } from '@vila/roles'
import { useEffect, useState } from 'react'
import { Candle } from '../components/Candle'
import { News } from '../components/News'
import { Page } from '../components/Page'
import { Ritual } from '../components/Ritual'
import { TarotCard } from '../components/TarotCard'

interface Props {
  game: GameState
  onChange: (game: GameState) => void
  onHome: () => void
}

/** Quem sai do jogo revela a função, numa carta cortada em sangue. */
function Fallen({ game, id }: { game: GameState; id: string }) {
  const player = playerById(game, id)
  return (
    <div className="fallen">
      <div className="fallen__card">
        <TarotCard role={player.role} flip delay={700} />
        <span className="fallen__slash" aria-hidden="true" />
      </div>
      <p className="muted">Era {ROLES[player.role].name}.</p>
    </div>
  )
}

function Deaths({ game, fallen }: { game: GameState; fallen: { id: string; verb: string }[] }) {
  if (fallen.length === 0) return null
  return (
    <div className={fallen.length > 1 ? 'deaths deaths--many' : 'deaths'}>
      {fallen.map(({ id, verb }) => (
        <div key={id} className="death">
          <p className="headline">
            {playerById(game, id).name} {verb}.
          </p>
          <Fallen game={game} id={id} />
        </div>
      ))}
    </div>
  )
}

export function Dawn({ game, onChange, onHome }: Props) {
  const bloody = game.deaths.length > 0

  return (
    <Page name="game" tag={`Dia ${game.round}`} back={{ label: 'Menu', onClick: onHome }}>
      {bloody && <div className="blood-flash" aria-hidden="true" />}
      <Ritual
        players={game.players}
        revealFallen
        top={
          <>
            <p className="eyebrow">Coloquem o grimório no meio da roda.</p>
            <h1 className="display">Amanheceu</h1>
            {!bloody && (
              <>
                <Candle className="candle--solo" />
                <p className="headline">Ninguém morreu esta noite.</p>
                {isPeacefulRound(game) && (
                  <p className="muted">A primeira rodada é sempre sem mortes.</p>
                )}
              </>
            )}
            <Deaths
              game={game}
              fallen={game.deaths.map((id) => ({ id, verb: 'morreu' }))}
            />
            <News game={game} />
          </>
        }
        bottom={
          <button
            type="button"
            className="primary"
            onClick={() => onChange(continueAfterDawn(game))}
          >
            {game.winner ? 'Ver o resultado' : 'Começar a discussão'}
          </button>
        }
      />
    </Page>
  )
}

function useCountdown(totalSeconds: number) {
  const [left, setLeft] = useState(totalSeconds)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    // Usa o relógio para não atrasar se o navegador pausar o intervalo.
    const end = Date.now() + left * 1000
    const id = setInterval(() => {
      setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000)))
    }, 250)
    return () => clearInterval(id)
    // `left` só interessa no momento em que o relógio é ligado.
  }, [running])

  return { left, running, toggle: () => setRunning((r) => !r) }
}

export function Discussion({ game, onChange, onHome, minutes }: Props & { minutes: number }) {
  const total = minutes * 60
  const { left, running, toggle } = useCountdown(total)
  const peaceful = isPeacefulRound(game)
  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`

  return (
    <Page name="game" tag={`Dia ${game.round}`} back={{ label: 'Menu', onClick: onHome }}>
      <Ritual
        players={game.players}
        revealFallen
        top={
          <>
            <h1 className="display">Discussão</h1>
            <p className="muted">A vela marca o tempo.</p>
            <News game={game} />
            {/* A vela derrete junto com o relógio. */}
            <Candle className="candle--timer" wax={left / total} out={left === 0} />
            <p className={left <= 10 ? 'timer timer--over' : 'timer'}>{clock}</p>
            {left === 0 ? (
              <p className="headline">Tempo esgotado!</p>
            ) : (
              <button type="button" className="secondary" onClick={toggle}>
                {running ? 'Pausar' : 'Retomar'}
              </button>
            )}
          </>
        }
        bottom={
          <>
            {peaceful && <p className="notice">Primeira rodada: sem votação e sem mortes.</p>}
            <button type="button" className="primary" onClick={() => onChange(endDiscussion(game))}>
              {peaceful ? 'Começar a segunda noite' : 'Ir para a votação'}
            </button>
          </>
        }
      />
    </Page>
  )
}

export function VoteResult({ game, onChange, onHome }: Props) {
  const { eliminatedId, sparedId, alsoDied = [], tally } = game.voteOutcome!
  const voted = Object.keys(tally).length > 0

  return (
    <Page name="game" tag={`Dia ${game.round}`} back={{ label: 'Menu', onClick: onHome }}>
      {eliminatedId && <div className="blood-flash" aria-hidden="true" />}
      <Ritual
        players={game.players}
        revealFallen
        note={(player) => {
          const votes = tally[player.id]
          return votes ? `${votes} ${votes === 1 ? 'voto' : 'votos'}` : null
        }}
        top={
          <>
            <h1 className="display">O veredito</h1>
            {eliminatedId ? (
              <Deaths
                game={game}
                fallen={[
                  { id: eliminatedId, verb: 'saiu do jogo' },
                  ...alsoDied.map((id) => ({ id, verb: 'morreu junto' })),
                ]}
              />
            ) : (
              <>
                <Candle className="candle--solo" />
                <p className="headline">
                  {sparedId
                    ? `${playerById(game, sparedId).name} ia sair, mas uma força impediu.`
                    : voted
                      ? 'Empate: ninguém saiu.'
                      : 'Sem votos: ninguém saiu.'}
                </p>
              </>
            )}
            <News game={game} />
          </>
        }
        bottom={
          <button
            type="button"
            className="primary"
            onClick={() => onChange(continueAfterVote(game))}
          >
            {game.winner ? 'Ver o resultado' : 'Começar a noite'}
          </button>
        }
      />
    </Page>
  )
}
