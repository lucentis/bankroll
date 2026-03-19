<script setup lang="ts">
import { TrendingUp, PlusCircle, User, Settings, Trash2, LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
</script>

<template>
    <div class="bg-white border-b border-stone-200 shadow">
        <header class="h-14 container mx-auto flex items-center px-6 gap-6 shrink-0">

        <!-- Brand -->
        <div class="flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-emerald-600" :stroke-width="2.5" />
            <span class="font-bold text-stone-900 tracking-tight">Bankroll</span>
        </div>

        <div class="grow" />

        <!-- Add session -->
        <Button variant="default" size="sm" class="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            <PlusCircle class="w-4 h-4" />
            Nouvelle session
        </Button>

        <!-- User menu -->
        <DropdownMenu>
            <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="rounded-full w-8 h-8 bg-stone-100 hover:bg-stone-200">
                <User class="w-4 h-4 text-stone-600" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuLabel class="text-xs text-stone-400 font-normal">Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="gap-2 cursor-pointer">
                <User class="w-4 h-4" />
                Profil
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2 cursor-pointer">
                <Settings class="w-4 h-4" />
                Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="gap-2 cursor-pointer text-red-500 focus:text-red-500">
                <Trash2 class="w-4 h-4" />
                Réinitialiser les données
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2 cursor-pointer">
                <LogOut class="w-4 h-4" />
                Se déconnecter
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        </header>
  </div>
</template>