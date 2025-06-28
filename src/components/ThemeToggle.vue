<template>
  <v-btn
    :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
    variant="text"
    @click="toggleTheme"
    :title="isDark ? 'Mode clair' : 'Mode sombre'"
  ></v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const isDark = computed(() => theme.current.value.dark)

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'customLight' : 'customDark'
}
</script> 