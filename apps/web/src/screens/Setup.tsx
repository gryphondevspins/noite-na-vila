import { defaultSetup, MAX_PLAYERS, validateGame, type RoleSetup } from '@vila/engine'
import { OPTIONAL_ROLE_IDS, ROLE_GROUPS, ROLES } from '@vila/roles'
import { useState, type FormEvent } from 'react'
import { Page } from '../components/Page'
import { TarotCard } from '../components/TarotCard'
import type { TablePrefs } from '../storage'

interface Props {
  initial: TablePrefs | null
  onStart: (prefs: TablePrefs) => void
  onBack: () => void
}

const sameSetup = (a: RoleSetup, b: RoleSetup) =>
  OPTIONAL_ROLE_IDS.every((r) => Boolean(a[r]) === Boolean(b[r]))

export function Setup({ initial, onStart, onBack }: Props) {
  const [names, setNames] = useState<string[]>(initial?.names ?? [])
  const [draft, setDraft] = useState('')
  const [draftError, setDraftError] = useState('')
  const [minutes, setMinutes] = useState(initial?.discussionMinutes ?? 3)
  // Enquanto ninguém mexer nas funções, elas acompanham o tamanho da roda.
  const [custom, setCustom] = useState<RoleSetup | null>(
    initial && !sameSetup(initial.setup, defaultSetup(initial.names.length)) ? initial.setup : null,
  )
  const setup = custom ?? defaultSetup(names.length)
  const problem = validateGame(names, setup)
  const active = OPTIONAL_ROLE_IDS.filter((r) => setup[r])
  const special = 1 + active.length
  const victims = Math.max(0, names.length - special)

  function add(event: FormEvent) {
    event.preventDefault()
    const name = draft.trim()
    if (!name) return
    const lower = name.toLocaleLowerCase('pt-BR')
    if (names.some((n) => n.toLocaleLowerCase('pt-BR') === lower)) {
      setDraftError(`Já existe alguém chamado ${name}.`)
      return
    }
    setNames([...names, name])
    setDraft('')
    setDraftError('')
  }

  function move(from: number, to: number) {
    const next = [...names]
    next.splice(to, 0, ...next.splice(from, 1))
    setNames(next)
  }

  return (
    <Page name="setup" back={{ label: 'Voltar', onClick: onBack }}>
      <h1 className="display">Novo jogo</h1>
      <div className="setup">
        <section className="panel">
          <h2>Quem está na roda ({names.length})</h2>
          <p className="muted">Na ordem em que vocês estão sentados.</p>
          {names.length < MAX_PLAYERS && (
            <form className="row" onSubmit={add}>
              <input
                className="grow"
                aria-label="Nome do jogador"
                placeholder="Nome do jogador"
                maxLength={16}
                autoComplete="off"
                enterKeyHint="done"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="secondary">
                Adicionar
              </button>
            </form>
          )}
          {draftError && <p className="error">{draftError}</p>}
          <ol className="roster">
            {names.map((name, i) => (
              <li key={name} className="roster__item">
                <span className="seat__sigil">{i + 1}</span>
                <span className="grow">{name}</span>
                <button
                  type="button"
                  className="icon"
                  aria-label={`Subir ${name}`}
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon"
                  aria-label={`Remover ${name}`}
                  onClick={() => setNames(names.filter((n) => n !== name))}
                >
                  ✕
                </button>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel">
          <h2>Cartas do ritual</h2>
          <p className="muted">Toque numa carta para colocar ou tirar.</p>
          <div className="deck">
            <figure className="deck__item">
              <TarotCard role="assassin" />
              <figcaption>sempre 1</figcaption>
            </figure>
            <figure className="deck__item">
              <TarotCard role="villager" />
              <figcaption>
                {victims} {victims === 1 ? 'vítima' : 'vítimas'}
              </figcaption>
            </figure>
          </div>
          {ROLE_GROUPS.map((group) => (
            <fieldset key={group.id} className="deck-group">
              <legend>{group.name}</legend>
              <div className="deck">
                {OPTIONAL_ROLE_IDS.filter((role) => ROLES[role].group === group.id).map((role) => (
                  <label key={role} className="deck__item deck__item--optional">
                    <input
                      type="checkbox"
                      aria-label={ROLES[role].name}
                      checked={Boolean(setup[role])}
                      onChange={(e) => setCustom({ ...setup, [role]: e.target.checked })}
                    />
                    <TarotCard role={role} />
                    <span>{setup[role] ? 'no jogo' : 'fora'}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <details className="chosen">
            <summary>O que fazem as funções ligadas ({special})</summary>
            <ul>
              {(['assassin', ...active] as const).map((role) => (
                <li key={role}>
                  <b>{ROLES[role].name}.</b> {ROLES[role].description}
                </li>
              ))}
            </ul>
          </details>

          <label className="row between">
            <span>Tempo de discussão</span>
            <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 7, 10].map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </label>

          {problem && <p className="notice">{problem}</p>}
          <button
            type="button"
            className="primary"
            disabled={problem !== null}
            onClick={() => onStart({ names, setup, discussionMinutes: minutes })}
          >
            Sortear funções e começar
          </button>
        </section>
      </div>
    </Page>
  )
}
