<template>
  <v-container><v-card
      width="auto"
      absolute
      style="z-index: 50;"
    >
    <v-progress-linear
        :active="seanceStore.loading"
        :indeterminate="seanceStore.loading"
        bottom
        color="deep-purple-accent-4"
      ></v-progress-linear>
    </v-card>
    <div v-if="seanceStore.currentSeance">
      <p>Date: {{seanceStore.currentSeance.created_at}}</p>
      <p>Admin: {{seanceStore.currentSeanceAdmin?.name}}</p>
      <p>Coach: {{seanceStore.currentSeanceCoach?.name}}</p>
      <p>Challenger: {{seanceStore.currentSeanceChallenger?.name}}</p>
      <p>Trainings: {{seanceStore.currentSeanceTrainings}}</p>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useSeanceStore } from '../../../store/AdminStore/SeanceStore'
import { useRoute } from 'vue-router'

export default defineComponent({
  setup() {
      const router = useRoute()
      const seanceStore = useSeanceStore()
      seanceStore.currentSeance = null
      seanceStore.currentSeanceAdmin = null
      seanceStore.currentSeanceCoach = null
      seanceStore.currentSeanceChallenger = null
      seanceStore.showSeance(Number(router.params.idSeance))

      return{ seanceStore }
    }
})
</script>
