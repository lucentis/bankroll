export type SessionType = 'CASH_GAME' | 'MTT' | 'SNG' | 'SPIN'
export type Venue = 'LIVE' | 'ONLINE'

export interface Session {
  id: string
  date: Date
  type: SessionType
  venue: Venue
  totalBuyIn: number
  cashOut: number
  duration: number // minutes
  location: string
  stakes?: string // cash game only, e.g. "1/2"
  players?: number // tournament only
  position?: number // tournament only
  notes?: string
}

export type SortKey = 'date' | 'profit' | 'duration' | 'buyIn'
export type SortDir = 'asc' | 'desc'
