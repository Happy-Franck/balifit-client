<template>
  <v-app>
    <v-navigation-drawer v-model="drawer">
      <v-layout>
        <v-navigation-drawer permanent absolute>
          <v-list>
            <v-list-item :prepend-avatar="AuthStore.userAuth?.avatar ? `http://localhost:8000/storage/avatars/${AuthStore.userAuth.avatar}` : ''" :title="AuthStore.userAuth?.name" :subtitle="AuthStore.userAuth?.email">
              <template v-slot:append>
                <v-btn size="small" variant="text" icon="mdi-menu-down" ></v-btn>
              </template>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list :lines="false" density="compact" nav>
            <router-link to="/admin/dashboard">
              <v-list-item 
                prepend-icon="mdi-view-dashboard" 
                title="Dashboard" 
                value="dashboard"
                :active="isActive('/admin/dashboard')"
              ></v-list-item>
            </router-link>
            <router-link to="/admin/category">
              <v-list-item 
                prepend-icon="mdi-view-dashboard" 
                title="Categories" 
                value="category"
                :active="isActive('/admin/category')"
              ></v-list-item>
            </router-link>
            <router-link to="/admin/user">
              <v-list-item 
                prepend-icon="mdi-account-box" 
                title="Utilisateurs" 
                value="user"
                :active="isActive('/admin/user')"
              ></v-list-item>
            </router-link>
            <router-link to="/admin/product">
              <v-list-item 
                prepend-icon="mdi-gavel" 
                title="Produits" 
                value="product"
                :active="isActive('/admin/product')"
              ></v-list-item>
            </router-link>
            <router-link to="/admin/profile">
              <v-list-item 
                prepend-icon="mdi-account-edit" 
                title="Mon Profil" 
                value="profile"
                :active="isActive('/admin/profile')"
              ></v-list-item>
            </router-link>
          </v-list>
        </v-navigation-drawer>
        <v-main style="height: 354px;"></v-main>
      </v-layout>
    </v-navigation-drawer>
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <ThemeToggle />
      <v-btn icon @click="deconnexion">
        <v-icon>mdi-export</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main class="bg-surface" style="min-height: 300px;">
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

const AuthStore = useAuthStore()
const drawer = ref(null)
const route = useRoute()
const router = useRouter()

AuthStore.getUserAuth()

// Fonction pour déterminer si un lien est actif
const isActive = (path) => {
  return route.path.startsWith(path)
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
    
    CategoryStore.$reset()
    ProductStore.$reset()
    RolePermissionStore.$reset()
    SeanceStore.$reset()
    UserStore.$reset()
    
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

