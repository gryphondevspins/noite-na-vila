import { sound } from '@vila/assets'
import { createGame, type GameState } from '@vila/engine'
import { useEffect, useState } from 'react'
import { Atmosphere, type Tone } from './components/Atmosphere'
import { FullscreenButton } from './components/FullscreenButton'
import { SoundToggle } from './components/SoundToggle'
import { cueFor } from './cues'
import { Game } from './screens/Game'
import { Home } from './screens/Home'
import { HowToPlay, RoleGuide } from './screens/Info'
import { Setup } from './screens/Setup'
import { loadMatch, loadTable, saveMatch, saveTable, type TablePrefs } from './storage'

type Screen = 'home' | 'setup' | 'roles' | 'help' | 'game'

function toneOf(game: GameState): Tone {
  const daylight = ['dawn', 'discussion', 'voteResult'].includes(game.phase)
  return daylight || game.winner === 'village' ? 'day' : 'night'
}

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [match, setMatch] = useState(loadMatch)

  useEffect(() => {
    if (match) saveMatch(match)
  }, [match])

  useEffect(() => {
    document.documentElement.scrollTop = 0
  }, [screen, match?.game.phase, match?.game.turnIndex])

  function start(prefs: TablePrefs) {
    saveTable(prefs)
    const { names, setup, discussionMinutes } = prefs
    setMatch({ game: createGame(names, setup), setup, discussionMinutes })
    setScreen('game')
  }

  function update(game: GameState) {
    const cue = match && cueFor(match.game, game)
    if (cue) sound.play(cue)
    setMatch((current) => current && { ...current, game })
  }
  const home = () => setScreen('home')

  function content() {
    if (screen === 'setup') return <Setup initial={loadTable()} onStart={start} onBack={home} />
    if (screen === 'roles') return <RoleGuide onBack={home} />
    if (screen === 'help') return <HowToPlay onBack={home} />

    if (screen === 'game' && match) {
      return (
        <Game
          match={match}
          onChange={update}
          onHome={home}
          onRematch={() => start({ ...match, names: match.game.players.map((p) => p.name) })}
        />
      )
    }

    const canContinue = match !== null && match.game.phase !== 'gameOver'
    return (
      <Home
        onNew={() => setScreen('setup')}
        onContinue={canContinue ? () => setScreen('game') : null}
        onRoles={() => setScreen('roles')}
        onHelp={() => setScreen('help')}
      />
    )
  }

  return (
    <>
      <Atmosphere tone={screen === 'game' && match ? toneOf(match.game) : 'night'} />
      {content()}
      <div className="top-tools">
        <SoundToggle />
        <FullscreenButton />
      </div>
    </>
  )
}
