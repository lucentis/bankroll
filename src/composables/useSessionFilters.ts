import { ref, computed } from 'vue'
import { bankrollStore } from '@/store/bankroll'
import { sessionProfit } from '@/utils/format'
import type { ComputedRef } from 'vue'
import type { Session, SessionType, SortDir, SortKey, Venue } from '@/types/session'

export const ALL_TYPES: SessionType[] = ['CASH_GAME', 'MTT', 'SNG', 'SPIN']
export const ALL_VENUES: Venue[] = ['LIVE', 'ONLINE']

// Sort state stays local — not needed in the store
const sortKey = ref<SortKey>('date')
const sortDir = ref<SortDir>('desc')

export function useSessionFilters(sortedSessions: ComputedRef<Session[]>) {
  const toggleType = (type: SessionType) => {
    console.log(bankrollStore.sessionFilters.types);
    
    const types = bankrollStore.sessionFilters.types
    const idx = types.indexOf(type)
    if (idx === -1) types.push(type)
    else types.splice(idx, 1)
    
    console.log(bankrollStore.sessionFilters.types);
  }

  const toggleVenue = (venue: Venue) => {
    const venues = bankrollStore.sessionFilters.venues
    const idx = venues.indexOf(venue)
    if (idx === -1) venues.push(venue)
    else venues.splice(idx, 1)
  }

  const setSort = (key: SortKey) => {
    if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    else { sortKey.value = key; sortDir.value = 'desc' }
  }

  const filteredSessions = computed<Session[]>(() => {
    const activeTypes = bankrollStore.sessionFilters.types
    const activeVenues = bankrollStore.sessionFilters.venues

    const filtered = sortedSessions.value.filter(s =>
      // empty array = no filter applied (show all)
      (activeTypes.length === 0 || activeTypes.includes(s.type)) &&
      (activeVenues.length === 0 || activeVenues.includes(s.venue)),
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

  const isTypeActive = (type: SessionType) =>
    bankrollStore.sessionFilters.types.length === 0 ||
    bankrollStore.sessionFilters.types.includes(type)

  const isVenueActive = (venue: Venue) =>
    bankrollStore.sessionFilters.venues.length === 0 ||
    bankrollStore.sessionFilters.venues.includes(venue)

  const isAllTypes = computed(() => bankrollStore.sessionFilters.types.length === 0)
  const isAllVenues = computed(() => bankrollStore.sessionFilters.venues.length === 0)
  const hasActiveFilters = computed(() => !isAllTypes.value || !isAllVenues.value)

  const resetFilters = () => {
    bankrollStore.sessionFilters.types = []
    bankrollStore.sessionFilters.venues = []
  }

  return {
    sortKey,
    sortDir,
    filteredSessions,
    isTypeActive,
    isVenueActive,
    isAllTypes,
    isAllVenues,
    hasActiveFilters,
    toggleType,
    toggleVenue,
    setSort,
    resetFilters,
    ALL_TYPES,
    ALL_VENUES,
  }
}