<template>
  <v-container>
    <h1>Liste de mes seances</h1>
    <li v-for="(seance , index) in seanceStore.seances" :key="index">
      {{seance.created_at}}
      <p>Validate: {{seance.validated}}</p>
      <router-link :to="{name: 'coachSeanceItem', params: {id: seance.id}}">
        voir
      </router-link>
    </li>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useSeanceStore } from '@/store/CoachStore/SeanceStore'
export default defineComponent({
  setup(){
    const seanceStore = useSeanceStore()
    seanceStore.getSeances()
    return { seanceStore }
  }
})
</script>
