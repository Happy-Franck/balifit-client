<template>
  <v-container>
    <h1>Liste de Tous challengers</h1>
    <li v-for="(challenger , index) in challengerStore.allChallengers" :key="index">
      {{challenger.name}}
      <router-link :to="{name: 'coachChallengerItem', params: {id: challenger.id}}">
        voir
      </router-link>
    </li>
    <h1>Liste de Mes challengers</h1>
    <li v-for="(challenger , index) in challengerStore.myChallengers" :key="index">
      {{challenger.name}}
      <router-link :to="{name: 'coachChallengerItem', params: {id: challenger.id}}">
        voir
      </router-link>
    </li>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useChallengerStore } from '../../../store/CoachStore/ChallengerStore'
export default defineComponent({
  setup(){
    const challengerStore = useChallengerStore()
    challengerStore.getChallengers()
    return { challengerStore }
  }
})
</script>
