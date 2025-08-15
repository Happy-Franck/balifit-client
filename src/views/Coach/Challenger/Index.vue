<template>
  <v-container>
    <h1 class="text-h4 mb-6 text-center">Liste de Tous les Challengers</h1>
    
    <v-text-field
      v-model="searchQuery"
      label="Rechercher un challenger"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      hide-details
      clearable
      class="mb-6"
    />

    <v-row>
      <v-col 
        v-for="(challenger, index) in filteredChallengers" 
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="challenger-card" elevation="3">
          <!-- Profile Section -->
          <v-card-text class="text-center pb-0">
            <v-avatar size="80" class="mb-3 avatar-border">
              <v-img 
                v-if="challenger.image"
                :src="`${APP_CONFIG.STORAGE_BASE_URL}/avatars/${challenger.image}`" 
                alt="Profile"
                cover
              />
              <v-icon 
                v-else 
                size="40" 
                color="grey-lighten-1"
              >
                mdi-account
              </v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-1">{{ challenger.name }}</h3>
            <p class="text-caption text-medium-emphasis mb-4">{{ challenger.role || 'Challenger' }}</p>
          </v-card-text>

          <!-- Statistics Section -->
          <v-card-text class="pt-0">
            <v-row class="text-center mb-4">
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Séances total</div>
                <div class="text-h6 font-weight-bold">{{ challenger.totalSessions || 0 }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Séances du mois</div>
                <div class="text-h6 font-weight-bold">{{ challenger.monthlySessions || 0 }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Séances solo</div>
                <div class="text-h6 font-weight-bold">{{ challenger.soloSessions || 0 }}</div>
              </v-col>
            </v-row>

            <!-- Productivity Section -->
            <div class="mb-3">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-caption">Productivité mensuelle: {{ calculateProductivity(challenger) }}%</span>
              </div>
              <v-progress-linear
                :model-value="calculateProductivity(challenger)"
                color="primary"
                height="8"
                rounded
              ></v-progress-linear>
            </div>

            <!-- Action Button -->
            <v-btn
              :to="{name: 'coachChallengerItem', params: {id: challenger.id}}"
              color="primary"
              variant="outlined"
              block
              size="small"
            >
              Voir le profil
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useChallengerStore } from '../../../store/CoachStore/ChallengerStore'
import { APP_CONFIG } from '../../../config/constants'
export default defineComponent({
  setup(){
    const challengerStore = useChallengerStore()
    challengerStore.getChallengers()

    const searchQuery = ref('')
    const filteredChallengers = computed(() => {
      const query = searchQuery.value.trim().toLowerCase()
      if (!query) return challengerStore.allChallengers
      return challengerStore.allChallengers.filter((c: any) => {
        const name = (c?.name || '').toString().toLowerCase()
        return name.includes(query)
      })
    })
    
    const calculateProductivity = (challenger: any) => {
      const sessionsCompleted = challenger.sessionsCompleted || 0
      const productivity = (sessionsCompleted / 15) * 100
      return Math.min(Math.round(productivity), 100)
    }
    
    return { challengerStore, calculateProductivity, APP_CONFIG, searchQuery, filteredChallengers }
  }
})
</script>

<style scoped>
.challenger-card {
  border-radius: 12px;
  transition: transform 0.2s ease-in-out;
}

.challenger-card:hover {
  transform: translateY(-4px);
}

.avatar-border {
  border: 3px solid #e0e0e0;
  background-color: #f5f5f5;
}
</style>
