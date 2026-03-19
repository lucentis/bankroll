import { ref, computed } from 'vue'
import { INITIAL_BANKROLL } from '@/data/mockData'
import { sessionProfit } from '@/utils/format'
import type { ComputedRef } from 'vue'
import type { Session } from '@/types/session'
import type { BankrollPoint, Period } from '@/types/stats'

export const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7j' },
  { value: '30d', label: '30j' },
  { value: '3m', label: '3m' },
  { value: '6m', label: '6m' },
  { value: 'all', label: 'Tout' },
]

export function useBankroll(sortedSessions: ComputedRef<Session[]>) {
  const selectedPeriod = ref<Period>('all')

  const allBankrollPoints = computed<BankrollPoint[]>(() => {
    let running = INITIAL_BANKROLL
    const points: BankrollPoint[] = [
      { date: sortedSessions.value[0]?.date ?? new Date(), bankroll: running },
    ]
    for (const session of sortedSessions.value) {
      running += sessionProfit(session)
      points.push({ date: session.date, bankroll: running })
    }
    return points
  })

  const periodStartDate = computed<Date | null>(() => {
    const now = new Date()
    const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000)
    switch (selectedPeriod.value) {
      case '7d': return daysAgo(7)
      case '30d': return daysAgo(30)
      case '3m': return daysAgo(90)
      case '6m': return daysAgo(180)
      default: return null
    }
  })

  // Starts the curve at the correct bankroll level for the selected period
  const chartData = computed<BankrollPoint[]>(() => {
    if (!periodStartDate.value) return allBankrollPoints.value

    const startPoint = allBankrollPoints.value
      .filter(p => p.date < periodStartDate.value!)
      .at(-1)
    const startBankroll = startPoint?.bankroll ?? INITIAL_BANKROLL
    const inPeriod = allBankrollPoints.value.filter(p => p.date >= periodStartDate.value!)

    return [{ date: periodStartDate.value, bankroll: startBankroll }, ...inPeriod]
  })

  const currentBankroll = computed(
    () => allBankrollPoints.value.at(-1)?.bankroll ?? INITIAL_BANKROLL,
  )

  return { selectedPeriod, chartData, currentBankroll }
}