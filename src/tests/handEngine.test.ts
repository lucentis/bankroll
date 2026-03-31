// HandEngine.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useHandEngine } from '@/composables/useHandEngine'

describe('HandEngine - full flow', () => {
  let engine: ReturnType<typeof useHandEngine>

  beforeEach(() => {
    engine = useHandEngine()
    const { setPlayers, startHand } = engine

    setPlayers([
      { id: 'p1', name: 'UTG', stack: 100, position: 'UTG' },
      { id: 'p2', name: 'MP', stack: 100, position: 'MP' },
      { id: 'p3', name: 'CO', stack: 100, position: 'CO' },
      { id: 'p4', name: 'BTN', stack: 100, position: 'BTN' },
      { id: 'p5', name: 'SB', stack: 100, position: 'SB' },
      { id: 'p6', name: 'BB', stack: 100, position: 'BB' },
    ])

    startHand()
  })

  it('initializes correctly', () => {
    const { handState } = engine
    expect(handState.status).toBe('playing')
    expect(handState.street).toBe('preflop')
    expect(handState.pot).toBe(3)      // SB + BB
    expect(handState.currentBet).toBe(2) // BB
    expect(handState.contributions['p5']).toBe(1)
    expect(handState.contributions['p6']).toBe(2)
    expect(handState.playersInHand.length).toBe(6)
    expect(handState.playersToAct[0].id).toBe('p1') // UTG first
  })

  it('fold updates playersInHand and playersToAct', () => {
    const { handState, act, currentPlayer } = engine
    expect(currentPlayer.value.id).toBe('p1')

    act({ type: 'fold' })
    expect(handState.playersInHand.find(p => p.id === 'p1')).toBeFalsy()
    expect(currentPlayer.value.id).toBe('p2')
  })

  it('call updates stack, pot and contributions', () => {
    const { handState, act, currentPlayer } = engine

    act({ type: 'call' }) // p1 calls BB=2
    expect(handState.contributions['p1']).toBe(2)
    expect(handState.pot).toBe(5)
    expect(currentPlayer.value.id).toBe('p2')
  })

  it('raise updates currentBet, contributions and restarts turn order', () => {
    const { handState, act, currentPlayer } = engine

    act({ type: 'raise', amount: 6 }) // p1 raises
    expect(handState.currentBet).toBe(6)
    expect(handState.contributions['p1']).toBe(6)
    expect(currentPlayer.value.id).toBe('p2') // next in order
  })

  it('street finishes correctly after all players act', () => {
    const { handState, act } = engine

    // All call/check in preflop
    act({ type: 'call' })  // p1
    act({ type: 'call' })  // p2
    act({ type: 'call' })  // p3
    act({ type: 'call' })  // p4
    act({ type: 'call' })  // p5
    act({ type: 'check' }) // p6

    expect(handState.street).toBe('flop')
    expect(handState.currentBet).toBe(0)
    expect(handState.contributions['p1']).toBe(0) // reset
  })

  it('hand finishes when only one player remains', () => {
    const { handState, act } = engine

    // everyone folds except BB
    act({ type: 'fold' }) // p1
    act({ type: 'fold' }) // p2
    act({ type: 'fold' }) // p3
    act({ type: 'fold' }) // p4
    act({ type: 'fold' }) // p5

    expect(handState.playersInHand.length).toBe(1)
    expect(handState.status).toBe('finished')
    expect(handState.street).toBe('result')
  })

  it('handles complex scenario with raise and multiple streets', () => {
    const { handState, act } = engine

    // Preflop
    act({ type: 'call' })  // p1
    act({ type: 'raise', amount: 6 }) // p2
    act({ type: 'call' })  // p3
    act({ type: 'call' })  // p4
    act({ type: 'call' })  // p5
    act({ type: 'call' })  // p6 responds to raise
    act({ type: 'call' })  // p1

    expect(handState.street).toBe('flop')

    // Flop - all check
    act({ type: 'check' }) // p1
    act({ type: 'check' }) // p2
    act({ type: 'check' }) // p3
    act({ type: 'check' }) // p4
    act({ type: 'check' }) // p5
    act({ type: 'check' }) // p6

    expect(handState.street).toBe('turn')
  })
})