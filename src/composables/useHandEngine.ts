import { reactive, computed } from 'vue'
import type { Street, Action, PlayerAction } from '@/types/hand'


export function useHandEngine(blinds: [number, number] = [1,2]) {
    const POSITIONS: Position[] = ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']

    // ---------------------------------------------------------------------------
    // STATE
    // ---------------------------------------------------------------------------
    const handState = reactive({
        status: 'setup' as 'setup' | 'playing' | 'finished',

        street: 'preflop' as Street,

        position: 'BTN',

        defaultStack: 100,

        players: [
            { id: 'hero', name: 'Hero', stack: 100, position: 'BTN' }
        ] as Player[],

        holeCards: [],
        board: [],

        playersToAct: [] as Player[],

        actions: {
            preflop: [] as PlayerAction[],
            flop: [] as PlayerAction[],
            turn: [] as PlayerAction[],
            river: [] as PlayerAction[],
        },

        pot: 0,
        currentBet: 0,
        contributions: {} as Record<string, number>,
        smallBlind: Number(blinds?.[0]) || 1,
        bigBlind: Number(blinds?.[1]) || 2,
        errors: {} as Record<string, string>,
    })

    // ---------------------------------------------------------------------------
    // COMPUTED
    // ---------------------------------------------------------------------------
    const currentPlayer = computed(() => handState.playersToAct[0])

    const toCall = computed(() => {
        if (!currentPlayer.value) return 0
        const id = currentPlayer.value.id
        return handState.currentBet - (handState.contributions[id] || 0)
    })

    const availableActions = computed<ActionType[]>(() => {
        if (!currentPlayer.value) return []

        console.log('to call: ', toCall.value);
        
        if (toCall.value === 0) {
            return ['check', 'raise']
        } else {
            return ['fold', 'call', 'raise']
        }
    })

    // ---------------------------------------------------------------------------
    // SETUP
    // ---------------------------------------------------------------------------
    function setPlayers(players: Player[]) {
        handState.players = players
    }

    function addPlayer() {
        const id = `villain_${handState.players.length}`
        const used = new Set(handState.players.map(p => p.position))
        const pos = POSITIONS.find(p => !used.has(p))
        if (!pos) return
        
        const player = {
            id: id,
            name: id,
            stack: handState.defaultStack,
            position: pos,
        }

        handState.players.push(player)
    }

    function removePlayer(player: Player) {
        if (player.id === 'hero') return
        handState.players = handState.players.filter(p => p.id !== id)
    }
    
    function startHand() {
        if (handState.status !== 'setup') return
        const players = handState.players
        
        // contributions
        players.forEach(p => {
            if (!handState.contributions[p.id]) handState.contributions[p.id] = 0
        })

        contributeBlinds(players)

        // other state
        handState.playersToAct = orderPlayersForPreflop(players)
        handState.status = 'playing'
        handState.street = 'preflop'

    }

    function contributeBlinds(players: Player[]) {
        const sbPlayer = players.find(p => p.position === 'SB')
        const bbPlayer = players.find(p => p.position === 'BB')
      
        if (sbPlayer) {
            sbPlayer.stack -= handState.smallBlind
            handState.contributions[sbPlayer.id] = handState.smallBlind
            handState.pot += handState.smallBlind
        } else {
            handState.pot += handState.smallBlind
        }
      
        if (bbPlayer) {
            bbPlayer.stack -= handState.bigBlind
            handState.contributions[bbPlayer.id] = handState.bigBlind
            handState.pot += handState.bigBlind
        } else {
            handState.pot += handState.bigBlind
        }

        handState.currentBet = handState.bigBlind
    }

    function orderPlayersForPreflop(players) {
        const order = []

        POSITIONS.forEach(pos => {
            const p = players.find(pl => pl.position === pos)
            if (p) order.push(p as Player)
        })

        return order
    }

    // ---------------------------------------------------------------------------
    // CORE LOGIC
    // ---------------------------------------------------------------------------
    function act(action: PlayerAction) {
        
        const player = currentPlayer.value
        if (!player) return
        
        const playerId = player.id
        
        // ----- VALIDATION MINIMALE -----
        if (!availableActions.value.includes(action.action)) return
        console.log('has action', action.action);

        // ----- APPLY -----
        if (action.action === 'fold') {
            console.log('fold');
            
            removeFromInHand(playerId)
            removeFromToAct(playerId)
        }

        if (action.type === 'check') {
            removeFromToAct(playerId)
        }

        if (action.type === 'call') {
            const amountToCall = toCall.value

            player.stack -= amountToCall
            handState.pot += amountToCall
            handState.contributions[playerId] += amountToCall

            removeFromToAct(playerId)
        }

        if (action.type === 'raise') {
            const raiseAmount = action.amount || 0
            const total = toCall.value + raiseAmount

            player.stack -= total
            handState.pot += total
            handState.contributions[playerId] += total

            handState.currentBet = handState.contributions[playerId]

            // 🔥 reset playersToAct (sauf lui)
            const others = handState.players.filter(p => p.id !== playerId)
            handState.playersToAct = [...others]
        }

        // ----- LOG -----
        handState.actions[handState.street].push({
            playerId,
            action: action.action,
            amount: action.amount,
        })

        // ----- FLOW -----
        if (isHandFinished()) {
            handState.status = 'finished'
            handState.street = 'result'
            return
        }

        if (isStreetFinished()) {
            nextStreet()
        }
    }

    // ---------------------------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------------------------
    function removeFromToAct(id: string) {
        handState.playersToAct = handState.playersToAct.filter(p => p.id !== id)
    }

    function removeFromInHand(id: string) {
        handState.players = handState.players.filter(p => p.id !== id)
    }

    function isStreetFinished() {
        return handState.playersToAct.length === 0
    }

    function isHandFinished() {
        return handState.players.length === 1
    }

    function nextStreet() {
        if (handState.street === 'preflop') handState.street = 'flop'
        else if (handState.street === 'flop') handState.street = 'turn'
        else if (state.street === 'turn') handState.street = 'river'
        else {
            handState.street = 'result'
            handState.status = 'finished'
        return
        }

        // reset street
        handState.playersToAct = [...handState.players]
        handState.currentBet = 0

        handState.contributions = Object.fromEntries(
            handState.players.map(p => [p.id, 0])
        )
    }

    // ---------------------------------------------------------------------------
    // API
    // ---------------------------------------------------------------------------
    return {
        // state
        handState,
        currentPlayer,
        toCall,
        availableActions,

        // setup
        addPlayer,
        removePlayer,
        setPlayers,
        startHand,

        // game
        act,
    }
}