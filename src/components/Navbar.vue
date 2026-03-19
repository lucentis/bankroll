<script setup lang="ts">
import { PlusCircle, User, Settings, Trash2, LogOut } from 'lucide-vue-next'
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
  <header class="h-14 border-b border-stone-200 bg-white flex items-center px-4 gap-3 shrink-0">

    <!-- Slot for SidebarTrigger -->
    <slot name="leading" />

    <div class="grow" />

    <!-- Add session -->
    <Button variant="default" size="sm" class="gap-1.5">
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
</template>