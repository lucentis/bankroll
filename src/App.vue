<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar.vue'
import Navbar from '@/components/Navbar.vue'
import Content from '@/components/Content.vue'
</script>

<template>
    <SidebarProvider>
        <AppSidebar />
        <div class="flex flex-col flex-1 min-w-0">
            <Navbar>
                <template #leading>
                    <SidebarTrigger class="-ml-1" />
                </template>
            </Navbar>
            <Content class="flex-1 overflow-auto" />
        </div>
    </SidebarProvider>
</template>