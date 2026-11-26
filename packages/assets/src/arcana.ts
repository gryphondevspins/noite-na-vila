// Os símbolos das demais cartas. O desenho ocupa o miolo da moldura (x 20–180, y 44–290).
// "url(#hatch)" é a hachura definida na moldura.
import { BLOOD, BONE, GOLD, INK, LIGHT, mirrored } from './ink'

/** Traço grosso com miolo claro, para hastes, cabos e cordas. */
const rod = (d: string, fill: string, width: number) =>
  `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="${INK}" stroke-width="${width + 4}"/><path d="${d}" stroke="${fill}" stroke-width="${width}"/></g>`

const flame = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0c-11-8-10-18-2-28 0 7 3 9 5 10-2-10 1-18 7-24-2 13 11 21 5 32q-5 12-15 10z" fill="${BLOOD}" stroke="${INK}" stroke-width="1.4"/><path d="M1-1c-5-5-4-11 0-16 6 7 7 12 0 16z" fill="#e0a040"/></g>`

const drop = (x: number, y: number, s: number, fill: string) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0c6 9 8 15 0 19-8-4-6-10 0-19z" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>`

/** Vidente de aura: a bola de cristal. */
export const AURA_SEER = `
<g fill="none" stroke="${INK}" stroke-linecap="round">
  <circle cx="100" cy="148" r="64" stroke-width="1.4" stroke-dasharray="14 7"/>
  <circle cx="100" cy="148" r="72" stroke-width=".8" stroke-dasharray="3 6"/>
  <path d="M100 52v14M58 64l8 12M142 64l-8 12M32 108l14 6M168 108l-14 6" stroke-width="1.6"/>
</g>
<circle cx="100" cy="150" r="52" fill="${LIGHT}" stroke="${INK}" stroke-width="2.6"/>
<path d="M146 126c14 34-8 74-46 76-18 1-34-8-42-22 26 14 62 10 78-14 8-12 12-26 10-40z" fill="url(#hatch)" opacity=".75"/>
<path d="M100 178c-20-6-26-30-8-40 14-7 28 4 22 16-5 9-20 6-17-4 2-6 9-5 9 0" fill="none" stroke="${BLOOD}" stroke-width="3" stroke-linecap="round"/>
<path d="M66 132q8-22 30-28" fill="none" stroke="#fffbea" stroke-width="5" stroke-linecap="round"/>
<path d="M66 196h68l10 20H56z" fill="${GOLD}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M56 216h88l-8 14H64z" fill="${INK}"/>
<path d="M66 230q-6 26-22 34M134 230q6 26 22 34M100 230v38" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
<path d="M46 272h108" stroke="${INK}" stroke-width="2"/>`

/** Aprendiz de vidente: o livro aberto e o olho que ainda aprende. */
export const APPRENTICE = `
<g stroke="${INK}">
  <path d="M72 108q28-28 56 0-28 24-56 0z" fill="${LIGHT}" stroke-width="2.2"/>
  <circle cx="100" cy="106" r="9" fill="${BLOOD}" stroke-width="1.4"/><circle cx="100" cy="106" r="3.5" fill="#100a06"/>
  <path d="M100 68v12M74 76l7 10M126 76l-7 10M58 94l12 6M142 94l-12 6M100 130v22M82 128l-10 18M118 128l10 18" fill="none" stroke-width="1.4"/>
</g>
<path d="M30 190q36-18 70 4 34-22 70-4v72q-36-14-70 8-34-22-70-8z" fill="${INK}"/>
<path d="M36 182q34-18 64 6v72q-30-22-64-8zM164 182q-34-18-64 6v72q30-22 64-8z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M100 188v72" stroke="${INK}" stroke-width="1.6"/>
<path d="M46 196q22-8 44 4M46 210q22-8 44 4M46 224q22-8 44 4M46 238q22-8 44 4M110 200q22-12 44-4M110 214q22-12 44-4" fill="none" stroke="${INK}" stroke-width="1.1"/>
<circle cx="132" cy="236" r="12" fill="none" stroke="${BLOOD}" stroke-width="1.6"/><path d="M132 224l7 21-18-13h22l-18 13z" fill="none" stroke="${BLOOD}" stroke-width="1"/>
<path d="M100 258v26l-6-7-6 7v-22" fill="${BLOOD}" stroke="${INK}" stroke-width="1.2"/>`

/** Guarda-costas: o escudo diante da espada. */
export const BODYGUARD = `
${rod('M100 56v228', LIGHT, 8)}
<path d="M74 78h52" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
<circle cx="100" cy="56" r="8" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>
<path d="M46 98q54 16 108 0v66c0 44-24 70-54 88-30-18-54-44-54-88z" fill="${BONE}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M56 111q44 11 88 0v53c0 36-19 58-44 74-25-16-44-38-44-74z" fill="none" stroke="${INK}" stroke-width="1.2"/>
<path d="M100 116c0 44 0 82 0 120 25-16 43-37 43-72v-52q-22 6-43 4z" fill="url(#hatch)" opacity=".7"/>
<path d="M89 128h22v30h28v22h-28v42l-11 9-11-9v-42H61v-22h28z" fill="${BLOOD}" stroke="${INK}" stroke-width="2"/>
<g fill="${INK}"><circle cx="58" cy="116" r="3"/><circle cx="142" cy="116" r="3"/><circle cx="64" cy="190" r="3"/><circle cx="136" cy="190" r="3"/></g>`

/** Bruxa: o caldeirão. */
export const WITCH = `
<g fill="${LIGHT}" stroke="${INK}" stroke-width="1.6">
  <circle cx="82" cy="140" r="11"/><circle cx="110" cy="118" r="8"/><circle cx="92" cy="94" r="5"/><circle cx="122" cy="142" r="6"/><circle cx="106" cy="76" r="3"/>
</g>
<path d="M100 66c-14-10 10-14-2-26" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
<path d="M58 168c-24 20-22 62 8 80 20 12 48 12 68 0 30-18 32-60 8-80z" fill="${INK}"/>
<ellipse cx="100" cy="166" rx="52" ry="12" fill="${BLOOD}" stroke="${INK}" stroke-width="4"/>
<path d="M72 164q10-8 20 0t20 0 18 0" fill="none" stroke="#c9573f" stroke-width="2"/>
<path d="M52 192q-18 4-12 22M148 192q18 4 12 22" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<path d="M62 194q-8 24 12 44" fill="none" stroke="${BONE}" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<path d="M100 190l16 44-38-27h44l-38 27z" fill="none" stroke="${BONE}" stroke-width="1.4" opacity=".8"/>
<path d="M70 246l-8 20M130 246l8 20M100 252v14" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
${flame(72, 285, 0.62)}${flame(100, 290, 0.8)}${flame(128, 285, 0.62)}`

/** Justiceiro: a única bala na mira. */
export const VIGILANTE = `
<g fill="none" stroke="${INK}">
  <circle cx="100" cy="162" r="66" stroke-width="5"/><circle cx="100" cy="162" r="66" stroke="${GOLD}" stroke-width="1.6"/>
  <circle cx="100" cy="162" r="48" stroke-width="1.2" stroke-dasharray="2 4"/>
  <path d="M100 70v40M100 214v40M24 162h42M134 162h42" stroke-width="3"/>
</g>
<path d="M80 164c0-34 8-60 20-76 12 16 20 42 20 76z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M79 164h42v66H79z" fill="${GOLD}" stroke="${INK}" stroke-width="2.4"/>
<path d="M104 94c10 16 15 40 15 70v66h-12v-66c0-28-1-50-3-70z" fill="url(#hatch)" opacity=".8"/>
<path d="M74 230h52v12H74z" fill="${INK}"/>
<path d="M79 172h42M79 220h42" stroke="${INK}" stroke-width="1.4"/>
<circle cx="100" cy="196" r="9" fill="${BLOOD}" stroke="${INK}" stroke-width="1.6"/>
<path d="M88 150q0-28 9-45" fill="none" stroke="#fffbea" stroke-width="4" stroke-linecap="round"/>
${drop(100, 262, 1, BLOOD)}`

/** Padre: o frasco de água benta. */
export const PRIEST = `
<path d="M93 56h14v16h16v14h-16v26H93V86H77V72h16z" fill="${GOLD}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M86 114h28v10H86z" fill="${INK}"/>
<path d="M90 124h20v30c28 12 40 30 38 56-3 30-22 52-48 52s-45-22-48-52c-2-26 10-44 38-56z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M62 196q18-12 38 0t38 0c10 30-12 58-38 58s-48-28-38-58z" fill="#9fb4b0" stroke="${INK}" stroke-width="1.2"/>
<path d="M122 164c24 20 30 64 4 84 6-26 6-54-4-84z" fill="url(#hatch)" opacity=".7"/>
<path d="M93 194h14v16h14v13h-14v27H93v-27H79v-13h14z" fill="${BLOOD}" stroke="${INK}" stroke-width="1.4"/>
<path d="M66 190q4-18 20-28" fill="none" stroke="#fffbea" stroke-width="4.5" stroke-linecap="round"/>
${drop(48, 128, 1.1, '#9fb4b0')}${drop(152, 120, 0.9, '#9fb4b0')}${drop(160, 160, 0.7, '#9fb4b0')}${drop(38, 168, 0.7, '#9fb4b0')}${drop(100, 268, 0.9, '#9fb4b0')}`

/** Dama de vermelho: a rosa e os espinhos. */
export const RED_LADY = `
<defs><path id="leaf" d="M97 232c-24 4-44-8-52-30 24-4 44 6 52 30z"/></defs>
${rod('M100 166c-6 34 10 66-2 118', '#5d6b3a', 5)}
<g fill="#6f7d45" stroke="${INK}" stroke-width="1.8">${mirrored('leaf')}</g>
<path d="M52 208q22 8 40 20M148 208q-22 8-40 20" fill="none" stroke="${INK}" stroke-width="1"/>
<path d="M98 190l-12-6 10 14M101 250l13-8-11 18M99 266l-12-4 10 12" fill="${INK}"/>
<path d="M100 70c30 0 56 22 56 52 0 34-26 56-56 56s-56-22-56-56c0-30 26-52 56-52z" fill="${BLOOD}" stroke="${INK}" stroke-width="2.6"/>
<g fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round">
  <path d="M52 108c18 4 28 20 30 38M148 108c-18 4-28 20-30 38M58 148c22 24 62 26 84 0"/>
  <path d="M100 84c24 2 38 20 34 40-4 18-24 28-40 22-18-6-22-28-8-38 12-9 32-2 28 12-3 11-20 11-20 1 0-6 7-8 10-4"/>
  <path d="M68 100c6-14 18-20 32-16"/>
</g>
<path d="M142 96c16 24 8 62-22 76 22-22 28-48 22-76z" fill="url(#hatch)" opacity=".8"/>
<path d="M62 118q4-24 26-34" fill="none" stroke="#c9573f" stroke-width="3.5" stroke-linecap="round"/>`

/** Durão: a lâmina que se quebra na bigorna. */
export const TOUGH_GUY = `
<path d="M36 166h92q4 0 4 4h36c-4 18-20 30-40 32-14 2-16 12-14 22l10 18H76l10-18c2-12-2-20-14-24-18-6-32-14-36-34z" fill="${INK}"/>
<path d="M40 170h90v10H44z" fill="${BONE}" opacity=".35"/>
<path d="M62 242h76l10 22H52z" fill="${INK}"/>
<path d="M50 272h100" stroke="${INK}" stroke-width="3"/>
<path d="M92 196q8 22 0 40M120 186q-6 14 2 24" fill="none" stroke="${BONE}" stroke-width="1.6" opacity=".5"/>
<path d="M100 166l-18-26 14 2-22-28 20 8-6-24 14 26 6-30 6 30 20-20-12 30 22-6-26 22 14 2z" fill="#e0a040" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M60 62l26 40-8 4 6 10-12-4-24-42z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M126 108l10-8-2 10 12-2 30 36 4 16-16-6-30-36z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M140 108l30 38 4 12" fill="none" stroke="${INK}" stroke-width="1"/>
<path d="M44 66l14-14" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`

/** Prefeito: a coroa e o selo. */
export const MAYOR = `
<path d="M46 170l-8-82 34 38 28-58 28 58 34-38-8 82z" fill="${GOLD}" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
<path d="M100 72l28 56 30-34-8 76h-50z" fill="url(#hatch)" opacity=".55"/>
<path d="M44 170h112v24H44z" fill="${BONE}" stroke="${INK}" stroke-width="2.8"/>
<g fill="${BLOOD}" stroke="${INK}" stroke-width="1.6">
  <circle cx="38" cy="86" r="6.5"/><circle cx="100" cy="66" r="8"/><circle cx="162" cy="86" r="6.5"/>
  <circle cx="72" cy="182" r="6"/><path d="M100 173l10 9-10 9-10-9z"/><circle cx="128" cy="182" r="6"/>
</g>
<path d="M82 218l-18 62 14-8 6 14 16-54zM118 218l18 62-14-8-6 14-16-54z" fill="${BLOOD}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
<circle cx="100" cy="230" r="28" fill="${BLOOD}" stroke="${INK}" stroke-width="2.6"/>
<circle cx="100" cy="230" r="31" fill="none" stroke="${INK}" stroke-width="4" stroke-dasharray="3 4"/>
<circle cx="100" cy="230" r="19" fill="none" stroke="${BONE}" stroke-width="1.2"/>
<path d="M89 220l11 22 11-22M92 240h16" fill="none" stroke="${BONE}" stroke-width="3"/>`

/** Padeiro: o pão entre as espigas. */
export const BAKER = `
<defs>
  <g id="wheat">
    <path d="M78 200C56 170 48 130 52 78" fill="none" stroke="${INK}" stroke-width="2.4"/>
    <g fill="${GOLD}" stroke="${INK}" stroke-width="1.4">
      <ellipse cx="52" cy="76" rx="5" ry="12"/>
      <ellipse cx="43" cy="96" rx="5" ry="12" transform="rotate(-32 43 96)"/><ellipse cx="62" cy="94" rx="5" ry="12" transform="rotate(28 62 94)"/>
      <ellipse cx="43" cy="118" rx="5" ry="12" transform="rotate(-34 43 118)"/><ellipse cx="63" cy="116" rx="5" ry="12" transform="rotate(26 63 116)"/>
      <ellipse cx="46" cy="140" rx="5" ry="12" transform="rotate(-38 46 140)"/><ellipse cx="67" cy="138" rx="5" ry="12" transform="rotate(22 67 138)"/>
    </g>
  </g>
</defs>
${mirrored('wheat')}
<path d="M30 228c0-44 30-66 70-66s70 22 70 66c0 20-30 28-70 28s-70-8-70-28z" fill="#c79a55" stroke="${INK}" stroke-width="3"/>
<path d="M170 228c0 20-30 28-70 28s-70-8-70-28c18 14 112 18 140 0z" fill="url(#hatch)" opacity=".75"/>
<g fill="${LIGHT}" stroke="${INK}" stroke-width="1.8">
  <path d="M60 188q18 6 20 34-18-8-20-34z"/><path d="M90 174q20 10 20 44-20-14-20-44z"/><path d="M122 180q18 10 16 40-18-14-16-40z"/>
</g>
<path d="M44 216q4-30 34-42" fill="none" stroke="#f0d49a" stroke-width="3.5" stroke-linecap="round"/>
<path d="M100 150c-12-14 12-20 0-36s10-24 2-36M78 154c-8-10 6-16-2-26M122 154c8-10-6-16 2-26" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
<path d="M36 268h128" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`

/** Vovó rabugenta: os óculos e o novelo. */
export const GRANDMA = `
<g fill="${LIGHT}" stroke="${INK}" stroke-width="4">
  <circle cx="68" cy="118" r="26"/><circle cx="132" cy="118" r="26"/>
</g>
<path d="M94 114q6-10 12 0M42 112l-18-14M158 112l18-14" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
<g stroke="${INK}">
  <path d="M54 116h28M118 116h28" stroke-width="3"/>
  <path d="M60 120q8 12 16 0M124 120q8 12 16 0" fill="${BLOOD}" stroke-width="1.6"/>
  <path d="M44 78l44 14M156 78l-44 14" stroke-width="6" stroke-linecap="round"/>
</g>
<path d="M72 106q8-8 18-4" fill="none" stroke="#fffbea" stroke-width="3" stroke-linecap="round"/>
${rod('M52 168l86 104', GOLD, 4)}${rod('M148 168l-86 104', GOLD, 4)}
<circle cx="100" cy="222" r="40" fill="${BLOOD}" stroke="${INK}" stroke-width="2.6"/>
<path d="M64 206q40-14 72 20M62 226q34-4 56 34M76 190q38 4 62 40M68 244q8-38 56-58M86 260q10-44 52-62" fill="none" stroke="${BONE}" stroke-width="1.4" opacity=".75"/>
<path d="M128 252q26 10 12 24t-34 2-48 6" fill="none" stroke="${BLOOD}" stroke-width="2.6" stroke-linecap="round"/>
<circle cx="52" cy="168" r="5" fill="${INK}"/><circle cx="148" cy="168" r="5" fill="${INK}"/>`

/** Criança das flores: a flor que desfaz o laço da forca. */
export const FLOWER_CHILD = `
${rod('M100 48v56', GOLD, 7)}
<path d="M88 100h24v40H88z" fill="${GOLD}" stroke="${INK}" stroke-width="2.4"/>
<path d="M88 108l24 6M88 118l24 6M88 128l24 6" stroke="${INK}" stroke-width="2"/>
${rod('M100 140c-40 6-62 36-56 72 5 32 30 50 56 50s51-18 56-50c6-36-16-66-56-72z', GOLD, 6)}
<g fill="${LIGHT}" stroke="${INK}" stroke-width="1.8">
  ${[0, 45, 90, 135, 180, 225, 270, 315]
    .map((turn) => `<ellipse cx="100" cy="176" rx="11" ry="24" transform="rotate(${turn} 100 202)"/>`)
    .join('')}
</g>
<circle cx="100" cy="202" r="16" fill="${BLOOD}" stroke="${INK}" stroke-width="2.4"/>
<circle cx="100" cy="202" r="10" fill="none" stroke="${GOLD}" stroke-width="3" stroke-dasharray="1.5 3"/>
<path d="M100 262q-4 14 4 26M101 276q-18 0-22-14 18-2 22 14zM104 282q16-2 20-16-18 0-20 16z" fill="#6f7d45" stroke="${INK}" stroke-width="1.8"/>`

/** Cupido: o coração atravessado por duas flechas. */
export const CUPID = `
${rod('M36 78l128 172', GOLD, 4)}${rod('M164 78L36 250', GOLD, 4)}
<g fill="${INK}">
  <path d="M164 250l-4-26-8 12-14 2zM36 250l26-12-14-2-8-12z"/>
  <path d="M36 78l24 6-8 6 10 14-6 4-10-14-6 8zM164 78l-24 6 8 6-10 14 6 4 10-14 6 8z"/>
</g>
<path d="M100 238C56 208 34 180 34 146c0-24 18-40 38-40 14 0 24 8 28 20 4-12 14-20 28-20 20 0 38 16 38 40 0 34-22 62-66 92z" fill="${BLOOD}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M156 128c20 36-6 72-56 108 28-30 62-62 56-108z" fill="url(#hatch)" opacity=".8"/>
<path d="M48 146q0-24 22-28" fill="none" stroke="#c9573f" stroke-width="4.5" stroke-linecap="round"/>
<path d="M100 130l-10 24 18 14-14 22 8 18" fill="none" stroke="${BONE}" stroke-width="1.4" stroke-dasharray="4 3"/>
${drop(88, 252, 0.8, BLOOD)}${drop(112, 262, 0.6, BLOOD)}`

/** Vingador: os dois machados cruzados. */
export const AVENGER = `
<defs>
  <g id="axe">
    ${rod('M54 90l92 170', '#6d4a2c', 7)}
    <path d="M62 106c-18 8-34 4-40-12-4-12 0-28 12-38 2 14 10 20 20 18l16-2 12 22z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M34 60c-8 12-10 24-6 34 6 12 20 16 34 10" fill="none" stroke="${INK}" stroke-width="1"/>
  </g>
</defs>
${mirrored('axe')}
<path d="M100 134c-25 0-36 16-34 36 1 12 8 16 12 20v16h44v-16c4-4 11-8 12-20 2-20-9-36-34-36z" fill="${BONE}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
<g fill="${INK}"><path d="M76 168l20 6-8 12-11-5zM124 168l-20 6 8 12 11-5z"/><path d="M100 186l-5 10h10z"/></g>
<g fill="${BLOOD}"><circle cx="86" cy="177" r="3"/><circle cx="114" cy="177" r="3"/></g>
<path d="M86 200v8M94 200v10M106 200v10M114 200v8" stroke="${INK}" stroke-width="1.6"/>
<path d="M112 140c18 8 24 30 8 50v16h-10c10-24 12-46 2-66z" fill="url(#hatch)" opacity=".8"/>
${drop(32, 112, 0.9, BLOOD)}${drop(168, 112, 0.9, BLOOD)}`

/** Fofoqueiro: a boca que não se cala. */
export const LOUDMOUTH = `
<path d="M36 168q30-46 64-28 34-18 64 28-18 78-64 78t-64-78z" fill="${BLOOD}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M50 168q50-20 100 0-14 60-50 60t-50-60z" fill="#100a06" stroke="${INK}" stroke-width="2"/>
<path d="M56 167q44-16 88 0l-4 14-12-2-4 12-12-12-12 3-12-3-12 12-4-12-12 2z" fill="${LIGHT}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M74 218c0-18 12-24 26-18 14-6 26 0 26 18q-11 12-26 10-15 2-26-10z" fill="#b4372a" stroke="${INK}" stroke-width="1.6"/>
<path d="M100 202v18" stroke="${INK}" stroke-width="1.2"/>
<path d="M44 172q6 40 28 60M156 172q-6 40-28 60" fill="none" stroke="${INK}" stroke-width="1"/>
<path d="M54 156q16-18 36-12" fill="none" stroke="#c9573f" stroke-width="3.5" stroke-linecap="round"/>
<g fill="none" stroke="${INK}" stroke-linecap="round">
  <path d="M78 118l-10-22M100 112V80M122 118l10-22M52 134l-20-18M148 134l20-18" stroke-width="3"/>
  <path d="M62 92q38-34 76 0M48 76q52-44 104 0" stroke-width="1.4"/>
  <path d="M82 262l-5 16M100 266v18M118 262l5 16" stroke-width="2"/>
</g>`

/** Ritualista: a cruz ansata entre duas velas. */
export const RITUALIST = `
<defs>
  <g id="taper"><path d="M36 190h18v80H36z" fill="${BONE}" stroke="${INK}" stroke-width="2"/><path d="M36 190q5 14 8 2t10 6v-8z" fill="${LIGHT}" stroke="${INK}" stroke-width="1.2"/><ellipse cx="45" cy="272" rx="18" ry="5" fill="${INK}"/></g>
</defs>
${mirrored('taper')}${flame(45, 186, 0.55)}${flame(155, 186, 0.55)}
<path d="M100 60c-22 0-34 16-34 34 0 20 18 34 25 56H60v22h31l-5 104h28l-5-104h31v-22h-31c7-22 25-36 25-56 0-18-12-34-34-34zm0 20c10 0 15 7 15 16 0 12-9 22-15 40-6-18-15-28-15-40 0-9 5-16 15-16z" fill="${GOLD}" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round" fill-rule="evenodd"/>
<path d="M106 174l6 100h-8l-4-100zM118 70c12 12 16 30 4 52l-12 26 2-16c14-22 18-42 6-62z" fill="url(#hatch)" opacity=".7"/>
<circle cx="100" cy="161" r="7" fill="${BLOOD}" stroke="${INK}" stroke-width="1.6"/>`

/** Ladrão de túmulos: a lápide e a pá. */
export const GRAVE_ROBBER = `
<path d="M44 256V132c0-32 22-52 50-52s50 20 50 52v124z" fill="${BONE}" stroke="${INK}" stroke-width="3"/>
<path d="M122 92c20 12 22 30 22 44v120h-20z" fill="url(#hatch)" opacity=".8"/>
<path d="M88 112h12v20h18v12h-18v38H88v-38H70v-12h18z" fill="${INK}"/>
<path d="M64 200h60M70 214h48M76 228h36" stroke="${INK}" stroke-width="1.6"/>
<path d="M62 84l8 24-8 12 10 18" fill="none" stroke="${INK}" stroke-width="1.4"/>
${rod('M162 72l-26 142', '#6d4a2c', 7)}
<path d="M148 68l30 6" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
<path d="M118 210l38 7-6 32c-4 16-16 26-27 30-8-9-13-23-10-39z" fill="#8f8f86" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M137 214l-12 62" stroke="${INK}" stroke-width="1.4"/>
<path d="M24 270q26-30 56-14t46-4 50 20v10H24z" fill="${INK}"/>
<path d="M40 266l-6-18M48 262l2-22M56 260l10-16" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
<g fill="${BONE}"><circle cx="70" cy="274" r="3"/><circle cx="104" cy="270" r="2.4"/><circle cx="146" cy="277" r="3"/></g>`

/** Bobo: o chapéu de guizos. */
export const FOOL = `
<path d="M62 176C52 128 38 112 26 130c-4-40 34-60 58-24z" fill="${BLOOD}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M138 176c10-48 24-64 36-46 4-40-34-60-58-24z" fill="${INK}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M68 176c0-48 8-92 46-118 20 8 28 26 18 40-6-14-18-14-22 0 14 18 22 46 22 78z" fill="${GOLD}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M58 172q42-16 84 0v20q-42-16-84 0z" fill="${BONE}" stroke="${INK}" stroke-width="2.4"/>
<g fill="${GOLD}" stroke="${INK}" stroke-width="2"><circle cx="26" cy="138" r="9"/><circle cx="174" cy="138" r="9"/><circle cx="133" cy="106" r="9"/></g>
<path d="M21 140h10M169 140h10M128 108h10" stroke="${INK}" stroke-width="2.4"/>
<path d="M70 192c0 42 12 70 30 76 18-6 30-34 30-76q-30-10-60 0z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.4"/>
<g fill="${INK}"><path d="M78 208q10-12 18 0-9-4-18 0zM104 208q8-12 18 0-9-4-18 0z"/><path d="M80 232q20 14 40 0-4 22-20 22t-20-22z"/></g>
<path d="M87 200v22M113 200v22" stroke="${BLOOD}" stroke-width="3" stroke-linecap="round"/>
<path d="M120 196c8 28-2 56-18 70 12-22 16-46 8-70z" fill="url(#hatch)" opacity=".7"/>
<path d="M62 266l16 18 10-14 12 16 12-16 10 14 16-18" fill="none" stroke="${BLOOD}" stroke-width="3" stroke-linejoin="round"/>`

/** Caçador de cabeças: o alvo com a caveira cravada. */
export const HEADHUNTER = `
<g stroke="${INK}">
  <circle cx="100" cy="168" r="70" fill="${BONE}" stroke-width="3"/>
  <circle cx="100" cy="168" r="54" fill="${BLOOD}" stroke-width="1.6"/>
  <circle cx="100" cy="168" r="39" fill="${BONE}" stroke-width="1.6"/>
  <circle cx="100" cy="168" r="24" fill="${BLOOD}" stroke-width="1.6"/>
</g>
<path d="M100 98a70 70 0 0 1 0 140c30-16 42-40 42-70s-12-54-42-70z" fill="url(#hatch)" opacity=".5"/>
<path d="M100 146c-17 0-24 11-23 24 1 8 5 11 8 14v11h30v-11c3-3 7-6 8-14 1-13-6-24-23-24z" fill="${LIGHT}" stroke="${INK}" stroke-width="2"/>
<g fill="${INK}"><circle cx="91" cy="170" r="6"/><circle cx="109" cy="170" r="6"/><path d="M100 178l-4 8h8z"/></g>
<path d="M93 188v7M100 188v7M107 188v7" stroke="${INK}" stroke-width="1.4"/>
${rod('M168 66l-54 80', GOLD, 4)}
<path d="M106 158l5-22 7 12 14 1z" fill="${INK}"/>
<path d="M168 66l-4 22-6-8-14 2 10-11-6-7z" fill="${BLOOD}" stroke="${INK}" stroke-width="1.2"/>
<path d="M62 232l-18 44M138 232l18 44M100 238v40" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`

/** Incendiário: o fósforo e o incêndio. */
export const ARSONIST = `
<path d="M100 250c-46 0-66-30-60-62 4-24 20-34 22-58 12 10 14 22 12 34 14-20 6-54 34-90-2 30 14 44 28 62 8 10 10 22 8 30 8-6 12-16 12-26 16 22 20 46 12 66-10 28-34 44-68 44z" fill="${BLOOD}" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
<path d="M100 246c-26 0-40-18-36-40 3-16 16-24 16-42 10 8 10 18 8 26 12-14 10-34 24-52 0 22 16 34 24 50 10 24-6 58-36 58z" fill="#d9822b" stroke="${INK}" stroke-width="1.6"/>
<path d="M100 242c-14 0-22-11-19-24 3-10 13-18 14-32 12 12 24 24 24 38 0 11-8 18-19 18z" fill="#ffe3a0"/>
<path d="M148 170c14 34-2 66-36 78 24-20 36-46 36-78z" fill="url(#hatch)" opacity=".6"/>
${rod('M52 278l62-30', BONE, 7)}
<ellipse cx="117" cy="246" rx="10" ry="7" transform="rotate(-26 117 246)" fill="${INK}"/>
<path d="M136 270h30v14h-30z" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>
<g fill="${BLOOD}"><circle cx="58" cy="110" r="3"/><circle cx="146" cy="104" r="2.4"/><circle cx="70" cy="84" r="1.8"/><circle cx="136" cy="76" r="3"/></g>`
