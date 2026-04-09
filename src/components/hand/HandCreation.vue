<script setup lang="ts">
import { bankrollStore } from '@/store/bankroll';
import type { Action, Card, PlayerAction, Position, } from '@/types/hand';
import { computed, reactive, ref, watch } from 'vue';
import CardPicker from './CardPicker.vue';
import { Separator } from '../ui/separator';
import { Card as UiCard, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next';
import { Input } from '../ui/input';
import { useHandEngine } from '@/composables/useHandEngine'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';


// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------
const POSITIONS: Position[] = ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']

const session = bankrollStore.sessions.find(s => s.id === bankrollStore.activeSessionId)
const blinds = session?.stakes?.split('/').map(blind => Number(blind)) as [number, number] || [1,2]

const { handState, currentPlayer, toCall, addPlayer, removePlayer, startHand, act, getPlayerById, totalPot } = useHandEngine(blinds)

const currentAction = reactive<PlayerAction>({ 
    playerId: '',
    type: 'fold',
    amount: 0
})

const currentTab = ref<string>('setup')

watch(() => handState.street, (street) => {
    currentTab.value = street
})

// ---------------------------------------------------------------------------
// SETUP PLAYERS
// ---------------------------------------------------------------------------
const setAction = (action: Action) => {
    if (!currentPlayer.value) return
    currentAction.type = action
    currentAction.playerId = currentPlayer.value.id

    if (action == 'call') currentAction.amount = handState.currentBet
}

const setAmount = (amount: number | string) => {
    currentAction.amount = Number(amount)
}

const validateAction = () => {
    if (!currentAction.type) return
    
    act(currentAction)

    currentAction.type = 'fold'
    currentAction.amount = 0
}

const validateSetup = () => {
    if(handState.holeCards.length !== 2) {
        handState.errors.holeCards = "Choisir ses cartes avant de valider !"
        return
    }
    startHand()

    currentTab.value = 'preflop'
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
const goBack = () => {
  bankrollStore.activePage = 'session';
};

const suitSymbol: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColor: Record<string, string> = {
  s: 'text-stone-800',
  h: 'text-red-500',
  d: 'text-red-500',
  c: 'text-stone-800',
};
const renderCard = (card: Card) => ({
  rank: card.slice(0, -1),
  suit: suitSymbol[card.slice(-1)] ?? card.slice(-1),
  color: suitColor[card.slice(-1)] ?? '',
});

const usedCards = computed<Card[]>(() => {
  return [...handState.holeCards, ...handState.board];
});

const formatAction = (action: PlayerAction) => {
    if (action.type === 'fold') return 'Fold'
    if (action.type === 'check') return 'Check'
    if (action.type === 'call') return `Call ${action.amount}€`
    if (action.type === 'raise') return action.amount ? `Raise to ${action.amount}€` : 'Raise'
    return action.type
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

        <h1 class="text-2xl font-bold tracking-tight text-stone-900">Ajouter une main</h1>

        <Tabs :default-value="currentTab" v-model="currentTab" class="max-w-5xl mx-auto">
            <TabsList class="w-full">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="preflop">Préflop</TabsTrigger>
                <TabsTrigger value="flop">Flop</TabsTrigger>
                <TabsTrigger value="turn">Turn</TabsTrigger>
                <TabsTrigger value="river">River</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" class="py-4 space-y-4">
                <div class="text-stone-700 flex items-center gap-4">
                    <span class="font-medium">Blindes:</span>
                    <div class="flex items-center gap-2">
                        <Input v-model="handState.smallBlind" class="w-9"/>
                        <span>SB</span>
                    </div> 
                    <span>/</span>
                    <div class="flex items-center gap-2">
                        <Input v-model="handState.bigBlind" class="w-9"/>
                        <span>BB</span>
                    </div>

                </div>
                <div class="grid lg:grid-cols-2 gap-4">
                    <!-- Setup -->
                    <UiCard class="border-stone-200 shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-sm font-medium text-stone-500">Mes cartes</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-4">

                            <!-- Hole card preview -->
                            <div class="flex items-center gap-2">
                            <span
                                v-for="card in handState.holeCards"
                                :key="card"
                                class="inline-flex items-center font-mono font-bold text-xl leading-none px-2 py-1.5 rounded-lg border-2 bg-white shadow-sm"
                                :class="renderCard(card).color"
                            >
                                {{ renderCard(card).rank }}<span class="text-base">{{ renderCard(card).suit }}</span>
                            </span>
                            <span v-if="handState.holeCards.length === 0" class="text-sm text-stone-300">Aucune carte sélectionnée</span>
                            </div>
                            <p v-if="handState.errors.holeCards && handState.holeCards.length !== 2" class="text-xs text-red-500">{{ handState.errors.holeCards }}</p>

                            <CardPicker
                                v-model="handState.holeCards"
                                :max="2"
                                :disabled="usedCards.filter(c => !handState.holeCards.includes(c))"
                            />

                            <Separator class="bg-stone-100" />

                            <!-- Hero position -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-medium text-stone-500">Ma position</label>
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
                                <CardTitle class="text-sm font-medium text-stone-500">Joueurs</CardTitle>
                                <Button variant="outline" size="sm" class="gap-1.5 text-xs" @click="addPlayer">
                                    <Plus class="w-3.5 h-3.5" />
                                    Ajouter un villain
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent class="space-y-3">
                            <p v-if="handState.errors.stacks" class="text-xs text-red-500">{{ handState.errors.stacks }}</p>

                            <div
                                v-for="(player) in handState.players"
                                :key="player.id"
                                class="flex gap-2 items-center"
                            >
                                <!-- Name -->
                                <input
                                    v-model="player.name"
                                    type="text"
                                    class="text-sm border border-stone-200 rounded-md px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    :placeholder="player.id === 'hero' ? 'Hero' : 'Villain'"
                                />
                                <!-- Stack -->  
                                <div class="relative min-w-20">
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
                                        :disabled="handState.players.some(p => p.position === pos && p.id !== player.id)"
                                    >{{ pos }}</option>
                                </select>
                                <!-- Remove (villains only) -->
                                <button
                                    v-if="player.id !== 'hero'"
                                    type="button"
                                    class="text-stone-300 hover:text-red-400 transition-colors"
                                    @click="removePlayer(player)"
                                >
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </CardContent>
                        <CardFooter class="mx-auto">
                            <Button @click="validateSetup">Valider</Button>
                        </CardFooter>
                    </UiCard>

                </div>
            </TabsContent>

            <TabsContent value="preflop" class="py-4 space-y-4">
                <div class="space-y-2">
                    <UiCard class="border-stone-200 shadow-sm">
                        <!-- HEADER -->
                        <CardHeader>
                            <CardTitle class="flex justify-between items-center">
                            <span class="text-stone-500">Préflop</span>
                            <span class="font-mono text-lg">Pot: {{ totalPot }}€</span>
                            </CardTitle>
                        </CardHeader>

                        <CardContent class="space-y-4">

                            <!-- 🧾 HISTORIQUE -->
                            <div class="bg-stone-50 rounded-lg p-3 overflow-y-auto">
                                <ul class="space-y-1 text-sm">
                                    <li 
                                        v-for="(action, index) in handState.actions['preflop']"
                                        :key="action.playerId + action.type + index"
                                        class="flex justify-between"
                                    >
                                        <span class="font-medium">
                                            {{ getPlayerById(action.playerId)?.name }}
                                        </span>
                                        <span class="text-stone-500">
                                            {{ formatAction(action) }}
                                        </span>
                                    </li>

                                    <li v-if="handState.actions['preflop'].length === 0" class="text-xs text-stone-400">
                                    Aucune action pour le moment
                                    </li>
                                </ul>
                            </div>

                            <!-- 🎯 JOUEUR ACTUEL -->
                            <div 
                                class="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2 border border-primary/20"
                                v-show="handState.street === 'preflop'"
                            >
                                <div>
                                    <p class="text-xs text-stone-400">À jouer</p>
                                    <p class="font-semibold text-stone-800">
                                    {{ currentPlayer?.name || '—' }}
                                    </p>
                                </div>

                                <div class="text-right">
                                    <p class="text-xs text-stone-400">À payer</p>
                                    <p class="font-mono text-lg">
                                    {{ toCall }}€
                                    </p>
                                </div>
                            </div>

                            <!-- 🎮 ACTIONS -->
                            <div class="space-y-2" v-show="handState.street === 'preflop'">
                                <div class="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        class="text-xs px-3 py-1.5 rounded-full border font-mono font-medium transition-colors duration- hover:bg-slate-200"
                                        :class="currentAction.type === 'fold' && currentAction.playerId == currentPlayer?.id
                                            ? 'bg-primary/70 text-primary-foreground border-primary/10'
                                            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
                                        @click="setAction('fold')"
                                        v-if="toCall !== 0"
                                    >
                                        <span>Fold</span>
                                    </Button>

                                    <Button
                                        v-if="toCall === 0"
                                        type="button"
                                        class="text-xs px-3 py-1.5 rounded-full border font-mono font-medium transition-colors duration- hover:bg-slate-200"
                                        :class="currentAction?.type === 'check' && currentAction.playerId == currentPlayer?.id
                                            ? 'bg-primary/70 text-primary-foreground border-primary/10'
                                            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
                                        @click="setAction('check')"
                                    >
                                        <span>Check</span>
                                    </Button>

                                    <Button
                                        v-if="toCall > 0"
                                        type="button"
                                        class="text-xs px-3 py-1.5 rounded-full border font-mono font-medium transition-colors duration- hover:bg-slate-200"
                                        :class="currentAction?.type === 'call' && currentAction.playerId == currentPlayer?.id
                                            ? 'bg-primary/70 text-primary-foreground border-primary/10'
                                            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
                                        @click="setAction('call')"
                                    >
                                        <span>Call</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        class="text-xs px-3 py-1.5 rounded-full border font-mono font-medium transition-colors duration- hover:bg-slate-200"
                                        :class="currentAction?.type === 'raise' && currentAction.playerId == currentPlayer?.id
                                            ? 'bg-primary/70 text-primary-foreground border-primary/10'
                                            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
                                        @click="setAction('raise')"
                                    >
                                        <span>Raise</span>
                                    </Button>

                                </div>

                                <Input 
                                    v-if="currentAction?.type == 'raise' && currentAction.playerId == currentPlayer?.id" 
                                    type="number" 
                                    @update:model-value="setAmount"
                                    placeholder="Montant"
                                />
                                
                                <Button @click="validateAction" class="w-full">Valider {{ formatAction(currentAction) }}</Button>
                            </div>
                        </CardContent>
                    </UiCard>       
                    
                    
                </div>
            </TabsContent>
        </Tabs>
    </div>
    <pre>action: {{  currentAction }}</pre>
    <pre>players: {{  handState }}</pre>
</template>