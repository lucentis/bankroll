import { reactive } from 'vue'
import { ALL_TYPES, ALL_VENUES } from '@/composables/useSessionFilters'
import { mockSessions } from '@/data/mockData'
import { useStorage } from '@/composables/useLocalStorage'
import type { SessionType, Venue, Session } from '@/types/session'

const { get } = useStorage()

// Dates are serialized as strings in JSON — restore them as Date objects
const reviveDates = (sessions: Session[]): Session[] =>
  sessions.map(s => ({ ...s, date: new Date(s.date) }))

const storedSessions = get<Session[]>('sessions')

export const bankrollStore = reactive({
  activePage: 'dashboard',
  activeSessionId: null as string | null,
  sessions: storedSessions ? reviveDates(storedSessions) : [...mockSessions],
  sessionFilters: {
    types: [...ALL_TYPES] as SessionType[],
    venues: [...ALL_VENUES] as Venue[],
  },
})