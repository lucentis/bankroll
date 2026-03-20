<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { bankrollStore } from '@/store/bankroll'
import { useSessions } from '@/composables/useSessions'
import type { Session, SessionType, Venue } from '@/types/session'

const { addSession } = useSessions()

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

const type = ref<SessionType>('CASH_GAME')
const venue = ref<Venue>('LIVE')
const date = ref(new Date().toISOString().split('T')[0])
const location = ref('')
const totalBuyIn = ref<number | null>(null)
const cashOut = ref<number | null>(null)
const durationHours = ref<number | null>(null)
const durationMinutes = ref<number | null>(null)
const stakes = ref('')
const players = ref<number | null>(null)
const position = ref<number | null>(null)
const notes = ref('')

const isTournament = computed(() => type.value !== 'CASH_GAME')

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const errors = ref<Record<string, string>>({})

const validate = (): boolean => {
  errors.value = {}
  if (!date.value) errors.value.date = 'Champ requis'
  if (!location.value.trim()) errors.value.location = 'Champ requis'
  if (!totalBuyIn.value && totalBuyIn.value !== 0) errors.value.totalBuyIn = 'Champ requis'
  if (!cashOut.value && cashOut.value !== 0) errors.value.cashOut = 'Champ requis'
  if (!durationHours.value && !durationMinutes.value) errors.value.duration = 'Champ requis'
  return Object.keys(errors.value).length === 0
}

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------

const submit = () => {
  if (!validate()) return

  const duration = ((durationHours.value ?? 0) * 60) + (durationMinutes.value ?? 0)

  const session: Session = {
    id: crypto.randomUUID(),
    date: new Date(date.value),
    type: type.value,
    venue: venue.value,
    totalBuyIn: totalBuyIn.value!,
    cashOut: cashOut.value!,
    duration,
    location: location.value.trim(),
    ...(type.value === 'CASH_GAME' && stakes.value ? { stakes: stakes.value } : {}),
    ...(isTournament.value && players.value ? { players: players.value } : {}),
    ...(isTournament.value && position.value ? { position: position.value } : {}),
    ...(notes.value.trim() ? { notes: notes.value.trim() } : {}),
  }

  addSession(session)
  bankrollStore.activeSessionId = session.id
  bankrollStore.activePage = 'session-detail'
}

const goBack = () => {
  bankrollStore.activePage = 'sessions'
}
</script>

<template>
  <div class="p-6 space-y-6">

    <!-- Back -->
    <button
      class="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
      @click="goBack"
    >
      <ArrowLeft class="w-4 h-4" />
      Sessions
    </button>

    <h1 class="text-2xl font-bold tracking-tight text-stone-900">Nouvelle session</h1>

    <div class="grid md:grid-cols-2 gap-4">
      <!-- Type + venue -->
      <Card class="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle class="text-sm font-medium text-stone-500">Type de session</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-stone-500">Type</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="t in (['CASH_GAME', 'MTT', 'SNG', 'SPIN'] as const)"
                :key="t"
                class="text-xs px-3 py-1.5 rounded-full border transition-colors duration-100 font-medium"
                :class="type === t
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
                @click="type = t"
              >
                {{ t === 'CASH_GAME' ? 'Cash Game' : t === 'SPIN' ? 'Spin & Go' : t }}
              </button>
            </div>
          </div>

          <Separator class="bg-stone-100" />

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-stone-500">Format</label>
            <div class="flex gap-2">
              <button
                v-for="v in (['LIVE', 'ONLINE'] as const)"
                :key="v"
                class="text-xs px-3 py-1.5 rounded-full border transition-colors duration-100 font-medium"
                :class="venue === v
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'"
                @click="venue = v"
              >
                {{ v === 'LIVE' ? 'Live' : 'Online' }}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Financier -->
      <Card class="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle class="text-sm font-medium text-stone-500">Résultat financier</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-stone-500">Buy-in total <span class="text-stone-400 font-normal">(€)</span></label>
              <input
                v-model.number="totalBuyIn"
                type="number"
                min="0"
                placeholder="200"
                class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 font-mono text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <p v-if="errors.totalBuyIn" class="text-xs text-red-500">{{ errors.totalBuyIn }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-stone-500">Cash out <span class="text-stone-400 font-normal">(€)</span></label>
              <input
                v-model.number="cashOut"
                type="number"
                min="0"
                placeholder="350"
                class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 font-mono text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <p v-if="errors.cashOut" class="text-xs text-red-500">{{ errors.cashOut }}</p>
            </div>
          </div>

          <!-- Live profit preview -->
          <div
            v-if="totalBuyIn !== null && cashOut !== null"
            class="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-mono font-semibold"
            :class="(cashOut - totalBuyIn) >= 0
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'"
          >
            <span class="text-xs font-sans font-medium">Résultat</span>
            <span>{{ (cashOut - totalBuyIn) >= 0 ? '+' : '' }}{{ (cashOut - totalBuyIn).toFixed(0) }}€</span>
          </div>
        </CardContent>
      </Card>

      <!-- Infos générales -->
      <Card class="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle class="text-sm font-medium text-stone-500">Informations</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-stone-500">Date</label>
              <input
                v-model="date"
                type="date"
                class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <p v-if="errors.date" class="text-xs text-red-500">{{ errors.date }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-stone-500">Lieu</label>
              <input
                v-model="location"
                type="text"
                placeholder="Casino, salle, site…"
                class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <p v-if="errors.location" class="text-xs text-red-500">{{ errors.location }}</p>
            </div>
          </div>

          <Separator class="bg-stone-100" />

          <!-- Duration -->
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-stone-500">Durée</label>
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <input
                  v-model.number="durationHours"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">h</span>
              </div>
              <div class="relative flex-1">
                <input
                  v-model.number="durationMinutes"
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">min</span>
              </div>
            </div>
            <p v-if="errors.duration" class="text-xs text-red-500">{{ errors.duration }}</p>
          </div>

          <!-- Stakes — cash game only -->
          <template v-if="!isTournament">
            <Separator class="bg-stone-100" />
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-stone-500">Stakes <span class="text-stone-300">(optionnel)</span></label>
              <input
                v-model="stakes"
                type="text"
                placeholder="1/2, 2/5…"
                class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 font-mono text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </template>

          <!-- Players + position — tournament only -->
          <template v-if="isTournament">
            <Separator class="bg-stone-100" />
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-stone-500">Joueurs <span class="text-stone-300">(optionnel)</span></label>
                <input
                  v-model.number="players"
                  type="number"
                  min="2"
                  placeholder="120"
                  class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-stone-500">Position <span class="text-stone-300">(optionnel)</span></label>
                <input
                  v-model.number="position"
                  type="number"
                  min="1"
                  placeholder="12"
                  class="w-full text-sm border border-stone-200 rounded-md px-3 py-2 text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </template>

        </CardContent>
      </Card>

      <!-- Notes -->
      <Card class="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle class="text-sm font-medium text-stone-500">Notes <span class="text-stone-300 font-normal">(optionnel)</span></CardTitle>
        </CardHeader>
        <CardContent class="grow">
          <textarea
            v-model="notes"
            placeholder="Observations, main clé, contexte…"
            class="w-full h-full text-sm border border-stone-200 rounded-md px-3 py-2 text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
        </CardContent>
      </Card>
    </div>

    <!-- Submit -->
    <div class="flex gap-3 pb-6 max-w-lg mx-auto">
      <Button variant="outline" class="flex-1" @click="goBack">Annuler</Button>
      <Button class="flex-1" @click="submit">Créer la session</Button>
    </div>

  </div>
</template>