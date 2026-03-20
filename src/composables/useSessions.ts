import { computed } from 'vue'
import { bankrollStore } from '@/store/bankroll'
import { useStorage } from '@/composables/useLocalStorage'
import type { Session } from '@/types/session'

const { set } = useStorage()

const persist = () => set<Session[]>('sessions', bankrollStore.sessions)

export function useSessions() {
  const sortedSessions = computed<Session[]>(() =>
    [...bankrollStore.sessions].sort((a, b) => a.date.getTime() - b.date.getTime()),
  )

  const addSession = (session: Session): void => {
    bankrollStore.sessions.push(session)
    persist()
  }

  const updateSession = (updated: Session): void => {
    const idx = bankrollStore.sessions.findIndex(s => s.id === updated.id)
    if (idx !== -1) {
      bankrollStore.sessions[idx] = updated
      persist()
    }
  }

  const deleteSession = (id: string): void => {
    const idx = bankrollStore.sessions.findIndex(s => s.id === id)
    if (idx !== -1) {
      bankrollStore.sessions.splice(idx, 1)
      persist()
    }
  }

  return { sortedSessions, addSession, updateSession, deleteSession }
}