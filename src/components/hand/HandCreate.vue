<script setup lang="ts">
import { bankrollStore } from '@/store/bankroll'
import type { Action, Card, PlayerAction, Position, Street } from '@/types/hand'
import { computed, reactive, ref, watch } from 'vue'
import CardPicker from './CardPicker.vue'
import { Separator } from '../ui/separator'
import { Card as UiCard, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next'
import { useHandEngine } from '@/composables/useHandEngine'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const POSITIONS: Position[] = ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']
const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river']

const STREET_LABEL: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
}

const BOARD_MAX: Record<string, number> = { flop: 3, turn: 1, river: 1 }

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

const session = bankrollStore.sessions.find(s => s.id === bankrollStore.activeSessionId)
const blinds = session?.stakes?.split('/').map(Number) as [number, number] ?? [1, 2]

const {
  handState, currentPlayer, toCall, availableActions,
  addPlayer, removePlayer, startHand, act,
} = useHandEngine(blinds)

// ---------------------------------------------------------------------------
// Local UI state
// ---------------------------------------------------------------------------

const currentTab = ref<string>('setup')
const selectedAction = ref<Action | null>(null)
const raiseAmount = ref<number>(0)

// Board cards collected per post-flop street — kept separate from handState
// so the UI can ask for them before the street starts acting
const boardCards = reactive<Record<'flop' | 'turn' | 'river', string[]>>({
  flop: [],
  turn: [],
  river: [],
})

// Auto-advance tab whenever the engine moves to the next street
watch(() => handState.street, (street) => {
  if (handState.status === 'playing') currentTab.value = street
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

// All cards already committed — used to disable duplicates in pickers
const usedCards = computed<Card[]>(() => [
  ...handState.holeCards,
  ...boardCards.flop,
  ...boardCards.turn,
  ...boardCards.river,
])

const getBoardCards = (street: Street): string[] =>
  street === 'preflop' ? [] : boardCards[street as 'flop' | 'turn' | 'river']

const needsBoardInput = (street: Street): boolean => {
  if (street === 'preflop') return false
  const cards = boardCards[street as 'flop' | 'turn' | 'river']
  return cards.length < BOARD_MAX[street]
}

const isStreetActive = (street: Street): boolean =>
  handState.status === 'playing' && handState.street === street

const isStreetPast = (street: Street): boolean => {
  if (handState.status === 'setup') return false
  return STREETS.indexOf(street) < STREETS.indexOf(handState.street as Street)
}

const isStreetReachable = (street: Street): boolean => {
  if (handState.status === 'setup') return false
  return STREETS.indexOf(street) <= STREETS.indexOf(handState.street as Street)
}

// True when the player can interact with action controls on this street
const canAct = (street: Street): boolean =>
  isStreetActive(street) && !needsBoardInput(street)

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

const selectAction = (action: Action) => {
  selectedAction.value = selectedAction.value === action ? null : action
  if (action !== 'raise') raiseAmount.value = 0
}

const submitAction = () => {
  if (!selectedAction.value || !currentPlayer.value) return

  act({
    playerId: currentPlayer.value.id,
    type: selectedAction.value,
    amount: selectedAction.value === 'raise' ? raiseAmount.value : undefined,
  } as PlayerAction)

  selectedAction.value = null
  raiseAmount.value = 0
}

const validateSetup = () => {
  startHand()
  currentTab.value = 'preflop'
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

const goBack = () => { bankrollStore.activePage = 'session' }

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

const playerName = (id: string): string =>
  handState.players.find(p => p.id === id)?.name ?? id

const ACTION_COLOR: Record<Action, string> = {
  fold: 'text-stone-400',
  check: 'text-stone-500',
  call: 'text-sky-600',
  raise: 'text-amber-600',
}

const formatAction = (type: Action, amount?: number): string => {
  if (type === 'fold') return 'Fold'
  if (type === 'check') return 'Check'
  if (type === 'call') return amount ? `Call ${amount}€` : 'Call'
  if (type === 'raise') return amount ? `Raise to ${amount}€` : 'Raise'
  return type
}
</script>

<template>
  <div class="p-6 space-y-6">

    <button
      class="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
      @click="goBack"
    >
      <ArrowLeft class="w-4 h-4" />
      Session
    </button>

    <h1 class="text-2xl font-bold tracking-tight text-stone-900">Add a hand</h1>

    <Tabs v-model="currentTab">
      <TabsList class="w-full">
        <TabsTrigger value="setup">Setup</TabsTrigger>
        <TabsTrigger value="preflop" :disabled="handState.status === 'setup'">Preflop</TabsTrigger>
        <TabsTrigger value="flop" :disabled="!isStreetReachable('flop')">Flop</TabsTrigger>
        <TabsTrigger value="turn" :disabled="!isStreetReachable('turn')">Turn</TabsTrigger>
        <TabsTrigger value="river" :disabled="!isStreetReachable('river')">River</TabsTrigger>
      </TabsList>

      <!-- ---------------------------------------------------------------- -->
      <!-- SETUP                                                             -->
      <!-- ---------------------------------------------------------------- -->
      <TabsContent value="setup" class="py-4 space-y-4">

        <div class="flex items-center gap-4 text-stone-700">
          <span class="text-sm font-medium">Blinds</span>
          <div class="flex items-center gap-2">
            <Input v-model="handState.smallBlind" type="number" class="w-16" />
            <span class="text-xs text-stone-400">SB</span>
          </div>
          <span class="text-stone-300">/</span>
          <div class="flex items-center gap-2">
            <Input v-model="handState.bigBlind" type="number" class="w-16" />
            <span class="text-xs text-stone-400">BB</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">

          <!-- Hole cards + position -->
          <UiCard class="border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle class="text-sm font-medium text-stone-500">My cards</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">

              <div class="flex items-center gap-2 min-h-[2.5rem]">
                <span
                  v-for="card in handState.holeCards"
                  :key="card"
                  class="inline-flex items-center font-mono font-bold text-xl leading-none px-2 py-1.5 rounded-lg border-2 bg-white shadow-sm"
                  :class="renderCard(card).color"
                >
                  {{ renderCard(card).rank }}<span class="text-base">{{ renderCard(card).suit }}</span>
                </span>
                <span v-if="handState.holeCards.length === 0" class="text-sm text-stone-300">
                  No card selected
                </span>
              </div>

              <CardPicker
                v-model="handState.holeCards"
                :max="2"
                :disabled="usedCards.filter(c => !handState.holeCards.includes(c))"
              />

              <Separator class="bg-stone-100" />

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-stone-500">My position</label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="pos in POSITIONS"
                    :key="pos"
                    type="button"
                    class="text-xs px-3 py-1.5 rounded-full border font-mono font-medium transition-colors duration-100"
                    :class="handState.position === pos
                      ? 'bg-primary/70 text-primary-foreground border-primary/10'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
                    @click="handState.position = pos; handState.players[0].position = pos"
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
                <CardTitle class="text-sm font-medium text-stone-500">Players</CardTitle>
                <Button variant="outline" size="sm" class="gap-1.5 text-xs" @click="addPlayer">
                  <Plus class="w-3.5 h-3.5" />
                  Add villain
                </Button>
              </div>
            </CardHeader>
            <CardContent class="space-y-3">
              <div
                v-for="player in handState.players"
                :key="player.id"
                class="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center"
              >
                <input
                  v-model="player.name"
                  type="text"
                  class="text-sm border border-stone-200 rounded-md px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  :placeholder="player.id === 'hero' ? 'Hero' : 'Villain'"
                />
                <input
                  v-model.number="player.stack"
                  type="number"
                  min="0"
                  placeholder="100"
                  class="w-20 text-sm border border-stone-200 rounded-md px-3 py-1.5 font-mono text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <select
                  v-model="player.position"
                  class="text-xs border border-stone-200 rounded-md px-2 py-1.5 font-mono text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">—</option>
                  <option
                    v-for="pos in POSITIONS"
                    :key="pos"
                    :value="pos"
                    :disabled="handState.players.some(p => p.position === pos && p.id !== player.id)"
                  >{{ pos }}</option>
                </select>
                <button
                  v-if="player.id !== 'hero'"
                  type="button"
                  class="text-stone-300 hover:text-red-400 transition-colors"
                  @click="removePlayer(player)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
                <div v-else class="w-4" />
              </div>
            </CardContent>
            <div class="px-6 pb-6 pt-2">
              <Button class="w-full" @click="validateSetup">Start hand</Button>
            </div>
          </UiCard>

        </div>
      </TabsContent>

      <!-- ---------------------------------------------------------------- -->
      <!-- STREET TABS — shared structure rendered once per street           -->
      <!-- ---------------------------------------------------------------- -->
      <TabsContent
        v-for="street in STREETS"
        :key="street"
        :value="street"
        class="py-4"
      >
        <UiCard class="border-stone-200 shadow-sm">

          <!-- Header: street name + status badge + pot -->
          <CardHeader>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold uppercase tracking-widest text-stone-400">
                  {{ STREET_LABEL[street] }}
                </span>
                <Badge
                  v-if="isStreetActive(street)"
                  variant="outline"
                  class="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-600 px-1.5"
                >
                  Active
                </Badge>
                <Badge
                  v-else-if="isStreetPast(street)"
                  variant="outline"
                  class="text-[10px] border-stone-200 text-stone-400 px-1.5"
                >
                  Done
                </Badge>
              </div>
              <span class="text-lg font-bold font-mono text-stone-800">
                Pot: {{ handState.pot }}€
              </span>
            </div>
          </CardHeader>

          <CardContent class="space-y-4">

            <!-- Board row (post-flop streets only) -->
            <template v-if="street !== 'preflop'">
              <div class="flex items-center gap-3">
                <span class="text-xs text-stone-400 w-10 shrink-0">Board</span>
                <div class="flex items-center gap-1 flex-wrap">
                  <span
                    v-for="card in getBoardCards(street)"
                    :key="card"
                    class="inline-flex items-center font-mono font-bold text-sm leading-none px-1.5 py-1 rounded border bg-white shadow-sm"
                    :class="renderCard(card).color"
                  >
                    {{ renderCard(card).rank }}<span class="text-xs">{{ renderCard(card).suit }}</span>
                  </span>
                  <span
                    v-if="getBoardCards(street).length === 0"
                    class="text-xs text-stone-300"
                  >
                    —
                  </span>
                </div>
              </div>

              <!-- Card picker for board — visible only on the active street before cards are set -->
              <div v-if="isStreetActive(street) && needsBoardInput(street)" class="space-y-2">
                <p class="text-xs text-stone-500">
                  Select {{ BOARD_MAX[street] }} {{ STREET_LABEL[street].toLowerCase() }}
                  card{{ BOARD_MAX[street] > 1 ? 's' : '' }} to continue
                </p>
                <CardPicker
                  v-if="street === 'flop'"
                  v-model="boardCards.flop"
                  :max="3"
                  :disabled="usedCards.filter(c => !boardCards.flop.includes(c))"
                />
                <CardPicker
                  v-else-if="street === 'turn'"
                  v-model="boardCards.turn"
                  :max="1"
                  :disabled="usedCards.filter(c => !boardCards.turn.includes(c))"
                />
                <CardPicker
                  v-else-if="street === 'river'"
                  v-model="boardCards.river"
                  :max="1"
                  :disabled="usedCards.filter(c => !boardCards.river.includes(c))"
                />
              </div>

              <Separator class="bg-stone-100" />
            </template>

            <!-- Action history for this street -->
            <div class="min-h-[5rem] max-h-52 overflow-y-auto space-y-1">
              <div
                v-for="(action, idx) in handState.actions[street]"
                :key="idx"
                class="flex items-center gap-3 py-1 rounded-md px-2"
                :class="action.playerId === 'hero' ? 'bg-primary/5' : ''"
              >
                <span
                  class="text-xs font-medium w-24 shrink-0 truncate"
                  :class="action.playerId === 'hero' ? 'text-primary' : 'text-stone-400'"
                >
                  {{ playerName(action.playerId) }}
                </span>
                <span
                  class="text-sm font-medium"
                  :class="ACTION_COLOR[action.type]"
                >
                  {{ formatAction(action.type, action.amount) }}
                </span>
                <span v-if="action.amount" class="text-xs font-mono text-stone-400 ml-auto">
                  {{ action.amount }}€
                </span>
              </div>

              <p
                v-if="handState.actions[street].length === 0"
                class="text-xs text-stone-300 py-3 text-center"
              >
                No action yet
              </p>
            </div>

            <Separator class="bg-stone-100" />

            <!-- ---------------------------------------------------------- -->
            <!-- Action zone — current player controls                       -->
            <!-- ---------------------------------------------------------- -->
            <template v-if="canAct(street)">

              <!-- Current player info -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-stone-800">
                    {{ currentPlayer?.name }}
                  </span>
                  <span
                    class="text-xs font-mono text-stone-400 border border-stone-200 rounded px-1.5 py-0.5"
                  >
                    {{ currentPlayer?.position }}
                  </span>
                  <span class="text-xs text-stone-400 font-mono">
                    {{ currentPlayer?.stack }}€
                  </span>
                </div>
                <span v-if="toCall > 0" class="text-xs text-stone-500">
                  To call:
                  <span class="font-mono font-semibold text-stone-700">{{ toCall }}€</span>
                </span>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-wrap items-center gap-2">

                <button
                  v-if="availableActions.includes('fold')"
                  type="button"
                  class="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors duration-100"
                  :class="selectedAction === 'fold'
                    ? 'bg-stone-700 text-white border-stone-700'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'"
                  @click="selectAction('fold')"
                >
                  Fold
                </button>

                <button
                  v-if="availableActions.includes('check')"
                  type="button"
                  class="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors duration-100"
                  :class="selectedAction === 'check'
                    ? 'bg-stone-600 text-white border-stone-600'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'"
                  @click="selectAction('check')"
                >
                  Check
                </button>

                <button
                  v-if="availableActions.includes('call')"
                  type="button"
                  class="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors duration-100"
                  :class="selectedAction === 'call'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-sky-600 border-sky-200 hover:border-sky-400'"
                  @click="selectAction('call')"
                >
                  Call {{ toCall }}€
                </button>

                <button
                  type="button"
                  class="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors duration-100"
                  :class="selectedAction === 'raise'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-amber-600 border-amber-200 hover:border-amber-400'"
                  @click="selectAction('raise')"
                >
                  Raise
                </button>

                <div v-if="selectedAction === 'raise'" class="flex items-center gap-1.5">
                  <Input
                    v-model.number="raiseAmount"
                    type="number"
                    :min="toCall + 1"
                    placeholder="0"
                    class="w-24 h-8 text-xs font-mono"
                    @update:model-value="val => raiseAmount = Number(val)"
                  />
                  <span class="text-xs text-stone-400">€</span>
                </div>

                <Button
                  size="sm"
                  class="ml-auto"
                  :disabled="!selectedAction || (selectedAction === 'raise' && raiseAmount <= 0)"
                  @click="submitAction"
                >
                  Confirm
                </Button>

              </div>
            </template>

            <!-- Board cards needed before acting -->
            <template v-else-if="isStreetActive(street) && needsBoardInput(street)">
              <p class="text-xs text-stone-400 text-center py-2">
                Select the board cards above to continue.
              </p>
            </template>

            <!-- Hand finished -->
            <template v-else-if="handState.status === 'finished'">
              <div class="text-center py-3 space-y-1">
                <p class="text-sm font-medium text-stone-700">Hand complete</p>
                <p class="text-xs text-stone-400">Review the action above, then save the hand.</p>
              </div>
            </template>

            <!-- Past street — read only -->
            <template v-else-if="isStreetPast(street)">
              <p class="text-xs text-stone-400 text-center py-2">Street completed.</p>
            </template>

            <!-- Future street — not yet reached -->
            <template v-else-if="handState.status === 'playing'">
              <p class="text-xs text-stone-300 text-center py-2">Not reached yet.</p>
            </template>

            <!-- Setup not done -->
            <template v-else>
              <p class="text-xs text-stone-300 text-center py-2">Complete the setup first.</p>
            </template>

          </CardContent>
        </UiCard>
      </TabsContent>

    </Tabs>
  </div>
</template>