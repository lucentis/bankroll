<script setup lang="ts">
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/utils/format'
import type { Hand, HandTag, StreetActions } from '@/types/hand'

defineProps<{
  hand: Hand | null
  open: boolean
}>()

defineEmits<{
  'update:open': [value: boolean]
}>()

// ---------------------------------------------------------------------------
// Card rendering
// ---------------------------------------------------------------------------

const suitSymbol: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }
const suitColor: Record<string, string> = {
  s: 'text-stone-800',
  h: 'text-red-500',
  d: 'text-red-500',
  c: 'text-stone-800',
}

const renderCard = (card: string) => ({
  rank: card.slice(0, -1),
  suit: suitSymbol[card.slice(-1)] ?? card.slice(-1),
  color: suitColor[card.slice(-1)] ?? '',
})

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

const tagLabels: Record<HandTag, string> = {
  'bluff': 'Bluff',
  'hero-call': 'Hero call',
  'bad-beat': 'Bad beat',
  'cooler': 'Cooler',
  'value': 'Value',
  '3bet-pot': '3bet pot',
  'multiway': 'Multiway',
  'squeeze': 'Squeeze',
}

const tagColors: Record<HandTag, string> = {
  'bluff': 'bg-violet-50 text-violet-700 border-violet-200',
  'hero-call': 'bg-sky-50 text-sky-700 border-sky-200',
  'bad-beat': 'bg-red-50 text-red-700 border-red-200',
  'cooler': 'bg-orange-50 text-orange-700 border-orange-200',
  'value': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '3bet-pot': 'bg-amber-50 text-amber-700 border-amber-200',
  'multiway': 'bg-stone-50 text-stone-600 border-stone-200',
  'squeeze': 'bg-pink-50 text-pink-700 border-pink-200',
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

const actionLabels: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  '3bet': '3-Bet',
  '4bet': '4-Bet',
  allin: 'All-in',
}

const actionColors: Record<string, string> = {
  fold: 'text-stone-400',
  check: 'text-stone-500',
  call: 'text-sky-600',
  bet: 'text-amber-600',
  raise: 'text-amber-700',
  '3bet': 'text-orange-600',
  '4bet': 'text-red-500',
  allin: 'text-red-600 font-bold',
}

const streetLabel: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
}

const playerName = (hand: Hand, playerId: string): string =>
  hand.players.find(p => p.id === playerId)?.name ?? playerId

const isHero = (playerId: string) => playerId === 'hero'

const boardCards = (street: StreetActions) => street.cards ?? []
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-3xl max-h-[85vh] overflow-y-auto">
      <template v-if="hand">
        <DialogHeader>
          <DialogTitle class="mb-4">Votre main</DialogTitle>
          <DialogDescription class="sr-only">Détail de la main</DialogDescription>
          <!-- Hole cards + position + result -->
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span
                  v-for="card in hand.holeCards"
                  :key="card"
                  class="inline-flex items-center font-mono font-bold text-xl leading-none px-2 py-1.5 rounded-lg border-2 bg-white shadow-sm"
                  :class="renderCard(card).color"
                >
                  {{ renderCard(card).rank }}<span class="text-base">{{ renderCard(card).suit }}</span>
                </span>
                <Badge variant="outline" class="text-xs font-mono border-stone-200 text-stone-500">
                  {{ hand.position }}
                </Badge>
              </div>
              <div v-if="hand.tags?.length" class="flex items-center gap-1.5 flex-wrap">
                <Badge
                  v-for="tag in hand.tags"
                  :key="tag"
                  variant="outline"
                  class="text-xs px-1.5 py-0 font-medium"
                  :class="tagColors[tag as HandTag]"
                >
                  {{ tagLabels[tag as HandTag] }}
                </Badge>
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="flex items-center gap-1 justify-end">
                <TrendingUp v-if="hand.result >= 0" class="w-4 h-4 text-emerald-500" />
                <TrendingDown v-else class="w-4 h-4 text-red-400" />
                <span
                  class="text-2xl font-bold font-mono"
                  :class="hand.result >= 0 ? 'text-emerald-600' : 'text-red-500'"
                >
                  {{ formatCurrency(hand.result, true) }}
                </span>
              </div>
              <p class="text-xs text-stone-400 font-mono">Pot {{ formatCurrency(hand.potSize) }}</p>
            </div>
          </div>
        </DialogHeader>

        <!-- Players -->
        <div class="mt-4">
          <p class="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Joueurs</p>
          <div class="space-y-1.5">
            <div
              v-for="player in hand.players"
              :key="player.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="isHero(player.id)
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-stone-100 text-stone-500 border border-stone-200'"
                >
                  {{ player.id }}
                </span>
                <span class="text-sm text-stone-600">{{ player.name }}</span>
                <span v-if="player.position" class="text-xs font-mono text-stone-400 border border-stone-200 rounded px-1.5 py-0.5">
                  {{ player.position }}
                </span>
              </div>
              <span class="text-sm font-mono font-semibold text-stone-700">
                {{ formatCurrency(player.stack) }}
              </span>
            </div>
          </div>
        </div>

        <Separator class="my-1" />

        <!-- Streets -->
        <div class="space-y-4">
          <p class="text-xs font-medium text-stone-400 uppercase tracking-widest">Action</p>
          <div
            v-for="(street, idx) in hand.streets"
            :key="street.street"
          >
            <Separator v-if="idx > 0" class="bg-stone-100 mb-4" />

            <!-- Street header -->
            <div class="flex items-center gap-3 mb-2">
              <span class="text-xs font-semibold uppercase tracking-widest text-stone-400 w-14 shrink-0">
                {{ streetLabel[street.street] }}
              </span>
              <div v-if="boardCards(street).length" class="flex items-center gap-1">
                <span
                  v-for="card in boardCards(street)"
                  :key="card"
                  class="inline-flex items-center font-mono font-bold text-sm leading-none px-1.5 py-1 rounded border bg-white shadow-sm"
                  :class="renderCard(card).color"
                >
                  {{ renderCard(card).rank }}<span class="text-xs">{{ renderCard(card).suit }}</span>
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-1.5 pl-1">
              <div
                v-for="(action, aIdx) in street.actions"
                :key="aIdx"
                class="flex items-center gap-2"
                :class="isHero(action.playerId) ? 'opacity-100' : 'opacity-70'"
              >
                <span
                  class="text-xs font-medium w-20 shrink-0 truncate"
                  :class="isHero(action.playerId) ? 'text-primary' : 'text-stone-500'"
                >
                  {{ playerName(hand, action.playerId) }}
                </span>
                <span class="text-sm font-medium" :class="actionColors[action.type]">
                  {{ actionLabels[action.type] }}
                </span>
                <span v-if="action.amount" class="text-sm font-mono text-stone-700">
                  {{ formatCurrency(action.amount) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <template v-if="hand.notes">
          <Separator class="my-1" />
          <div>
            <p class="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Notes</p>
            <p class="text-sm text-stone-600 leading-relaxed">{{ hand.notes }}</p>
          </div>
        </template>

      </template>
    </DialogContent>
  </Dialog>
</template>