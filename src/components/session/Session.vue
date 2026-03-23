<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowLeft, MapPin, Clock, Calendar, Users, Trophy,
  TrendingUp, TrendingDown, Pencil, Trash2,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { bankrollStore } from '@/store/bankroll'
import { useSessions } from '@/composables/useSessions'
import { formatCurrency, formatDuration, sessionProfit } from '@/utils/format'

const { sortedSessions } = useSessions()

const session = computed(() =>
  sortedSessions.value.find(s => s.id === bankrollStore.activeSessionId) ?? null,
)

const profit = computed(() => session.value ? sessionProfit(session.value) : 0)

const typeLabel: Record<string, string> = {
  CASH_GAME: 'Cash Game',
  MTT: 'MTT',
  SNG: 'SNG',
  SPIN: 'Spin & Go',
}

const goBack = () => {
  bankrollStore.activePage = 'sessions'
  bankrollStore.activeSessionId = null
}
</script>

<template>
  <div v-if="session" class="p-6 max-w-2xl space-y-5">

    <!-- Back -->
    <button
      class="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
      @click="goBack"
    >
      <ArrowLeft class="w-4 h-4" />
      Sessions
    </button>

    <!-- Hero header -->
    <div
      class="rounded-xl p-6 border"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" class="text-xs font-medium border-primary/30 bg-primary/5 text-primary">
              {{ typeLabel[session.type] }}
            </Badge>
            <Badge variant="outline" class="text-xs font-medium border-stone-200 bg-white text-stone-500">
              {{ session.venue === 'LIVE' ? 'Live' : 'Online' }}
            </Badge>
            <span v-if="session.stakes" class="text-xs text-stone-400 font-mono bg-white px-2 py-0.5 rounded-full border border-stone-200">
              {{ session.stakes }}
            </span>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-stone-900 capitalize">
            {{ session.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
          </h1>
          <div class="flex items-center gap-1.5 mt-1 text-sm text-stone-500">
            <MapPin class="w-3.5 h-3.5 shrink-0" />
            {{ session.location }}
          </div>
        </div>

        <!-- Profit big number -->
        <div class="text-right shrink-0">
          <p class="text-xs uppercase tracking-widest mb-1"
            :class="profit >= 0 ? 'text-emerald-600' : 'text-red-400'"
          >
            Résultat
          </p>
          <div class="flex items-center gap-1 justify-end">
            <TrendingUp v-if="profit >= 0" class="w-5 h-5 text-emerald-500" />
            <TrendingDown v-else class="w-5 h-5 text-red-400" />
            <span
              class="text-3xl font-bold font-mono tracking-tight"
              :class="profit >= 0 ? 'text-emerald-600' : 'text-red-500'"
            >
              {{ formatCurrency(profit, true) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Financial summary -->
    <div class="grid grid-cols-2 gap-3">
      <Card class="border-stone-200 shadow-sm">
        <CardContent>
          <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Buy-in</p>
          <p class="text-2xl font-bold font-mono text-stone-800">{{ formatCurrency(session.totalBuyIn) }}</p>
        </CardContent>
      </Card>
      <Card class="border-stone-200 shadow-sm">
        <CardContent>
          <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Cash out</p>
          <p class="text-2xl font-bold font-mono text-stone-800">{{ formatCurrency(session.cashOut) }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Details -->
    <Card class="border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-sm font-medium text-stone-500">Détails</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">

        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2 text-sm text-stone-500">
            <Clock class="w-3.5 h-3.5 text-primary/60" />
            Durée
          </span>
          <span class="text-sm font-semibold font-mono text-stone-700">{{ formatDuration(session.duration) }}</span>
        </div>

        <Separator class="bg-stone-100" />

        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2 text-sm text-stone-500">
            <Calendar class="w-3.5 h-3.5 text-primary/60" />
            Date
          </span>
          <span class="text-sm font-semibold text-stone-700">
            {{ session.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
          </span>
        </div>

        <template v-if="session.type !== 'CASH_GAME'">
          <template v-if="session.players">
            <Separator class="bg-stone-100" />
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-sm text-stone-500">
                <Users class="w-3.5 h-3.5 text-primary/60" />
                Joueurs
              </span>
              <span class="text-sm font-semibold font-mono text-stone-700">{{ session.players }}</span>
            </div>
          </template>
          <template v-if="session.position">
            <Separator class="bg-stone-100" />
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-sm text-stone-500">
                <Trophy class="w-3.5 h-3.5 text-primary/60" />
                Position
              </span>
              <span class="text-sm font-semibold font-mono text-stone-700">
                {{ session.position }}e / {{ session.players }}
              </span>
            </div>
          </template>
        </template>

        <template v-if="session.type === 'CASH_GAME' && session.duration > 0">
          <Separator class="bg-stone-100" />
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2 text-sm text-stone-500">
              <TrendingUp class="w-3.5 h-3.5 text-primary/60" />
              Winrate
            </span>
            <span
              class="text-sm font-semibold font-mono"
              :class="profit >= 0 ? 'text-emerald-600' : 'text-red-500'"
            >
              {{ formatCurrency(profit / (session.duration / 60), true) }}/h
            </span>
          </div>
        </template>

      </CardContent>
    </Card>

    <!-- Notes -->
    <Card v-if="session.notes" class="border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-sm font-medium text-stone-500">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-stone-600 leading-relaxed">{{ session.notes }}</p>
      </CardContent>
    </Card>

    <!-- Actions -->
    <div class="flex items-center gap-3 pt-2">
      <Button variant="outline" class="flex-1 gap-2" @click="bankrollStore.activePage = 'session-edit'">
        <Pencil class="w-4 h-4" />
        Modifier la session
      </Button>
      <Button variant="outline" class="gap-2 text-red-500 hover:text-red-600 hover:border-red-200 hover:bg-red-100">
        <Trash2 class="w-4 h-4" />
        Supprimer
      </Button>
    </div>

  </div>

  <!-- Fallback -->
  <div v-else class="flex items-center justify-center h-full text-stone-400 text-sm">
    Session introuvable.
  </div>
</template>