import { computed } from 'vue'
import { mockSessions } from '@/data/mockData'
import type { Session } from '@/types/session'

export function useSessions() {
  // Will be replaced by localStorage read when storage layer is implemented
  const sortedSessions = computed<Session[]>(() =>
    [...mockSessions].sort((a, b) => a.date.getTime() - b.date.getTime()),
  )

  return { sortedSessions }
}