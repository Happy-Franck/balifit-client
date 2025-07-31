<template>
  <v-container class="pa-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-primary mb-2">
        Mes Séances
      </h1>
      <p class="text-subtitle-1 text-medium-emphasis">
        Gérez et suivez vos séances d'entraînement
      </p>
    </div>

    <!-- Loading State -->
    <v-row v-if="loading" justify="center" class="my-12">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4 text-body-1">Chargement des séances...</p>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else-if="seanceStore.seances.length === 0" justify="center" class="my-12">
      <v-col cols="12" md="6" class="text-center">
        <v-icon
          size="80"
          color="grey-lighten-1"
          class="mb-4"
        >
          mdi-calendar-blank
        </v-icon>
        <h3 class="text-h5 mb-2">Aucune séance trouvée</h3>
        <p class="text-body-1 text-medium-emphasis">
          Vous n'avez pas encore créé de séances d'entraînement.
        </p>
        <v-btn
          color="primary"
          size="large"
          class="mt-4"
          prepend-icon="mdi-plus"
        >
          Créer une séance
        </v-btn>
      </v-col>
    </v-row>

    <!-- Séances List -->
    <v-row v-else>
      <v-col
        v-for="(seance, index) in seanceStore.seances"
        :key="index"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="seance-card"
          elevation="2"
          hover
          @click="goToSeance(seance.id)"
        >
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon
                :color="seance.validated ? 'success' : 'warning'"
                class="mr-3"
                size="24"
              >
                {{ seance.validated ? 'mdi-check-circle' : 'mdi-clock-outline' }}
              </v-icon>
              <span class="text-h6">Séance #{{ seance.id }}</span>
            </div>
            <v-chip
              :color="seance.validated ? 'success' : 'warning'"
              size="small"
              variant="flat"
            >
              {{ seance.validated ? 'Validée' : 'En attente' }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" class="mr-2" size="20">
                mdi-calendar
              </v-icon>
              <span class="text-body-2">
                {{ formatDate(seance.created_at) }}
              </span>
            </div>

            <div class="d-flex align-center">
              <v-icon color="info" class="mr-2" size="20">
                mdi-clock-outline
              </v-icon>
              <span class="text-body-2">
                {{ formatTime(seance.created_at) }}
              </span>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              prepend-icon="mdi-eye"
              @click.stop="goToSeance(seance.id)"
            >
              Voir détails
            </v-btn>
            
            <v-spacer></v-spacer>
            
            <v-btn
              v-if="!seance.validated"
              color="success"
              variant="text"
              size="small"
              prepend-icon="mdi-check"
            >
              Valider
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSeanceStore } from '../../../store/CoachStore/SeanceStore'

export default defineComponent({
  setup() {
    const seanceStore = useSeanceStore()
    const router = useRouter()
    const loading = ref(true)

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatTime = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const goToSeance = (id: number) => {
      router.push({ name: 'coachSeanceItem', params: { id } })
    }

    onMounted(async () => {
      try {
        await seanceStore.getSeances()
      } catch (error) {
        console.error('Error loading seances:', error)
      } finally {
        loading.value = false
      }
    })

    return {
      seanceStore,
      loading,
      formatDate,
      formatTime,
      goToSeance
    }
  }
})
</script>

<style scoped>
.seance-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.seance-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .floating-btn {
    bottom: 16px;
    right: 16px;
  }
}
</style>
