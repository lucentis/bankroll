import { ref, computed } from 'vue'
import { sessionProfit } from '@/utils/format'
import type { ComputedRef } from 'vue'
import type { Session, SessionType, Venue } from '@/types/session'

export type SortKey = 'date' | 'profit' | 'duration' | 'buyIn'
export type SortDir = 'asc' | 'desc'

export interface SessionFilters {
  types: SessionType[]
  venues: Venue[]
}

const ALL_TYPES: SessionType[] = ['CASH_GAME', 'MTT', 'SNG', 'SPIN']
const ALL_VENUES: Venue[] = ['LIVE', 'ONLINE']

export function useSessionFilters(sortedSessions: ComputedRef<Session[]>) {
  const filters = ref<SessionFilters>({ types: ['CASH_GAME', 'MTT'], venues: [...ALL_VENUES] })
  const sortKey = ref<SortKey>('date')
  const sortDir = ref<SortDir>('desc')

  const toggleType = (type: SessionType) => {
    const idx = filters.value.types.indexOf(type)
    if (idx === -1) filters.value.types.push(type)
    else filters.value.types.splice(idx, 1)
  }

  const toggleVenue = (venue: Venue) => {
    const idx = filters.value.venues.indexOf(venue)
    if (idx === -1) filters.value.venues.push(venue)
    else filters.value.venues.splice(idx, 1)
  }

  const setSort = (key: SortKey) => {
    if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    else { sortKey.value = key; sortDir.value = 'desc' }
  }

  const filteredSessions = computed<Session[]>(() => {
    const filtered = sortedSessions.value.filter(s =>
      filters.value.types.includes(s.type) &&
      filters.value.venues.includes(s.venue),
    )

    return [...filtered].sort((a, b) => {
      let diff = 0
      switch (sortKey.value) {
        case 'date':     diff = a.date.getTime() - b.date.getTime(); break
        case 'profit':   diff = sessionProfit(a) - sessionProfit(b); break
        case 'duration': diff = a.duration - b.duration; break
        case 'buyIn':    diff = a.totalBuyIn - b.totalBuyIn; break
      }
      return sortDir.value === 'asc' ? diff : -diff
    })
  })

  const isAllTypes = computed(() => filters.value.types.length === ALL_TYPES.length)
  const isAllVenues = computed(() => filters.value.venues.length === ALL_VENUES.length)

  const resetFilters = () => {
    filters.value = { types: ['CASH_GAME', 'MTT'], venues: [...ALL_VENUES] }
  }

  return {
    filters,
    sortKey,
    sortDir,
    filteredSessions,
    isAllTypes,
    isAllVenues,
    toggleType,
    toggleVenue,
    setSort,
    resetFilters,
    ALL_TYPES,
    ALL_VENUES,
  }
}