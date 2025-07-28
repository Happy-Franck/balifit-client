<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="text-h4 font-weight-bold mb-4">Tableau de Bord</h1>
      <div class="dashboard-stats">
        <v-row>
          <v-col cols="12" md="3">
            <v-card class="stat-card" elevation="2">
              <v-card-text class="text-center">
                <v-icon size="48" color="primary" class="mb-2">mdi-calendar-check</v-icon>
                <div class="text-h5 font-weight-bold">{{ totalSeances }}</div>
                <div class="text-body-2 text-grey-darken-1">Séances ce mois</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="stat-card" elevation="2">
              <v-card-text class="text-center">
                <v-icon size="48" color="success" class="mb-2">mdi-check-circle</v-icon>
                <div class="text-h5 font-weight-bold">{{ validatedSeances }}</div>
                <div class="text-body-2 text-grey-darken-1">Séances terminées</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="stat-card" elevation="2">
              <v-card-text class="text-center">
                <v-icon size="48" color="warning" class="mb-2">mdi-clock</v-icon>
                <div class="text-h5 font-weight-bold">{{ pendingSeances }}</div>
                <div class="text-body-2 text-grey-darken-1">En attente de validation</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="stat-card" elevation="2">
              <v-card-text class="text-center">
                <v-icon size="48" color="info" class="mb-2">mdi-play-circle</v-icon>
                <div class="text-h5 font-weight-bold">{{ inProgressSeances }}</div>
                <div class="text-body-2 text-grey-darken-1">En cours</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Graphique des séances -->
    <v-card class="chart-card mt-6" elevation="2">
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <v-icon start color="primary">mdi-chart-line</v-icon>
          Évolution des Séances - {{ currentMonthYear }}
        </div>
        <v-btn-group>
          <v-btn 
            :variant="selectedPeriod === 'current' ? 'elevated' : 'outlined'"
            size="small"
            @click="changePeriod('current')"
          >
            Ce mois
          </v-btn>
          <v-btn 
            :variant="selectedPeriod === 'previous' ? 'elevated' : 'outlined'"
            size="small"
            @click="changePeriod('previous')"
          >
            Mois précédent
          </v-btn>
        </v-btn-group>
      </v-card-title>
      
      <v-card-text>
        <div v-if="seanceStore.statsLoading" class="d-flex justify-center align-center" style="height: 300px;">
          <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        </div>
        
        <div v-else-if="chartData.series.length === 0" class="d-flex justify-center align-center" style="height: 300px;">
          <div class="text-center">
            <v-icon size="64" color="grey-lighten-1">mdi-chart-line</v-icon>
            <div class="text-h6 text-grey-darken-1 mt-2">Aucune donnée disponible</div>
            <div class="text-body-2 text-grey-darken-1">Aucune séance n'a été créée pour cette période</div>
          </div>
        </div>
        
        <div v-else class="chart-container">
          <apexchart
            type="area"
            height="350"
            :options="chartOptions"
            :series="chartData.series"
          ></apexchart>
        </div>
      </v-card-text>
    </v-card>

    <!-- Actions rapides -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <v-card class="action-card" elevation="2" @click="goToSeances">
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="primary" class="mr-4">mdi-dumbbell</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">Gérer les Séances</div>
              <div class="text-body-2 text-grey-darken-1">Créer, modifier et suivre les séances</div>
            </div>
            <v-spacer></v-spacer>
            <v-icon color="primary">mdi-arrow-right</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card class="action-card" elevation="2" @click="goToUsers">
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="success" class="mr-4">mdi-account-group</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">Gérer les Utilisateurs</div>
              <div class="text-body-2 text-grey-darken-1">Coaches et challengers</div>
            </div>
            <v-spacer></v-spacer>
            <v-icon color="success">mdi-arrow-right</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useSeanceStore } from '../../store/AdminStore/SeanceStore'
import { useUserStore } from '../../store/AdminStore/UserStore'
import { useRouter } from 'vue-router'
import VueApexCharts from 'vue3-apexcharts'

const seanceStore = useSeanceStore()
const userStore = useUserStore()
const router = useRouter()

// Reactive data
const selectedPeriod = ref('current')
const currentDate = new Date()
const currentMonth = currentDate.getMonth() + 1
const currentYear = currentDate.getFullYear()

// Computed properties
const currentMonthYear = computed(() => {
  const date = new Date()
  if (selectedPeriod.value === 'previous') {
    date.setMonth(date.getMonth() - 1)
  }
  return date.toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  })
})

const totalSeances = computed(() => {
  return seanceStore.seancesStats.reduce((total, stat) => total + stat.count, 0)
})

const validatedSeances = computed(() => {
  // Séances avec validated = 1 (terminées)
  return seanceStore.seancesStats.reduce((total, stat) => total + (stat.validated || 0), 0)
})

const pendingSeances = computed(() => {
  // Séances avec validated = 0 (en attente de validation)
  return seanceStore.seancesStats.reduce((total, stat) => total + (stat.pending || 0), 0)
})

const inProgressSeances = computed(() => {
  // Séances avec validated = null (créées et en cours)
  return seanceStore.seancesStats.reduce((total, stat) => total + (stat.inProgress || 0), 0)
})

const activeUsers = computed(() => {
  return userStore.users?.length || 0
})

const chartData = computed(() => {
  if (!seanceStore.seancesStats.length) {
    return { series: [] }
  }

  const series = [
    {
      name: 'Séances créées',
      data: seanceStore.seancesStats.map(stat => stat.count)
    }
  ]

  return { series }
})

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 350,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  colors: ['#5865f2'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.2,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    categories: seanceStore.seancesStats.map(stat => stat.date),
    labels: {
      style: {
        colors: '#666'
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: '#666'
      }
    }
  },
  legend: {
    show: false
  },
  tooltip: {
    theme: 'dark',
    x: {
      format: 'dd/MM'
    }
  },
  grid: {
    borderColor: '#e0e0e0',
    strokeDashArray: 5
  }
}))

// Methods
const loadStats = async () => {
  let month, year
  
  if (selectedPeriod.value === 'current') {
    month = currentMonth
    year = currentYear
  } else {
    const prevDate = new Date(currentYear, currentMonth - 2, 1)
    month = prevDate.getMonth() + 1
    year = prevDate.getFullYear()
  }
  
  await seanceStore.getSeancesStats(month.toString(), year.toString())
}

const changePeriod = async (period: string) => {
  selectedPeriod.value = period
  await loadStats()
}

const goToSeances = () => {
  router.push('/admin/seance')
}

const goToUsers = () => {
  router.push('/admin/users')
}

// Lifecycle
onMounted(async () => {
  await loadStats()
  await userStore.getUsers()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 24px;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.chart-container {
  position: relative;
}

.action-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }
  
  .dashboard-stats .v-col {
    margin-bottom: 16px;
  }
}
</style>
