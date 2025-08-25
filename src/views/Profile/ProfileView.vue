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
            
            <!-- Boutons d'action -->
            <div class="profile-actions-container">
              <v-btn 
                color="primary" 
                @click="goToEdit"
                variant="elevated"
                size="large"
                class="profile-action-btn"
                min-width="200"
              >
                <v-icon start size="20">mdi-account-edit</v-icon>
                Éditer mon profil
              </v-btn>
              
              <v-btn 
                v-if="!isAdmin && !isCoach"
                color="secondary" 
                @click="$router.push({ name: 'billingPortal' })"
                variant="elevated"
                size="large"
                class="profile-action-btn"
                min-width="200"
              >
                <v-icon start size="20">mdi-credit-card</v-icon>
                Gérer mon abonnement
              </v-btn>
            </div>
          </div>

          <!-- Layout conditionnel selon le rôle -->
          <!-- Layout Administrateur : 2 colonnes -->
          <div v-if="isAdmin" class="admin-layout">
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

          <!-- Layout Challenger -->
          <div v-else-if="isChallenger" class="challenger-layout">
            <!-- Première rangée : Informations principales -->
            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <!-- Informations personnelles -->
                <v-card class="challenger-card h-100">
                  <v-card-title class="challenger-card-title">
                    <div class="d-flex align-center">
                      <v-icon class="me-3" size="24">mdi-account-circle</v-icon>
                      <span>Mes informations</span>
                    </div>
                  </v-card-title>
                  <v-card-text class="challenger-card-content">
                    <div class="info-grid-challenger">
                      <div class="info-item-challenger">
                        <div class="info-label-challenger">
                          <v-icon size="18" class="me-2">mdi-phone</v-icon>
                          Téléphone
                        </div>
                        <div class="info-value-challenger">{{ user?.telephone || 'Non renseigné' }}</div>
                      </div>
                      <div class="info-item-challenger">
                        <div class="info-label-challenger">
                          <v-icon size="18" class="me-2">mdi-gender-male-female</v-icon>
                          Sexe
                        </div>
                        <div class="info-value-challenger">{{ formatSexe(user?.sexe) }}</div>
                      </div>
                      <div class="info-item-challenger">
                        <div class="info-label-challenger">
                          <v-icon size="18" class="me-2">mdi-cake-variant</v-icon>
                          Date de naissance
                        </div>
                        <div class="info-value-challenger">{{ formatDate(user?.date_naissance) }}</div>
                      </div>
                      <div class="info-item-challenger">
                        <div class="info-label-challenger">
                          <v-icon size="18" class="me-2">mdi-calendar-check</v-icon>
                          Membre depuis
                        </div>
                        <div class="info-value-challenger">{{ formatDate(user?.created_at) }}</div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <!-- Données physiques -->
                <v-card class="challenger-card h-100">
                  <v-card-title class="challenger-card-title">
                    <div class="d-flex align-center">
                      <v-icon class="me-3" size="24">mdi-human</v-icon>
                      <span>Mes données physiques</span>
                    </div>
                  </v-card-title>
                  <v-card-text class="challenger-card-content">
                    <div class="info-grid-challenger">
                      <div class="info-item-challenger">
                        <div class="info-label-challenger">
                          <v-icon size="18" class="me-2">mdi-human-male-height</v-icon>
                          Taille
                        </div>
                        <div class="info-value-challenger">{{ user?.taille ? `${user.taille} m` : 'Non renseigné' }}</div>
                      </div>
                      <div class="info-item-challenger">
                        <div class="info-label-challenger">
                          <v-icon size="18" class="me-2">mdi-scale-bathroom</v-icon>
                          Poids actuel
                        </div>
                        <div class="info-value-challenger">{{ currentWeight ? `${currentWeight} kg` : 'Non renseigné' }}</div>
                      </div>
                      <div class="info-item-challenger">
                        <div class="info-label-challenger">
                          <v-icon size="18" class="me-2">mdi-calculator</v-icon>
                          IMC
                        </div>
                        <div class="info-value-challenger">
                          <v-chip 
                            v-if="calculateIMC() !== 'Non calculable'"
                            :color="getIMCColor()"
                            variant="tonal"
                            size="small"
                            class="font-weight-medium"
                          >
                            {{ calculateIMC() }}
                          </v-chip>
                          <span v-else class="text-medium-emphasis">{{ calculateIMC() }}</span>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Deuxième rangée : Objectif et Évolution -->
            <v-row>
              <v-col cols="12" md="6">
                <!-- Objectif -->
                <v-card class="challenger-card h-100">
                  <v-card-title class="challenger-card-title">
                    <div class="d-flex align-center">
                      <v-icon class="me-3" size="24">mdi-target</v-icon>
                      <span>Mon objectif</span>
                    </div>
                  </v-card-title>
                  <v-card-text class="challenger-card-content text-center">
                    <div class="objective-container">
                      <v-chip 
                        v-if="user?.objectif" 
                        color="primary" 
                        variant="elevated"
                        size="x-large"
                        class="objective-chip"
                      >
                        <v-icon start size="20">mdi-flag</v-icon>
                        {{ formatObjectif(user.objectif) }}
                      </v-chip>
                      <div v-else class="no-objective">
                        <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-target-variant</v-icon>
                        <p class="text-medium-emphasis">Aucun objectif défini</p>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <!-- Évolution récente -->
                <v-card class="challenger-card h-100" v-if="weightHistory.length > 0">
                  <v-card-title class="challenger-card-title">
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon class="me-3" size="24">mdi-chart-line</v-icon>
                        <span>Évolution récente</span>
                      </div>
                      <v-chip color="success" variant="tonal" size="small">
                        {{ weightHistory.length }} pesées
                      </v-chip>
                    </div>
                  </v-card-title>
                  <v-card-text class="challenger-card-content">
                    <div class="weight-evolution">
                      <div 
                        v-for="(weight, index) in weightHistory.slice(-3)" 
                        :key="index"
                        class="weight-entry-modern"
                      >
                        <div class="weight-date-modern">
                          <v-icon size="16" class="me-2">mdi-calendar</v-icon>
                          {{ formatDate(weight.date) }}
                        </div>
                        <div class="weight-value-modern">
                          <v-chip 
                            :color="index === weightHistory.slice(-3).length - 1 ? 'primary' : 'success'" 
                            variant="tonal" 
                            size="small"
                            class="font-weight-bold"
                          >
                            {{ weight.valeur }} kg
                          </v-chip>
                        </div>
                      </div>
                    </div>
                    <v-divider class="my-3" v-if="weightHistory.length > 3"></v-divider>
                    <div class="text-center" v-if="weightHistory.length > 3">
                      <v-btn 
                        variant="text" 
                        size="small" 
                        color="primary"
                        @click="showAllWeight = !showAllWeight"
                        prepend-icon="mdi-history"
                      >
                        {{ showAllWeight ? 'Voir moins' : 'Historique complet' }}
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Message si pas d'historique -->
                <v-card class="challenger-card h-100" v-else>
                  <v-card-title class="challenger-card-title">
                    <div class="d-flex align-center">
                      <v-icon class="me-3" size="24">mdi-chart-line</v-icon>
                      <span>Évolution</span>
                    </div>
                  </v-card-title>
                  <v-card-text class="challenger-card-content text-center">
                    <div class="no-data-container">
                      <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-chart-line-variant</v-icon>
                      <p class="text-medium-emphasis mb-3">Aucune donnée de poids enregistrée</p>
                      <v-btn color="primary" variant="tonal" size="small">
                        <v-icon start>mdi-plus</v-icon>
                        Ajouter une pesée
                      </v-btn>
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

const getIMCColor = () => {
  if (!user.value?.taille || !currentWeight.value) {
    return 'grey'
  }
  const imc = currentWeight.value / (user.value.taille * user.value.taille)
  
  if (imc < 18.5) return 'blue'      // Insuffisance pondérale
  if (imc < 25) return 'success'     // Normal
  if (imc < 30) return 'warning'     // Surpoids
  return 'error'                     // Obésité
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

/* Responsive pour mobile */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.25rem;
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

/* Styles spécifiques pour les challengers */
.challenger-layout {
  padding: 0;
}

.challenger-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-outline-variant-rgb), 0.2);
  background: rgb(var(--v-theme-surface));
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: var(--hpfit-shadow-soft);
  overflow: hidden;
}

.challenger-card:hover {
  box-shadow: var(--hpfit-shadow-secondary);
  transform: translateY(-4px);
  border-color: rgba(var(--v-theme-primary-rgb), 0.3);
}

.challenger-card-title {
  background: var(--hpfit-gradient-light);
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  font-size: 1.1rem;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid rgba(var(--v-theme-outline-variant-rgb), 0.2);
}

.challenger-card-content {
  padding: 32px;
}

.info-grid-challenger {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item-challenger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(var(--v-theme-surface-variant-rgb), 0.3);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.info-item-challenger:hover {
  background: rgba(var(--v-theme-primary-rgb), 0.08);
  transform: translateX(4px);
}

.info-label-challenger {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface-rgb), 0.8);
  font-size: 1rem;
}

.info-value-challenger {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  text-align: right;
  font-size: 1rem;
}

.objective-container {
  padding: 32px 0;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.objective-chip {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 24px;
  height: auto;
  box-shadow: var(--hpfit-shadow-secondary);
}

.no-objective {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.7;
}

.weight-evolution {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weight-entry-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(var(--v-theme-surface-variant-rgb), 0.3);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.weight-entry-modern:hover {
  background: rgba(var(--v-theme-success-rgb), 0.08);
  transform: translateX(4px);
}

.weight-date-modern {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: rgba(var(--v-theme-on-surface-rgb), 0.7);
  font-weight: 500;
}

.weight-value-modern {
  font-weight: 600;
}

.no-data-container {
  padding: 32px 0;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

/* Mode sombre pour challenger */
.v-theme--customDark .challenger-card {
  background: rgba(18, 18, 18, 0.95);
  border-color: rgba(42, 45, 58, 0.3);
}

.v-theme--customDark .challenger-card-title {
  background: linear-gradient(135deg, rgba(42, 45, 58, 0.8) 0%, rgba(18, 18, 18, 0.9) 100%);
  border-bottom-color: rgba(42, 45, 58, 0.3);
}

.v-theme--customDark .info-item-challenger {
  background: rgba(42, 45, 58, 0.4);
}

.v-theme--customDark .weight-entry-modern {
  background: rgba(42, 45, 58, 0.4);
}

/* Styles pour les boutons d'action du profil */
.profile-actions-container {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.profile-action-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: var(--hpfit-shadow-secondary);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 12px;
  height: 48px;
}

.profile-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--hpfit-shadow-primary);
}

.profile-action-btn .v-icon {
  margin-right: 8px;
}

/* Responsive pour challenger */
@media (max-width: 768px) {
  .challenger-card-title {
    padding: 16px 20px 12px 20px;
    font-size: 1rem;
  }
  
  .challenger-card-content {
    padding: 20px;
  }
  
  .info-item-challenger {
    padding: 10px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .info-value-challenger {
    text-align: left;
    align-self: flex-end;
  }
  
  .objective-container {
    padding: 16px 0;
    min-height: 100px;
  }
  
  .weight-entry-modern {
    padding: 10px 12px;
  }
  
  .profile-actions-container {
    flex-direction: column;
    gap: 12px;
  }
  
  .profile-action-btn {
    width: 100%;
    max-width: 280px;
  }
}
</style> 