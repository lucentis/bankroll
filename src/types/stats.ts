export type Period = '7d' | '30d' | '3m' | '6m' | 'all'

export interface BankrollPoint {
  date: Date
  bankroll: number
}

export interface BarPoint {
  category: string
  profit: number
}