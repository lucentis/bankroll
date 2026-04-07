<script setup lang="ts">
import Dashboard from './Dashboard.vue';
import HandCreate from './hand/HandCreate.vue';
import HandCreation from './hand/HandCreation.vue';
import Session from './session/Session.vue';
import SessionCreate from './session/SessionCreate.vue';
import SessionEdit from './session/SessionEdit.vue';
import Sessions from './session/Sessions.vue';
import Stats from './Stats.vue';
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

            <TabsContent value="session">
                <Session></Session>
            </TabsContent>

            <TabsContent value="session-create">
                <SessionCreate />
            </TabsContent>

            <TabsContent value="stats">
                <Stats />
            </TabsContent>

            <TabsContent value="session-edit">
                <SessionEdit />
            </TabsContent>

            <TabsContent value="hand-create">
                <HandCreation />
            </TabsContent>
        </Tabs>
    </div>
</template>