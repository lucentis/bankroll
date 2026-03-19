<script setup lang="ts">
import { ref, computed } from 'vue'
import { VisXYContainer, VisLine, VisArea, VisAxis, VisGroupedBar } from '@unovis/vue'
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
  type ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { mockSessions, INITIAL_BANKROLL, type MockSession } from '@/data/mockData'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Period = '7d' | '30d' | '3m' | '6m' | 'all'

interface BankrollPoint {
  date: Date
  bankroll: number
}

interface BarPoint {
  category: string
  profit: number
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const selectedPeriod = ref<Period>('all')

const periods: { value: Period; label: string }[] = [
  { value: '7d', label: '7j' },
  { value: '30d', label: '30j' },
  { value: '3m', label: '3m' },
  { value: '6m', label: '6m' },
  { value: 'all', label: 'Tout' },
]

// ---------------------------------------------------------------------------
// Derived data
// ---------------------------------------------------------------------------

const sortedSessions = computed(() =>
  [...mockSessions].sort((a, b) => a.date.getTime() - b.date.getTime()),
)

// Full running bankroll series — one point per session
const allBankrollPoints = computed<BankrollPoint[]>(() => {
  let running = INITIAL_BANKROLL
  const points: BankrollPoint[] = [{ date: sortedSessions.value[0]?.date ?? new Date(), bankroll: running }]
  for (const session of sortedSessions.value) {
    running += session.cashOut - session.totalBuyIn
    points.push({ date: session.date, bankroll: running })
  }
  return points
})

const periodStartDate = computed<Date | null>(() => {
  const now = new Date()
  const ms = (days: number) => new Date(now.getTime() - days * 86_400_000)
  switch (selectedPeriod.value) {
    case '7d': return ms(7)
    case '30d': return ms(30)
    case '3m': return ms(90)
    case '6m': return ms(180)
    default: return null
  }
})

// Chart data filtered to selected period, starting from the correct bankroll level
const chartData = computed<BankrollPoint[]>(() => {
  if (!periodStartDate.value) return allBankrollPoints.value

  const startPoint = allBankrollPoints.value
    .filter(p => p.date < periodStartDate.value!)
    .at(-1)
  const startBankroll = startPoint?.bankroll ?? INITIAL_BANKROLL
  const inPeriod = allBankrollPoints.value.filter(p => p.date >= periodStartDate.value!)

  return [{ date: periodStartDate.value, bankroll: startBankroll }, ...inPeriod]
})

// ---------------------------------------------------------------------------
// Global stats
// ---------------------------------------------------------------------------

const currentBankroll = computed(() => allBankrollPoints.value.at(-1)?.bankroll ?? INITIAL_BANKROLL)
const totalProfit = computed(() => currentBankroll.value - INITIAL_BANKROLL)
const totalProfitPct = computed(() => (totalProfit.value / INITIAL_BANKROLL) * 100)

const totalDurationMinutes = computed(() => sortedSessions.value.reduce((s, x) => s + x.duration, 0))

const bestSessionProfit = computed(() =>
  Math.max(...sortedSessions.value.map(s => s.cashOut - s.totalBuyIn)),
)

const worstSessionProfit = computed(() =>
  Math.min(...sortedSessions.value.map(s => s.cashOut - s.totalBuyIn)),
)

// ---------------------------------------------------------------------------
// Cash game stats
// ---------------------------------------------------------------------------

const cashSessions = computed(() => sortedSessions.value.filter(s => s.type === 'CASH_GAME'))

const cashProfit = computed(() =>
  cashSessions.value.reduce((s, x) => s + x.cashOut - x.totalBuyIn, 0),
)

const cashDurationHours = computed(() =>
  cashSessions.value.reduce((s, x) => s + x.duration, 0) / 60,
)

// Winrate in €/h — only meaningful with played hours
const cashWinRate = computed(() =>
  cashDurationHours.value > 0 ? cashProfit.value / cashDurationHours.value : 0,
)

// ---------------------------------------------------------------------------
// Tournament stats (MTT + SNG + SPIN)
// ---------------------------------------------------------------------------

const tournamentSessions = computed(() => sortedSessions.value.filter(s => s.type !== 'CASH_GAME'))

const tournamentProfit = computed(() =>
  tournamentSessions.value.reduce((s, x) => s + x.cashOut - x.totalBuyIn, 0),
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

// ---------------------------------------------------------------------------
// Last 5 sessions
// ---------------------------------------------------------------------------

const lastSessions = computed(() => [...sortedSessions.value].reverse().slice(0, 5))

// ---------------------------------------------------------------------------
// Bar chart — profit by session category
// ---------------------------------------------------------------------------

const barData = computed<BarPoint[]>(() => {
  const categories: { label: string; filter: (s: MockSession) => boolean }[] = [
    { label: 'Cash Live', filter: s => s.type === 'CASH_GAME' && s.venue === 'LIVE' },
    { label: 'Cash Online', filter: s => s.type === 'CASH_GAME' && s.venue === 'ONLINE' },
    { label: 'MTT', filter: s => s.type === 'MTT' },
    { label: 'SNG', filter: s => s.type === 'SNG' },
    { label: 'Spin', filter: s => s.type === 'SPIN' },
  ]
  return categories.map(({ label, filter }) => ({
    category: label,
    profit: sortedSessions.value.filter(filter).reduce((s, x) => s + x.cashOut - x.totalBuyIn, 0),
  }))
})

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const bankrollChartConfig = {
  bankroll: { label: 'Bankroll', color: '#0f766e' },
} satisfies ChartConfig

const barChartConfig = {
  profit: { label: 'Profit', color: '#0f766e' },
} satisfies ChartConfig

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (value: number, showSign = false): string => {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(0)}€`
}

const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}m` : `${h}h`
}

const sessionProfit = (s: MockSession): number => s.cashOut - s.totalBuyIn

const sessionTypeLabel = (s: MockSession): string => {
  const types: Record<string, string> = { CASH_GAME: 'Cash', MTT: 'MTT', SNG: 'SNG', SPIN: 'Spin' }
  return `${types[s.type]} ${s.venue === 'LIVE' ? 'Live' : 'Online'}`
}

const formatAxisDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

const formatAxisEur = (value: number): string => `${value}€`

const barColor = (d: BarPoint): string => (d.profit >= 0 ? '#16a34a' : '#dc2626')
</script>

<template>
  <div class="min-h-screen bg-stone-50 p-6 space-y-5 font-sans">

    <!-- ------------------------------------------------------------------ -->
    <!-- Header — bankroll + variation                                        -->
    <!-- ------------------------------------------------------------------ -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div>
        <p class="text-xs font-medium uppercase tracking-widest text-stone-400 mb-1">Bankroll</p>
        <div class="flex items-end gap-3">
          <span class="text-5xl font-bold tracking-tight text-stone-900 font-mono">
            {{ formatCurrency(currentBankroll) }}
          </span>
          <Badge
            :class="[
              'mb-1 text-sm font-mono font-semibold px-2 py-0.5',
              totalProfit >= 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-600 border border-red-200',
            ]"
            variant="outline"
          >
            {{ formatCurrency(totalProfit, true) }}
            ({{ totalProfitPct >= 0 ? '+' : '' }}{{ totalProfitPct.toFixed(1) }}%)
          </Badge>
        </div>
        <p class="text-xs text-stone-400 mt-1">
          Mise de départ : {{ formatCurrency(INITIAL_BANKROLL) }} ·
          {{ sortedSessions.length }} sessions · {{ formatDuration(totalDurationMinutes) }} jouées
        </p>
      </div>

      <p class="text-xs text-stone-400">
        {{ new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
      </p>
    </div>

    <!-- ------------------------------------------------------------------ -->
    <!-- Main section — chart + quick stats                                  -->
    <!-- ------------------------------------------------------------------ -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

      <!-- Bankroll chart -->
      <Card class="lg:col-span-2 border-stone-200 shadow-sm">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <CardTitle class="text-sm font-medium text-stone-500">Évolution bankroll</CardTitle>
            <ToggleGroup
              type="single"
              :model-value="selectedPeriod"
              @update:model-value="(v) => { if (v) selectedPeriod = v as Period }"
              class="h-7"
            >
              <ToggleGroupItem
                v-for="p in periods"
                :key="p.value"
                :value="p.value"
                class="h-7 px-2.5 text-xs font-mono"
              >
                {{ p.label }}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent class="pt-0">
          <ChartContainer :config="bankrollChartConfig" class="h-56 w-full">
            <VisXYContainer :data="chartData">
              <VisArea
                :x="(d: BankrollPoint) => d.date.getTime()"
                :y="(d: BankrollPoint) => d.bankroll"
                :color="bankrollChartConfig.bankroll.color"
                :opacity="0.12"
              />
              <VisLine
                :x="(d: BankrollPoint) => d.date.getTime()"
                :y="(d: BankrollPoint) => d.bankroll"
                :color="bankrollChartConfig.bankroll.color"
                :line-width="2"
              />
              <VisAxis
                type="x"
                :tick-format="(d: number) => formatAxisDate(d)"
                :tick-line="false"
                :domain-line="false"
                :grid-line="false"
                :num-ticks="5"
              />
              <VisAxis
                type="y"
                :tick-format="(d: number) => formatAxisEur(d)"
                :tick-line="false"
                :domain-line="false"
                :grid-line="true"
                :num-ticks="4"
              />
              <ChartTooltip />
              <ChartCrosshair
                :template="componentToString(bankrollChartConfig, ChartTooltipContent, {
                  labelFormatter: (d: number) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }),
                  indicator: 'line',
                })"
                :color="bankrollChartConfig.bankroll.color"
              />
            </VisXYContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <!-- Quick stats — 2x2 grid -->
      <div class="grid grid-cols-2 gap-3">
        <Card class="border-stone-200 shadow-sm">
          <CardContent class="p-4">
            <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Sessions</p>
            <p class="text-2xl font-bold font-mono text-stone-900">{{ sortedSessions.length }}</p>
            <p class="text-xs text-stone-400 mt-0.5">{{ formatDuration(totalDurationMinutes) }}</p>
          </CardContent>
        </Card>
        <Card class="border-stone-200 shadow-sm">
          <CardContent class="p-4">
            <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Meilleure</p>
            <p class="text-2xl font-bold font-mono text-emerald-600">{{ formatCurrency(bestSessionProfit, true) }}</p>
          </CardContent>
        </Card>
        <Card class="border-stone-200 shadow-sm">
          <CardContent class="p-4">
            <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Pire</p>
            <p class="text-2xl font-bold font-mono text-red-500">{{ formatCurrency(worstSessionProfit) }}</p>
          </CardContent>
        </Card>
        <Card class="border-stone-200 shadow-sm">
          <CardContent class="p-4">
            <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Profit</p>
            <p
              class="text-2xl font-bold font-mono"
              :class="totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'"
            >
              {{ formatCurrency(totalProfit, true) }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- ------------------------------------------------------------------ -->
    <!-- Stats séparées — Cash Game | Tournois                               -->
    <!-- ------------------------------------------------------------------ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <!-- Cash Game -->
      <Card class="border-stone-200 shadow-sm">
        <CardHeader class="px-4">
          <div class="flex items-center justify-between">
            <CardTitle class="text-sm font-medium text-stone-500">Cash Game</CardTitle>
            <Badge variant="outline" class="text-xs font-mono border-stone-200 text-stone-500">
              {{ cashSessions.length }} sessions
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="px-4 space-y-2">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-stone-400 mb-0.5">Profit</p>
              <p
                class="text-xl font-bold font-mono"
                :class="cashProfit >= 0 ? 'text-emerald-600' : 'text-red-500'"
              >
                {{ formatCurrency(cashProfit, true) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-stone-400 mb-0.5">Winrate</p>
              <p
                class="text-xl font-bold font-mono"
                :class="cashWinRate >= 0 ? 'text-emerald-600' : 'text-red-500'"
              >
                {{ formatCurrency(cashWinRate, true) }}<span class="text-sm font-normal text-stone-400">/h</span>
              </p>
            </div>
          </div>
          <Separator class="bg-stone-100" />
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-stone-400 mb-0.5">Heures jouées</p>
              <p class="text-sm font-semibold font-mono text-stone-700">{{ cashDurationHours.toFixed(1) }}h</p>
            </div>
            <div>
              <p class="text-xs text-stone-400 mb-0.5">Stakes live</p>
              <p class="text-sm font-semibold font-mono text-stone-700">1/2 — 2/5</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Tournois -->
      <Card class="border-stone-200 shadow-sm">
        <CardHeader class="px-4">
          <div class="flex items-center justify-between">
            <CardTitle class="text-sm font-medium text-stone-500">Tournois</CardTitle>
            <Badge variant="outline" class="text-xs font-mono border-stone-200 text-stone-500">
              {{ tournamentSessions.length }} sessions
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="px-4 space-y-2">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-stone-400 mb-0.5">Profit</p>
              <p
                class="text-xl font-bold font-mono"
                :class="tournamentProfit >= 0 ? 'text-emerald-600' : 'text-red-500'"
              >
                {{ formatCurrency(tournamentProfit, true) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-stone-400 mb-0.5">ROI</p>
              <p
                class="text-xl font-bold font-mono"
                :class="tournamentROI >= 0 ? 'text-emerald-600' : 'text-red-500'"
              >
                {{ tournamentROI >= 0 ? '+' : '' }}{{ tournamentROI.toFixed(1) }}%
              </p>
            </div>
          </div>
          <Separator class="bg-stone-100" />
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-stone-400 mb-0.5">ITM</p>
              <p class="text-sm font-semibold font-mono text-stone-700">
                {{ itmPct.toFixed(0) }}%
                <span class="text-stone-400 font-normal">({{ itmCount }}/{{ tournamentSessions.length }})</span>
              </p>
            </div>
            <div>
              <p class="text-xs text-stone-400 mb-0.5">Investissement</p>
              <p class="text-sm font-semibold font-mono text-stone-700">{{ formatCurrency(tournamentTotalBuyIn) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- ------------------------------------------------------------------ -->
    <!-- Bottom — dernières sessions | répartition par type                  -->
    <!-- ------------------------------------------------------------------ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <!-- Last 5 sessions -->
      <Card class="border-stone-200 shadow-sm">
        <CardHeader class="px-4">
          <CardTitle class="text-sm font-medium text-stone-500">Dernières sessions</CardTitle>
        </CardHeader>
        <CardContent class="px-4">
          <div>
            <div
              v-for="session in lastSessions"
              :key="session.id"
              class="flex items-center justify-between py-2 border-b border-stone-50 last:border-0"
            >
              <div class="flex items-center gap-3">
                <div class="w-1 h-5 rounded-full flex-shrink-0"
                  :class="sessionProfit(session) >= 0 ? 'bg-emerald-500' : 'bg-red-400'"
                />
                <div>
                  <p class="text-sm font-medium text-stone-800 leading-tight">
                    {{ sessionTypeLabel(session) }}
                  </p>
                  <p class="text-xs text-stone-400">
                    {{ session.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) }}
                    · {{ session.location }}
                  </p>
                </div>
              </div>
              <span
                class="text-sm font-semibold font-mono"
                :class="sessionProfit(session) >= 0 ? 'text-emerald-600' : 'text-red-500'"
              >
                {{ formatCurrency(sessionProfit(session), true) }}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Profit by type bar chart -->
      <Card class="border-stone-200 shadow-sm">
        <CardHeader class="px-4">
          <CardTitle class="text-sm font-medium text-stone-500">Profit par catégorie</CardTitle>
        </CardHeader>
        <CardContent class="px-4">
          <ChartContainer :config="barChartConfig" class="h-52 w-full">
            <VisXYContainer :data="barData">
              <VisGroupedBar
                :x="(_: BarPoint, i: number) => i"
                :y="(d: BarPoint) => d.profit"
                :color="(d: BarPoint) => barColor(d)"
                :rounded-corners="3"
                bar-padding="0.3"
              />
              <VisAxis
                type="x"
                :tick-format="(i: number) => barData[i]?.category ?? ''"
                :tick-values="barData.map((_, i) => i)"
                :tick-line="false"
                :domain-line="false"
                :grid-line="false"
              />
              <VisAxis
                type="y"
                :tick-format="(d: number) => formatAxisEur(d)"
                :tick-line="false"
                :domain-line="false"
                :grid-line="true"
                :num-ticks="4"
              />
            </VisXYContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>

  </div>
</template>