// HandEngine.test.ts
import { describe, it, expect } from 'vitest'
import { useHandEngine } from '@/composables/useHandEngine'

describe('HandEngine - setup', () => {

  it('initialise correctement une main', () => {
    const { handState, setPlayers, startHand } = useHandEngine()

    setPlayers([
      { id: 'p1', name: 'P1', stack: 100, position: 'UTG' },
      { id: 'p2', name: 'P2', stack: 100, position: 'BTN' },
      { id: 'p3', name: 'P3', stack: 100, position: 'SB' },
      { id: 'p4', name: 'P4', stack: 100, position: 'BB' },
    ])

    startHand()

    expect(handState.status).toBe('playing')
    expect(handState.street).toBe('preflop')

    // blinds
    expect(handState.pot).toBe(3)
    expect(handState.currentBet).toBe(2)

    expect(handState.contributions['p3']).toBe(1) // SB
    expect(handState.contributions['p4']).toBe(2) // BB

    // joueurs en jeu
    expect(handState.playersInHand.length).toBe(4)

    // ordre → UTG first
    expect(handState.playersToAct[0].id).toBe('p1')
  })

})

describe('HandEngine - preflop flow', () => {

  it('passe au joueur suivant après fold', () => {
    const { handState, setPlayers, startHand, act, currentPlayer } = useHandEngine()

    setPlayers([
      { id: 'p1', name: 'UTG', stack: 100, position: 'UTG' },
      { id: 'p2', name: 'BTN', stack: 100, position: 'BTN' },
      { id: 'p3', name: 'SB', stack: 100, position: 'SB' },
      { id: 'p4', name: 'BB', stack: 100, position: 'BB' },
    ])

    startHand()

    expect(currentPlayer.value.id).toBe('p1')

    act({ type: 'fold' })

    expect(handState.playersInHand.find(p => p.id === 'p1')).toBeFalsy()
    expect(currentPlayer.value.id).toBe('p2')
  })

  it('call met à jour stack, pot et contributions', () => {
    const { handState, setPlayers, startHand, act } = useHandEngine()

    setPlayers([
      { id: 'p1', name: 'UTG', stack: 100, position: 'UTG' },
      { id: 'p2', name: 'BTN', stack: 100, position: 'BTN' },
      { id: 'p3', name: 'SB', stack: 100, position: 'SB' },
      { id: 'p4', name: 'BB', stack: 100, position: 'BB' },
    ])

    startHand()

    act({ type: 'call' }) // UTG call 2

    expect(handState.contributions['p1']).toBe(2)
    expect(handState.pot).toBe(5) // 3 + 2
  })

  it('raise met à jour currentBet et relance le tour', () => {
    const { handState, setPlayers, startHand, act } = useHandEngine()

    setPlayers([
      { id: 'p1', name: 'UTG', stack: 100, position: 'UTG' },
      { id: 'p2', name: 'BTN', stack: 100, position: 'BTN' },
      { id: 'p3', name: 'SB', stack: 100, position: 'SB' },
      { id: 'p4', name: 'BB', stack: 100, position: 'BB' },
    ])

    startHand()

    act({ type: 'raise', amount: 6 }) // UTG raise

    expect(handState.currentBet).toBe(6)
    expect(handState.contributions['p1']).toBe(6)

    // UTG ne rejoue pas → BTN next
    expect(handState.playersToAct[0].id).toBe('p2')
  })

  it('passe à la street suivante quand tout le monde a joué', () => {
    const { handState, setPlayers, startHand, act } = useHandEngine()

    setPlayers([
      { id: 'p1', name: 'UTG', stack: 100, position: 'UTG' },
      { id: 'p2', name: 'BTN', stack: 100, position: 'BTN' },
      { id: 'p3', name: 'SB', stack: 100, position: 'SB' },
      { id: 'p4', name: 'BB', stack: 100, position: 'BB' },
    ])

    startHand()

    // tout le monde call/check
    act({ type: 'call' })
    act({ type: 'call' })
    act({ type: 'call' })
    act({ type: 'check' })

    expect(handState.street).toBe('flop')
  })

})