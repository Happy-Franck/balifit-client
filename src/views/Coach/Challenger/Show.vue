<template>
  <v-container>
    <div v-if="challengerStore.currentChallenger">
      <!-- Header Section - User Profile -->
      <v-card class="mb-6" elevation="2">
        <v-card-text class="d-flex align-center">
          <v-avatar size="80" class="mr-4 avatar-border">
            <v-img 
              v-if="challengerStore.currentChallenger.avatar"
              :src="getAvatarUrl(challengerStore.currentChallenger.avatar)" 
              alt="Profile"
            />
            <v-icon 
              v-else 
              size="40" 
              color="grey-lighten-1"
            >
              mdi-account
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center mb-2">
              <h2 class="text-h4 font-weight-bold mr-3">{{ challengerStore.currentChallenger.name }}</h2>
              <v-chip color="purple" size="small" variant="outlined">
                {{ challengerStore.currentChallenger.role || 'Challenger' }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              <div>{{ challengerStore.currentChallenger.email }}</div>
              <div v-if="challengerStore.currentChallenger.telephone">
                {{ challengerStore.currentChallenger.telephone }}
              </div>
              <div>Joined {{ formatDate(challengerStore.currentChallenger.created_at) }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Statistics and Activity Row -->
      <v-row class="mb-6">
        <!-- Progress Statistic Card -->
        <v-col cols="12" md="6">
          <v-card elevation="2">
            <v-card-title>
              <span>Productivité mensuelle</span>
            </v-card-title>
            <v-card-text>
              <div class="text-center">
                <apexchart
                  type="radialBar"
                  height="200"
                  :options="gaugeOptions"
                  :series="gaugeSeries"
                ></apexchart>
                <div class="text-caption text-medium-emphasis mt-2">
                  {{ calculateMonthlySessions() }} séances ce mois
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Activity Chart Card -->
        <v-col cols="12" md="6">
          <v-card elevation="2">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Weekly Exercise Performance</span>
              <v-btn variant="outlined" size="small" prepend-icon="mdi-calendar">
                Last Week
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div class="text-h3 font-weight-bold mb-4">{{ calculateTotalExercises() }} Total exercises performed</div>
              <apexchart
                type="bar"
                height="200"
                :options="chartOptions"
                :series="chartSeries"
              ></apexchart>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Trainings List -->
      <v-card elevation="2">
        <v-card-title>Mes Trainings</v-card-title>
        <v-card-text>
          <v-expansion-panels>
            <v-expansion-panel
              v-for="(seance, index) in challengerStore.currentChallenger.challenger_seances" 
              :key="index"
            >
              <v-expansion-panel-title>
                <div class="d-flex justify-space-between align-center w-100">
                  <div>
                    <h4 class="text-h6 font-weight-bold">
                      Training #{{ seance.id }}
                    </h4>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDate(seance.created_at) }} • {{ seance.trainings?.length || 0 }} exercises
                    </div>
                  </div>
                  <div class="d-flex align-center">
                    <v-chip 
                      v-if="AuthStore.userAuth?.id == seance.coach_id" 
                      color="cyan" 
                      size="small"
                      class="mr-2"
                    >
            By me
          </v-chip>
                    <v-chip 
                      v-else-if="AuthStore.userAuth?.id !== seance.coach_id && seance.admin_id" 
                      color="primary" 
                      size="small"
                      class="mr-2"
                    >
            Coached
          </v-chip>
                    <v-chip 
                      v-else-if="!seance.coach_id && !seance.admin_id" 
                      color="pink" 
                      size="small"
                      class="mr-2"
                    >
            Solo
          </v-chip>
                    
                    <v-chip 
                      v-if="seance.validated === 1" 
                      color="success" 
                      size="small"
                    >
            Validé
          </v-chip>
                    <v-chip 
                      v-else-if="seance.validated === 0" 
                      color="info" 
                      size="small"
                    >
                      A valider
          </v-chip>
                    <v-chip 
                      v-else-if="seance.validated === null && AuthStore.userAuth?.id == seance.coach_id && (!seance.trainings || seance.trainings.length == 0)" 
                      color="error" 
                      size="small"
                    >
            A remplir
          </v-chip>
                    <v-chip 
                      v-else-if="seance.validated === null" 
                      color="warning" 
                      size="small"
                    >
                      En attente
          </v-chip>
                  </div>
                </div>
              </v-expansion-panel-title>
              
              <v-expansion-panel-text>
                <!-- Training Details -->
                <div v-if="seance.trainings && seance.trainings.length > 0" class="mt-3">
                  <div class="text-caption font-weight-bold mb-3">Exercises:</div>
                  <v-list>
                    <v-list-item
                      v-for="(training, idx) in seance.trainings" 
                      :key="idx"
                      class="px-0"
                    >
                      <template v-slot:prepend>
                        <v-icon color="primary" size="small">mdi-dumbbell</v-icon>
                      </template>
                      
                      <v-list-item-title class="font-weight-medium">
                        {{ training.name }}
                      </v-list-item-title>
                      
                      <v-list-item-subtitle class="text-caption">
                        {{ training.pivot.series }} x {{ training.pivot.repetitions }}
                        <span v-if="training.pivot.duree">|| {{ training.pivot.duree }}s</span>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>
                
                <div v-else class="text-center py-4">
                  <v-icon color="grey-lighten-1" size="large">mdi-dumbbell-off</v-icon>
                  <div class="text-caption text-medium-emphasis mt-2">Aucun exercice assigné</div>
                </div>

                <!-- Action Button -->
                <div v-if="AuthStore.userAuth?.id == seance.coach_id" class="mt-4">
                  <v-btn 
                    :to="`/coach/seance/${seance.id}`"
                    variant="outlined" 
                    size="small"
                    color="primary"
                    prepend-icon="mdi-pencil"
                  >
                    Editer
                  </v-btn>
          </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useChallengerStore } from '../../../store/CoachStore/ChallengerStore'
import { useAuthStore } from '../../../store/AuthStore'
import { getAvatarUrl } from '../../../config/constants'
import VueApexCharts from 'vue3-apexcharts'

export default defineComponent({
  components: {
    apexchart: VueApexCharts
  },
  setup() {
    const challengerStore = useChallengerStore()
    const route = useRoute()
    const AuthStore = useAuthStore()
    
    AuthStore.getUserAuth()
    
    if(challengerStore.currentChallenger){
      if(challengerStore.currentChallenger.id != Number(route.params.id)){
        challengerStore.loading = true
        challengerStore.currentChallenger = null
        challengerStore.showChallenger(Number(route.params.id))
      }
    }
    if(!challengerStore.currentChallenger){
      challengerStore.loading = true
      challengerStore.currentChallenger = null
      challengerStore.showChallenger(Number(route.params.id))
    }

    const formatDate = (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }

    const calculateTotalActivity = () => {
      if (!challengerStore.currentChallenger?.challenger_seances) return 0
      const totalSeances = challengerStore.currentChallenger.challenger_seances.length
      const completedSeances = challengerStore.currentChallenger.challenger_seances.filter(
        (seance: any) => seance.validated === 1
      ).length
      return Math.round((completedSeances / totalSeances) * 100) || 0
    }

    const calculateProductivity = () => {
      if (!challengerStore.currentChallenger?.challenger_seances) return 0
      const monthlySessions = challengerStore.currentChallenger.challenger_seances.filter(
        (seance: any) => {
          const seanceDate = new Date(seance.created_at)
          const currentDate = new Date()
          return seanceDate.getMonth() === currentDate.getMonth() && 
                 seanceDate.getFullYear() === currentDate.getFullYear()
        }
      ).length
      const productivity = (monthlySessions / 15) * 100
      return Math.min(Math.round(productivity), 100)
    }

    const calculateTotalHours = () => {
      if (!challengerStore.currentChallenger?.challenger_seances) return 0
      // Estimation: 1 heure par séance
      return challengerStore.currentChallenger.challenger_seances.length
    }

    const calculateTotalExercises = () => {
      if (!challengerStore.currentChallenger?.challenger_seances) return 0
      return challengerStore.currentChallenger.challenger_seances.reduce((sum: number, seance: any) => {
        return sum + (seance.trainings?.length || 0);
      }, 0);
    }

    const calculateMonthlySessions = () => {
      if (!challengerStore.currentChallenger?.challenger_seances) return 0;
      const currentDate = new Date();
      return challengerStore.currentChallenger.challenger_seances.filter(
        (seance: any) => {
          const seanceDate = new Date(seance.created_at);
          return seanceDate.getMonth() === currentDate.getMonth() &&
                 seanceDate.getFullYear() === currentDate.getFullYear();
        }
      ).length;
    };

    // Configuration du graphique ApexCharts
    const chartOptions = computed(() => ({
      chart: {
        type: 'bar',
        height: 200,
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
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yaxis: {
        title: {
          text: 'Exercises Performed'
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + " exercises performed"
          }
        }
      },
      colors: ['#2196F3']
    }))

    const chartSeries = computed(() => {
      console.log('exerciseCountByDay:', challengerStore.currentChallenger?.exerciseCountByDay);
      return [{
        name: 'Exercises Performed',
        data: challengerStore.currentChallenger?.exerciseCountByDay || [0, 0, 0, 0, 0, 0, 0]
      }]
    })

    // Configuration du graphique de la jauge
    const gaugeOptions = computed(() => ({
      chart: {
        height: 200,
        type: 'radialBar',
        offsetY: -10
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          dataLabels: {
            name: {
              fontSize: '16px',
              color: undefined,
              offsetY: 120
            },
            value: {
              offsetY: 76,
              fontSize: '22px',
              color: undefined,
              formatter: function (val: number) {
                return val + "%";
              }
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          shadeIntensity: 0.15,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 65, 91]
        }
      },
      stroke: {
        dashArray: 4
      },
      labels: ['Productivité'],
      colors: ['#2196F3']
    }))

    const gaugeSeries = computed(() => [calculateProductivity()])

    return { 
      challengerStore, 
      AuthStore, 
      formatDate,
      calculateTotalActivity,
      calculateProductivity,
      calculateTotalHours,
      calculateTotalExercises,
      calculateMonthlySessions,
      chartOptions,
      chartSeries,
      gaugeOptions,
      gaugeSeries,
      getAvatarUrl
    }
  }
})
</script>

<style scoped>
.avatar-border {
  border: 3px solid #e0e0e0;
  background-color: #f5f5f5;
}

.activity-legend {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.activity-legend.blue {
  background-color: #2196F3;
}

.activity-legend.green {
  background-color: #4CAF50;
}

.activity-legend.purple {
  background-color: #9C27B0;
}

.training-card {
  transition: transform 0.2s ease-in-out;
}

.training-card:hover {
  transform: translateY(-2px);
}

.training-exercises {
  max-height: 120px;
  overflow-y: auto;
}

.exercise-item {
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.exercise-item:last-child {
  border-bottom: none;
}
</style>
