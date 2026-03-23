<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next'
import { Card as UiCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import CardPicker from '@/components/hand/CardPicker.vue'
import { bankrollStore } from '@/store/bankroll'
import { useHands } from '@/composables/useHands'
import { formatCurrency } from '@/utils/format'
import type { Card, Position, Action, HandTag, Player, PlayerAction, StreetActions, Street } from '@/types/hand'

const { addHand } = useHands()

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const holeCards = ref<Card[]>([])
const position = ref<Position>('BTN')

const POSITIONS: Position[] = ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']

const players = ref<Player[]>([
  { id: 'hero', name: 'Hero', stack: 0, position: 'BTN' },
  { id: 'villain_1', name: 'Villain 1', stack: 0, position: 'BB' },
])

const addVillain = () => {
  const n = players.value.filter(p => p.id !== 'hero').length + 1
  players.value.push({ id: `villain_${n}`, name: `Villain ${n}`, stack: 0, position: undefined })
}

const removeVillain = (id: string) => {
  players.value = players.value.filter(p => p.id !== id)
  // Remove actions referencing this player
  for (const street of streets.value) {
    street.actions = street.actions.filter(a => a.playerId !== id)
  }
}

// ---------------------------------------------------------------------------
// Streets
// ---------------------------------------------------------------------------

interface StreetForm {
  street: Street
  cards: Card[]
  actions: { playerId: string; action: Action; amount: string }[]
}

const streets = ref<StreetForm[]>([
  { street: 'preflop', cards: [], actions: [] },
  { street: 'flop',    cards: [], actions: [] },
  { street: 'turn',    cards: [], actions: [] },
  { street: 'river',   cards: [], actions: [] },
])

const streetLabel: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
}

const streetMaxCards: Record<Street, number> = {
  preflop: 0,
  flop: 3,
  turn: 1,
  river: 1,
}

// All cards already picked (hole cards + board) to disable in pickers
const usedCards = computed<Card[]>(() => {
  const board = streets.value.flatMap(s => s.cards)
  return [...holeCards.value, ...board]
})

const ACTIONS: Action[] = ['fold', 'check', 'call', 'bet', 'raise', '3bet', '4bet', 'allin']
const actionNeedsAmount: Set<Action> = new Set(['bet', 'raise', '3bet', '4bet', 'allin', 'call'])

const actionLabel: Record<Action, string> = {
  fold: 'Fold', check: 'Check', call: 'Call', bet: 'Bet',
  raise: 'Raise', '3bet': '3-Bet', '4bet': '4-Bet', allin: 'All-in',
}

const addAction = (streetIdx: number) => {
  streets.value[streetIdx].actions.push({
    playerId: players.value[0]?.id ?? 'hero',
    action: 'check',
    amount: '',
  })
}

const removeAction = (streetIdx: number, actionIdx: number) => {
  streets.value[streetIdx].actions.splice(actionIdx, 1)
}

const setAction = (streetIdx: number, actionIdx: number, action: Action) => {
  streets.value[streetIdx].actions[actionIdx].action = action
  if (!actionNeedsAmount.has(action)) {
    streets.value[streetIdx].actions[actionIdx].amount = ''
  }
}

// ---------------------------------------------------------------------------
// Result + tags + notes
// ---------------------------------------------------------------------------

const potSize = ref<string>('')
const result = ref<string>('')

const TAGS: HandTag[] = ['bluff', 'hero-call', 'bad-beat', 'cooler', 'value', '3bet-pot', 'multiway', 'squeeze']
const tagLabels: Record<HandTag, string> = {
  'bluff': 'Bluff', 'hero-call': 'Hero call', 'bad-beat': 'Bad beat',
  'cooler': 'Cooler', 'value': 'Value', '3bet-pot': '3bet pot',
  'multiway': 'Multiway', 'squeeze': 'Squeeze',
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

const selectedTags = ref<HandTag[]>([])
const notes = ref('')

const toggleTag = (tag: HandTag) => {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
}

// ---------------------------------------------------------------------------
// Card rendering (preview)
// ---------------------------------------------------------------------------

const suitSymbol: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }
const suitColor: Record<string, string> = {
  s: 'text-stone-800', h: 'text-red-500', d: 'text-red-500', c: 'text-stone-800',
}
const renderCard = (card: Card) => ({
  rank: card.slice(0, -1),
  suit: suitSymbol[card.slice(-1)] ?? card.slice(-1),
  color: suitColor[card.slice(-1)] ?? '',
})

// ---------------------------------------------------------------------------
// Validation + submit
// ---------------------------------------------------------------------------

const errors = ref<Record<string, string>>({})

const validate = (): boolean => {
  errors.value = {}
  if (holeCards.value.length !== 2) errors.value.holeCards = 'Sélectionnez 2 cartes'
  if (!potSize.value || isNaN(Number(potSize.value))) errors.value.potSize = 'Champ requis'
  if (!result.value || isNaN(Number(result.value))) errors.value.result = 'Champ requis'
  if (players.value.some(p => !p.stack && p.stack !== 0)) errors.value.stacks = 'Stacks requis'
  return Object.keys(errors.value).length === 0
}

const submit = () => {
  if (!validate()) return

  const builtStreets: StreetActions[] = streets.value
    .filter(s => s.actions.length > 0 || s.cards.length > 0)
    .map(s => ({
      street: s.street,
      ...(s.cards.length > 0 ? { cards: s.cards as [Card, Card, Card] | [Card] } : {}),
      actions: s.actions.map(a => ({
        playerId: a.playerId,
        action: a.action,
        ...(a.amount ? { amount: Number(a.amount) } : {}),
      })) as PlayerAction[],
    }))

  addHand({
    id: crypto.randomUUID(),
    sessionId: bankrollStore.activeSessionId!,
    holeCards: holeCards.value as [Card, Card],
    position: position.value,
    potSize: Number(potSize.value),
    result: Number(result.value),
    players: players.value,
    streets: builtStreets,
    tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
    notes: notes.value.trim() || undefined,
  })

  bankrollStore.activePage = 'session'
}

const goBack = () => {
  bankrollStore.activePage = 'session'
}
</script>

<template>
  <div class="p-6 space-y-6 max-w-3xl">

    <button
      class="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
      @click="goBack"
    >
      <ArrowLeft class="w-4 h-4" />
      Session
    </button>

    <h1 class="text-2xl font-bold tracking-tight text-stone-900">Ajouter une main</h1>

    <!-- Setup -->
    <UiCard class="border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-sm font-medium text-stone-500">Hole cards</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">

        <!-- Hole card preview -->
        <div class="flex items-center gap-2">
          <span
            v-for="card in holeCards"
            :key="card"
            class="inline-flex items-center font-mono font-bold text-xl leading-none px-2 py-1.5 rounded-lg border-2 bg-white shadow-sm"
            :class="renderCard(card).color"
          >
            {{ renderCard(card).rank }}<span class="text-base">{{ renderCard(card).suit }}</span>
          </span>
          <span v-if="holeCards.length === 0" class="text-sm text-stone-300">Aucune carte sélectionnée</span>
        </div>
        <p v-if="errors.holeCards" class="text-xs text-red-500">{{ errors.holeCards }}</p>

        <CardPicker
          v-model="holeCards"
          :max="2"
          :disabled="usedCards.filter(c => !holeCards.includes(c))"
        />

        <Separator class="bg-stone-100" />

        <!-- Hero position -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-stone-500">Position du héro</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="pos in POSITIONS"
              :key="pos"
              type="button"
              class="text-xs px-3 py-1.5 rounded-full border font-mono font-medium transition-colors duration-100"
              :class="position === pos
                ? 'bg-primary/70 text-primary-foreground border-primary/10'
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
              @click="position = pos; players[0].position = pos"
            >
              {{ pos }}
            </button>
          </div>
        </div>

      </CardContent>
    </UiCard>

    <!-- Players -->
    <UiCard class="border-stone-200 shadow-sm">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-sm font-medium text-stone-500">Joueurs</CardTitle>
          <Button variant="outline" size="sm" class="gap-1.5 text-xs" @click="addVillain">
            <Plus class="w-3.5 h-3.5" />
            Ajouter un villain
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <p v-if="errors.stacks" class="text-xs text-red-500">{{ errors.stacks }}</p>
        <div
          v-for="(player, idx) in players"
          :key="player.id"
          class="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center"
        >
          <!-- Name -->
          <input
            v-model="player.name"
            type="text"
            class="text-sm border border-stone-200 rounded-md px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            :placeholder="player.id === 'hero' ? 'Hero' : 'Villain'"
          />
          <!-- Stack -->
          <div class="relative">
            <input
              v-model.number="player.stack"
              type="number"
              min="0"
              placeholder="100"
              class="w-full text-sm border border-stone-200 rounded-md px-3 py-1.5 font-mono text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">€</span>
          </div>
          <!-- Position -->
          <select
            v-model="player.position"
            class="text-xs border border-stone-200 rounded-md px-2 py-1.5 font-mono text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">—</option>
            <option v-for="pos in POSITIONS" :key="pos" :value="pos">{{ pos }}</option>
          </select>
          <!-- Remove (villains only) -->
          <button
            v-if="player.id !== 'hero'"
            type="button"
            class="text-stone-300 hover:text-red-400 transition-colors"
            @click="removeVillain(player.id)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
          <div v-else class="w-4" />
        </div>
      </CardContent>
    </UiCard>

    <!-- Streets -->
    <UiCard
      v-for="(street, sIdx) in streets"
      :key="street.street"
      class="border-stone-200 shadow-sm"
    >
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-sm font-medium text-stone-500">{{ streetLabel[street.street] }}</CardTitle>
          <!-- Board card preview -->
          <div v-if="street.cards.length > 0" class="flex items-center gap-1">
            <span
              v-for="card in street.cards"
              :key="card"
              class="inline-flex items-center font-mono font-bold text-sm leading-none px-1.5 py-1 rounded border bg-white shadow-sm"
              :class="renderCard(card).color"
            >
              {{ renderCard(card).rank }}<span class="text-xs">{{ renderCard(card).suit }}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">

        <!-- Board picker (flop/turn/river) -->
        <template v-if="streetMaxCards[street.street] > 0">
          <CardPicker
            v-model="street.cards"
            :max="streetMaxCards[street.street]"
            :disabled="usedCards.filter(c => !street.cards.includes(c))"
          />
          <Separator class="bg-stone-100" />
        </template>

        <!-- Actions -->
        <div class="space-y-2">
          <div
            v-for="(action, aIdx) in street.actions"
            :key="aIdx"
            class="space-y-2 p-3 bg-stone-50 rounded-lg border border-stone-100"
          >
            <div class="flex items-center justify-between gap-2">
              <!-- Player selector -->
              <select
                v-model="action.playerId"
                class="text-xs border border-stone-200 rounded-md px-2 py-1.5 font-medium text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option v-for="player in players" :key="player.id" :value="player.id">
                  {{ player.name }}
                </option>
              </select>

              <button
                type="button"
                class="text-stone-300 hover:text-red-400 transition-colors ml-auto"
                @click="removeAction(sIdx, aIdx)"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Action buttons -->
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="act in ACTIONS"
                :key="act"
                type="button"
                class="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors duration-100"
                :class="action.action === act
                  ? 'bg-primary/70 text-primary-foreground border-primary/10'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
                @click="setAction(sIdx, aIdx, act)"
              >
                {{ actionLabel[act] }}
              </button>
            </div>

            <!-- Amount input -->
            <div v-if="actionNeedsAmount.has(action.action)" class="relative max-w-[140px]">
              <input
                v-model="action.amount"
                type="number"
                min="0"
                placeholder="0"
                class="w-full text-sm border border-stone-200 rounded-md px-3 py-1.5 font-mono text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">€</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          class="gap-1.5 text-xs w-full"
          @click="addAction(sIdx)"
        >
          <Plus class="w-3.5 h-3.5" />
          Ajouter une action
        </Button>

      </CardContent>
    </UiCard>

    <!-- Result -->
    <UiCard class="border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-sm font-medium text-stone-500">Résultat</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-stone-500">Taille du pot <span class="text-stone-400">(€)</span></label>
            <input
              v-model="potSize"
              type="number"
              min="0"
              placeholder="120"
              class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 font-mono text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p v-if="errors.potSize" class="text-xs text-red-500">{{ errors.potSize }}</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-stone-500">Résultat <span class="text-stone-400">(€, négatif si perdu)</span></label>
            <input
              v-model="result"
              type="number"
              placeholder="+80 ou -40"
              class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 font-mono text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p v-if="errors.result" class="text-xs text-red-500">{{ errors.result }}</p>
          </div>
        </div>

        <!-- Live preview -->
        <div
          v-if="result !== ''"
          class="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-mono font-semibold"
          :class="Number(result) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'"
        >
          <span class="text-xs font-sans font-medium">Résultat</span>
          <span>{{ Number(result) >= 0 ? '+' : '' }}{{ Number(result).toFixed(0) }}€</span>
        </div>
      </CardContent>
    </UiCard>

    <!-- Tags + notes -->
    <UiCard class="border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-sm font-medium text-stone-500">Tags &amp; notes</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tag in TAGS"
            :key="tag"
            type="button"
            class="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors duration-100"
            :class="selectedTags.includes(tag)
              ? tagColors[tag]
              : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'"
            @click="toggleTag(tag)"
          >
            {{ tagLabels[tag] }}
          </button>
        </div>

        <textarea
          v-model="notes"
          placeholder="Observations, raisonnement, points à revoir…"
          rows="3"
          class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
      </CardContent>
    </UiCard>

    <!-- Submit -->
    <div class="flex gap-3 pb-6">
      <Button variant="outline" class="flex-1" @click="goBack">Annuler</Button>
      <Button class="flex-1" @click="submit">Enregistrer la main</Button>
    </div>

  </div>
</template>