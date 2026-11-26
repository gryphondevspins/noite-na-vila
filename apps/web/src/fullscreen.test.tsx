// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { App } from './App'

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'

const button = (name: string) => screen.queryByRole('button', { name })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

/** Navegador que aceita tela cheia, como o Chrome no Android. */
function supportFullscreen() {
  let current: Element | null = null
  const change = async (next: Element | null) => {
    current = next
    document.dispatchEvent(new Event('fullscreenchange'))
  }
  const request = vi.fn((_options?: FullscreenOptions) => change(document.documentElement))
  const exit = vi.fn(() => change(null))
  Object.defineProperties(document, {
    fullscreenEnabled: { configurable: true, value: true },
    fullscreenElement: { configurable: true, get: () => current },
    exitFullscreen: { configurable: true, value: exit },
  })
  Object.defineProperty(document.documentElement, 'requestFullscreen', {
    configurable: true,
    value: request,
  })
  /** O jogador sai pelo gesto do próprio celular. */
  return { request, exit, leaveByGesture: () => change(null) }
}

const useIPhone = () => vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(IPHONE)

function openedAsApp(mode: 'standalone' | 'fullscreen') {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === `(display-mode: ${mode})`,
  }))
}

afterEach(() => {
  cleanup()
  for (const key of ['fullscreenEnabled', 'fullscreenElement', 'exitFullscreen']) {
    delete (document as any)[key]
  }
  delete (document.documentElement as any).requestFullscreen
  delete (navigator as any).standalone
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('tela cheia onde o navegador permite', () => {
  test('um toque entra na tela cheia e esconde as barras do celular', async () => {
    const api = supportFullscreen()
    render(<App />)
    await act(async () => click('Tela cheia'))
    expect(api.request).toHaveBeenCalledWith({ navigationUI: 'hide' })
    expect(button('Sair da tela cheia')).toBeTruthy()
  })

  test('outro toque sai', async () => {
    const api = supportFullscreen()
    render(<App />)
    await act(async () => click('Tela cheia'))
    await act(async () => click('Sair da tela cheia'))
    expect(api.exit).toHaveBeenCalledOnce()
    expect(button('Tela cheia')).toBeTruthy()
  })

  test('sair pelo gesto do celular atualiza o botão', async () => {
    const api = supportFullscreen()
    render(<App />)
    await act(async () => click('Tela cheia'))
    await act(() => api.leaveByGesture())
    expect(button('Tela cheia')).toBeTruthy()
  })

  test('se o navegador recusar, o jogo segue normal', async () => {
    const api = supportFullscreen()
    api.request.mockRejectedValue(new TypeError('recusado'))
    render(<App />)
    await act(async () => click('Tela cheia'))
    expect(button('Tela cheia')).toBeTruthy()
    expect(button('Novo jogo')).toBeTruthy()
  })

  test('o botão continua disponível nas outras telas', () => {
    supportFullscreen()
    render(<App />)
    click('Novo jogo')
    expect(button('Tela cheia')).toBeTruthy()
  })
})

describe('tela cheia no iPhone', () => {
  test('o botão ensina a adicionar à Tela de Início', () => {
    useIPhone()
    render(<App />)
    click('Tela cheia')
    const dialog = screen.getByRole('dialog', { name: 'Jogar em tela cheia' })
    expect(dialog.textContent).toContain('Compartilhar')
    expect(dialog.textContent).toContain('Adicionar à Tela de Início')
    expect(dialog.textContent).toContain('Safari')
  })

  test('o passo a passo cobre a tela, fora da área dos botões do topo', () => {
    useIPhone()
    render(<App />)
    click('Tela cheia')
    // A área do topo usa translate, que prende elementos fixos dentro dela.
    expect(screen.getByRole('dialog').closest('.top-tools')).toBeNull()
  })

  test('o botão Entendi fecha o passo a passo', () => {
    useIPhone()
    render(<App />)
    click('Tela cheia')
    click('Entendi')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('a tecla Esc também fecha', () => {
    useIPhone()
    render(<App />)
    click('Tela cheia')
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('quando o botão não faz sentido', () => {
  test.each(['standalone', 'fullscreen'] as const)('app instalado (%s) não mostra', (mode) => {
    supportFullscreen()
    openedAsApp(mode)
    render(<App />)
    expect(button('Tela cheia')).toBeNull()
  })

  test('app aberto pelo ícone no iPhone não mostra', () => {
    useIPhone()
    Object.defineProperty(navigator, 'standalone', { configurable: true, value: true })
    render(<App />)
    expect(button('Tela cheia')).toBeNull()
  })

  test('navegador sem tela cheia e que não é iPhone não mostra', () => {
    render(<App />)
    expect(button('Tela cheia')).toBeNull()
  })

  test('na tela cheia ativada pelo botão, ele continua lá para sair', async () => {
    const api = supportFullscreen()
    // O Chrome passa a responder "fullscreen" também quando a tela cheia vem do botão.
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(display-mode: fullscreen)' && document.fullscreenElement !== null,
    }))
    render(<App />)
    await act(async () => click('Tela cheia'))
    expect(api.request).toHaveBeenCalled()
    expect(button('Sair da tela cheia')).toBeTruthy()
  })
})
