<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisGroupedBar, VisAxis, VisLine, VisArea, VisTooltip, VisSingleContainer, VisDonut, VisBulletLegend } from '@unovis/vue'
import { GroupedBar, Donut } from '@unovis/ts'
import {
  ChartContainer, ChartTooltip, ChartCrosshair,
  ChartTooltipContent, componentToString, type ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessions } from '@/composables/useSessions'
import { useBankroll, PERIODS } from '@/composables/useBankroll'
import { useStats } from '@/composables/useStats'
import { useStatsCharts } from '@/composables/useStatsCharts'
import { formatCurrency, formatDuration } from '@/utils/format'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { BankrollPoint } from '@/types/stats'
import type { MonthPoint, StakePoint, TournamentTypePoint, DonutSlice, StakeVenuePoint } from '@/composables/useStatsCharts'
import type { Period } from '@/types/stats'

const { sortedSessions } = useSessions()
const { selectedPeriod, chartData, currentBankroll } = useBankroll(sortedSessions)
const { totalProfit, totalProfitPct, totalDurationMinutes, cashWinRate, tournamentROI, itmPct } = useStats(sortedSessions, currentBankroll)
const { profitByMonth, winRateByStake, roiByTournamentType, itmDonut, sessionsByType, sessionsByVenue, profitByStakeAndVenue } = useStatsCharts(sortedSessions)

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const bankrollConfig = { bankroll: { label: 'Bankroll', color: '#0284c7' } } satisfies ChartConfig
const monthConfig = {
  profit: { label: 'Total', color: '#64748b' },
  cash: { label: 'Cash Game', color: '#0284c7' },
  tournament: { label: 'Tournois', color: '#d97706' },
} satisfies ChartConfig
const stakeConfig = { winRate: { label: '€/h', color: '#d97706' } } satisfies ChartConfig
const roiConfig = { roi: { label: 'ROI %', color: '#d97706' } } satisfies ChartConfig
const stakeVenueConfig = {
  live: { label: 'Live', color: '#d97706' },
  online: { label: 'Online', color: '#0284c7' },
} satisfies ChartConfig

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const barColorRoi = (d: TournamentTypePoint) => d.roi >= 0 ? '#16a34a' : '#dc2626'
const formatAxisEur = (d: number | Date) => `${Number(d)}€`
const formatAxisPct = (d: number | Date) => `${Number(d).toFixed(0)}%`
const formatAxisHr = (d: number | Date) => `${Number(d).toFixed(0)}€/h`

const tooltipStyle = 'background:#fff;border:1px solid #e7e5e4;border-radius:8px;padding:8px 12px;font-size:12px;font-family:inherit;box-shadow:0 2px 8px rgba(0,0,0,0.08)'
const tooltipLabel = (label: string, value: string) =>
  `<div style="${tooltipStyle}"><span style="color:#78716c">${label}</span><br/><b style="font-family:monospace">${value}</b></div>`

const fmtEur = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(0)}€`

const monthTooltip = {
  [GroupedBar.selectors.bar]: (d: MonthPoint) =>
    `<div style="${tooltipStyle}">
      <span style="color:#78716c;font-weight:500">${d.month}</span>
      <div style="margin-top:6px;display:flex;flex-direction:column;gap:3px">
        <div style="display:flex;justify-content:space-between;gap:16px">
          <span style="display:flex;align-items:center;gap:5px;color:#78716c">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#64748b"></span>Total
          </span>
          <b style="font-family:monospace;color:${d.profit >= 0 ? '#16a34a' : '#dc2626'}">${fmtEur(d.profit)}</b>
        </div>
        <div style="display:flex;justify-content:space-between;gap:16px">
          <span style="display:flex;align-items:center;gap:5px;color:#78716c">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#0284c7"></span>Cash Game
          </span>
          <b style="font-family:monospace;color:${d.cash >= 0 ? '#16a34a' : '#dc2626'}">${fmtEur(d.cash)}</b>
        </div>
        <div style="display:flex;justify-content:space-between;gap:16px">
          <span style="display:flex;align-items:center;gap:5px;color:#78716c">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#d97706"></span>Tournois
          </span>
          <b style="font-family:monospace;color:${d.tournament >= 0 ? '#16a34a' : '#dc2626'}">${fmtEur(d.tournament)}</b>
        </div>
      </div>
    </div>`,
}
const stakeTooltip = {
  [GroupedBar.selectors.bar]: (d: StakePoint) =>
    tooltipLabel(d.stake, `${d.winRate >= 0 ? '+' : ''}${d.winRate.toFixed(1)}€/h`),
}
const stakeVenueTooltip = {
  [GroupedBar.selectors.bar]: (d: StakeVenuePoint) =>
    `<div style="${tooltipStyle}">
      <span style="color:#78716c;font-weight:500">${d.stake}</span>
      <div style="margin-top:6px;display:flex;flex-direction:column;gap:3px">
        <div style="display:flex;justify-content:space-between;gap:16px">
          <span style="display:flex;align-items:center;gap:5px;color:#78716c">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#d97706"></span>Live
          </span>
          <b style="font-family:monospace;color:${d.live >= 0 ? '#16a34a' : '#dc2626'}">${d.live >= 0 ? '+' : ''}${d.live.toFixed(0)}€</b>
        </div>
        <div style="display:flex;justify-content:space-between;gap:16px">
          <span style="display:flex;align-items:center;gap:5px;color:#78716c">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#0284c7"></span>Online
          </span>
          <b style="font-family:monospace;color:${d.online >= 0 ? '#16a34a' : '#dc2626'}">${d.online >= 0 ? '+' : ''}${d.online.toFixed(0)}€</b>
        </div>
      </div>
    </div>`,
}
const roiTooltip = {
  [GroupedBar.selectors.bar]: (d: TournamentTypePoint) =>
    tooltipLabel(d.type, `ROI ${d.roi >= 0 ? '+' : ''}${d.roi.toFixed(1)}%`),
}

const typeLegendItems = computed(() =>
  sessionsByType.value.map(s => ({ name: s.label, color: s.color })),
)
const venueLegendItems = computed(() =>
  sessionsByVenue.value.map(s => ({
    name: `${s.label} (${sortedSessions.value.length > 0 ? ((s.value / sortedSessions.value.length) * 100).toFixed(0) : 0}%)`,
    color: s.color,
  })),
)
const monthLegendItems = [
  { name: monthConfig.profit.label, color: monthConfig.profit.color },
  { name: monthConfig.cash.label, color: monthConfig.cash.color },
  { name: monthConfig.tournament.label, color: monthConfig.tournament.color },
]
</script>

<template>
  <div class="p-6 space-y-8">

    <h1 class="text-2xl font-bold tracking-tight text-stone-900">Statistiques</h1>

    <!-- Summary KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card class="border-stone-200 shadow-sm">
        <CardContent>
          <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Profit total</p>
          <p class="text-2xl font-bold font-mono" :class="totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'">
            {{ formatCurrency(totalProfit, true) }}
          </p>
          <p class="text-xs text-stone-400 mt-0.5">{{ totalProfitPct >= 0 ? '+' : '' }}{{ totalProfitPct.toFixed(1) }}%</p>
        </CardContent>
      </Card>
      <Card class="border-stone-200 shadow-sm">
        <CardContent>
          <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Sessions</p>
          <p class="text-2xl font-bold font-mono text-stone-800">{{ sortedSessions.length }}</p>
          <p class="text-xs text-stone-400 mt-0.5">{{ formatDuration(totalDurationMinutes) }}</p>
        </CardContent>
      </Card>
      <Card class="border-stone-200 shadow-sm">
        <CardContent>
          <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Winrate cash</p>
          <p class="text-2xl font-bold font-mono" :class="cashWinRate >= 0 ? 'text-emerald-600' : 'text-red-500'">
            {{ formatCurrency(cashWinRate, true) }}<span class="text-sm font-normal text-stone-400">/h</span>
          </p>
        </CardContent>
      </Card>
      <Card class="border-stone-200 shadow-sm">
        <CardContent>
          <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">ROI tournois</p>
          <p class="text-2xl font-bold font-mono" :class="tournamentROI >= 0 ? 'text-emerald-600' : 'text-red-500'">
            {{ tournamentROI >= 0 ? '+' : '' }}{{ tournamentROI.toFixed(1) }}%
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Bankroll evolution -->
    <Card class="border-stone-200 shadow-sm">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-sm font-medium text-stone-500">Évolution bankroll</CardTitle>
          <ToggleGroup
            type="single"
            :model-value="selectedPeriod"
            @update:model-value="(v) => { if (v) selectedPeriod = v as Period }"
            class="h-7"
          >
            <ToggleGroupItem v-for="p in PERIODS" :key="p.value" :value="p.value" class="h-7 px-2.5 text-xs font-mono">
              {{ p.label }}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer :config="bankrollConfig" class="h-56 w-full">
          <VisXYContainer :data="chartData">
            <VisArea :x="(d: BankrollPoint) => d.date.getTime()" :y="(d: BankrollPoint) => d.bankroll" :color="bankrollConfig.bankroll.color" :opacity="0.12" />
            <VisLine :x="(d: BankrollPoint) => d.date.getTime()" :y="(d: BankrollPoint) => d.bankroll" :color="bankrollConfig.bankroll.color" :line-width="2" />
            <VisAxis type="x" :tick-format="(d: number | Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })" :tick-line="false" :domain-line="false" :grid-line="false" :num-ticks="5" />
            <VisAxis type="y" :tick-format="formatAxisEur" :tick-line="false" :domain-line="false" :grid-line="true" :num-ticks="4" />
            <ChartTooltip />
            <ChartCrosshair
              :template="componentToString(bankrollConfig, ChartTooltipContent, { labelFormatter: (d: number | Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }), indicator: 'line' })"
              :color="bankrollConfig.bankroll.color"
            />
          </VisXYContainer>
        </ChartContainer>
      </CardContent>
    </Card>

    <!-- Profit by month | Session breakdown -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <Card class="border-stone-200 shadow-sm">
        <CardHeader>
          <div class="flex items-center justify-between flex-wrap gap-2">
            <CardTitle class="text-sm font-medium text-stone-500">Profit par mois</CardTitle>
            <div class="flex items-center gap-3">
              <span v-for="item in monthLegendItems" :key="item.name" class="flex items-center gap-1.5 text-xs text-stone-500">
                <span class="w-2.5 h-2.5 rounded-sm inline-block" :style="{ background: item.color }" />
                {{ item.name }}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer :config="monthConfig" class="h-48 w-full">
            <VisXYContainer :data="profitByMonth">
              <VisGroupedBar
                :x="(_: MonthPoint, i: number) => i"
                :y="[(d: MonthPoint) => d.profit, (d: MonthPoint) => d.cash, (d: MonthPoint) => d.tournament]"
                :color="[monthConfig.profit.color, monthConfig.cash.color, monthConfig.tournament.color]"
                :rounded-corners="2"
                bar-padding="0.05"
                group-padding="0.3"
              />
              <VisAxis type="x" :tick-format="(i: number | Date) => profitByMonth[Number(i)]?.month ?? ''" :tick-values="profitByMonth.map((_, i) => i)" :tick-line="false" :domain-line="false" :grid-line="false" />
              <VisAxis type="y" :tick-format="formatAxisEur" :tick-line="false" :domain-line="false" :grid-line="true" :num-ticks="4" />
              <VisTooltip :triggers="monthTooltip" />
            </VisXYContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div class="grid grid-cols-2 gap-5">
        <Card class="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-stone-500">Sessions par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col items-center gap-3">
              <VisSingleContainer :data="sessionsByType" class="h-36 w-36">
                <VisDonut :value="(d: DonutSlice) => d.value" :color="(d: DonutSlice) => d.color" :arc-width="26" :central-label="`${sortedSessions.length}`" central-sub-label="sessions" />
                <VisTooltip :triggers="{ [Donut.selectors.segment]: (d: any) => { const s: DonutSlice = d?.data ?? d; return tooltipLabel(s.label, `${s.value} (${sortedSessions.length > 0 ? ((s.value / sortedSessions.length) * 100).toFixed(0) : 0}%)`) } }" />
              </VisSingleContainer>
              <VisBulletLegend :items="typeLegendItems" />
            </div>
          </CardContent>
        </Card>

        <Card class="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-stone-500">Live vs Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col items-center gap-3">
              <VisSingleContainer :data="sessionsByVenue" class="h-36 w-36">
                <VisDonut :value="(d: DonutSlice) => d.value" :color="(d: DonutSlice) => d.color" :arc-width="26" />
              </VisSingleContainer>
              <VisBulletLegend :items="venueLegendItems" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Cash Game -->
    <div>
      <h2 class="text-base font-semibold text-stone-700 mb-4">Cash Game</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">

        <Card class="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-stone-500">Winrate par stake (€/h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="winRateByStake.length === 0" class="flex items-center justify-center h-32 text-sm text-stone-300">Aucune donnée</div>
            <ChartContainer v-else :config="stakeConfig" class="h-48 w-full">
              <VisXYContainer :data="winRateByStake">
                <VisGroupedBar :x="(_: StakePoint, i: number) => i" :y="(d: StakePoint) => d.winRate" :color="(d: StakePoint) => d.winRate >= 0 ? '#16a34a' : '#dc2626'" :rounded-corners="3" bar-padding="0.3" />
                <VisAxis type="x" :tick-format="(i: number | Date) => winRateByStake[Number(i)]?.stake ?? ''" :tick-values="winRateByStake.map((_, i) => i)" :tick-line="false" :domain-line="false" :grid-line="false" />
                <VisAxis type="y" :tick-format="formatAxisHr" :tick-line="false" :domain-line="false" :grid-line="true" :num-ticks="4" />
                <VisTooltip :triggers="stakeTooltip" />
              </VisXYContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card class="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-stone-500">Profit Live vs Online par stake</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer :config="stakeVenueConfig" class="h-48 w-full">
              <VisXYContainer :data="profitByStakeAndVenue">
                <VisGroupedBar :x="(_: StakeVenuePoint, i: number) => i" :y="[(d: StakeVenuePoint) => d.live, (d: StakeVenuePoint) => d.online]" :color="[stakeVenueConfig.live.color, stakeVenueConfig.online.color]" :rounded-corners="3" bar-padding="0.1" group-padding="0.3" />
                <VisAxis type="x" :tick-format="(i: number | Date) => profitByStakeAndVenue[Number(i)]?.stake ?? ''" :tick-values="profitByStakeAndVenue.map((_, i) => i)" :tick-line="false" :domain-line="false" :grid-line="false" />
                <VisAxis type="y" :tick-format="formatAxisEur" :tick-line="false" :domain-line="false" :grid-line="true" :num-ticks="4" />
                <VisTooltip :triggers="stakeVenueTooltip" />
              </VisXYContainer>
            </ChartContainer>
            <div class="flex items-center gap-4 mt-2 justify-center">
              <span class="flex items-center gap-1.5 text-xs text-stone-500"><span class="w-3 h-3 rounded-sm inline-block" :style="{ background: stakeVenueConfig.live.color }"></span>Live</span>
              <span class="flex items-center gap-1.5 text-xs text-stone-500"><span class="w-3 h-3 rounded-sm inline-block" :style="{ background: stakeVenueConfig.online.color }"></span>Online</span>
            </div>
          </CardContent>
        </Card>

        <Card class="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-stone-500">Récapitulatif cash game</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-for="stake in winRateByStake" :key="stake.stake" class="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
              <div>
                <p class="text-sm font-semibold font-mono text-stone-700">{{ stake.stake }}</p>
                <p class="text-xs text-stone-400">{{ stake.hours.toFixed(1) }}h jouées</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold font-mono" :class="stake.profit >= 0 ? 'text-emerald-600' : 'text-red-500'">{{ formatCurrency(stake.profit, true) }}</p>
                <p class="text-xs font-mono" :class="stake.winRate >= 0 ? 'text-emerald-500' : 'text-red-400'">{{ formatCurrency(stake.winRate, true) }}/h</p>
              </div>
            </div>
            <div v-if="winRateByStake.length === 0" class="text-sm text-stone-300 text-center py-4">Aucune donnée</div>
          </CardContent>
        </Card>

      </div>
    </div>

    <!-- Tournaments -->
    <div>
      <h2 class="text-base font-semibold text-stone-700 mb-4">Tournois</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <Card class="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-stone-500">ROI par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="roiByTournamentType.length === 0" class="flex items-center justify-center h-32 text-sm text-stone-300">Aucune donnée</div>
            <ChartContainer v-else :config="roiConfig" class="h-48 w-full">
              <VisXYContainer :data="roiByTournamentType">
                <VisGroupedBar :x="(_: TournamentTypePoint, i: number) => i" :y="(d: TournamentTypePoint) => d.roi" :color="(d: TournamentTypePoint) => barColorRoi(d)" :rounded-corners="3" bar-padding="0.3" />
                <VisAxis type="x" :tick-format="(i: number | Date) => roiByTournamentType[Number(i)]?.type ?? ''" :tick-values="roiByTournamentType.map((_, i) => i)" :tick-line="false" :domain-line="false" :grid-line="false" />
                <VisAxis type="y" :tick-format="formatAxisPct" :tick-line="false" :domain-line="false" :grid-line="true" :num-ticks="4" />
                <VisTooltip :triggers="roiTooltip" />
              </VisXYContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card class="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-stone-500">ITM — In The Money</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-end gap-3">
              <span class="text-4xl font-bold font-mono text-stone-800">{{ itmPct.toFixed(0) }}%</span>
              <span class="text-sm text-stone-400 mb-1">ITM</span>
            </div>
            <div class="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
              <div class="h-full rounded-full bg-emerald-500 transition-all duration-500" :style="{ width: `${itmPct}%` }" />
            </div>
            <div class="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p class="text-xs text-stone-400 mb-0.5">Dans l'argent</p>
                <p class="text-lg font-bold font-mono text-emerald-600">{{ itmDonut.itm }}</p>
              </div>
              <div>
                <p class="text-xs text-stone-400 mb-0.5">Éliminé</p>
                <p class="text-lg font-bold font-mono text-stone-500">{{ itmDonut.outOfMoney }}</p>
              </div>
            </div>
            <div class="space-y-2 pt-1">
              <div v-for="t in roiByTournamentType" :key="t.type" class="flex items-center justify-between">
                <span class="text-sm text-stone-500">{{ t.type }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-xs text-stone-400">{{ t.sessions }} sessions</span>
                  <span class="text-sm font-semibold font-mono" :class="t.roi >= 0 ? 'text-emerald-600' : 'text-red-500'">{{ t.roi >= 0 ? '+' : '' }}{{ t.roi.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>

  </div>
</template>