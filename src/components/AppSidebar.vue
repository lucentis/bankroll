<script setup lang="ts">
import { ref } from 'vue'
import {
  LayoutDashboard,
  ListVideo,
  Coins,
  Trophy,
  BarChart3,
  Settings,
  ChevronRight,
  TrendingUp,
} from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { bankrollStore } from '@/store/bankroll'
import { ALL_TYPES, ALL_VENUES } from '@/composables/useSessionFilters'

const sessionsOpen = ref(true)

const goToSessions = () => {
  bankrollStore.sessionFilters.types = [...ALL_TYPES]
  bankrollStore.sessionFilters.venues = [...ALL_VENUES]
  bankrollStore.activePage = 'sessions'
}

const goToCashGame = () => {
  bankrollStore.sessionFilters.types = ['CASH_GAME']
  bankrollStore.sessionFilters.venues = [...ALL_VENUES]
  bankrollStore.activePage = 'sessions'
}

const goToTournois = () => {
  bankrollStore.sessionFilters.types = ['MTT', 'SNG', 'SPIN']
  bankrollStore.sessionFilters.venues = [...ALL_VENUES]
  bankrollStore.activePage = 'sessions'
}
</script>

<template>
  <Sidebar collapsible="icon">

    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                <TrendingUp class="size-4" />
              </div>
              <span class="font-bold text-stone-900">Bankroll</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>

            <!-- Dashboard -->
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Dashboard" @click="bankrollStore.activePage = 'dashboard'">
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Sessions — collapsible -->
            <Collapsible v-model:open="sessionsOpen" as-child>
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton tooltip="Sessions" @click="goToSessions">
                    <ListVideo />
                    <span>Sessions</span>
                    <ChevronRight
                      class="ml-auto transition-transform duration-200"
                      :class="sessionsOpen ? 'rotate-90' : ''"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <a href="#" @click.prevent="goToSessions">
                          <ListVideo class="size-3.5" />
                          <span>Toutes</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <a href="#" @click.prevent="goToCashGame">
                          <Coins class="size-3.5" />
                          <span>Cash Game</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <a href="#" @click.prevent="goToTournois">
                          <Trophy class="size-3.5" />
                          <span>Tournois</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <!-- Statistiques -->
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Statistiques">
                <BarChart3 />
                <span>Statistiques</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- Bottom group — settings -->
      <SidebarGroup class="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Paramètres">
                <Settings />
                <span>Paramètres</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

    </SidebarContent>

    <SidebarRail />
  </Sidebar>
</template>