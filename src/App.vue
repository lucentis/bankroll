<script setup lang="ts">
import Content from './components/Content.vue';
import Navbar from './components/Navbar.vue';
import Sidebar from './components/sidebar/Sidebar.vue';
import SidebarItem from './components/sidebar/SidebarItem.vue';

</script>

<template>
    <Navbar></Navbar>
    <main class="grow flex overflow-hidden">
        <Sidebar>
            <SidebarItem>
                Dashboard
            </SidebarItem>

            <SidebarItem>
                Games
            </SidebarItem>
        </Sidebar>
        <Content class="grow">ok</Content>
    </main>
</template>
