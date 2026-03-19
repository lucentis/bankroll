<script setup lang="ts">
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
import { INITIAL_BANKROLL } from '@/data/mockData'
import { useSessions } from '@/composables/useSessions'
import { useBankroll, PERIODS } from '@/composables/useBankroll'
import { useStats } from '@/composables/useStats'
import {
  formatCurrency,
  formatDuration,
  formatAxisDate,
  formatAxisEur,
  sessionProfit,
  sessionTypeLabel,
  barColor,
} from '@/utils/format'
import type { BankrollPoint, BarPoint } from '@/types/stats'

const { sortedSessions } = useSessions()
const { selectedPeriod, chartData, currentBankroll } = useBankroll(sortedSessions)
const {
  totalProfit, totalProfitPct, totalDurationMinutes,
  bestSessionProfit, worstSessionProfit, lastSessions,
  cashSessions, cashProfit, cashDurationHours, cashWinRate,
  tournamentSessions, tournamentProfit, tournamentTotalBuyIn, tournamentROI,
  itmCount, itmPct,
  barData,
} = useStats(sortedSessions, currentBankroll)

const bankrollChartConfig = {
  bankroll: { label: 'Bankroll', color: '#0284c7' },
} satisfies ChartConfig

const barChartConfig = {
  profit: { label: 'Profit', color: '#0f766e' },
} satisfies ChartConfig
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
                  labelFormatter: (d: number | Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }),
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
          <CardContent>
            <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Sessions</p>
            <p class="text-2xl font-bold font-mono text-stone-900">{{ sortedSessions.length }}</p>
            <p class="text-xs text-stone-400 mt-0.5">{{ formatDuration(totalDurationMinutes) }}</p>
          </CardContent>
        </Card>
        <Card class="border-stone-200 shadow-sm">
          <CardContent>
            <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Meilleure</p>
            <p class="text-2xl font-bold font-mono text-emerald-600">{{ formatCurrency(bestSessionProfit, true) }}</p>
          </CardContent>
        </Card>
        <Card class="border-stone-200 shadow-sm">
          <CardContent>
            <p class="text-xs uppercase tracking-widest text-stone-400 mb-1">Pire</p>
            <p class="text-2xl font-bold font-mono text-red-500">{{ formatCurrency(worstSessionProfit) }}</p>
          </CardContent>
        </Card>
        <Card class="border-stone-200 shadow-sm">
          <CardContent>
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
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-sm font-medium text-stone-500">Cash Game</CardTitle>
            <Badge variant="outline" class="text-xs font-mono border-stone-200 text-stone-500">
              {{ cashSessions.length }} sessions
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-2">
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
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-sm font-medium text-stone-500">Tournois</CardTitle>
            <Badge variant="outline" class="text-xs font-mono border-stone-200 text-stone-500">
              {{ tournamentSessions.length }} sessions
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-2">
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
        <CardHeader>
          <CardTitle class="text-sm font-medium text-stone-500">Dernières sessions</CardTitle>
        </CardHeader>
        <CardContent>
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
        <CardHeader>
          <CardTitle class="text-sm font-medium text-stone-500">Profit par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
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
              <ChartTooltip />
              <ChartCrosshair
                :template="componentToString(barChartConfig, ChartTooltipContent, {
                  labelFormatter: (d: number | Date) => barData[Number(d)]?.category ?? '',
                  indicator: 'dot',
                })"
              />
            </VisXYContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>

  </div>
</template>