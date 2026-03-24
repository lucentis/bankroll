<script setup lang="ts">
import { bankrollStore } from '@/store/bankroll';
import type { Card, PlayerAction, Position } from '@/types/hand';
import { computed, reactive } from 'vue';
import CardPicker from './CardPicker.vue';
import { Separator } from '../ui/separator';
import { Card as UiCard, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next';
import type { Action } from '@/types/hand';
import { Input } from '../ui/input';


//----------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
const DEFAULT_STACK = 100
const POSITIONS: Position[] = ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']
const ACTIONS: Action[] = ['fold', 'check', 'call', 'raise']

const session = bankrollStore.sessions.find(s => s.id === bankrollStore.activeSessionId)
const blinds = session?.stakes?.split('/')

const setupState = reactive({
    holeCards: [] as Card[],
    position: 'BTN',
    errors: {} as Record<string, string>,
    streets: [
        { street: 'preflop', cards: [], actions: [] as PlayerAction[] },
        { street: 'flop',    cards: [], actions: [] as PlayerAction[] },
        { street: 'turn',    cards: [], actions: [] as PlayerAction[] },
        { street: 'river',   cards: [], actions: [] as PlayerAction[] },
    ],
    players: [
        { id: 'hero', name: 'Hero', stack: DEFAULT_STACK, position: 'BTN' },
    ],
    board: [] as Card[],
    smallBlind: blinds?.[0] || 10,
    bigBlind: blinds?.[1] || 20,
    pot:0
})

const addPlayer = () => {
  const id = `villain_${setupState.players.length}`

  const usedPositions = new Set(setupState.players.map(p => p.position))

  const availablePosition = POSITIONS.find(p => !usedPositions.has(p))

  if (!availablePosition) return // max joueurs atteint

  setupState.players.push({
    id,
    name: `Villain ${setupState.players.length}`,
    stack: DEFAULT_STACK,
    position: availablePosition,
  })

  setupState.streets[0].actions.push({
    playerId: id,
    action: 'fold',
    amount: undefined
  })
}

const removePlayer = (id: string) => {
  if (id === 'hero') return // interdit

  setupState.players = setupState.players.filter(p => p.id !== id)
}

//----------------------------------------------------------------------------
// Streets
// ---------------------------------------------------------------------------
const preflopOrder = computed(() => {
  const order: string[] = []
  const positionsOrder: Position[] = ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']
  
  positionsOrder.forEach(pos => {
    const player = setupState.players.find(p => p.position === pos)
    if (player) order.push(player.id)
  })

  return order
})

const setAction = (streetIdx: number, actionIdx: number, action: Action) => {
  setupState.streets[streetIdx].actions[actionIdx].action = action
  if (action !== 'fold') {
    setupState.streets[streetIdx].actions[actionIdx].amount = 0
  }
}

//----------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
const goBack = () => {
  bankrollStore.activePage = 'session'
}

const suitSymbol: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }
const suitColor: Record<string, string> = {
  s: 'text-stone-800', h: 'text-red-500', d: 'text-red-500', c: 'text-stone-800',
}
const renderCard = (card: Card) => ({
  rank: card.slice(0, -1),
  suit: suitSymbol[card.slice(-1)] ?? card.slice(-1),
  color: suitColor[card.slice(-1)] ?? '',
})

// All cards already picked (hole cards + board) to disable in pickers
const usedCards = computed<Card[]>(() => {
  return [...setupState.holeCards, ...setupState.board]
})

const getPlayerById = (id: string) => setupState.players.find(p => p.id === id)
const getActionByPlayer = (streetIdx: number, playerId: string) =>
  setupState.streets[streetIdx].actions.find(a => a.playerId === playerId)
const getActionIndex = (streetIdx: number, playerId: string) =>
  setupState.streets[streetIdx].actions.findIndex(a => a.playerId === playerId)

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

        <h1 class="text-2xl font-bold tracking-tight text-stone-900">Ajouter une main</h1>

        <div class="text-sm text-slate-700/50 flex items-center gap-4">
            <span>Blindes:</span>
            <div class="flex items-center gap-2">
                <Input v-model="setupState.smallBlind" class="w-9"/>
                <span>SB</span>
            </div> 
            <span>/</span>
            <div class="flex items-center gap-2">
                <Input v-model="setupState.bigBlind" class="w-9"/>
                <span>BB</span>
            </div>

        </div>

        <div class="grid grid-cols-2 gap-4">
            <!-- Setup -->
            <UiCard class="border-stone-200 shadow-sm">
                <CardHeader>
                    <CardTitle class="text-sm font-medium text-stone-500">Hole cards</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">

                    <!-- Hole card preview -->
                    <div class="flex items-center gap-2">
                    <span
                        v-for="card in setupState.holeCards"
                        :key="card"
                        class="inline-flex items-center font-mono font-bold text-xl leading-none px-2 py-1.5 rounded-lg border-2 bg-white shadow-sm"
                        :class="renderCard(card).color"
                    >
                        {{ renderCard(card).rank }}<span class="text-base">{{ renderCard(card).suit }}</span>
                    </span>
                    <span v-if="setupState.holeCards.length === 0" class="text-sm text-stone-300">Aucune carte sélectionnée</span>
                    </div>
                    <p v-if="setupState.errors.holeCards" class="text-xs text-red-500">{{ setupState.errors.holeCards }}</p>

                    <CardPicker
                        v-model="setupState.holeCards"
                        :max="2"
                        :disabled="usedCards.filter(c => !setupState.holeCards.includes(c))"
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
                            :class="setupState.position === pos
                                ? 'bg-primary/70 text-primary-foreground border-primary/10'
                                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
                            @click="setupState.position = pos; setupState.players[0].position = pos"
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
                        <Button variant="outline" size="sm" class="gap-1.5 text-xs" @click="addPlayer">
                            <Plus class="w-3.5 h-3.5" />
                            Ajouter un villain
                        </Button>
                    </div>
                </CardHeader>
                <CardContent class="space-y-3">
                    <p v-if="setupState.errors.stacks" class="text-xs text-red-500">{{ setupState.errors.stacks }}</p>
                    <div
                        v-for="(player) in setupState.players"
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
                        <option 
                            v-for="pos in POSITIONS" 
                            :key="pos" 
                            :value="pos"
                            :disabled="setupState.players.some(p => p.position === pos && p.id !== player.id)"
                        >{{ pos }}</option>
                    </select>
                    <!-- Remove (villains only) -->
                    <button
                        v-if="player.id !== 'hero'"
                        type="button"
                        class="text-stone-300 hover:text-red-400 transition-colors"
                        @click="removePlayer(player.id)"
                    >
                        <Trash2 class="w-4 h-4" />
                    </button>
                    <div v-else class="w-4" />
                    </div>
                </CardContent>
            </UiCard>

        </div>

        <div class="space-y-2">
            <UiCard class="border-stone-200 shadow-sm">
                <CardHeader>
                    <CardTitle class="text-sm font-medium text-stone-500">Préflop</CardTitle>
                </CardHeader>

                <CardContent></CardContent>
            </UiCard>
            
            <div v-for="(playerId) in preflopOrder" :key="playerId" class="flex items-center gap-2">
                <!-- Nom du joueur -->
                <span class="w-24 font-mono">
                {{ getPlayerById(playerId)?.name }}
                </span>

                <!-- Boutons d'action -->
                <button
                    v-for="action in ACTIONS"
                    :key="action"
                    type="button"
                    class="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors duration-100"
                    :class="getActionByPlayer(0, playerId)?.action === action
                        ? 'bg-primary/70 text-primary-foreground border-primary/10'
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
                    @click="setAction(0, getActionIndex(0, playerId), action)"
                >
                {{ action }}
                </button>

                <!-- Input montant si action = raise -->
                <input
                    v-if="getActionByPlayer(0, playerId)?.action === 'raise'"
                    v-model.number="getActionByPlayer(0, playerId)!.amount"
                    type="number"
                    min="1"
                    placeholder="€"
                    class="w-20 border rounded px-2 py-1 text-sm font-mono"
                />
            </div>
        </div>
    </div>

    <pre>{{ setupState }}</pre>
</template>