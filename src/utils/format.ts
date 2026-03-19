import type { Session } from '@/types/session'
import type { BarPoint } from '@/types/stats'

export const formatCurrency = (value: number, showSign = false): string => {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(0)}€`
}

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}m` : `${h}h`
}

export const formatAxisDate = (d: number | Date): string =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

export const formatAxisEur = (d: number | Date): string => `${Number(d)}€`

export const sessionProfit = (s: Session): number => s.cashOut - s.totalBuyIn

export const sessionTypeLabel = (s: Session): string => {
  const labels: Record<string, string> = { CASH_GAME: 'Cash', MTT: 'MTT', SNG: 'SNG', SPIN: 'Spin' }
  return `${labels[s.type]} ${s.venue === 'LIVE' ? 'Live' : 'Online'}`
}

export const barColor = (d: BarPoint): string => (d.profit >= 0 ? '#16a34a' : '#dc2626')