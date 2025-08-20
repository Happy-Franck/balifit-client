<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" permanent>
      <!-- Section Avatar et Profil -->
      <v-list>
        <v-list-item class="text-center pa-6">
          <div class="d-flex flex-column align-center">
        <v-avatar
              size="80"
              class="mb-4"
          :image="AuthStore.userAuth?.avatar ? `${APP_CONFIG.STORAGE_BASE_URL}/avatars/${AuthStore.userAuth.avatar}` : ''"
            >
              <v-icon v-if="!AuthStore.userAuth?.avatar" size="40">mdi-account-tie</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-medium mb-1">
              {{ AuthStore.userAuth?.name || 'Coach' }}
            </div>
            <div class="text-caption text-grey">
              {{ AuthStore.userAuth?.email || 'email@example.com' }}
            </div>
          </div>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <!-- Menu de navigation -->
      <v-list density="compact" nav>
        <v-list-item 
          prepend-icon="mdi-view-dashboard" 
          title="Dashboard" 
          value="dashboard"
          color="primary"
          :active="isActive('/coach/dashboard')"
          @click="navigateTo('/coach/dashboard')"
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-dumbbell" 
          title="Trainings" 
          value="training"
          color="primary"
          :active="isActive('/coach/training')"
          @click="navigateTo('/coach/training')"
        ></v-list-item>

        <v-list-item 
          prepend-icon="mdi-account-group" 
          title="Challengers" 
          value="challenger"
          color="primary"
          :active="isActive('/coach/challenger')"
          @click="navigateTo('/coach/challenger')"
        ></v-list-item>

        <v-list-item 
          prepend-icon="mdi-calendar-check" 
          title="Séances" 
          value="seance"
          color="primary"
          :active="isActive('/coach/seance')"
          @click="navigateTo('/coach/seance')"
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-account-edit" 
          title="Mon Profil" 
          value="profile"
          color="primary"
          :active="isActive('/coach/profile')"
          @click="navigateTo('/coach/profile')"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Coach</v-toolbar-title>
      <v-spacer></v-spacer>
        <ThemeToggle />
        <v-btn icon @click="deconnexion">
          <v-icon>mdi-export</v-icon>
        </v-btn>
    </v-app-bar>

    <!-- Contenu principal -->
    <v-main class="bg-surface">
      <v-container>
        <router-view v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath" />
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/AuthStore'
import { useRoute, useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import http from '@/axios'
import { useCategoryStore } from '@/store/CoachStore/CategoryStore'
import { useChallengerStore } from '@/store/CoachStore/ChallengerStore'
import { useSeanceStore } from '@/store/CoachStore/SeanceStore'
import { useTrainingStore } from '@/store/CoachStore/TrainingStore'
import { APP_CONFIG } from '@/config/constants'

const AuthStore = useAuthStore()
const drawer = ref(true)
const route = useRoute()
const router = useRouter()

// Charger les données utilisateur au montage du composant
onMounted(async () => {
  try {
    await AuthStore.getUserAuth()
  } catch (error) {
    console.error('Erreur lors du chargement des données utilisateur:', error)
  }
})

// Fonction pour déterminer si un lien est actif
const isActive = (path) => {
  return route.path.startsWith(path)
}

// Fonction pour naviguer vers une route
const navigateTo = (path) => {
  router.push(path)
}

// Méthode de déconnexion corrigée
const deconnexion = async () => {
  try {
    // Réinitialiser tous les stores
    const CategoryStore = useCategoryStore()
    const ChallengerStore = useChallengerStore()
    const SeanceStore = useSeanceStore()
    const TrainingStore = useTrainingStore()
    
    CategoryStore.$reset()
    ChallengerStore.$reset()
    SeanceStore.$reset()
    TrainingStore.$reset()
    
    // Appeler l'API de déconnexion
    await http.post("/logout")
    
    // Utiliser la méthode deconnexion de l'AuthStore pour nettoyer proprement
    AuthStore.deconnexion()
    
    // Rediriger vers login
    router.push('/login')
    
  } catch (err) {
    console.log(err)
    // En cas d'erreur, forcer la déconnexion locale
    AuthStore.deconnexion()
    router.push('/login')
  }
}
</script>
