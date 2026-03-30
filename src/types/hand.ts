export type Card = string // 'As', 'Kh', '2d', 'Tc'

export type Position = 'UTG' | 'UTG+1' | 'MP' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB'

export type Street = 'preflop' | 'flop' | 'turn' | 'river'

export type Action = 'fold' | 'check' | 'call' | 'raise'

export type HandTag = 'bluff' | 'hero-call' | 'bad-beat' | 'cooler' | 'value' | '3bet-pot' | 'multiway' | 'squeeze'

export interface Player {
  id: string        // 'hero' | 'villain_1' | 'villain_2' ...
  name: string      // 'Hero' | 'Villain 1' — editable
  stack: number     // stack de départ en €
  position?: Position
}

export interface PlayerAction {
  playerId: string  // référence Player.id
  action: Action
  amount?: number   // en €, undefined pour fold/check
}

export interface StreetActions {
  street: Street
  cards?: string[]
  actions: PlayerAction[]
}

export interface Hand {
  id: string
  sessionId: string
  holeCards: [Card, Card]
  position: Position
  potSize: number       // pot final en €
  result: number        // positif = gagné, négatif = perdu
  players: Player[]     // hero + villains, dans l'ordre des positions
  streets: StreetActions[]
  tags?: HandTag[]
  notes?: string
}