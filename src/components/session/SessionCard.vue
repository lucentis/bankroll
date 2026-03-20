<script setup lang="ts">
import { Clock, MapPin, Users, TrendingUp, TrendingDown } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDuration, sessionProfit } from '@/utils/format'
import type { Session } from '@/types/session'

const props = defineProps<{ session: Session }>()

const profit = sessionProfit(props.session)

const typeLabel: Record<string, string> = {
  CASH_GAME: 'Cash Game',
  MTT: 'MTT',
  SNG: 'SNG',
  SPIN: 'Spin & Go',
}

const typeBadgeClass: Record<string, string> = {
  CASH_GAME: 'bg-sky-50 text-sky-700 border-sky-200',
  MTT:       'bg-violet-50 text-violet-700 border-violet-200',
  SNG:       'bg-amber-50 text-amber-700 border-amber-200',
  SPIN:      'bg-rose-50 text-rose-700 border-rose-200',
}
</script>

<template>
  <Card class="border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-150 cursor-pointer">
    <CardContent>
      <div class="flex items-start justify-between gap-4">

        <!-- Left — type + meta -->
        <div class="flex items-start gap-3 min-w-0">

          <!-- Profit indicator bar -->
          <div
            class="w-1 self-stretch rounded-full shrink-0 mt-0.5"
            :class="profit >= 0 ? 'bg-emerald-400' : 'bg-red-400'"
          />

          <div class="min-w-0">
            <!-- Type + venue badges -->
            <div class="flex items-center gap-1.5 flex-wrap mb-1.5">
              <Badge
                variant="outline"
                class="text-xs font-medium px-2 py-0"
                :class="typeBadgeClass[session.type]"
              >
                {{ typeLabel[session.type] }}
              </Badge>
              <Badge variant="outline" class="text-xs font-medium px-2 py-0 border-stone-200 text-stone-500">
                {{ session.venue === 'LIVE' ? 'Live' : 'Online' }}
              </Badge>
              <span v-if="session.stakes" class="text-xs text-stone-400 font-mono">
                {{ session.stakes }}
              </span>
            </div>

            <!-- Location + date -->
            <div class="flex items-center gap-3 flex-wrap">
              <span class="flex items-center gap-1 text-xs text-stone-500">
                <MapPin class="w-3 h-3 shrink-0" />
                {{ session.location }}
              </span>
              <span class="text-xs text-stone-400">
                {{ session.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
              </span>
            </div>

            <!-- Secondary stats -->
            <div class="flex items-center gap-4 mt-2 flex-wrap">
              <span class="flex items-center gap-1 text-xs text-stone-400">
                <Clock class="w-3 h-3 shrink-0" />
                {{ formatDuration(session.duration) }}
              </span>
              <span v-if="session.players" class="flex items-center gap-1 text-xs text-stone-400">
                <Users class="w-3 h-3 shrink-0" />
                {{ session.players }} joueurs
              </span>
              <span v-if="session.position" class="text-xs text-stone-400">
                {{ session.position }}e position
              </span>
              <span class="text-xs text-stone-400">
                Buy-in : <span class="font-mono text-stone-600">{{ formatCurrency(session.totalBuyIn) }}</span>
              </span>
            </div>

            <!-- Notes -->
            <p v-if="session.notes" class="mt-2 text-xs text-stone-400 italic truncate max-w-sm">
              {{ session.notes }}
            </p>
          </div>
        </div>

        <!-- Right — profit -->
        <div class="text-right shrink-0">
          <div class="flex items-center justify-end gap-1 mb-0.5">
            <TrendingUp v-if="profit >= 0" class="w-3.5 h-3.5 text-emerald-500" />
            <TrendingDown v-else class="w-3.5 h-3.5 text-red-400" />
            <span
              class="text-lg font-bold font-mono"
              :class="profit >= 0 ? 'text-emerald-600' : 'text-red-500'"
            >
              {{ formatCurrency(profit, true) }}
            </span>
          </div>
          <span class="text-xs text-stone-400 font-mono">
            → {{ formatCurrency(session.cashOut) }}
          </span>
        </div>

      </div>
    </CardContent>
  </Card>
</template>