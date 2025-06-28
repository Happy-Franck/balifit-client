<template>
  <div class="profile-view">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="pa-6">
            <v-card-title class="text-h5 mb-4 d-flex justify-space-between align-center">
              <div>
                <v-icon class="mr-2">mdi-account</v-icon>
                Mon Profil
              </div>
              <v-btn 
                color="primary" 
                @click="goToEdit"
                variant="elevated"
              >
                <v-icon class="mr-2">mdi-account-edit</v-icon>
                Éditer mon profil
              </v-btn>
            </v-card-title>

            <v-divider class="mb-6"></v-divider>

            <!-- Avatar et informations de base -->
            <v-row class="mb-6">
              <v-col cols="12" class="text-center">
                <v-avatar size="120" class="mb-4">
                  <v-img 
                    v-if="user?.avatar" 
                    :src="`http://localhost:8000/storage/avatars/${user.avatar}`"
                    cover
                  ></v-img>
                  <v-icon v-else size="60">mdi-account</v-icon>
                </v-avatar>
                <h3 class="text-h5">{{ user?.name }}</h3>
                <p class="text-subtitle-1 text-medium-emphasis">{{ user?.email }}</p>
              </v-col>
            </v-row>

            <!-- Informations personnelles -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-account-details</v-icon>
                Informations personnelles
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">Téléphone</v-list-item-title>
                      <v-list-item-subtitle>{{ user?.telephone || 'Non renseigné' }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">CIN</v-list-item-title>
                      <v-list-item-subtitle>{{ user?.cin || 'Non renseigné' }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">Sexe</v-list-item-title>
                      <v-list-item-subtitle>{{ formatSexe(user?.sexe) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">Date de naissance</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(user?.date_naissance) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Informations physiques -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-human-male-height</v-icon>
                Informations physiques
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">Taille</v-list-item-title>
                      <v-list-item-subtitle>{{ user?.taille ? `${user.taille} m` : 'Non renseigné' }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">Poids actuel</v-list-item-title>
                      <v-list-item-subtitle>{{ currentWeight ? `${currentWeight} kg` : 'Non renseigné' }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">IMC</v-list-item-title>
                      <v-list-item-subtitle>{{ calculateIMC() }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Objectif -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-target</v-icon>
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

            <!-- Historique de poids -->
            <v-card variant="outlined" v-if="weightHistory.length > 0">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-chart-line</v-icon>
                Historique de poids (dernières entrées)
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item
                    v-for="(entry, index) in weightHistory.slice(-5).reverse()"
                    :key="index"
                  >
                    <template v-slot:prepend>
                      <v-icon>mdi-scale-bathroom</v-icon>
                    </template>
                    <v-list-item-title>{{ entry.valeur }} kg</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(entry.date) }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <v-btn 
                  v-if="weightHistory.length > 5"
                  variant="text" 
                  size="small"
                  @click="showAllWeight = !showAllWeight"
                >
                  {{ showAllWeight ? 'Voir moins' : 'Voir tout l\'historique' }}
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- Rôles et permissions -->
            <v-card variant="outlined" class="mt-4">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-shield-account</v-icon>
                Rôles et permissions
              </v-card-title>
              <v-card-text>
                <div class="mb-3">
                  <strong>Rôles :</strong>
                  <v-chip 
                    v-for="role in user?.roles" 
                    :key="role.id"
                    class="ml-2"
                    color="success"
                    variant="elevated"
                  >
                    {{ role.name }}
                  </v-chip>
                </div>
                <div v-if="user?.permissions && user.permissions.length > 0">
                  <strong>Permissions spéciales :</strong>
                  <v-chip 
                    v-for="permission in user.permissions" 
                    :key="permission.id"
                    class="ml-2 mt-1"
                    color="info"
                    variant="outlined"
                    size="small"
                  >
                    {{ permission.name }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>

            <!-- Dates importantes -->
            <v-card variant="outlined" class="mt-4">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-calendar</v-icon>
                Informations du compte
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">Membre depuis</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(user?.created_at) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">Dernière mise à jour</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(user?.updated_at) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

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
import type User from '../../types/User'

const router = useRouter()
const authStore = useAuthStore()
const user = ref<User | null>(null)
const weightHistory = ref<Array<{date: string, valeur: number}>>([])
const showAllWeight = ref(false)

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

const currentWeight = computed(() => {
  if (weightHistory.value.length > 0) {
    return weightHistory.value[weightHistory.value.length - 1].valeur
  }
  return null
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

const loadProfile = async () => {
  try {
    const userData = await authStore.getProfile()
    user.value = userData
    
    // Charger l'historique de poids
    await loadWeightHistory()
  } catch (error) {
    showSnackbar('Erreur lors du chargement du profil', 'error')
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

const showSnackbar = (message: string, color: string) => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.v-list-item {
  padding: 8px 0;
}

.v-list-item-title {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.v-list-item-subtitle {
  color: rgb(var(--v-theme-on-surface-variant));
}
</style> 