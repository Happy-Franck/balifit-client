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
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-primary mb-2">
        Tableau de Bord Coach
      </h1>
      <p class="text-subtitle-1 text-medium-emphasis">
        Gérez et suivez vos séances de coaching
      </p>
    </div>

    <!-- Statistics Cards Row -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="stat-card" elevation="2" color="deep-purple-lighten-3">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-clock-outline</v-icon>
            <div class="text-h4 font-weight-bold">{{ seancesARemplir }}</div>
            <div class="text-body-2">À remplir</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="stat-card" elevation="2" color="deep-purple-lighten-2">
          <v-card-text class="text-center text-white">
            <v-icon size="48" class="mb-2">mdi-clock-check</v-icon>
            <div class="text-h4 font-weight-bold">{{ seancesAValider }}</div>
            <div class="text-body-2">À valider</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="stat-card" elevation="2" color="deep-purple-lighten-1">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-check-circle</v-icon>
            <div class="text-h4 font-weight-bold">{{ seancesAchevees }}</div>
            <div class="text-body-2">Achevées</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Chart Section -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-card class="chart-card" elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon start color="primary">mdi-chart-line</v-icon>
              Évolution des Séances - Semaine en cours
            </div>
            <v-btn-group>
              <v-btn 
                variant="elevated"
                size="small"
                disabled
              >
                Cette semaine
              </v-btn>
            </v-btn-group>
          </v-card-title>
          
          <v-card-text>
            <div v-if="loading" class="d-flex justify-center align-center" style="height: 300px;">
              <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
            </div>
            
            <div v-else class="chart-container">
              <apexchart
                type="bar"
                height="350"
                :options="chartOptions"
                :series="chartSeries"
              ></apexchart>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Top 3 Challengers Card -->
      <v-col cols="12" md="4">
        <v-card class="top-challengers-card" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-trophy</v-icon>
            Top 3 des Challengers
          </v-card-title>
          
          <v-card-text>
            <div v-if="loading" class="d-flex justify-center align-center" style="height: 200px;">
              <v-progress-circular indeterminate size="32" color="primary"></v-progress-circular>
            </div>
            
            <div v-else-if="topChallengers.length === 0" class="text-center py-4">
              <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-account-group</v-icon>
              <div class="text-caption text-grey-darken-1">Aucun challenger disponible</div>
            </div>
            
            <div v-else>
              <div 
                v-for="(challenger, index) in topChallengers" 
                :key="challenger.id"
                class="challenger-item d-flex align-center mb-3"
              >
                <div class="rank-badge mr-3" :class="`rank-${index + 1}`">
                  {{ index + 1 }}
                </div>
                
                <v-avatar size="40" class="mr-3">
                  <v-img 
                    v-if="challenger.avatar"
                    :src="`${APP_CONFIG.STORAGE_BASE_URL}/avatars/${challenger.avatar}`"
                    cover
                  />
                  <v-icon v-else size="20" color="grey-lighten-1">mdi-account</v-icon>
                </v-avatar>
                
                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-medium">{{ challenger.name }}</div>
                  <div class="text-caption text-grey-darken-1">
                    {{ challenger.productivity }}% de productivité
                  </div>
                </div>
                
                <v-btn
                  :to="{name: 'coachChallengerItem', params: {id: challenger.id}}"
                  variant="text"
                  size="small"
                  color="primary"
                >
                  Voir
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSeanceStore } from '../../store/CoachStore/SeanceStore'
import { useChallengerStore } from '../../store/CoachStore/ChallengerStore'
import { APP_CONFIG } from '../../config/constants'
import VueApexCharts from 'vue3-apexcharts'

const breadcrumbItems = computed(() => [
  {
    title: 'Tableau de Bord',
    disabled: true,
    icon: 'mdi-view-dashboard'
  }
])

const seanceStore = useSeanceStore()
const challengerStore = useChallengerStore()
const loading = ref(true)

// Computed properties pour les séances
const seancesARemplir = computed(() => {
  return seanceStore.seances.filter(seance => seance.validated === null).length
})

const seancesAValider = computed(() => {
  return seanceStore.seances.filter(seance => seance.validated === false || seance.validated === 0).length
})

const seancesAchevees = computed(() => {
  return seanceStore.seances.filter(seance => seance.validated === true || seance.validated === 1).length
})

// Top 3 des challengers les plus productifs
const topChallengers = computed(() => {
  if (!challengerStore.allChallengers) return []
  
  return challengerStore.allChallengers
    .map(challenger => ({
      ...challenger,
      productivity: calculateProductivity(challenger)
    }))
    .sort((a, b) => b.productivity - a.productivity)
    .slice(0, 3)
})

// Calcul de la productivité pour un challenger
const calculateProductivity = (challenger: any) => {
  if (!challenger.challenger_seances || challenger.challenger_seances.length === 0) return 0
  
  const totalSeances = challenger.challenger_seances.length
  const completedSeances = challenger.challenger_seances.filter(
    (seance: any) => seance.validated === true || seance.validated === 1
  ).length
  
  return Math.round((completedSeances / totalSeances) * 100)
}

// Configuration du graphique ApexCharts
const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded'
    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
  },
  yaxis: {
    title: {
      text: 'Nombre de séances'
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: function (val: number) {
        return val + " séances"
      }
    }
  },
  colors: ['#2196F3']
}))

const chartSeries = computed(() => {
  // Calculer le nombre de séances par jour de la semaine (Lundi à Vendredi)
  const seancesByDay = [0, 0, 0, 0, 0] // Lundi à Vendredi
  
  seanceStore.seances.forEach(seance => {
    const date = new Date(seance.created_at)
    const dayOfWeek = date.getDay() // 0 = Dimanche, 1 = Lundi, etc.
    
    // Convertir en index 0-4 (Lundi à Vendredi)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const index = dayOfWeek - 1
      seancesByDay[index]++
    }
  })
  
  return [{
    name: 'Séances',
    data: seancesByDay
  }]
})

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([
      seanceStore.getSeances(),
      challengerStore.getChallengers()
    ])
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.chart-card {
  height: 100%;
}

.top-challengers-card {
  height: 100%;
}

.challenger-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.challenger-item:last-child {
  border-bottom: none;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  color: white;
}

.rank-1 {
  background-color: #FFD700; /* Or */
}

.rank-2 {
  background-color: #C0C0C0; /* Argent */
}

.rank-3 {
  background-color: #CD7F32; /* Bronze */
}

.chart-container {
  min-height: 350px;
}
</style>
