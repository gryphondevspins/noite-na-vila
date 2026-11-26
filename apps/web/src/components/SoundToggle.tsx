import { sound } from '@vila/assets'
import { useEffect, useState } from 'react'

export function SoundToggle() {
  const [muted, setMuted] = useState(sound.isMuted)

  useEffect(() => {
    // Os navegadores só liberam som depois de um toque.
    const unlock = () => sound.unlock()
    const visibility = () => sound.setHidden(document.hidden)
    window.addEventListener('pointerdown', unlock)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

  const label = muted ? 'Ativar som' : 'Silenciar'

  return (
    <button
      type="button"
      className="top-tool"
      aria-label={label}
      title={label}
      onClick={() => {
        sound.setMuted(!muted)
        setMuted(!muted)
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 9h4l5-4v14l-5-4H4z" />
        {muted ? <path d="M16 9l6 6M22 9l-6 6" /> : <path d="M16 9q3 3 0 6M18.500 6.500q6 5.500 0 11" />}
      </svg>
    </button>
  )
}
