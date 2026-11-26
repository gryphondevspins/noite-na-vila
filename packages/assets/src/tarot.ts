// Cartas de tarô desenhadas em código. Não têm texto: os nomes são escritos no HTML,
// porque uma imagem SVG não enxerga as fontes da página.
import type { RoleId } from '@vila/roles'
import * as art from './arcana'
import { BLOOD, BONE, GOLD, INK, LIGHT, mirrored } from './ink'

const toDataUrl = (body: string): string =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="688" viewBox="0 0 200 344">${body}</svg>`,
  )

const star = (x: number, y: number, r: number) =>
  `<path d="M${x} ${y - r}q${r * 0.16} ${r * 0.84} ${r} ${r}q${-r * 0.84} ${r * 0.16} ${-r} ${r}q${-r * 0.16} ${-r * 0.84} ${-r} ${-r}q${r * 0.84} ${-r * 0.16} ${r} ${-r}z" fill="${INK}"/>`

/** Moldura de papel envelhecido, com o halo de raios atrás do símbolo. */
function frame(emblem: string): string {
  return toDataUrl(`
<defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .25 0 0 0 0 .16 0 0 0 0 .07 0 0 0 .55 -.16"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  <radialGradient id="age" cx="50%" cy="46%" r="68%"><stop offset=".45" stop-color="#e6d6ac"/><stop offset="1" stop-color="#947645"/></radialGradient>
  <pattern id="hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(42)"><path d="M0 0v3" stroke="${INK}" stroke-width="1"/></pattern>
</defs>
<rect width="200" height="344" rx="9" fill="url(#age)"/>
<rect width="200" height="344" rx="9" filter="url(#grain)"/>
<g fill="none" stroke="${INK}">
  <rect x="8" y="8" width="184" height="328" rx="4" stroke-width="2"/>
  <rect x="13" y="13" width="174" height="318" stroke-width=".7"/>
  <path d="M13 38h174M13 296h174" stroke-width=".9"/>
  <path d="M18 43h9M18 43v9M182 43h-9M182 43v9M18 291h9M18 291v-9M182 291h-9M182 291v-9" stroke-width="1"/>
  <circle cx="100" cy="150" r="75" stroke-width="22" stroke-dasharray=".9 4.4" opacity=".55"/>
  <circle cx="100" cy="150" r="62" stroke-width="1.2" opacity=".8"/>
  <circle cx="100" cy="150" r="58" stroke-width=".5" opacity=".8"/>
</g>
${star(32, 64, 8)}${star(168, 64, 8)}${star(32, 270, 7)}${star(168, 270, 7)}
${emblem}`)
}

/** Vidente: o olho na palma da mão. */
const SEER = `
<path d="M70 272c2-22-2-34-14-48-12-13-24-25-26-40-1-8 8-11 13-4l18 24c3 3 6 1 5-3l-3-78c0-11 15-11 16 0l4 54c0 4 6 4 6 0l2-66c0-12 17-12 17 0l2 66c0 4 6 4 6 0l5-57c1-11 16-10 15 1l-3 65c0 4 5 5 6 1l10-33c3-10 16-7 14 3-5 26-8 46-12 62-5 22-22 32-19 53z" fill="${BONE}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M130 272c-3-21 14-31 19-53 4-16 7-36 12-62 1-5-1-7-4-8 0 24-8 66-20 86-9 15-18 22-17 37z" fill="url(#hatch)" opacity=".65"/>
<path d="M62 190c16 8 20 22 18 38M69 127q5 2 9-1M93 113q5 2 10 0M122 116q5 2 10 1M82 244q18 8 36 0M84 254q16 6 32 0" fill="none" stroke="${INK}" stroke-width=".9"/>
<g stroke="${INK}">
  <path d="M68 182q32-34 64 0-32 30-64 0z" fill="${LIGHT}" stroke-width="2.4"/>
  <circle cx="100" cy="181" r="13.5" fill="${BLOOD}" stroke-width="1.6"/>
  <circle cx="100" cy="181" r="11" fill="none" stroke-width="5" stroke-dasharray=".6 2.2" opacity=".6"/>
  <circle cx="100" cy="181" r="5.5" fill="#100a06"/>
  <circle cx="96" cy="177" r="2.2" fill="${LIGHT}" stroke="none"/>
  <path d="M66 172q34-34 68 0" fill="none" stroke-width="1.5"/>
  <path d="M72 160l-5-8M85 152l-3-10M100 149v-11M115 152l3-10M128 160l5-8M80 200l-3 8M100 206v10M120 200l3 8" fill="none" stroke-width="1.2"/>
</g>
<path d="M100 52a13 13 0 1 0 11 20 11 11 0 0 1-11-20z" fill="${INK}"/>`

/** Assassino: o punhal atravessando a lua. */
const ASSASSIN = `
<path d="M122 90a64 64 0 1 0 38 106 52 52 0 1 1-38-106z" fill="${BONE}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M62 118c-14 28-6 66 22 82 22 13 50 14 76-4-20 32-68 38-95 10-24-25-25-63-3-88z" fill="url(#hatch)" opacity=".7"/>
<g fill="${INK}" opacity=".55"><circle cx="66" cy="146" r="4.5"/><circle cx="76" cy="188" r="3"/><circle cx="64" cy="170" r="1.8"/></g>
<path d="M90 108h20l-3 122-7 38-7-38z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M100 109h9l-3 121-6 35z" fill="url(#hatch)"/>
<path d="M100 110v156" stroke="${INK}" stroke-width="1"/>
<path d="M64 96c10 10 24 6 36 6s26 4 36-6c6 8 1 18-9 17-9-1-17 2-27 2s-18-3-27-2c-10 1-15-9-9-17z" fill="${INK}"/>
<path d="M93 62h14v40H93z" fill="${BLOOD}" stroke="${INK}" stroke-width="1.6"/>
<path d="M93 70l14 7M93 80l14 7M93 90l14 7" stroke="${INK}" stroke-width="2"/>
<circle cx="100" cy="55" r="9" fill="${GOLD}" stroke="${INK}" stroke-width="2"/><circle cx="100" cy="55" r="3.5" fill="${BLOOD}"/>
<g fill="${BLOOD}" stroke="${INK}" stroke-width=".8">
  <path d="M100 272c5 8 7 12 0 15-7-3-5-7 0-15z"/>
  <path d="M82 252c4 6 5 9 0 11-5-2-4-5 0-11zM118 262c3 5 4 8 0 9.5-4-1.5-3-4.500 0-9.500z"/>
</g>
<path d="M96 216c-2 14 3 22 2 34 4-9 6-20 3-34z" fill="${BLOOD}"/>`

/** Detetive: a lanterna e a lente. */
const DETECTIVE = `
<g fill="none" stroke="${INK}" stroke-width="2.2">
  <ellipse cx="100" cy="45" rx="3.5" ry="6"/><ellipse cx="100" cy="55" rx="3.5" ry="6"/><circle cx="100" cy="67" r="7"/>
</g>
<path d="M66 100l17-24h34l17 24z" fill="${INK}"/>
<path d="M72 100h56l-8 72H80z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M112 100h16l-8 72h-9z" fill="url(#hatch)" opacity=".8"/>
<path d="M100 112c15 18 17 34 0 44-17-10-15-26 0-44z" fill="${BLOOD}" stroke="${INK}" stroke-width="1.6"/>
<path d="M100 133c7 9 8 17 0 21-8-4-7-12 0-21z" fill="#e0a040"/>
<path d="M86 100l4 72M114 100l-4 72M72 100h56" stroke="${INK}" stroke-width="2.2"/>
<path d="M74 172h52l-5 11H79z" fill="${INK}"/>
<path d="M92 236l-40 42" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
<path d="M79 250l-24 26" stroke="${BLOOD}" stroke-width="9" stroke-linecap="round"/>
<circle cx="117" cy="212" r="38" fill="${BONE}" stroke="${INK}" stroke-width="8"/>
<circle cx="117" cy="212" r="38" fill="none" stroke="${GOLD}" stroke-width="3"/>
<circle cx="117" cy="212" r="29" fill="none" stroke="${INK}" stroke-width=".9"/>
<path d="M117 192a11 11 0 0 1 6 20l6 22h-24l6-22a11 11 0 0 1 6-20z" fill="${INK}"/>
<path d="M92 200q6-16 22-19" fill="none" stroke="${LIGHT}" stroke-width="4" stroke-linecap="round"/>`

/** Médico: a máscara do médico da peste. */
const DOCTOR = `
<defs><path id="cloak" d="M30 295c4-38 20-68 50-84l12 26-8 58z"/></defs>
<g fill="${INK}">${mirrored('cloak')}</g>
<path d="M68 112c-6 52 4 80 32 96 28-16 38-44 32-96z" fill="${INK}"/>
<path d="M76 118c-2 40 6 62 24 74 18-12 26-34 24-74z" fill="${BONE}" stroke="${INK}" stroke-width="1.6"/>
<path d="M72 108c0-30 10-48 28-48s28 18 28 48z" fill="${INK}"/>
<path d="M73 96q27 8 54 0v11q-27 8-54 0z" fill="${BLOOD}"/>
<ellipse cx="100" cy="112" rx="64" ry="11" fill="${INK}"/>
<path d="M44 111q56 13 112 0" fill="none" stroke="${BONE}" stroke-width="1" opacity=".5"/>
<g stroke="${INK}">
  <circle cx="83" cy="143" r="12" fill="${BLOOD}" stroke-width="4"/><circle cx="117" cy="143" r="12" fill="${BLOOD}" stroke-width="4"/>
  <circle cx="83" cy="143" r="5" fill="#100a06" stroke="none"/><circle cx="117" cy="143" r="5" fill="#100a06" stroke="none"/>
</g>
<g fill="${LIGHT}"><circle cx="79" cy="139" r="2.4"/><circle cx="113" cy="139" r="2.4"/></g>
<path d="M86 160c8-11 22-11 28 1 12 34 2 74-34 112 14-38 11-66 5-88-3-10-3-19 1-25z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M113 161c12 34 2 74-33 111 25-40 30-70 23-110z" fill="url(#hatch)" opacity=".75"/>
<path d="M99 158c5 36 1 70-15 105" fill="none" stroke="${INK}" stroke-width="1"/>
<path d="M95 172l9-2M97 186l9-2M97 200l9-1M96 214l8 1M93 228l8 2M89 241l7 3" stroke="${INK}" stroke-width="1.2"/>
<path d="M90 163q4-3 8 0" fill="none" stroke="${INK}" stroke-width="1.6"/>`

/** Vítima: a vela que se apaga. */
const VILLAGER = `
<g fill="none" stroke="${INK}" stroke-linecap="round">
  <path d="M101 166C76 146 128 132 106 110C86 91 132 82 114 60C104 47 86 54 91 68C95 78 109 74 106 65" stroke-width="3"/>
  <path d="M97 160C84 146 114 134 100 116C86 98 108 90 104 76" stroke-width="1"/>
  <path d="M108 154C124 138 104 126 120 108C132 94 126 84 128 74" stroke-width=".8"/>
</g>
<ellipse cx="100" cy="270" rx="54" ry="11" fill="${GOLD}" stroke="${INK}" stroke-width="2.2"/>
<path d="M50 272q50 30 100 0l-10 14q-40 14-80 0z" fill="${INK}"/>
<path d="M152 268c16-4 18-24 2-24-9 0-9 12-1 12" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
<path d="M78 192q8-9 22-5t22-3v80q-22 8-44 0z" fill="${BONE}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M108 187q8 1 14-3v80q-7 3-14 4z" fill="url(#hatch)" opacity=".8"/>
<path d="M78 192q8-9 22-5t22-3c1 9-4 11-6 13v26c0 9-10 9-10 0v-17q-5 2-6 8v6c0 7-8 7-8 0v-14q-3 0-4 4v38c0 9-10 9-10 0z" fill="${LIGHT}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M62 268q10-12 18-6t14 2q10 8 28 1t20 5q-40 14-80-2z" fill="${LIGHT}" stroke="${INK}" stroke-width="1.4"/>
<path d="M100 188c-1-8 3-13 1-21" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
<circle cx="101" cy="167" r="3.4" fill="${BLOOD}"/>`

export const ROLE_ART: Record<RoleId, string> = {
  assassin: frame(ASSASSIN),
  detective: frame(DETECTIVE),
  doctor: frame(DOCTOR),
  seer: frame(SEER),
  villager: frame(VILLAGER),
  auraSeer: frame(art.AURA_SEER),
  apprentice: frame(art.APPRENTICE),
  bodyguard: frame(art.BODYGUARD),
  witch: frame(art.WITCH),
  vigilante: frame(art.VIGILANTE),
  priest: frame(art.PRIEST),
  redLady: frame(art.RED_LADY),
  toughGuy: frame(art.TOUGH_GUY),
  mayor: frame(art.MAYOR),
  baker: frame(art.BAKER),
  grandma: frame(art.GRANDMA),
  flowerChild: frame(art.FLOWER_CHILD),
  cupid: frame(art.CUPID),
  avenger: frame(art.AVENGER),
  loudmouth: frame(art.LOUDMOUTH),
  ritualist: frame(art.RITUALIST),
  graveRobber: frame(art.GRAVE_ROBBER),
  fool: frame(art.FOOL),
  headhunter: frame(art.HEADHUNTER),
  arsonist: frame(art.ARSONIST),
}

export const TAROT_NUMERAL: Record<RoleId, string> = {
  seer: 'II',
  assassin: 'XIII',
  detective: 'IX',
  doctor: 'XIV',
  villager: 'XII',
  auraSeer: 'XVII',
  apprentice: 'I',
  bodyguard: 'VII',
  witch: 'XV',
  vigilante: 'XI',
  priest: 'V',
  redLady: 'XVIII',
  toughGuy: 'VIII',
  mayor: 'IV',
  baker: 'XIX',
  grandma: 'III',
  flowerChild: 'XXI',
  cupid: 'VI',
  avenger: 'XXII',
  loudmouth: 'XXIII',
  ritualist: 'XX',
  graveRobber: 'X',
  fool: '0',
  headhunter: 'XXIV',
  arsonist: 'XVI',
}

/** Verso igual para todas as cartas: o bode no pentagrama invertido. */
export const CARD_BACK: string = toDataUrl(`
<defs>
  <radialGradient id="soot" cx="50%" cy="50%" r="65%"><stop stop-color="#2a0d0a"/><stop offset=".55" stop-color="#120806"/><stop offset="1" stop-color="#050302"/></radialGradient>
  <pattern id="fur" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><path d="M0 0v2.6" stroke="#2a160d" stroke-width=".8"/></pattern>
  <path id="horn" d="M89 153C70 150 52 136 50 112c-1-14 5-26 15-34-6 12-6 23 0 33 7 13 20 20 33 29z"/>
  <path id="ear" d="M83 170c-19 0-39 13-56 31 21 1 42-6 58-17z"/>
  <path id="eye" d="M85 172l13 6c-6 6-13 3-13-6z"/>
</defs>
<rect width="200" height="344" rx="9" fill="url(#soot)"/>
<g fill="none" stroke="${GOLD}">
  <rect x="8" y="8" width="184" height="328" rx="4" stroke-width="1.6"/><rect x="13" y="13" width="174" height="318" stroke-width=".6"/>
  <path d="M13 62l49-49M138 13l49 49M13 282l49 49M138 331l49-49" stroke-width=".6"/>
  <circle cx="100" cy="176" r="84" stroke-width="1.4"/><circle cx="100" cy="176" r="78" stroke-width=".6"/>
  <circle cx="100" cy="176" r="81" stroke-width="3.4" stroke-dasharray=".8 5.6" opacity=".8"/>
  <circle cx="100" cy="176" r="91" stroke-width="7" stroke-dasharray=".6 5.4" opacity=".35"/>
</g>
<path d="M100 254L54.2 112.9 174.2 200.1H25.8L145.8 112.9z" fill="none" stroke="#a3241a" stroke-width="2.4" stroke-linejoin="round"/>
<g stroke="#150b07" stroke-width="1.4" stroke-linejoin="round" fill="#d9c797">
  ${mirrored('horn')}${mirrored('ear')}
  <path d="M88 145q12-9 24 0l10 24c-1 15-8 24-12 36l-3 24q-7 10-14 0l-3-24c-4-12-11-21-12-36z"/>
</g>
<path d="M112 145l10 24c-1 15-8 24-12 36l-3 24q-3 5-7 6V141q7 0 12 4z" fill="url(#fur)"/>
<g fill="#c92a1c">${mirrored('eye')}</g>
<g fill="none" stroke="#150b07" stroke-width="1.2" stroke-linecap="round">
  <path d="M100 150v52M83 166q9-3 17 6 8-9 17-6M94 226q3 3 5 0M106 226q-3 3-5 0M94 236q6 3 12 0M65 94q4 8 12 12M135 94q-4 8-12 12M57 112q8 8 18 11M143 112q-8 8-18 11M55 128q12 8 24 10M145 128q-12 8-24 10"/>
</g>
<path d="M95 237l5 30 5-30q-5 4-10 0z" fill="#d9c797" stroke="#150b07"/>
<path d="M100 140c-11-9-9-18-3-26 0 6 2 8 4 9-2-9 0-19 7-26-2 13 12 22 6 33q-5 11-14 10z" fill="#d9822b" stroke="#150b07"/>
<path d="M101 139c-5-5-4-10 0-15 6 6 8 11 0 15z" fill="#ffe3a0"/>`)
