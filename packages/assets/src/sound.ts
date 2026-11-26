// Todo o som é gerado no aparelho com WebAudio: não há arquivos e funciona sem internet.

export type Cue = 'flip' | 'bell' | 'finale'

export const MUTE_KEY = 'noite-na-vila:som'

const VOLUME = 0.6

interface Engine {
  context: AudioContext
  master: GainNode
  noise: AudioBuffer
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function noiseBuffer(context: AudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

/** Ruído filtrado com um envelope curto: base do vento, dos estalos e da virada de carta. */
function burst(
  { context, master, noise }: Engine,
  options: { at: number; length: number; from: number; to: number; peak: number; q?: number },
) {
  const { at, length, from, to, peak, q = 0.8 } = options
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = noise
  filter.type = 'bandpass'
  filter.Q.value = q
  filter.frequency.setValueAtTime(from, at)
  filter.frequency.exponentialRampToValueAtTime(to, at + length)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(peak, at + length * 0.3)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
  source.connect(filter).connect(gain).connect(master)
  source.start(at, Math.random(), length + 0.05)
}

function tone(
  { context, master }: Engine,
  options: { at: number; frequency: number; length: number; peak: number; attack?: number },
) {
  const { at, frequency, length, peak, attack = 0.01 } = options
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(peak, at + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
  oscillator.connect(gain).connect(master)
  oscillator.start(at)
  oscillator.stop(at + length + 0.05)
}

const CUES: Record<Cue, (engine: Engine, now: number) => void> = {
  flip(engine, now) {
    burst(engine, { at: now, length: 0.34, from: 500, to: 3200, peak: 0.22 })
    burst(engine, { at: now + 0.3, length: 0.09, from: 900, to: 300, peak: 0.3 })
  },
  // Sino fúnebre: parciais que não são múltiplos exatos soam como metal.
  bell(engine, now) {
    for (const [ratio, peak] of [[1, 0.3], [2.01, 0.16], [2.76, 0.12], [4.07, 0.06], [0.5, 0.2]] as const) {
      tone(engine, { at: now, frequency: 164 * ratio, length: 4.2 / Math.sqrt(ratio), peak })
    }
  },
  finale(engine, now) {
    for (const [i, frequency] of [73.4, 110, 146.8, 174.6, 220].entries()) {
      tone(engine, { at: now + i * 0.18, frequency, length: 3.6, peak: 0.13, attack: 0.5 })
    }
  },
}

/** Vento constante que sobe e desce, com estalos de vela aqui e ali. */
function startAmbience(engine: Engine) {
  const { context, master, noise } = engine
  const wind = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  const swell = context.createOscillator()
  const depth = context.createGain()
  wind.buffer = noise
  wind.loop = true
  filter.type = 'lowpass'
  filter.frequency.value = 320
  gain.gain.value = 0.09
  swell.frequency.value = 0.07
  depth.gain.value = 170
  swell.connect(depth).connect(filter.frequency)
  wind.connect(filter).connect(gain).connect(master)
  wind.start()
  swell.start()

  const crackle = () => {
    if (context.state === 'running') {
      const from = 1800 + Math.random() * 2600
      burst(engine, { at: context.currentTime, length: 0.03, from, to: from * 0.6, peak: 0.05, q: 3 })
    }
    setTimeout(crackle, 250 + Math.random() * 1600)
  }
  crackle()
}

export function createSound() {
  let engine: Engine | null = null
  let muted = readMuted()
  const listeners = new Set<(cue: Cue) => void>()

  /** Só pode ser chamado depois de um toque: os navegadores bloqueiam som antes disso. */
  function unlock(): void {
    if (muted) return
    try {
      if (!engine) {
        if (typeof AudioContext === 'undefined') return
        const context = new AudioContext()
        const master = context.createGain()
        master.gain.value = VOLUME
        master.connect(context.destination)
        engine = { context, master, noise: noiseBuffer(context) }
        startAmbience(engine)
      }
      if (engine.context.state === 'suspended') void engine.context.resume()
    } catch {
      engine = null
    }
  }

  return {
    unlock,
    isMuted: () => muted,
    setMuted(value: boolean): void {
      muted = value
      try {
        localStorage.setItem(MUTE_KEY, value ? '1' : '0')
      } catch {
        // sem armazenamento disponível
      }
      if (value) void engine?.context.suspend()
      else unlock()
    },
    play(cue: Cue): void {
      listeners.forEach((listener) => listener(cue))
      if (muted || !engine) return
      CUES[cue](engine, engine.context.currentTime)
    },
    /** Pausa quando o aparelho sai da tela do jogo. */
    setHidden(hidden: boolean): void {
      if (!engine || muted) return
      void (hidden ? engine.context.suspend() : engine.context.resume())
    },
    onCue(listener: (cue: Cue) => void): () => void {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
  }
}

export const sound = createSound()
