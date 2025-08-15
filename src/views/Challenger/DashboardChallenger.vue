<template>
  <div class="dashboard-client">
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <v-parallax :src="back" height="300" class="dashboard-header">
          <div class="d-flex flex-column fill-height justify-center align-center text-white">
            <v-avatar size="80" class="mb-4" color="white">
              <v-icon size="40" color="primary">mdi-account-circle</v-icon>
            </v-avatar>
            <h1 class="text-h3 font-weight-bold mb-2">
              Bienvenue sur votre Dashboard
            </h1>
            <h4 class="text-h6 font-weight-light opacity-75">
              Gérez vos défis et suivez vos progrès
            </h4>
            <v-chip class="mt-4" color="success" variant="flat">
              <v-icon start>mdi-check-circle</v-icon>
              Connecté
            </v-chip>
          </div>
        </v-parallax>
      </v-col>
    </v-row>

    <v-container fluid class="pa-6">
      <!-- Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card" elevation="4" rounded="lg">
            <v-card-text class="text-center pa-6">
              <v-icon size="48" color="primary" class="mb-3">mdi-trophy</v-icon>
              <h3 class="text-h4 font-weight-bold text-primary mb-1">12</h3>
              <p class="text-body-2 text-medium-emphasis">Défis Complétés</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card" elevation="4" rounded="lg">
            <v-card-text class="text-center pa-6">
              <v-icon size="48" color="success" class="mb-3">mdi-fire</v-icon>
              <h3 class="text-h4 font-weight-bold text-success mb-1">8</h3>
              <p class="text-body-2 text-medium-emphasis">En Cours</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card" elevation="4" rounded="lg">
            <v-card-text class="text-center pa-6">
              <v-icon size="48" color="warning" class="mb-3">mdi-target</v-icon>
              <h3 class="text-h4 font-weight-bold text-warning mb-1">85%</h3>
              <p class="text-body-2 text-medium-emphasis">Taux de Réussite</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card" elevation="4" rounded="lg">
            <v-card-text class="text-center pa-6">
              <v-icon size="48" color="info" class="mb-3">mdi-star</v-icon>
              <h3 class="text-h4 font-weight-bold text-info mb-1">1,250</h3>
              <p class="text-body-2 text-medium-emphasis">Points Gagnés</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Main Content -->
      <v-row>
        <!-- Left Column -->
        <v-col cols="12" lg="8">
          <!-- Current Challenge -->
          <v-card class="mb-6" elevation="4" rounded="lg">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-3" color="primary">mdi-sword-cross</v-icon>
              Défi en Cours
              <v-spacer></v-spacer>
              <v-chip color="success" variant="flat">Actif</v-chip>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-img
                    :aspect-ratio="16/9"
                    cover
                    :src="one"
                    rounded="lg"
                    class="mb-4"
                  ></v-img>
                </v-col>
                <v-col cols="12" md="6">
                  <h3 class="text-h5 font-weight-bold mb-3">Défi Fitness 30 Jours</h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    Relevez le défi de 30 jours pour transformer votre corps et votre esprit. 
                    Chaque jour, de nouveaux exercices vous attendent.
                  </p>
                  <v-progress-linear
                    v-model="challengeProgress"
                    color="primary"
                    height="8"
                    rounded
                    class="mb-3"
                  ></v-progress-linear>
                  <div class="d-flex justify-space-between text-caption text-medium-emphasis mb-4">
                    <span>Jour 15 sur 30</span>
                    <span>{{ challengeProgress }}%</span>
                  </div>
                  <v-btn color="primary" variant="flat" block>
                    Continuer le Défi
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Recent Activities -->
          <v-card class="mb-6" elevation="4" rounded="lg">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-3" color="info">mdi-clock-outline</v-icon>
              Activités Récentes
            </v-card-title>
            <v-card-text>
              <v-timeline side="end" density="compact">
                <v-timeline-item
                  v-for="(activity, index) in recentActivities"
                  :key="index"
                  :dot-color="activity.color"
                  size="small"
                >
                  <v-card variant="outlined" class="mb-3">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-center">
                        <v-avatar size="32" :color="activity.color" class="mr-3">
                          <v-icon size="16" color="white">{{ activity.icon }}</v-icon>
                        </v-avatar>
                        <div>
                          <div class="font-weight-medium">{{ activity.title }}</div>
                          <div class="text-caption text-medium-emphasis">{{ activity.time }}</div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>

          <!-- Achievement Section -->
          <v-card elevation="4" rounded="lg">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-3" color="warning">mdi-medal</v-icon>
              Réalisations
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" v-for="achievement in achievements" :key="achievement.id">
                  <v-card variant="outlined" class="achievement-card">
                    <v-card-text class="text-center pa-4">
                      <v-icon size="48" :color="achievement.color" class="mb-3">
                        {{ achievement.icon }}
                      </v-icon>
                      <h4 class="text-h6 font-weight-bold mb-2">{{ achievement.title }}</h4>
                      <p class="text-body-2 text-medium-emphasis">{{ achievement.description }}</p>
                      <v-chip :color="achievement.color" variant="flat" size="small" class="mt-3">
                        {{ achievement.points }} pts
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column -->
        <v-col cols="12" lg="4">
          <!-- Quick Actions -->
          <v-card class="mb-6" elevation="4" rounded="lg">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-3" color="success">mdi-lightning-bolt</v-icon>
              Actions Rapides
            </v-card-title>
            <v-card-text>
              <v-btn
                v-for="action in quickActions"
                :key="action.id"
                :color="action.color"
                variant="flat"
                block
                class="mb-3"
                :prepend-icon="action.icon"
              >
                {{ action.title }}
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Leaderboard -->
          <v-card class="mb-6" elevation="4" rounded="lg">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-3" color="primary">mdi-podium</v-icon>
              Classement
            </v-card-title>
            <v-card-text>
              <div v-for="(player, index) in leaderboard" :key="player.id" class="d-flex align-center mb-4">
                <v-avatar size="40" :color="getRankColor(index)" class="mr-3">
                  <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-medium">{{ player.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ player.points }} points</div>
                </div>
                <v-icon v-if="index < 3" :color="getRankColor(index)" size="20">
                  mdi-crown
                </v-icon>
              </div>
            </v-card-text>
          </v-card>

          <!-- Notifications -->
          <v-card elevation="4" rounded="lg">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-3" color="info">mdi-bell</v-icon>
              Notifications
              <v-spacer></v-spacer>
              <v-badge :content="notifications.length" color="error"></v-badge>
            </v-card-title>
            <v-card-text>
              <div v-for="notification in notifications" :key="notification.id" class="mb-3">
                <v-alert
                  :color="notification.color"
                  variant="tonal"
                  density="compact"
                  class="mb-2"
                >
                  <div class="d-flex align-center">
                    <v-icon size="16" class="mr-2">{{ notification.icon }}</v-icon>
                    <div>
                      <div class="font-weight-medium text-caption">{{ notification.title }}</div>
                      <div class="text-caption">{{ notification.message }}</div>
                    </div>
                  </div>
                </v-alert>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  export default {
    data: () => ({
      volume: 2,
      alert: true,
      challengeProgress: 50,
      recentActivities: [
        {
          title: "Défi complété",
          time: "Il y a 2 heures",
          color: "success",
          icon: "mdi-check-circle"
        },
        {
          title: "Nouveau niveau atteint",
          time: "Il y a 4 heures",
          color: "primary",
          icon: "mdi-star"
        },
        {
          title: "Exercice terminé",
          time: "Il y a 6 heures",
          color: "info",
          icon: "mdi-dumbbell"
        }
      ],
      achievements: [
        {
          id: 1,
          title: "Premier Pas",
          description: "Complétez votre premier défi",
          icon: "mdi-trophy",
          color: "warning",
          points: 100
        },
        {
          id: 2,
          title: "Sérieux",
          description: "7 jours consécutifs",
          icon: "mdi-fire",
          color: "error",
          points: 250
        },
        {
          id: 3,
          title: "Déterminé",
          description: "30 jours d'activité",
          icon: "mdi-medal",
          color: "primary",
          points: 500
        },
        {
          id: 4,
          title: "Expert",
          description: "100 défis complétés",
          icon: "mdi-crown",
          color: "success",
          points: 1000
        }
      ],
      quickActions: [
        {
          id: 1,
          title: "Nouveau Défi",
          icon: "mdi-plus",
          color: "primary"
        },
        {
          id: 2,
          title: "Voir Progrès",
          icon: "mdi-chart-line",
          color: "success"
        },
        {
          id: 3,
          title: "Paramètres",
          icon: "mdi-cog",
          color: "info"
        }
      ],
      leaderboard: [
        { id: 1, name: "Alex Martin", points: 2450 },
        { id: 2, name: "Sarah Johnson", points: 2200 },
        { id: 3, name: "Mike Wilson", points: 1950 },
        { id: 4, name: "Emma Davis", points: 1800 },
        { id: 5, name: "John Smith", points: 1650 }
      ],
      notifications: [
        {
          id: 1,
          title: "Nouveau défi disponible",
          message: "Le défi 'Fitness Avancé' est maintenant disponible",
          color: "info",
          icon: "mdi-bell"
        },
        {
          id: 2,
          title: "Félicitations !",
          message: "Vous avez atteint un nouveau niveau",
          color: "success",
          icon: "mdi-star"
        }
      ]
    }),
    methods: {
      getRankColor(index) {
        const colors = ['warning', 'grey', 'brown'];
        return colors[index] || 'grey';
      }
    }
  }
</script>

<script setup>
  import one from "../../assets/1.jpg"
  import two from "../../assets/2.jpg"
  import three from "../../assets/3.jpg"
  import four from "../../assets/4.jpg"
  import five from "../../assets/5.jpg"
  import back from "../../assets/back.jpg"
  import { useCategoryStore } from '@/store/ChallengerStore/CategoryStore'
  import { useTrainingStore } from '@/store/ChallengerStore/TrainingStore'

  const categoryStore = useCategoryStore()
  const trainingStore = useTrainingStore()
  categoryStore.getCategories()
  trainingStore.getTrainings()

  const items = [one, two, three, four, five]

  const time = [
    {
      id: 1,
      color: 'info',
      icon: 'mdi-information',
    },
    {
      id: 2,
      color: 'error',
      icon: 'mdi-alert-circle',
    },
  ]
</script>

<style scoped>
  .dashboard-client {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
  }

  .dashboard-header {
    position: relative;
  }

  .dashboard-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }

  .dashboard-header > div {
    position: relative;
    z-index: 2;
  }

  .stats-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .stats-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  }

  .achievement-card {
    transition: transform 0.3s ease;
    cursor: pointer;
  }

  .achievement-card:hover {
    transform: scale(1.02);
  }

  .v-card--reveal {
    align-items: center;
    bottom: 0;
    justify-content: center;
    opacity: .9;
    position: absolute;
    width: 100%;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>
