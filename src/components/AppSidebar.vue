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
} from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
import { TrendingUp } from 'lucide-vue-next'

const sessionsOpen = ref(true)
</script>

<template>
  <Sidebar collapsible="icon">

    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <TrendingUp class="size-4" />
              </div>
              <span class="font-bold text-stone-900">Bankroll</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent class="pt-4">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu class="space-y-2">
            <!-- Dashboard -->
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Dashboard" is-active>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Sessions — collapsible -->
            <Collapsible v-model:open="sessionsOpen" as-child>
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton tooltip="Sessions">
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
                        <a href="#">
                          <ListVideo class="size-3.5" />
                          <span>Toutes</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <a href="#">
                          <Coins class="size-3.5" />
                          <span>Cash Game</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as-child>
                        <a href="#">
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