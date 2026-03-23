export type Period = '7d' | '30d' | '3m' | '6m' | 'all'

export interface BankrollPoint {
  date: Date
  bankroll: number
}

export interface BarPoint {
  category: string
  profit: number
}

export interface MonthPoint {
  month: string
  profit: number
  cash: number
  tournament: number
}

export interface StakePoint {
  stake: string
  profit: number
  hours: number
  winRate: number
}

export interface TournamentTypePoint {
  type: string
  roi: number
  sessions: number
  profit: number
}

export interface WeekdayPoint {
  day: string
  sessions: number
  profit: number
}

export interface StakeVenuePoint {
  stake: string
  live: number
  online: number
}

export interface DonutSlice {
  label: string
  value: number
  color: string
}