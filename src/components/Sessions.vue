<script setup lang="ts">
import { ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import SessionCard from '@/components/SessionCard.vue'
import { useSessions } from '@/composables/useSessions'
import { useSessionFilters } from '@/composables/useSessionFilters'
import { formatCurrency, sessionProfit } from '@/utils/format'
import type { SortKey } from '@/composables/useSessionFilters'

const { sortedSessions } = useSessions()
const {
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
} = useSessionFilters(sortedSessions)

const typeLabel: Record<string, string> = {
  CASH_GAME: 'Cash Game',
  MTT: 'MTT',
  SNG: 'SNG',
  SPIN: 'Spin & Go',
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'date',     label: 'Date' },
  { key: 'profit',   label: 'Profit' },
  { key: 'duration', label: 'Durée' },
  { key: 'buyIn',    label: 'Buy-in' },
]

const totalProfit = computed(() =>
  filteredSessions.value.reduce((s, x) => s + sessionProfit(x), 0),
)

const hasActiveFilters = computed(() => !isAllTypes.value || !isAllVenues.value)

import { computed } from 'vue'
</script>

<template>
  <div class="p-6 space-y-5">

    <!-- Header -->
    <div class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-stone-900">Sessions</h1>
        <p class="text-sm text-stone-400 mt-0.5">
          {{ filteredSessions.length }} session{{ filteredSessions.length > 1 ? 's' : '' }}
          <template v-if="filteredSessions.length > 0">
            · Profit :
            <span
              class="font-mono font-semibold"
              :class="totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'"
            >
              {{ formatCurrency(totalProfit, true) }}
            </span>
          </template>
        </p>
      </div>
    </div>

    <!-- Filters + sort bar -->
    <div class="flex flex-wrap items-center gap-3">

      <!-- Filter icon -->
      <span class="flex items-center gap-1.5 text-xs text-stone-400">
        <SlidersHorizontal class="w-3.5 h-3.5" />
        Filtres
      </span>

      <Separator orientation="vertical" class="h-4" />

      <!-- Type filters -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="type in ALL_TYPES"
          :key="type"
          class="text-xs px-2.5 py-1 rounded-full border transition-colors duration-100 font-medium"
          :class="filters.types.includes(type)
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
          @click="toggleType(type)"
        >
          {{ typeLabel[type] }}
        </button>
      </div>

      <Separator orientation="vertical" class="h-4" />

      <!-- Venue filters -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="venue in ALL_VENUES"
          :key="venue"
          class="text-xs px-2.5 py-1 rounded-full border transition-colors duration-100 font-medium"
          :class="filters.venues.includes(venue)
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
          @click="toggleVenue(venue)"
        >
          {{ venue === 'LIVE' ? 'Live' : 'Online' }}
        </button>
      </div>

      <!-- Reset filters -->
      <button
        v-if="hasActiveFilters"
        class="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
        @click="resetFilters"
      >
        <X class="w-3 h-3" />
        Réinitialiser
      </button>

      <div class="grow" />

      <!-- Sort -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-stone-400">Trier par</span>
        <div class="flex items-center gap-1">
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors duration-100 font-medium"
            :class="sortKey === opt.key
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
            @click="setSort(opt.key)"
          >
            {{ opt.label }}
            <ArrowUp v-if="sortKey === opt.key && sortDir === 'asc'" class="w-3 h-3" />
            <ArrowDown v-else-if="sortKey === opt.key && sortDir === 'desc'" class="w-3 h-3" />
            <ArrowUpDown v-else class="w-3 h-3 opacity-30" />
          </button>
        </div>
      </div>

    </div>

    <!-- Session list -->
    <div v-if="filteredSessions.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SessionCard
        v-for="session in filteredSessions"
        :key="session.id"
        :session="session"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <p class="text-stone-400 text-sm">Aucune session ne correspond aux filtres sélectionnés.</p>
      <Button variant="ghost" size="sm" class="mt-3 text-stone-500" @click="resetFilters">
        Réinitialiser les filtres
      </Button>
    </div>

  </div>
</template>