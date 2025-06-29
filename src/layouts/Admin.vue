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
              :image="AuthStore.userAuth?.avatar ? `http://localhost:8000/storage/avatars/${AuthStore.userAuth.avatar}` : ''"
            >
              <v-icon v-if="!AuthStore.userAuth?.avatar" size="40">mdi-account</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-medium mb-1">
              {{ AuthStore.userAuth?.name || 'Utilisateur' }}
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
          :active="isActive('/admin/dashboard')"
          @click="navigateTo('/admin/dashboard')"
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-account-edit" 
          title="Mon Profil" 
          value="profile"
          color="primary"
          :active="isActive('/admin/profile')"
          @click="navigateTo('/admin/profile')"
        ></v-list-item>

        <!-- Menu déroulant Entraînement -->
        <v-list-group value="entrainement">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-dumbbell"
              title="Entraînement"
              color="primary"
            ></v-list-item>
          </template>
          
          <v-list-item
            title="Tous les entraînements"
            value="training"
            color="primary"
            :active="isActive('/admin/training')"
            @click="navigateTo('/admin/training')"
            class="ml-4"
          ></v-list-item>

          <v-list-item
            title="Les équipements"
            value="equipment"
            color="primary"
            :active="isActive('/admin/equipment')"
            @click="navigateTo('/admin/equipment')"
            class="ml-4"
          ></v-list-item>

          <v-list-item
            title="Liste des Muscles"
            value="category"
            color="primary"
            :active="isActive('/admin/category')"
            @click="navigateTo('/admin/category')"
            class="ml-4"
          ></v-list-item>
        </v-list-group>

        <v-list-item 
          prepend-icon="mdi-account-box" 
          title="Utilisateurs" 
          value="user"
          color="primary"
          :active="isActive('/admin/user')"
          @click="navigateTo('/admin/user')"
        ></v-list-item>

        <v-list-item 
          prepend-icon="mdi-calendar-clock" 
          title="Séances" 
          value="seance"
          color="primary"
          :active="isActive('/admin/seance')"
          @click="navigateTo('/admin/seance')"
        ></v-list-item>

        <v-list-item 
          prepend-icon="mdi-gavel" 
          title="Produits" 
          value="product"
          color="primary"
          :active="isActive('/admin/product')"
          @click="navigateTo('/admin/product')"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <ThemeToggle />
      <v-btn icon @click="deconnexion">
        <v-icon>mdi-export</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Contenu principal -->
    <v-main class="bg-surface">
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/AuthStore'
import { useRoute, useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import http from '@/axios'
import { useCategoryStore } from '@/store/AdminStore/CategoryStore'
import { useProductStore } from '@/store/AdminStore/ProductStore'
import { useRolePermissionStore } from '@/store/AdminStore/RolePermissionStore'
import { useSeanceStore } from '@/store/AdminStore/SeanceStore'
import { useUserStore } from '@/store/AdminStore/UserStore'
import { useTrainingStore } from '@/store/AdminStore/TrainingStore'
import { useEquipmentStore } from '@/store/AdminStore/EquipmentStore'

const AuthStore = useAuthStore()
const drawer = ref(null)
const route = useRoute()
const router = useRouter()

AuthStore.getUserAuth()

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
    const ProductStore = useProductStore()
    const RolePermissionStore = useRolePermissionStore()
    const SeanceStore = useSeanceStore()
    const UserStore = useUserStore()
    const TrainingStore = useTrainingStore()
    const EquipmentStore = useEquipmentStore()
    
    CategoryStore.$reset()
    ProductStore.$reset()
    RolePermissionStore.$reset()
    SeanceStore.$reset()
    UserStore.$reset()
    TrainingStore.$reset()
    EquipmentStore.$reset()
    
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

