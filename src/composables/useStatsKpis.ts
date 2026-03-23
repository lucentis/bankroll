import { computed } from 'vue'
import { INITIAL_BANKROLL } from '@/data/mockData'
import { sessionProfit } from '@/utils/format'
import type { ComputedRef } from 'vue'
import type { Session } from '@/types/session'
import type { BarPoint } from '@/types/stats'

export function useStatsKpis(sortedSessions: ComputedRef<Session[]>, currentBankroll: ComputedRef<number>) {
  // Global
  const totalProfit = computed(() => currentBankroll.value - INITIAL_BANKROLL)
  const totalProfitPct = computed(() => (totalProfit.value / INITIAL_BANKROLL) * 100)
  const totalDurationMinutes = computed(() =>
    sortedSessions.value.reduce((s, x) => s + x.duration, 0),
  )
  const bestSessionProfit = computed(() =>
    Math.max(...sortedSessions.value.map(sessionProfit)),
  )
  const worstSessionProfit = computed(() =>
    Math.min(...sortedSessions.value.map(sessionProfit)),
  )
  const lastSessions = computed(() => [...sortedSessions.value].reverse().slice(0, 5))

  // Cash game
  const cashSessions = computed(() => sortedSessions.value.filter(s => s.type === 'CASH_GAME'))
  const cashProfit = computed(() => cashSessions.value.reduce((s, x) => s + sessionProfit(x), 0))
  const cashDurationHours = computed(
    () => cashSessions.value.reduce((s, x) => s + x.duration, 0) / 60,
  )
  // Winrate €/h
  const cashWinRate = computed(() =>
    cashDurationHours.value > 0 ? cashProfit.value / cashDurationHours.value : 0,
  )

  // Tournaments (MTT + SNG + SPIN)
  const tournamentSessions = computed(() => sortedSessions.value.filter(s => s.type !== 'CASH_GAME'))
  const tournamentProfit = computed(() =>
    tournamentSessions.value.reduce((s, x) => s + sessionProfit(x), 0),
  )
  const tournamentTotalBuyIn = computed(() =>
    tournamentSessions.value.reduce((s, x) => s + x.totalBuyIn, 0),
  )
  const tournamentROI = computed(() =>
    tournamentTotalBuyIn.value > 0
      ? (tournamentProfit.value / tournamentTotalBuyIn.value) * 100
      : 0,
  )
  const itmCount = computed(() => tournamentSessions.value.filter(s => s.cashOut > 0).length)
  const itmPct = computed(() =>
    tournamentSessions.value.length > 0
      ? (itmCount.value / tournamentSessions.value.length) * 100
      : 0,
  )

  // Bar chart data
  const barData = computed<BarPoint[]>(() => {
    const categories: { label: string; filter: (s: Session) => boolean }[] = [
      { label: 'Cash Live', filter: s => s.type === 'CASH_GAME' && s.venue === 'LIVE' },
      { label: 'Cash Online', filter: s => s.type === 'CASH_GAME' && s.venue === 'ONLINE' },
      { label: 'MTT', filter: s => s.type === 'MTT' },
      { label: 'SNG', filter: s => s.type === 'SNG' },
      { label: 'Spin', filter: s => s.type === 'SPIN' },
    ]
    return categories.map(({ label, filter }) => ({
      category: label,
      profit: sortedSessions.value.filter(filter).reduce((s, x) => s + sessionProfit(x), 0),
    }))
  })

  return {
    // Global
    totalProfit,
    totalProfitPct,
    totalDurationMinutes,
    bestSessionProfit,
    worstSessionProfit,
    lastSessions,
    // Cash game
    cashSessions,
    cashProfit,
    cashDurationHours,
    cashWinRate,
    // Tournaments
    tournamentSessions,
    tournamentProfit,
    tournamentTotalBuyIn,
    tournamentROI,
    itmCount,
    itmPct,
    // Chart
    barData,
  }
}