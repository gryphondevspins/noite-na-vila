// Gera os ícones PNG do aplicativo a partir do logotipo em SVG.
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const logo = await readFile(new URL('../src/svg/logo.svg', import.meta.url))
const out = new URL('../../../apps/web/public/icons/', import.meta.url)
await mkdir(out, { recursive: true })

async function icon(name, size, padding = 0.02) {
  const inner = Math.round(size * (1 - padding * 2))
  const art = await sharp(logo, { density: 300 }).resize(inner, inner).png().toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: '#0b0706' } })
    .composite([{ input: art, gravity: 'center' }])
    .png()
    .toFile(fileURLToPath(new URL(name, out)))
}

await icon('icon-192.png', 192)
await icon('icon-512.png', 512)
// Ícones "maskable" são recortados pelo celular, por isso a margem maior.
await icon('icon-maskable-512.png', 512, 0.12)
await icon('apple-touch-icon.png', 180, 0.04)
console.log('Ícones gerados em apps/web/public/icons')
