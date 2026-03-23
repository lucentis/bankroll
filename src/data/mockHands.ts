import type { Hand } from '@/types/hand'

export const mockHands: Hand[] = [
  // Session 1 — Cash Live 1/2, Aviation Club
  {
    id: 'h1',
    sessionId: '1',
    holeCards: ['As', 'Kh'],
    position: 'BTN',
    potSize: 87,
    result: 62,
    players: [
      { id: 'hero', name: 'Hero', stack: 200 },
      { id: 'villain_1', name: 'Villain 1', stack: 180 },
    ],
    streets: [
      {
        street: 'preflop',
        actions: [
          { playerId: 'villain_1', action: 'call', amount: 2 },
          { playerId: 'hero', action: 'raise', amount: 10 },
          { playerId: 'villain_1', action: 'call', amount: 10 },
        ],
      },
      {
        street: 'flop',
        cards: ['Kd', '7h', '2c'],
        actions: [
          { playerId: 'villain_1', action: 'check' },
          { playerId: 'hero', action: 'bet', amount: 14 },
          { playerId: 'villain_1', action: 'call', amount: 14 },
        ],
      },
      {
        street: 'turn',
        cards: ['9s'],
        actions: [
          { playerId: 'villain_1', action: 'check' },
          { playerId: 'hero', action: 'bet', amount: 28 },
          { playerId: 'villain_1', action: 'fold' },
        ],
      },
    ],
    tags: ['value'],
    notes: 'C-bet flop, barrel turn, villain fold.',
  },
  {
    id: 'h2',
    sessionId: '1',
    holeCards: ['Qh', 'Qd'],
    position: 'CO',
    potSize: 210,
    result: -105,
    players: [
      { id: 'hero', name: 'Hero', stack: 200 },
      { id: 'villain_1', name: 'Villain 1', stack: 220 },
    ],
    streets: [
      {
        street: 'preflop',
        actions: [
          { playerId: 'hero', action: 'raise', amount: 8 },
          { playerId: 'villain_1', action: '3bet', amount: 26 },
          { playerId: 'hero', action: 'call', amount: 26 },
        ],
      },
      {
        street: 'flop',
        cards: ['Ac', 'Ts', '3h'],
        actions: [
          { playerId: 'villain_1', action: 'bet', amount: 32 },
          { playerId: 'hero', action: 'call', amount: 32 },
        ],
      },
      {
        street: 'turn',
        cards: ['Kd'],
        actions: [
          { playerId: 'villain_1', action: 'bet', amount: 65 },
          { playerId: 'hero', action: 'fold' },
        ],
      },
    ],
    tags: ['3bet-pot'],
    notes: 'Fold face à double barrel sur A-K-T. Probablement correct.',
  },
  {
    id: 'h3',
    sessionId: '1',
    holeCards: ['7h', '6h'],
    position: 'SB',
    potSize: 44,
    result: 44,
    players: [
      { id: 'hero', name: 'Hero', stack: 200 },
      { id: 'villain_1', name: 'Villain 1', stack: 150 },
      { id: 'villain_2', name: 'Villain 2', stack: 175 },
    ],
    streets: [
      {
        street: 'preflop',
        actions: [
          { playerId: 'villain_1', action: 'call', amount: 2 },
          { playerId: 'villain_2', action: 'call', amount: 2 },
          { playerId: 'hero', action: 'call', amount: 1 },
        ],
      },
      {
        street: 'flop',
        cards: ['8h', '5d', '4h'],
        actions: [
          { playerId: 'hero', action: 'bet', amount: 6 },
          { playerId: 'villain_1', action: 'fold' },
          { playerId: 'villain_2', action: 'fold' },
        ],
      },
    ],
    tags: ['bluff'],
    notes: 'Semi-bluff open-ended + flush draw flop multiway.',
  },

  // Session 3 — Cash Online 0.5/1
  {
    id: 'h4',
    sessionId: '3',
    holeCards: ['Ad', 'Qc'],
    position: 'BTN',
    potSize: 38,
    result: 38,
    players: [
      { id: 'hero', name: 'Hero', stack: 100 },
      { id: 'villain_1', name: 'Villain 1', stack: 95 },
    ],
    streets: [
      {
        street: 'preflop',
        actions: [
          { playerId: 'hero', action: 'raise', amount: 3 },
          { playerId: 'villain_1', action: 'call', amount: 3 },
        ],
      },
      {
        street: 'flop',
        cards: ['Ah', '9d', '3c'],
        actions: [
          { playerId: 'villain_1', action: 'check' },
          { playerId: 'hero', action: 'bet', amount: 4 },
          { playerId: 'villain_1', action: 'raise', amount: 14 },
          { playerId: 'hero', action: 'call', amount: 14 },
        ],
      },
      {
        street: 'turn',
        cards: ['2s'],
        actions: [
          { playerId: 'villain_1', action: 'bet', amount: 20 },
          { playerId: 'hero', action: 'call', amount: 20 },
        ],
      },
      {
        street: 'river',
        cards: ['Ks'],
        actions: [
          { playerId: 'villain_1', action: 'check' },
          { playerId: 'hero', action: 'bet', amount: 40 },
          { playerId: 'villain_1', action: 'fold' },
        ],
      },
    ],
    tags: ['value'],
  },
  {
    id: 'h5',
    sessionId: '3',
    holeCards: ['Kc', 'Ks'],
    position: 'BB',
    potSize: 180,
    result: -90,
    players: [
      { id: 'hero', name: 'Hero', stack: 100 },
      { id: 'villain_1', name: 'Villain 1', stack: 110 },
    ],
    streets: [
      {
        street: 'preflop',
        actions: [
          { playerId: 'villain_1', action: 'raise', amount: 3 },
          { playerId: 'hero', action: '3bet', amount: 11 },
          { playerId: 'villain_1', action: '4bet', amount: 28 },
          { playerId: 'hero', action: 'call', amount: 28 },
        ],
      },
      {
        street: 'flop',
        cards: ['As', 'Jh', '4d'],
        actions: [
          { playerId: 'villain_1', action: 'bet', amount: 30 },
          { playerId: 'hero', action: 'allin', amount: 72 },
          { playerId: 'villain_1', action: 'call', amount: 72 },
        ],
      },
    ],
    tags: ['cooler', '3bet-pot'],
    notes: 'KK vs AA. Cooler classique en 4bet pot.',
  },
]