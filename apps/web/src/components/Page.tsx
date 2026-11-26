import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Botão discreto no topo da tela. */
  back?: { label: string; onClick: () => void }
  /** Rótulo no topo, como "Noite 2". */
  tag?: string
  /** Classe extra para o layout de cada tela. */
  name: string
}

/** Cada tela só anima ao entrar. Nada secreto continua visível durante uma troca. */
export function Page({ children, back, tag, name }: Props) {
  return (
    <main className={`page page--${name}`}>
      <header className="topbar">
        {back ? (
          <button type="button" className="link" onClick={back.onClick}>
            {back.label}
          </button>
        ) : (
          <span />
        )}
        {tag ? <span className="tag">{tag}</span> : <span />}
      </header>
      {children}
    </main>
  )
}
