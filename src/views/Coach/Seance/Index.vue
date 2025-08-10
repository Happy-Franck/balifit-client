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

    <!-- Séances Tabs -->
    <div v-else>
      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="center"
        class="mb-6"
      >
        <v-tab value="a-remplir">
          <v-badge
            :content="seancesARemplir.length"
            :model-value="seancesARemplir.length > 0"
            color="error"
            class="mr-2"
          >
            À remplir
          </v-badge>
        </v-tab>
        <v-tab value="a-valider">
          <v-badge
            :content="seancesAValider.length"
            :model-value="seancesAValider.length > 0"
            color="info"
            class="mr-2"
          >
            À valider
          </v-badge>
        </v-tab>
        <v-tab value="achevees">
          <v-badge
            :content="seancesAchevees.length"
            :model-value="seancesAchevees.length > 0"
            color="success"
            class="mr-2"
          >
            Achevées
          </v-badge>
        </v-tab>
      </v-tabs>

      <!-- Tab Content -->
      <v-window v-model="activeTab">
        <!-- À remplir Tab -->
        <v-window-item value="a-remplir">
          <v-row v-if="seancesARemplir.length === 0" justify="center" class="my-8">
            <v-col cols="12" md="6" class="text-center">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-check-circle
              </v-icon>
              <h4 class="text-h6 mb-2">Aucune séance à remplir</h4>
              <p class="text-body-2 text-medium-emphasis">
                Toutes vos séances assignées ont été remplies !
              </p>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col
              v-for="(seance, index) in seancesARemplir"
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
                      :color="getStatusColor(seance.validated)"
                      class="mr-3"
                      size="24"
                    >
                      {{ getStatusIcon(seance.validated) }}
                    </v-icon>
                    <span class="text-h6">Séance #{{ seance.id }}</span>
                  </div>
                  <v-chip
                    :color="getStatusColor(seance.validated)"
                    size="small"
                    variant="flat"
                  >
                    {{ getStatusText(seance.validated) }}
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
                    color="success"
                    variant="text"
                    size="small"
                    prepend-icon="mdi-check"
                    @click.stop="validerSeance(seance.id)"
                    :loading="seanceStore.loading"
                    :disabled="seanceStore.loading"
                  >
                    Valider
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- À valider Tab -->
        <v-window-item value="a-valider">
          <v-row v-if="seancesAValider.length === 0" justify="center" class="my-8">
            <v-col cols="12" md="6" class="text-center">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-check-circle
              </v-icon>
              <h4 class="text-h6 mb-2">Aucune séance à valider</h4>
              <p class="text-body-2 text-medium-emphasis">
                Aucune séance n'est en attente de validation par le challenger.
              </p>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col
              v-for="(seance, index) in seancesAValider"
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
                      :color="getStatusColor(seance.validated)"
                      class="mr-3"
                      size="24"
                    >
                      {{ getStatusIcon(seance.validated) }}
                    </v-icon>
                    <span class="text-h6">Séance #{{ seance.id }}</span>
                  </div>
                  <v-chip
                    :color="getStatusColor(seance.validated)"
                    size="small"
                    variant="flat"
                  >
                    {{ getStatusText(seance.validated) }}
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
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Achevées Tab -->
        <v-window-item value="achevees">
          <v-row v-if="seancesAchevees.length === 0" justify="center" class="my-8">
            <v-col cols="12" md="6" class="text-center">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-trophy
              </v-icon>
              <h4 class="text-h6 mb-2">Aucune séance achevée</h4>
              <p class="text-body-2 text-medium-emphasis">
                Aucune séance n'a encore été validée par le challenger.
              </p>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col
              v-for="(seance, index) in seancesAchevees"
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
                      :color="getStatusColor(seance.validated)"
                      class="mr-3"
                      size="24"
                    >
                      {{ getStatusIcon(seance.validated) }}
                    </v-icon>
                    <span class="text-h6">Séance #{{ seance.id }}</span>
                  </div>
                  <v-chip
                    :color="getStatusColor(seance.validated)"
                    size="small"
                    variant="flat"
                  >
                    {{ getStatusText(seance.validated) }}
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
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSeanceStore } from '../../../store/CoachStore/SeanceStore'

export default defineComponent({
  setup() {
    const seanceStore = useSeanceStore()
    const router = useRouter()
    const loading = ref(true)
    const activeTab = ref('a-remplir')

    // Computed properties pour filtrer les séances
    const seancesARemplir = computed(() => {
      return seanceStore.seances.filter(seance => seance.validated === null)
    })

    const seancesAValider = computed(() => {
      return seanceStore.seances.filter(seance => 
        seance.validated === false || seance.validated === 0
      )
    })

    const seancesAchevees = computed(() => {
      return seanceStore.seances.filter(seance => 
        seance.validated === true || seance.validated === 1
      )
    })

    // Watcher pour mettre à jour l'onglet actif quand les séances changent
    watch([seancesARemplir, seancesAValider, seancesAchevees], ([aRemplir, aValider, achevees]) => {
      if (aRemplir.length > 0) {
        activeTab.value = 'a-remplir'
      } else if (aValider.length > 0) {
        activeTab.value = 'a-valider'
      } else if (achevees.length > 0) {
        activeTab.value = 'achevees'
      }
    })

    const getStatusColor = (validated: any) => {
      if (validated === true || validated === 1) return 'success'
      if (validated === false || validated === 0) return 'info'
      return 'warning' // null
    }

    const getStatusIcon = (validated: any) => {
      if (validated === true || validated === 1) return 'mdi-check-circle'
      if (validated === false || validated === 0) return 'mdi-clock-outline'
      return 'mdi-clock-outline' // null
    }

    const getStatusText = (validated: any) => {
      if (validated === true || validated === 1) return 'Validée'
      if (validated === false || validated === 0) return 'A valider'
      return 'En attente' // null
    }

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

    const validerSeance = async (id: number) => {
      try {
        await seanceStore.valider(id)
        // Rafraîchir la liste des séances après validation
        await seanceStore.getSeances()
      } catch (error) {
        console.error('Error validating seance:', error)
      }
    }

    onMounted(async () => {
      try {
        await seanceStore.getSeances()
        // Définir l'onglet actif selon les séances disponibles
        if (seancesARemplir.value.length > 0) {
          activeTab.value = 'a-remplir'
        } else if (seancesAValider.value.length > 0) {
          activeTab.value = 'a-valider'
        } else if (seancesAchevees.value.length > 0) {
          activeTab.value = 'achevees'
        }
      } catch (error) {
        console.error('Error loading seances:', error)
      } finally {
        loading.value = false
      }
    })

    return {
      seanceStore,
      loading,
      activeTab,
      seancesARemplir,
      seancesAValider,
      seancesAchevees,
      formatDate,
      formatTime,
      goToSeance,
      validerSeance,
      getStatusColor,
      getStatusIcon,
      getStatusText
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
