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

        <!-- Blogs -->
        <v-list-item 
          prepend-icon="mdi-note-text-outline" 
          title="Blogs" 
          value="blog"
          color="primary"
          :active="isActive('/admin/blog')"
          @click="navigateTo('/admin/blog')"
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
        <v-breadcrumbs v-if="breadcrumbItems.length" :items="breadcrumbItems" class="mb-4">
          <template #prepend>
            <v-icon size="small" class="mr-2">mdi-home</v-icon>
          </template>
        </v-breadcrumbs>
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
import { useCategoryStore } from '@/store/AdminStore/CategoryStore'
import { useProductStore } from '@/store/AdminStore/ProductStore'
import { useRolePermissionStore } from '@/store/AdminStore/RolePermissionStore'
import { useSeanceStore } from '@/store/AdminStore/SeanceStore'
import { useUserStore } from '@/store/AdminStore/UserStore'
import { useTrainingStore } from '@/store/AdminStore/TrainingStore'
import { useEquipmentStore } from '@/store/AdminStore/EquipmentStore'
import { APP_CONFIG } from '@/config/constants'
import { computed } from 'vue'

const AuthStore = useAuthStore()
const drawer = ref(null)
const route = useRoute()
const router = useRouter()

// Stores for dynamic names on detail pages
const trainingStore = useTrainingStore()
const productStore = useProductStore()
const equipmentStore = useEquipmentStore()
const userStore = useUserStore()
const adminSeanceStore = useSeanceStore()

const breadcrumbItems = computed(() => {
  // Hide breadcrumbs on subpages: create/edit or deep nested routes (beyond detail)
  const segments = route.path.split('/').filter(Boolean)
  const isAdminRoute = segments[0] === 'admin'
  const isCreateOrEdit = route.path.includes('/create') || route.path.includes('/edit')
  const isTooDeep = segments.length > 3 // allow /admin/:section and /admin/:section/:id only
  if (!isAdminRoute || isCreateOrEdit || isTooDeep) {
    return []
  }

  const items = []
  // Root Admin
  items.push({ title: 'Admin', to: { path: '/admin' } })

  // Section from URL (e.g., /admin/training)
  const section = segments[1]
  if (section) {
    // Prefer the route meta label if available and not a generic one
    const matched = route.matched.filter(r => r.meta && r.meta.breadcrumb)
    const sectionRecord = matched.find(r => {
      const label = r && r.meta && r.meta.breadcrumb != null ? String(r.meta.breadcrumb) : undefined
      // Exclude root 'Admin' and generic labels
      return label && !['Admin', 'Détail', 'Modifier', 'Créer'].includes(label)
    })
    const sectionLabel = (sectionRecord && sectionRecord.meta && sectionRecord.meta.breadcrumb) || section.charAt(0).toUpperCase() + section.slice(1)
    const sectionPath = `/admin/${section}`
    items.push({ title: sectionLabel, to: { path: sectionPath } })
  }

  // If we are on a detail page (/admin/:section/:id), show entity name as last crumb
  const matched = route.matched.filter(r => r.meta && r.meta.breadcrumb)
  const isDetail = segments.length === 3 && /:\w+/.test((matched[matched.length - 1] && matched[matched.length - 1].path) || '')
  if (isDetail) {
    const name = (() => {
      switch (route.name) {
        case 'adminTrainingShow':
          return trainingStore.currentTraining && trainingStore.currentTraining.name
        case 'adminEquipmentShow':
          return equipmentStore.currentEquipment && equipmentStore.currentEquipment.name
        case 'productItem':
          return productStore.currentProduct && productStore.currentProduct.name
        case 'userItem':
          return userStore.currentUser && userStore.currentUser.name
        case 'adminSeanceShow': {
          const idParam = route.params && route.params.id
          const idStr = Array.isArray(idParam) ? idParam[0] : (typeof idParam === 'string' ? idParam : (idParam != null ? String(idParam) : undefined))
          return (adminSeanceStore.currentSeance && `Séance ${adminSeanceStore.currentSeance.id}`) || idStr
        }
        case 'adminBlogShow': {
          const slugParam = route.params && route.params.slug
          return Array.isArray(slugParam) ? slugParam[0] : (typeof slugParam === 'string' ? slugParam : (slugParam != null ? String(slugParam) : undefined))
        }
        default:
          return undefined
      }
    })()

    items.push({ title: name || 'Détail', disabled: true })
  }

  return items
})

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

