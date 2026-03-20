<script setup lang="ts">
import { VisXYContainer, VisGroupedBar, VisAxis, VisLine, VisArea, VisTooltip } from '@unovis/vue'
import { GroupedBar } from '@unovis/ts'
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
import type { MonthPoint, StakePoint, TournamentTypePoint, WeekdayPoint } from '@/composables/useStatsCharts'
import type { Period } from '@/types/stats'

const { sortedSessions } = useSessions()
const { selectedPeriod, chartData, currentBankroll } = useBankroll(sortedSessions)
const { totalProfit, totalProfitPct, totalDurationMinutes, cashWinRate, tournamentROI, itmPct } = useStats(sortedSessions, currentBankroll)
const { profitByMonth, winRateByStake, roiByTournamentType, itmDonut, sessionsByWeekday } = useStatsCharts(sortedSessions)

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const bankrollConfig = { bankroll: { label: 'Bankroll', color: '#0284c7' } } satisfies ChartConfig
const monthConfig = { profit: { label: 'Profit', color: '#d97706' } } satisfies ChartConfig
const stakeConfig = { winRate: { label: '€/h', color: '#d97706' } } satisfies ChartConfig
const roiConfig = { roi: { label: 'ROI %', color: '#d97706' } } satisfies ChartConfig
const weekdayConfig = { sessions: { label: 'Sessions', color: '#d97706' } } satisfies ChartConfig

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const barColorProfit = (d: MonthPoint) => d.profit >= 0 ? '#16a34a' : '#dc2626'
const barColorRoi = (d: TournamentTypePoint) => d.roi >= 0 ? '#16a34a' : '#dc2626'
const formatAxisEur = (d: number | Date) => `${Number(d)}€`
const formatAxisPct = (d: number | Date) => `${Number(d).toFixed(0)}%`
const formatAxisHr = (d: number | Date) => `${Number(d).toFixed(0)}€/h`

const tooltipStyle = 'background:#fff;border:1px solid #e7e5e4;border-radius:8px;padding:8px 12px;font-size:12px;font-family:inherit;box-shadow:0 2px 8px rgba(0,0,0,0.08)'
const tooltipLabel = (label: string, value: string) =>
  `<div style="${tooltipStyle}"><span style="color:#78716c">${label}</span><br/><b style="font-family:monospace">${value}</b></div>`

const monthTooltip = {
  [GroupedBar.selectors.bar]: (d: MonthPoint) =>
    tooltipLabel(d.month, `${d.profit >= 0 ? '+' : ''}${d.profit.toFixed(0)}€`),
}
const weekdayTooltip = {
  [GroupedBar.selectors.bar]: (d: WeekdayPoint) =>
    tooltipLabel(d.day, `${d.sessions} session${d.sessions > 1 ? 's' : ''}`),
}
const stakeTooltip = {
  [GroupedBar.selectors.bar]: (d: StakePoint) =>
    tooltipLabel(d.stake, `${d.winRate >= 0 ? '+' : ''}${d.winRate.toFixed(1)}€/h`),
}
const roiTooltip = {
  [GroupedBar.selectors.bar]: (d: TournamentTypePoint) =>
    tooltipLabel(d.type, `ROI ${d.roi >= 0 ? '+' : ''}${d.roi.toFixed(1)}%`),
}
</script>

<template>
  <div class="p-6 space-y-8">

    <h1 class="text-2xl font-bold tracking-tight text-stone-900">Statistiques</h1>

    <!-- ------------------------------------------------------------------ -->
    <!-- Summary KPIs                                                         -->
    <!-- ------------------------------------------------------------------ -->
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

    <!-- ------------------------------------------------------------------ -->
    <!-- Bankroll evolution                                                   -->
    <!-- ------------------------------------------------------------------ -->
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
            <ToggleGroupItem
              v-for="p in PERIODS"
              :key="p.value"
              :value="p.value"
              class="h-7 px-2.5 text-xs font-mono"
            >
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

    <!-- ------------------------------------------------------------------ -->
    <!-- Profit par mois  |  Sessions par jour                               -->
    <!-- ------------------------------------------------------------------ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <Card class="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle class="text-sm font-medium text-stone-500">Profit par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer :config="monthConfig" class="h-48 w-full">
            <VisXYContainer :data="profitByMonth">
              <VisGroupedBar
                :x="(_: MonthPoint, i: number) => i"
                :y="(d: MonthPoint) => d.profit"
                :color="(d: MonthPoint) => barColorProfit(d)"
                :rounded-corners="3"
                bar-padding="0.3"
              />
              <VisAxis type="x" :tick-format="(i: number | Date) => profitByMonth[Number(i)]?.month ?? ''" :tick-values="profitByMonth.map((_, i) => i)" :tick-line="false" :domain-line="false" :grid-line="false" />
              <VisAxis type="y" :tick-format="formatAxisEur" :tick-line="false" :domain-line="false" :grid-line="true" :num-ticks="4" />
              <VisTooltip :triggers="monthTooltip" />
            </VisXYContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card class="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle class="text-sm font-medium text-stone-500">Sessions par jour de la semaine</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer :config="weekdayConfig" class="h-48 w-full">
            <VisXYContainer :data="sessionsByWeekday">
              <VisGroupedBar
                :x="(_: WeekdayPoint, i: number) => i"
                :y="(d: WeekdayPoint) => d.sessions"
                :color="weekdayConfig.sessions.color"
                :rounded-corners="3"
                bar-padding="0.3"
              />
              <VisAxis type="x" :tick-format="(i: number | Date) => sessionsByWeekday[Number(i)]?.day ?? ''" :tick-values="sessionsByWeekday.map((_, i) => i)" :tick-line="false" :domain-line="false" :grid-line="false" />
              <VisAxis type="y" :tick-line="false" :domain-line="false" :grid-line="true" :num-ticks="4" />
              <VisTooltip :triggers="weekdayTooltip" />
            </VisXYContainer>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>

    <!-- ------------------------------------------------------------------ -->
    <!-- Cash Game                                                            -->
    <!-- ------------------------------------------------------------------ -->
    <div>
      <h2 class="text-base font-semibold text-stone-700 mb-4">Cash Game</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <Card class="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-stone-500">Winrate par stake (€/h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="winRateByStake.length === 0" class="flex items-center justify-center h-32 text-sm text-stone-300">
              Aucune donnée
            </div>
            <ChartContainer v-else :config="stakeConfig" class="h-48 w-full">
              <VisXYContainer :data="winRateByStake">
                <VisGroupedBar
                  :x="(_: StakePoint, i: number) => i"
                  :y="(d: StakePoint) => d.winRate"
                  :color="(d: StakePoint) => d.winRate >= 0 ? '#16a34a' : '#dc2626'"
                  :rounded-corners="3"
                  bar-padding="0.3"
                />
                <VisAxis type="x" :tick-format="(i: number | Date) => winRateByStake[Number(i)]?.stake ?? ''" :tick-values="winRateByStake.map((_, i) => i)" :tick-line="false" :domain-line="false" :grid-line="false" />
                <VisAxis type="y" :tick-format="formatAxisHr" :tick-line="false" :domain-line="false" :grid-line="true" :num-ticks="4" />
                <VisTooltip :triggers="stakeTooltip" />
              </VisXYContainer>
            </ChartContainer>
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
                <p class="text-sm font-semibold font-mono" :class="stake.profit >= 0 ? 'text-emerald-600' : 'text-red-500'">
                  {{ formatCurrency(stake.profit, true) }}
                </p>
                <p class="text-xs font-mono" :class="stake.winRate >= 0 ? 'text-emerald-500' : 'text-red-400'">
                  {{ formatCurrency(stake.winRate, true) }}/h
                </p>
              </div>
            </div>
            <div v-if="winRateByStake.length === 0" class="text-sm text-stone-300 text-center py-4">
              Aucune donnée
            </div>
          </CardContent>
        </Card>

      </div>
    </div>

    <!-- ------------------------------------------------------------------ -->
    <!-- Tournois                                                             -->
    <!-- ------------------------------------------------------------------ -->
    <div>
      <h2 class="text-base font-semibold text-stone-700 mb-4">Tournois</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <Card class="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-stone-500">ROI par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="roiByTournamentType.length === 0" class="flex items-center justify-center h-32 text-sm text-stone-300">
              Aucune donnée
            </div>
            <ChartContainer v-else :config="roiConfig" class="h-48 w-full">
              <VisXYContainer :data="roiByTournamentType">
                <VisGroupedBar
                  :x="(_: TournamentTypePoint, i: number) => i"
                  :y="(d: TournamentTypePoint) => d.roi"
                  :color="(d: TournamentTypePoint) => barColorRoi(d)"
                  :rounded-corners="3"
                  bar-padding="0.3"
                />
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
              <div
                class="h-full rounded-full bg-emerald-500 transition-all duration-500"
                :style="{ width: `${itmPct}%` }"
              />
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
                  <span class="text-sm font-semibold font-mono" :class="t.roi >= 0 ? 'text-emerald-600' : 'text-red-500'">
                    {{ t.roi >= 0 ? '+' : '' }}{{ t.roi.toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>

  </div>
</template>