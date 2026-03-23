<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '@/types/hand'

const props = defineProps<{
  modelValue: Card[]
  max?: number         // max selectable cards
  disabled?: Card[]    // cards already used elsewhere
}>()

const emit = defineEmits<{
  'update:modelValue': [cards: Card[]]
}>()

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
const SUITS = ['s', 'h', 'd', 'c']

const suitSymbol: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }
const suitColor: Record<string, string> = {
  s: 'text-stone-800',
  h: 'text-red-500',
  d: 'text-red-500',
  c: 'text-stone-800',
}
const suitBorder: Record<string, string> = {
  s: 'border-stone-300 hover:border-stone-500',
  h: 'border-red-200 hover:border-red-400',
  d: 'border-red-200 hover:border-red-400',
  c: 'border-stone-300 hover:border-stone-500',
}
const suitSelected: Record<string, string> = {
  s: 'bg-stone-800 text-white border-stone-800',
  h: 'bg-red-500 text-white border-red-500',
  d: 'bg-red-500 text-white border-red-500',
  c: 'bg-stone-800 text-white border-stone-800',
}

const isSelected = (card: Card) => props.modelValue.includes(card)
const isDisabled = (card: Card) => props.disabled?.includes(card) ?? false

const toggle = (card: Card) => {
  if (isDisabled(card)) return
  const current = props.modelValue
  if (isSelected(card)) {
    emit('update:modelValue', current.filter(c => c !== card))
  } else {
    if (props.max && current.length >= props.max) return
    emit('update:modelValue', [...current, card])
  }
}
</script>

<template>
  <div class="space-y-1">
    <div v-for="suit in SUITS" :key="suit" class="flex gap-1 flex-wrap">
      <button
        v-for="rank in RANKS"
        :key="`${rank}${suit}`"
        type="button"
        class="w-8 h-9 text-xs font-mono font-bold rounded border transition-all duration-100 flex flex-col items-center justify-center leading-none"
        :class="[
          isSelected(`${rank}${suit}`)
            ? suitSelected[suit]
            : isDisabled(`${rank}${suit}`)
              ? 'opacity-30 cursor-not-allowed bg-stone-50 border-stone-200 text-stone-400'
              : `bg-white ${suitColor[suit]} ${suitBorder[suit]} cursor-pointer`,
        ]"
        :disabled="isDisabled(`${rank}${suit}`)"
        @click="toggle(`${rank}${suit}`)"
      >
        <span>{{ rank }}</span>
        <span class="text-[10px]">{{ suitSymbol[suit] }}</span>
      </button>
    </div>
  </div>
</template>