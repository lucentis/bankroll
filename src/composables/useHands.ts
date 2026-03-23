import { computed } from 'vue'
import { bankrollStore } from '@/store/bankroll'
import { useStorage } from '@/composables/useLocalStorage'
import type { Hand } from '@/types/hand'

const { set } = useStorage()

const persist = () => set<Hand[]>('hands', bankrollStore.hands)

export function useHands(sessionId?: string) {
  const allHands = computed<Hand[]>(() => bankrollStore.hands)

  const sessionHands = computed<Hand[]>(() => {
    if (!sessionId) return allHands.value
    return allHands.value.filter(h => h.sessionId === sessionId)
  })

  const addHand = (hand: Hand): void => {
    bankrollStore.hands.push(hand)
    persist()
  }

  const updateHand = (updated: Hand): void => {
    const idx = bankrollStore.hands.findIndex(h => h.id === updated.id)
    if (idx !== -1) {
      bankrollStore.hands[idx] = updated
      persist()
    }
  }

  const deleteHand = (id: string): void => {
    const idx = bankrollStore.hands.findIndex(h => h.id === id)
    if (idx !== -1) {
      bankrollStore.hands.splice(idx, 1)
      persist()
    }
  }

  const deleteHandsBySession = (sessionId: string): void => {
    bankrollStore.hands = bankrollStore.hands.filter(h => h.sessionId !== sessionId)
    persist()
  }

  return { allHands, sessionHands, addHand, updateHand, deleteHand, deleteHandsBySession }
}