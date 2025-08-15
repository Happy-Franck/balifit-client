<template>
  <div class="profile-view">
    <!-- Photo de couverture avec avatar flottant -->
    <div class="cover-section">
      <div class="cover-image">
        <v-img
          :src="user?.cover_photo ? `${APP_CONFIG.STORAGE_BASE_URL}/covers/${user.cover_photo}` : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'"
          height="300"
          cover
          class="cover-bg"
        >
          <div class="cover-overlay"></div>
        </v-img>
      </div>
      
      <!-- Avatar flottant -->
      <div class="avatar-container">
        <v-avatar
          size="150"
          class="avatar-floating elevation-8"
          @click="showAvatarModal = true"
          style="border: 3px solid white;"
        >
          <v-img 
            v-if="user?.avatar" 
            :src="`${APP_CONFIG.STORAGE_BASE_URL}/avatars/${user.avatar}`"
            cover
          ></v-img>
          <v-icon v-else size="75" color="white">mdi-account</v-icon>
        </v-avatar>
      </div>
    </div>

    <!-- Informations principales -->
    <v-container class="profile-content">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <!-- Section nom, email, bio et bouton éditer -->
          <div class="profile-header">
            <h1 class="text-h3 font-weight-bold mb-2">{{ user?.name || 'Utilisateur' }}</h1>
            <p class="text-h6 text-medium-emphasis mb-3">{{ user?.email || 'email@example.com' }}</p>
            
            <!-- Bio -->
            <p v-if="user?.bio" class="text-body-1 mb-4">{{ user.bio }}</p>
            <p v-else class="text-body-1 text-medium-emphasis mb-4 font-italic">Aucune biographie renseignée</p>
            
            <!-- Bouton éditer -->
            <v-btn 
              color="primary" 
              @click="goToEdit"
              variant="elevated"
              size="large"
              class="mb-6"
            >
              <v-icon class="mr-2">mdi-account-edit</v-icon>
              Éditer mon profil
            </v-btn>
          </div>

          <!-- Layout Challenger - Design moderne et spécifique -->
          <div v-if="isChallenger" class="challenger-layout">
            <!-- Stats Cards -->
            <v-row class="mb-6">
              <v-col cols="12" sm="6" md="3">
                <v-card class="stats-card" elevation="4" rounded="lg">
                  <v-card-text class="text-center pa-6">
                    <v-icon size="48" color="primary" class="mb-3">mdi-dumbbell</v-icon>
                    <h3 class="text-h4 font-weight-bold text-primary mb-1">{{ fitnessStats.totalSessions || 0 }}</h3>
                    <p class="text-body-2 text-medium-emphasis">Séances Total</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card class="stats-card" elevation="4" rounded="lg">
                  <v-card-text class="text-center pa-6">
                    <v-icon size="48" color="success" class="mb-3">mdi-calendar-month</v-icon>
                    <h3 class="text-h4 font-weight-bold text-success mb-1">{{ fitnessStats.monthlySessions || 0 }}</h3>
                    <p class="text-body-2 text-medium-emphasis">Ce Mois</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card class="stats-card" elevation="4" rounded="lg">
                  <v-card-text class="text-center pa-6">
                    <v-icon size="48" color="warning" class="mb-3">mdi-target</v-icon>
                    <h3 class="text-h4 font-weight-bold text-warning mb-1">{{ fitnessStats.soloSessions || 0 }}</h3>
                    <p class="text-body-2 text-medium-emphasis">Solo</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card class="stats-card" elevation="4" rounded="lg">
                  <v-card-text class="text-center pa-6">
                    <v-icon size="48" color="info" class="mb-3">mdi-star</v-icon>
                    <h3 class="text-h4 font-weight-bold text-info mb-1">{{ fitnessStats.sessionsCompleted || 0 }}</h3>
                    <p class="text-body-2 text-medium-emphasis">Complétées</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row>
              <!-- Colonne gauche -->
              <v-col cols="12" lg="8">
                <!-- Informations personnelles -->
                <v-card class="mb-6 custom-card" elevation="4" rounded="lg">
                  <v-card-title class="custom-card-title d-flex align-center">
                    <v-icon class="mr-3" color="primary">mdi-account-details</v-icon>
                    Informations personnelles
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="info-item mb-4">
                          <div class="info-label">Téléphone</div>
                          <div class="info-value">{{ user?.telephone || 'Non renseigné' }}</div>
                        </div>
                        <div class="info-item mb-4">
                          <div class="info-label">CIN</div>
                          <div class="info-value">{{ user?.cin || 'Non renseigné' }}</div>
                        </div>
                        <div class="info-item mb-4">
                          <div class="info-label">Sexe</div>
                          <div class="info-value">{{ formatSexe(user?.sexe) }}</div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="info-item mb-4">
                          <div class="info-label">Date de naissance</div>
                          <div class="info-value">{{ formatDate(user?.date_naissance) }}</div>
                        </div>
                        <div class="info-item mb-4">
                          <div class="info-label">Membre depuis</div>
                          <div class="info-value">{{ formatDate(user?.created_at) }}</div>
                        </div>
                        <div class="info-item mb-4">
                          <div class="info-label">Âge</div>
                          <div class="info-value">{{ calculateAge(user?.date_naissance) }}</div>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- Informations physiques -->
                <v-card class="mb-6 custom-card" elevation="4" rounded="lg">
                  <v-card-title class="custom-card-title d-flex align-center">
                    <v-icon class="mr-3" color="success">mdi-human</v-icon>
                    Informations physiques
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="4">
                        <div class="physical-stat">
                          <div class="stat-icon">
                            <v-icon size="32" color="primary">mdi-ruler</v-icon>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ user?.taille ? `${user.taille} m` : 'Non renseigné' }}</div>
                            <div class="stat-label">Taille</div>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="4">
                        <div class="physical-stat">
                          <div class="stat-icon">
                            <v-icon size="32" color="warning">mdi-weight</v-icon>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ currentWeight ? `${currentWeight} kg` : 'Non renseigné' }}</div>
                            <div class="stat-label">Poids actuel</div>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="4">
                        <div class="physical-stat">
                          <div class="stat-icon">
                            <v-icon size="32" color="info">mdi-calculator</v-icon>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ calculateIMC() }}</div>
                            <div class="stat-label">IMC</div>
                          </div>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- Historique de poids -->
                <v-card class="mb-6 custom-card" elevation="4" rounded="lg" v-if="weightHistory.length > 0">
                  <v-card-title class="custom-card-title d-flex align-center">
                    <v-icon class="mr-3" color="warning">mdi-chart-line</v-icon>
                    Évolution du poids
                    <v-spacer></v-spacer>
                    <v-btn 
                      variant="text" 
                      @click="showAllWeight = !showAllWeight"
                      size="small"
                    >
                      {{ showAllWeight ? 'Voir moins' : 'Voir tout' }}
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <div class="weight-history">
                      <div 
                        v-for="(entry, index) in (showAllWeight ? weightHistory : weightHistory.slice(-5))" 
                        :key="index"
                        class="weight-entry"
                      >
                        <div class="weight-icon">
                          <v-icon color="primary">mdi-weight</v-icon>
                        </div>
                        <div class="weight-info">
                          <div class="weight-value">{{ entry.valeur }} kg</div>
                          <div class="weight-date">{{ formatDate(entry.date) }}</div>
                        </div>
                        <v-chip 
                          v-if="index === weightHistory.length - 1" 
                          color="success" 
                          size="small"
                        >
                          Actuel
                        </v-chip>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Colonne droite -->
              <v-col cols="12" lg="4">
                <!-- Objectif -->
                <v-card class="mb-6 custom-card" elevation="4" rounded="lg">
                  <v-card-title class="custom-card-title d-flex align-center">
                    <v-icon class="mr-3" color="primary">mdi-target</v-icon>
                    Mon Objectif
                  </v-card-title>
                  <v-card-text class="text-center">
                    <v-chip 
                      v-if="user?.objectif" 
                      color="primary" 
                      variant="elevated"
                      size="large"
                      class="mb-3"
                    >
                      {{ formatObjectif(user.objectif) }}
                    </v-chip>
                    <span v-else class="text-medium-emphasis">Non renseigné</span>
                    
                    <div class="mt-4">
                      <v-btn 
                        color="primary" 
                        variant="outlined"
                        @click="goToEdit"
                        block
                      >
                        <v-icon class="mr-2">mdi-pencil</v-icon>
                        Modifier l'objectif
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Rôles -->
                <v-card class="mb-6 custom-card" elevation="4" rounded="lg">
                  <v-card-title class="custom-card-title d-flex align-center">
                    <v-icon class="mr-3" color="success">mdi-shield-account</v-icon>
                    Mon Rôle
                  </v-card-title>
                  <v-card-text>
                    <div class="text-center">
                      <v-chip 
                        v-for="role in user?.roles" 
                        :key="role.id"
                        class="mb-2"
                        color="success"
                        variant="elevated"
                        size="large"
                      >
                        {{ role.name }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Actions rapides -->
                <v-card class="custom-card" elevation="4" rounded="lg">
                  <v-card-title class="custom-card-title d-flex align-center">
                    <v-icon class="mr-3" color="info">mdi-lightning-bolt</v-icon>
                    Actions rapides
                  </v-card-title>
                  <v-card-text>
                    <v-btn 
                      color="primary" 
                      variant="flat"
                      block
                      class="mb-3"
                      @click="$router.push('/challenger/dashboard')"
                    >
                      <v-icon class="mr-2">mdi-view-dashboard</v-icon>
                      Dashboard
                    </v-btn>
                    <v-btn 
                      color="success" 
                      variant="flat"
                      block
                      class="mb-3"
                      @click="$router.push('/challenger/exercice')"
                    >
                      <v-icon class="mr-2">mdi-dumbbell</v-icon>
                      Mes Exercices
                    </v-btn>
                    <v-btn 
                      color="warning" 
                      variant="flat"
                      block
                      @click="$router.push('/challenger/seance')"
                    >
                      <v-icon class="mr-2">mdi-calendar-check</v-icon>
                      Mes Séances
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Layout conditionnel selon le rôle -->
          <!-- Layout Administrateur : 2 colonnes -->
          <div v-else-if="isAdmin" class="admin-layout">
            <v-row>
              <!-- Colonne gauche -->
              <v-col cols="12" md="6">
                <!-- Informations personnelles -->
                <v-card class="mb-4 custom-card">
                  <v-card-title class="custom-card-title">
                    Informations personnelles
                  </v-card-title>
                  <v-card-text>
                    <div class="admin-info-grid">
                      <div class="admin-info-item">
                        <div class="admin-info-label">Téléphone</div>
                        <div class="admin-info-value">{{ user?.telephone || 'Non renseigné' }}</div>
                      </div>
                      <div class="admin-info-item">
                        <div class="admin-info-label">CIN</div>
                        <div class="admin-info-value">{{ user?.cin || 'Non renseigné' }}</div>
                      </div>
                      <div class="admin-info-item">
                        <div class="admin-info-label">Sexe</div>
                        <div class="admin-info-value">{{ formatSexe(user?.sexe) }}</div>
                      </div>
                      <div class="admin-info-item">
                        <div class="admin-info-label">Date de naissance</div>
                        <div class="admin-info-value">{{ formatDate(user?.date_naissance) }}</div>
                      </div>
                      <div class="admin-info-item">
                        <div class="admin-info-label">Membre depuis</div>
                        <div class="admin-info-value">{{ formatDate(user?.created_at) }}</div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Informations physiques -->
                <v-card class="mb-4 custom-card">
                  <v-card-title class="custom-card-title">
                    Informations physiques
                  </v-card-title>
                  <v-card-text>
                    <div class="admin-info-grid">
                      <div class="admin-info-item">
                        <div class="admin-info-label">Taille</div>
                        <div class="admin-info-value">{{ user?.taille ? `${user.taille} m` : 'Non renseigné' }}</div>
                      </div>
                      <div class="admin-info-item">
                        <div class="admin-info-label">Poids actuel</div>
                        <div class="admin-info-value">{{ currentWeight ? `${currentWeight} kg` : 'Non renseigné' }}</div>
                      </div>
                      <div class="admin-info-item">
                        <div class="admin-info-label">IMC</div>
                        <div class="admin-info-value">{{ calculateIMC() }}</div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Colonne droite -->
              <v-col cols="12" md="6">
                <!-- Objectif -->
                <v-card class="mb-4 custom-card">
                  <v-card-title class="custom-card-title">
                    Objectif
                  </v-card-title>
                  <v-card-text>
                    <v-chip 
                      v-if="user?.objectif" 
                      color="primary" 
                      variant="elevated"
                      size="large"
                    >
                      {{ formatObjectif(user.objectif) }}
                    </v-chip>
                    <span v-else class="text-medium-emphasis">Non renseigné</span>
                  </v-card-text>
                </v-card>

                <!-- Rôles et permissions -->
                <v-card class="custom-card">
                  <v-card-title class="custom-card-title">
                    Rôles et permissions
                  </v-card-title>
                  <v-card-text>
                    <div class="mb-4">
                      <div class="admin-info-label mb-2">Rôles</div>
                      <v-chip 
                        v-for="role in user?.roles" 
                        :key="role.id"
                        class="mr-2"
                        color="success"
                        variant="elevated"
                      >
                        {{ role.name }}
                      </v-chip>
                    </div>
                    <div v-if="user?.permissions && user.permissions.length > 0">
                      <div class="admin-info-label mb-2">Permissions spéciales</div>
                      <v-chip 
                        v-for="permission in user.permissions" 
                        :key="permission.id"
                        class="mr-2 mb-1"
                        color="info"
                        variant="outlined"
                        size="small"
                      >
                        {{ permission.name }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Layout Coach -->
          <div v-else-if="isCoach" class="coach-layout">
            <v-row>
              <!-- Colonne gauche -->
              <v-col cols="12" md="6">
                <v-card class="mb-4 custom-card">
                  <v-card-title class="custom-card-title">
                    Informations du coach
                  </v-card-title>
                  <v-card-text>
                    <div class="admin-info-grid">
                      <div class="admin-info-item">
                        <div class="admin-info-label">Téléphone</div>
                        <div class="admin-info-value">{{ user?.telephone || 'Non renseigné' }}</div>
                      </div>
                      <div class="admin-info-item">
                        <div class="admin-info-label">Sexe</div>
                        <div class="admin-info-value">{{ formatSexe(user?.sexe) }}</div>
                      </div>
                      <div class="admin-info-item">
                        <div class="admin-info-label">Membre depuis</div>
                        <div class="admin-info-value">{{ formatDate(user?.created_at) }}</div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <v-card class="custom-card">
                  <v-card-title class="custom-card-title">
                    Objectif
                  </v-card-title>
                  <v-card-text>
                    <v-chip 
                      v-if="user?.objectif" 
                      color="primary" 
                      variant="elevated"
                      size="large"
                    >
                      {{ formatObjectif(user.objectif) }}
                    </v-chip>
                    <span v-else class="text-medium-emphasis">Non renseigné</span>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Colonne droite -->
              <v-col cols="12" md="6">
                <v-card class="custom-card">
                  <v-card-title class="custom-card-title">
                    Rôles et permissions
                  </v-card-title>
                  <v-card-text>
                    <div class="mb-4">
                      <div class="admin-info-label mb-2">Rôles</div>
                      <v-chip 
                        v-for="role in user?.roles" 
                        :key="role.id"
                        class="mr-2"
                        color="success"
                        variant="elevated"
                      >
                        {{ role.name }}
                      </v-chip>
                    </div>
                    <div v-if="user?.permissions && user.permissions.length > 0">
                      <div class="admin-info-label mb-2">Permissions spéciales</div>
                      <v-chip 
                        v-for="permission in user.permissions" 
                        :key="permission.id"
                        class="mr-2 mb-1"
                        color="info"
                        variant="outlined"
                        size="small"
                      >
                        {{ permission.name }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

        </v-col>
      </v-row>
    </v-container>

    <!-- Modal pour afficher l'avatar en grand -->
    <v-dialog v-model="showAvatarModal" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Photo de profil</span>
          <v-btn icon variant="text" @click="showAvatarModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-center pa-6">
          <v-avatar size="300" class="mb-4">
            <v-img 
              v-if="user?.avatar" 
              :src="`${APP_CONFIG.STORAGE_BASE_URL}/avatars/${user.avatar}`"
              cover
            ></v-img>
            <v-icon v-else size="150">mdi-account</v-icon>
          </v-avatar>
          <div class="text-h6">{{ user?.name }}</div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar pour les messages -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">
          Fermer
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/AuthStore'
import { APP_CONFIG } from '../../config/constants'
import type User from '../../types/User'

const router = useRouter()
const authStore = useAuthStore()
const weightHistory = ref<Array<{date: string, valeur: number}>>([])
const showAllWeight = ref(false)
const showAvatarModal = ref(false)

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

// Utiliser directement authStore.userAuth au lieu d'une variable locale
const user = computed(() => authStore.userAuth)

const currentWeight = computed(() => {
  if (weightHistory.value.length > 0) {
    return weightHistory.value[weightHistory.value.length - 1].valeur
  }
  return null
})

const isAdmin = computed(() => {
  return user.value?.roles?.some(role => role.name === 'administrateur') || false
})

const isCoach = computed(() => {
  return user.value?.roles?.some(role => role.name === 'coach') || false
})

const isChallenger = computed(() => {
  return user.value?.roles?.some(role => role.name === 'challenger') || false
})

// Statistiques de fitness pour les challengers
const fitnessStats = computed(() => {
  // Simuler des statistiques basées sur les données utilisateur
  return {
    totalSessions: Math.floor(Math.random() * 50) + 10,
    monthlySessions: Math.floor(Math.random() * 15) + 5,
    soloSessions: Math.floor(Math.random() * 20) + 3,
    sessionsCompleted: Math.floor(Math.random() * 40) + 8
  }
})

const goToEdit = () => {
  // Déterminer la route d'édition selon le rôle
  const userRole = user.value?.roles?.[0]?.name
  switch (userRole) {
    case 'administrateur':
      router.push('/admin/profile/edit')
      break
    case 'coach':
      router.push('/coach/profile/edit')
      break
    case 'challenger':
      router.push('/challenger/profile/edit')
      break
    default:
      router.push('/profile/edit')
  }
}

const loadWeightHistory = async () => {
  try {
    const history = await authStore.getWeightHistory()
    weightHistory.value = history || []
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Non renseigné'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatSexe = (sexe: string | null) => {
  if (!sexe) return 'Non renseigné'
  return sexe.charAt(0).toUpperCase() + sexe.slice(1)
}

const formatObjectif = (objectif: string) => {
  return objectif.charAt(0).toUpperCase() + objectif.slice(1)
}

const calculateIMC = () => {
  if (!user.value?.taille || !currentWeight.value) {
    return 'Non calculable'
  }
  const imc = currentWeight.value / (user.value.taille * user.value.taille)
  return `${imc.toFixed(1)} kg/m²`
}

const calculateAge = (dateString: string | null) => {
  if (!dateString) return 'Non renseigné'
  const birthDate = new Date(dateString)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return `${age} ans`
}

const showSnackbar = (message: string, color: string) => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

onMounted(() => {
  // Charger seulement l'historique de poids car les données utilisateur sont déjà chargées par le layout
  loadWeightHistory()
})
</script>

<style scoped>
.cover-section {
  position: relative;
  height: 300px;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.avatar-container {
  border-radius: 50%;
  position: absolute;
  bottom: -25%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

.avatar-floating {
  cursor: pointer;
}

.profile-content {
  padding-top: 125px;
}

.profile-header {
  text-align: center;
  margin-bottom: 24px;
}

.profile-sections {
  margin-bottom: 24px;
}

.profile-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  border-bottom: 2px solid rgb(var(--v-theme-primary));
  padding-bottom: 8px;
}

.section-content {
  padding: 16px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  margin-bottom: 12px;
}

.info-label {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.info-value {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1rem;
}

.weight-history {
  margin-bottom: 16px;
}

.weight-entry {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.weight-entry:last-child {
  border-bottom: none;
}

.weight-icon {
  margin-right: 12px;
  color: rgb(var(--v-theme-primary));
}

.weight-info {
  flex: 1;
}

.weight-value {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.1rem;
}

.weight-date {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.875rem;
}

/* Styles spécifiques pour les challengers */
.challenger-layout {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  padding: 24px;
  margin: -24px;
}

.stats-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.custom-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.custom-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}

.custom-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  padding: 20px 20px 8px 20px;
}

.physical-stat {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 12px;
  margin-bottom: 16px;
}

.stat-icon {
  margin-right: 16px;
  padding: 12px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Responsive pour mobile */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.25rem;
  }

  .challenger-layout {
    padding: 16px;
    margin: -16px;
  }

  .physical-stat {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
}

/* Styles pour les cardes administrateur */
.admin-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: rgb(var(--v-theme-surface));
}

.admin-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  padding: 20px 20px 8px 20px;
}

/* Styles pour les administrateurs */
.admin-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.admin-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.admin-info-item:last-child {
  border-bottom: none;
}

.admin-info-label {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
  flex-shrink: 0;
  margin-right: 16px;
}

.admin-info-value {
  font-weight: 400;
  color: rgb(var(--v-theme-on-surface));
  text-align: right;
  word-break: break-word;
}

.profile-sections {
  margin-bottom: 24px;
}
</style> 