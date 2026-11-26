import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/** Aberto pelo ícone da tela inicial: já está sem as barras do navegador. */
function openedAsApp(): boolean {
  const iosApp = (navigator as Navigator & { standalone?: boolean }).standalone === true
  const modes = ['standalone', 'fullscreen']
  return iosApp || modes.some((m) => window.matchMedia?.(`(display-mode: ${m})`).matches)
}

const isApple = () => /iPhone|iPad|iPod/.test(navigator.userAgent)

export function FullscreenButton() {
  // Medido só na abertura: a tela cheia do próprio botão também muda o display-mode.
  const [installed] = useState(openedAsApp)
  const [active, setActive] = useState(() => Boolean(document.fullscreenElement))
  const [help, setHelp] = useState(false)

  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  // O Safari do iPhone não deixa uma página entrar em tela cheia.
  const supported = Boolean(document.fullscreenEnabled)
  if (installed || (!supported && !isApple())) return null

  function toggle() {
    if (!supported) return setHelp(true)
    const change = active
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    // Se o navegador recusar, o jogo continua como estava.
    void Promise.resolve(change).catch(() => {})
  }

  const label = active ? 'Sair da tela cheia' : 'Tela cheia'

  return (
    <>
      <button
        type="button"
        className="top-tool"
        aria-label={label}
        title={label}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          {active ? (
            <path d="M9 4v5H4M15 4v5h5M20 15h-5v5M4 15h5v5" />
          ) : (
            <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
          )}
        </svg>
      </button>

      {/* Vai direto no body: a área dos botões usa translate e prenderia o aviso nela. */}
      {help &&
        createPortal(
          <div className="veil">
            <div
              className="sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sheet-title"
              onKeyDown={(e) => e.key === 'Escape' && setHelp(false)}
            >
              <h2 id="sheet-title">Jogar em tela cheia</h2>
              <p>No iPhone e no iPad, abra o jogo no Safari e instale:</p>
              <ol>
                <li>
                  Toque no botão <b>Compartilhar</b> (o quadrado com uma seta para cima). Se não
                  aparecer, procure no menu <b>•••</b>.
                </li>
                <li>
                  Escolha <b>Adicionar à Tela de Início</b>.
                </li>
                <li>
                  Abra o jogo pelo <b>ícone novo</b>.
                </li>
              </ol>
              <p className="muted">
                Uma partida em andamento pode não aparecer no ícone novo. Instale antes de começar.
              </p>
              <button type="button" className="primary" autoFocus onClick={() => setHelp(false)}>
                Entendi
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
