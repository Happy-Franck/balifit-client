<template>
  <v-container>
    <!-- Breadcrumbs -->
    <v-breadcrumbs 
      :items="breadcrumbItems" 
      class="pa-0 mb-4"
      divider="/"
    >
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item
          :to="item.href"
          :disabled="item.disabled"
        >
          <v-icon v-if="item.icon" :icon="item.icon" size="16" class="mr-1"></v-icon>
          {{ item.title }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <!-- Header Section -->
    <div class="mb-6">
      <h1 class="text-h3 font-weight-bold text-primary mb-2">
        Mes Challengers
      </h1>
      <p class="text-subtitle-1 text-medium-emphasis">
        Suivez la progression de vos challengers
      </p>
    </div>

    <!-- Barre de recherche et tri -->
    <v-card class="mb-6" elevation="1">
      <v-card-text>
        <v-row>
          <!-- Barre de recherche -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Rechercher un challenger..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @input="onSearchInput"
            ></v-text-field>
          </v-col>
          
          <!-- Tri unique -->
          <v-col cols="12" md="6">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Trier"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="onSortChange"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center my-12">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p class="mt-4 text-body-1">Chargement des challengers...</p>
    </div>

    <!-- Grille des challengers -->
    <v-row v-else>
      <v-col 
        v-for="challenger in displayedChallengers" 
        :key="challenger.id"
        cols="12"
        sm="6"
        md="4"  
        lg="3"
      >
        <v-card 
          class="challenger-card" 
          elevation="2" 
          hover
          @click="viewChallenger(challenger.id)"
        >
          <!-- Photo de profil -->
          <div class="profile-section text-center pa-4">
            <v-avatar size="80" class="mb-3">
              <v-img 
                v-if="challenger.avatar"
                :src="`${APP_CONFIG.STORAGE_BASE_URL}/avatars/${challenger.avatar}`" 
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
            <p class="text-caption text-medium-emphasis">{{ challenger.role || 'Challenger' }}</p>
          </div>

          <!-- Barre de progression de productivité -->
          <v-card-text class="pt-0">
            <div class="productivity-section">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-caption font-weight-medium">Program progress:</span>
                <span class="text-caption font-weight-bold">{{ challenger.productivity }}%</span>
              </div>
              
              <v-progress-linear
                :model-value="challenger.productivity"
                :color="getProgressColor(challenger.productivity)"
                height="8"
                rounded
                class="mb-3"
              ></v-progress-linear>
              
              <!-- Statistiques rapides -->
              <div class="stats-row">
                <div class="stat-item">
                  <div class="stat-value">{{ challenger.totalSessions || 0 }}</div>
                  <div class="stat-label">Total</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ challenger.completedSessions || 0 }}</div>
                  <div class="stat-label">Validées</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ challenger.monthlySessions || 0 }}</div>
                  <div class="stat-label">Ce mois</div>
                </div>
              </div>
            </div>
          </v-card-text>

          <!-- Action Button -->
          <v-card-actions class="pa-4 pt-0">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              block
              prepend-icon="mdi-eye"
            >
              Voir le profil
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Message si aucun challenger -->
    <div v-if="!loading && displayedChallengers.length === 0" class="text-center my-12">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-group</v-icon>
      <h3 class="text-h5 mb-2">Aucun challenger trouvé</h3>
      <p class="text-body-1 text-medium-emphasis">
        {{ searchQuery ? 'Aucun challenger ne correspond à votre recherche' : 'Vous n\'avez pas encore de challengers' }}
      </p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useChallengerStore } from '../../../store/CoachStore/ChallengerStore'
import { APP_CONFIG } from '../../../config/constants'
import { useRouter } from 'vue-router'

const challengerStore = useChallengerStore()
const router = useRouter()
const loading = ref(true)
const searchQuery = ref('')

// Nouveau : un seul select
const sortBy = ref('none')

const sortOptions = [
  { title: 'Aucun', value: 'none' },
  { title: 'Productivité décroissante', value: 'productivity_desc' },
  { title: 'Productivité croissante', value: 'productivity_asc' },
  { title: 'Nom (A → Z)', value: 'alpha_asc' },
  { title: 'Nom (Z → A)', value: 'alpha_desc' }
]

// Breadcrumbs
const breadcrumbItems = computed(() => [
  {
    title: 'Accueil',
    href: '/coach/dashboard',
    icon: 'mdi-home'
  },
  {
    title: 'Challengers',
    disabled: true,
    icon: 'mdi-account-group'
  }
])

// Calcul de la productivité pour un challenger
const calculateProductivity = (challenger: any) => {
  if (!challenger.challenger_seances || challenger.challenger_seances.length === 0) return 0
  
  const totalSeances = challenger.challenger_seances.length
  const completedSeances = challenger.challenger_seances.filter(
    (seance: any) => seance.validated === true || seance.validated === 1
  ).length
  
  return Math.round((completedSeances / totalSeances) * 100)
}

// Challengers avec productivité et statistiques (utilise les données calculées par l'API)
const challengersWithProductivity = computed(() => {
  if (!challengerStore.allChallengers) return []
  
  return challengerStore.allChallengers.map(challenger => ({
    ...challenger,
    // Utiliser les données déjà calculées par l'API
    productivity: challenger.productivity || 0,
    totalSessions: challenger.totalSessions || 0,
    completedSessions: challenger.completedSessions || 0,
    monthlySessions: challenger.monthlySessions || 0,
    soloSessions: challenger.soloSessions || 0
  }))
})

// Challengers filtrés et triés
const displayedChallengers = computed(() => {
  let challengers = challengersWithProductivity.value

  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    challengers = challengers.filter(challenger => 
      challenger.name.toLowerCase().includes(query) ||
      challenger.email?.toLowerCase().includes(query)
    )
  }

  // Tri unique
  switch (sortBy.value) {
    case 'productivity_desc':
      challengers = challengers.sort((a, b) => b.productivity - a.productivity)
      break
    case 'productivity_asc':
      challengers = challengers.sort((a, b) => a.productivity - b.productivity)
      break
    case 'alpha_asc':
      challengers = challengers.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'alpha_desc':
      challengers = challengers.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'none':
    default:
      break
  }

  return challengers
})

// Gestion de la recherche avec debounce
let searchTimeout: number
const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {}, 300)
}

// Gestion du changement de tri
const onSortChange = () => {}

const viewChallenger = (id: number) => {
  router.push(`/coach/challenger/${id}`)
}

const getProgressColor = (productivity: number) => {
  if (productivity >= 80) return 'success'
  if (productivity >= 60) return 'info'
  if (productivity >= 40) return 'warning'
  return 'error'
}

onMounted(async () => {
  try {
    loading.value = true
    await challengerStore.getChallengers()
  } catch (error) {
    console.error('Erreur lors du chargement des challengers:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.challenger-card {
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
}

.challenger-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.profile-section {
  padding-top: 2rem;
}

.productivity-section {
  padding: 0 16px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: rgb(var(--v-theme-primary));
}

.stat-label {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.challenger-card .v-card-text {
  flex-grow: 1;
}

@media (max-width: 768px) {
  .challenger-card {
    margin-bottom: 16px;
  }
}
</style>
