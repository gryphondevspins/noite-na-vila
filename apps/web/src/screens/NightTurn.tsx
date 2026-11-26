import { ROLE_ART, sound } from '@vila/assets'
import {
  currentPlayer,
  endNightTurn,
  nightPrompt,
  nightResult,
  playerById,
  privateNotes,
  submitNightAction,
  type ActionKind,
  type Aura,
  type GameState,
  type NightOption,
} from '@vila/engine'
import { ROLES } from '@vila/roles'
import { useState } from 'react'
import { Handoff } from '../components/Handoff'
import { Notes } from '../components/Notes'
import { Page } from '../components/Page'
import { Ritual } from '../components/Ritual'
import { TarotCard } from '../components/TarotCard'

const QUESTIONS: Record<ActionKind, string> = {
  attack: 'Quem você vai atacar esta noite?',
  protect: 'Quem você vai proteger esta noite?',
  inspect: 'De quem você quer ver a função?',
  compare: 'Escolha duas pessoas para comparar.',
  aura: 'De quem você quer ver a aura?',
  guard: 'Quem você vai guardar? Se atacarem essa pessoa, você cai no lugar dela.',
  heal: 'Em quem você usa a poção de cura?',
  poison: 'Em quem você usa o veneno?',
  shoot: 'Você só tem uma bala. Em quem vai atirar?',
  water: 'Em quem vai a água benta? Se não for um assassino, quem morre é você.',
  visit: 'Quem você vai visitar esta noite?',
  bread: 'Quem recebe o pão?',
  silence: 'Quem fica de castigo amanhã?',
  pardon: 'Quem você quer salvar da votação de amanhã?',
  link: 'Escolha duas pessoas para se apaixonarem.',
  avenge: 'Quem vai junto se você morrer?',
  gossip: 'De quem você vai contar o segredo se morrer?',
  revive: 'Quem você traz de volta à vida?',
  douse: 'Quem você vai encharcar?',
  ignite: 'Pôr fogo em todos os encharcados?',
  skip: '',
  suspect: 'De quem você desconfia? É segredo e não muda nada.',
  rest: 'Primeira noite: ninguém morre. De quem você desconfia? Não muda nada.',
}

const CONFIRMATIONS: Partial<Record<ActionKind, string>> = {
  attack: 'Ataque marcado. Ele só vale quando amanhecer.',
  protect: 'Proteção marcada.',
  guard: 'Você vai montar guarda.',
  heal: 'Poção de cura usada.',
  poison: 'Veneno servido.',
  shoot: 'Tiro preparado. Ele só vale quando amanhecer.',
  water: 'Água benta lançada. O resultado vem ao amanhecer.',
  visit: 'Você vai passar a noite fora.',
  bread: 'Pão a caminho.',
  silence: 'Castigo anotado.',
  pardon: 'Essa pessoa não sai na votação de amanhã.',
  link: 'Corações unidos. O casal fica sabendo na próxima vez de cada um.',
  avenge: 'Marca feita.',
  gossip: 'Segredo guardado, por enquanto.',
  revive: 'O ritual se completa ao amanhecer.',
  douse: 'Gasolina derramada.',
  ignite: 'Fósforo aceso. O fogo vem ao amanhecer.',
  skip: 'Poder guardado para outra noite.',
}

/** Nome do botão quando o turno deixa escolher entre dois poderes. */
const MODES: Partial<Record<ActionKind, string>> = {
  heal: 'Cura',
  poison: 'Veneno',
  douse: 'Encharcar',
  ignite: 'Pôr fogo',
}

const AURAS: Record<Aura, string> = {
  good: 'boa',
  evil: 'má',
  unknown: 'desconhecida',
}

interface Props {
  game: GameState
  onChange: (game: GameState) => void
  onHome: () => void
}

export function NightTurn({ game, onChange, onHome }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [useSecond, setUseSecond] = useState(false)
  const player = currentPlayer(game)
  const tag = `Noite ${game.round}`

  if (!revealed) {
    return (
      <Handoff
        players={game.players}
        player={player}
        tag={tag}
        progress={`${game.turnIndex + 1} de ${game.turnOrder.length}`}
        hint="Que os outros desviem os olhos."
        onReveal={() => {
          sound.play('flip')
          setRevealed(true)
        }}
        onHome={onHome}
      />
    )
  }

  const role = ROLES[player.role]
  const prompt = nightPrompt(game, player.id)
  const option: NightOption = (useSecond && prompt.alternative) || prompt
  const options = prompt.alternative ? [prompt, prompt.alternative] : []
  const action = game.actions[player.id]

  return (
    <Page name="game" tag={tag}>
      <Ritual
        variant="secret"
        players={game.players}
        current={player.id}
        picking={
          action || option.count === 0
            ? undefined
            : {
                candidates: option.candidates,
                selected,
                max: option.count,
                // Sem som: o detetive escolhe duas pessoas, e daria para ouvir.
                onChange: setSelected,
              }
        }
        top={
          <>
            <p className="eyebrow">Você é</p>
            <TarotCard role={player.role} titleAs="h1" flip />
            <p className="description">{role.description}</p>
            <Notes game={game} notes={privateNotes(game, player.id)} />
          </>
        }
        bottom={
          action ? (
            <>
              <Outcome game={game} playerId={player.id} kind={action.kind} />
              <button
                type="button"
                className="primary"
                onClick={() => {
                  sound.play('flip')
                  onChange(endNightTurn(game))
                }}
              >
                Esconder e passar o grimório
              </button>
            </>
          ) : (
            <>
              {options.length > 0 && (
                <div className="modes" role="group" aria-label="Poder desta noite">
                  {options.map(({ kind }, i) => (
                    <button
                      key={kind}
                      type="button"
                      className="mode"
                      aria-pressed={option.kind === kind}
                      onClick={() => {
                        setUseSecond(i === 1)
                        setSelected([])
                      }}
                    >
                      {MODES[kind]}
                    </button>
                  ))}
                </div>
              )}
              <p className="question">{QUESTIONS[option.kind]}</p>
              <button
                type="button"
                className="primary"
                disabled={selected.length !== option.count}
                onClick={() => onChange(submitNightAction(game, selected, option.kind))}
              >
                Confirmar
              </button>
              {prompt.skippable && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onChange(submitNightAction(game, [], 'skip'))}
                >
                  Guardar para depois
                </button>
              )}
            </>
          )
        }
      />
    </Page>
  )
}

/** Todos os resultados ocupam o mesmo pergaminho, para não destacar função nenhuma. */
function Outcome({ game, playerId, kind }: { game: GameState; playerId: string; kind: ActionKind }) {
  const result = nightResult(game, playerId)
  const nameOf = (id: string) => playerById(game, id).name

  return (
    <div className="parchment outcome" role="status">
      {result.type === 'role' && (
        <>
          <img className="outcome__card" src={ROLE_ART[result.role]} alt="" />
          <p>
            <b>{nameOf(result.targetId)}</b> é <b>{ROLES[result.role].name}</b>.
          </p>
        </>
      )}
      {result.type === 'team' && (
        <p>
          <b>{nameOf(result.targetIds[0]!)}</b> e <b>{nameOf(result.targetIds[1]!)}</b>{' '}
          {result.sameTeam ? 'estão no mesmo time.' : 'estão em times diferentes.'}
        </p>
      )}
      {result.type === 'aura' && (
        <p>
          A aura de <b>{nameOf(result.targetId)}</b> é <b>{AURAS[result.aura]}</b>.
        </p>
      )}
      {result.type === 'none' && <p>{CONFIRMATIONS[kind] ?? 'Anotado. Fique de olho.'}</p>}
    </div>
  )
}
