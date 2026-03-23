<script setup lang="ts">
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/format'
import type { Hand, HandTag } from '@/types/hand'

defineProps<{ hand: Hand }>()

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

// Render a card string as a displayable string with suit symbol
const suitSymbol: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }
const suitColor: Record<string, string> = { s: 'text-stone-800', h: 'text-red-500', d: 'text-red-500', c: 'text-stone-800' }

const renderCard = (card: string) => {
  const rank = card.slice(0, -1)
  const suit = card.slice(-1)
  return { rank, suit: suitSymbol[suit] ?? suit, color: suitColor[suit] ?? '' }
}

const flop = (hand: Hand) => {
  const flopStreet = hand.streets.find(s => s.street === 'flop')
  return flopStreet?.cards ?? null
}

const streetsPlayed = (hand: Hand) =>
  hand.streets.map(s => s.street.charAt(0).toUpperCase() + s.street.slice(1)).join(' → ')
</script>

<template>
  <Card class="border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-150 cursor-pointer py-2">
    <CardContent class="py-3">
      <div class="flex items-start justify-between gap-4">

        <div class="flex items-start gap-3 min-w-0">
          <!-- Result bar -->
          <div
            class="w-1 self-stretch rounded-full shrink-0 mt-0.5"
            :class="hand.result >= 0 ? 'bg-emerald-400' : 'bg-red-400'"
          />

          <div class="min-w-0 space-y-1.5">

            <!-- Hole cards + position -->
            <div class="flex items-center gap-3 flex-wrap">
              <div class="flex items-center gap-1">
                <span
                  v-for="card in hand.holeCards"
                  :key="card"
                  class="inline-flex items-center font-mono font-bold text-sm leading-none px-1.5 py-1 rounded border bg-white shadow-sm"
                  :class="suitColor[card.slice(-1)]"
                >
                  {{ renderCard(card).rank }}<span class="text-xs">{{ renderCard(card).suit }}</span>
                </span>
              </div>
              <Badge variant="outline" class="text-xs font-mono border-stone-200 text-stone-500 px-1.5 py-0">
                {{ hand.position }}
              </Badge>
              <span class="text-xs text-stone-400">{{ streetsPlayed(hand) }}</span>
            </div>

            <!-- Flop cards if exists -->
            <div v-if="flop(hand)" class="flex items-center gap-1">
              <span class="text-xs text-stone-400 mr-1">Flop</span>
              <span
                v-for="card in flop(hand)"
                :key="card"
                class="inline-flex items-center font-mono text-xs leading-none px-1 py-0.5 rounded border bg-white shadow-sm"
                :class="suitColor[card.slice(-1)]"
              >
                {{ renderCard(card).rank }}<span class="text-[10px]">{{ renderCard(card).suit }}</span>
              </span>
            </div>

            <!-- Tags -->
            <div v-if="hand.tags?.length" class="flex items-center gap-1.5 flex-wrap">
              <Badge
                v-for="tag in hand.tags"
                :key="tag"
                variant="outline"
                class="text-xs px-1.5 py-0 font-medium"
                :class="tagColors[tag]"
              >
                {{ tagLabels[tag] }}
              </Badge>
            </div>

            <!-- Notes preview -->
            <p v-if="hand.notes" class="text-xs text-stone-400 italic truncate max-w-sm">
              {{ hand.notes }}
            </p>

          </div>
        </div>

        <!-- Result -->
        <div class="text-right shrink-0">
          <div class="flex items-center justify-end gap-1 mb-0.5">
            <TrendingUp v-if="hand.result >= 0" class="w-3.5 h-3.5 text-emerald-500" />
            <TrendingDown v-else class="w-3.5 h-3.5 text-red-400" />
            <span
              class="text-base font-bold font-mono"
              :class="hand.result >= 0 ? 'text-emerald-600' : 'text-red-500'"
            >
              {{ formatCurrency(hand.result, true) }}
            </span>
          </div>
          <span class="text-xs text-stone-400 font-mono">
            Pot {{ formatCurrency(hand.potSize) }}
          </span>
        </div>

      </div>
    </CardContent>
  </Card>
</template>