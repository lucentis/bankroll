<script setup lang="ts">
import Dashboard from './Dashboard.vue';
import Sessions from './Sessions.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { bankrollStore } from '@/store/bankroll';

</script>

<template>
    <div class="overflow-auto">

        <Tabs v-model="bankrollStore.activePage" :default-value="bankrollStore.activePage">
            <TabsList class="hidden">
                <TabsTrigger value="dashboard">db</TabsTrigger>
                <TabsTrigger value="sessions">db</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
                <Dashboard></Dashboard>
            </TabsContent>
            <TabsContent value="sessions">
                <Sessions></Sessions>
            </TabsContent>
        </Tabs>
    </div>
</template>