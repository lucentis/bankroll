import { computed } from 'vue'
import { sessionProfit } from '@/utils/format'
import type { ComputedRef } from 'vue'
import type { Session } from '@/types/session'

export interface MonthPoint {
  month: string // 'Jan 2026'
  profit: number
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

const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export function useStatsCharts(sortedSessions: ComputedRef<Session[]>) {
  // Profit by month
  const profitByMonth = computed<MonthPoint[]>(() => {
    const map = new Map<string, number>()
    for (const s of sortedSessions.value) {
      const key = `${MONTHS_FR[s.date.getMonth()]} ${s.date.getFullYear()}`
      map.set(key, (map.get(key) ?? 0) + sessionProfit(s))
    }
    return Array.from(map.entries()).map(([month, profit]) => ({ month, profit }))
  })

  // Winrate by stake (cash game only)
  const winRateByStake = computed<StakePoint[]>(() => {
    const map = new Map<string, { profit: number; minutes: number }>()
    for (const s of sortedSessions.value) {
      if (s.type !== 'CASH_GAME' || !s.stakes) continue
      const cur = map.get(s.stakes) ?? { profit: 0, minutes: 0 }
      map.set(s.stakes, {
        profit: cur.profit + sessionProfit(s),
        minutes: cur.minutes + s.duration,
      })
    }
    return Array.from(map.entries())
      .map(([stake, { profit, minutes }]) => ({
        stake,
        profit,
        hours: minutes / 60,
        winRate: minutes > 0 ? profit / (minutes / 60) : 0,
      }))
      .sort((a, b) => a.stake.localeCompare(b.stake))
  })

  // ROI by tournament type
  const roiByTournamentType = computed<TournamentTypePoint[]>(() => {
    const types = ['MTT', 'SNG', 'SPIN'] as const
    return types.map(type => {
      const sessions = sortedSessions.value.filter(s => s.type === type)
      const profit = sessions.reduce((s, x) => s + sessionProfit(x), 0)
      const buyIn = sessions.reduce((s, x) => s + x.totalBuyIn, 0)
      return {
        type: type === 'SPIN' ? 'Spin & Go' : type,
        roi: buyIn > 0 ? (profit / buyIn) * 100 : 0,
        sessions: sessions.length,
        profit,
      }
    }).filter(d => d.sessions > 0)
  })

  // ITM donut data
  const itmDonut = computed(() => {
    const tournaments = sortedSessions.value.filter(s => s.type !== 'CASH_GAME')
    const itm = tournaments.filter(s => s.cashOut > 0).length
    const outOfMoney = tournaments.length - itm
    return { itm, outOfMoney, total: tournaments.length }
  })

  // Sessions by weekday
  const sessionsByWeekday = computed<WeekdayPoint[]>(() => {
    const map = new Map<number, { sessions: number; profit: number }>()
    for (let i = 0; i < 7; i++) map.set(i, { sessions: 0, profit: 0 })
    for (const s of sortedSessions.value) {
      const day = s.date.getDay()
      const cur = map.get(day)!
      map.set(day, { sessions: cur.sessions + 1, profit: cur.profit + sessionProfit(s) })
    }
    return Array.from(map.entries()).map(([dayIdx, data]) => ({
      day: WEEKDAYS[dayIdx],
      ...data,
    }))
  })

  return {
    profitByMonth,
    winRateByStake,
    roiByTournamentType,
    itmDonut,
    sessionsByWeekday,
  }
}