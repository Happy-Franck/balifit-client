<template>
  <v-app>
    <AppTopBar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import AppTopBar from '@/components/AppTopBar.vue'
</script>
