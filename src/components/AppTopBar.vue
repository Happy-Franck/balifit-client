<template>
  <v-app-bar color="grey-darken-4" :elevation="0">
    <v-container class="fill-height d-flex align-center">
      <v-toolbar-title>HPFit</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Public links always visible -->
      <router-link to="/home"><v-btn color="white" variant="text">Home</v-btn></router-link>
      <router-link to="/about"><v-btn color="white" variant="text">About</v-btn></router-link>
      <router-link to="/pricing"><v-btn color="white" variant="text">Pricing</v-btn></router-link>
      <router-link v-if="!auth.isAuthenticated" to="/produits"><v-btn color="white" variant="text">Products</v-btn></router-link>
      <router-link v-if="!auth.isAuthenticated" to="/blog"><v-btn color="white" variant="text">Blog</v-btn></router-link>

      <!-- If not authenticated show login/register -->
      <template v-if="!auth.isAuthenticated">
        <router-link to="/login"><v-btn color="white" variant="text">Login</v-btn></router-link>
        <router-link to="/register"><v-btn color="white" variant="text">Register</v-btn></router-link>
      </template>

      <!-- If authenticated show role-based quick links and actions -->
      <template v-else>
        <v-divider vertical class="mx-2" inset></v-divider>
        <template v-if="auth.isChallenger">
          <v-btn variant="text" color="white" @click="go('/challenger/dashboard')">Dashboard</v-btn>
          <v-btn variant="text" color="white" @click="go('/challenger/produit')">Mes produits</v-btn>
          <v-btn variant="text" color="white" @click="go('/challenger/seance')">Séances</v-btn>
          <v-btn variant="text" color="white" @click="go('/challenger/exercice')">Exercices</v-btn>
          <v-btn variant="text" color="white" @click="go('/challenger/blog')">Blog</v-btn>
          <v-btn variant="text" color="white" @click="go('/challenger/profile')">Profil</v-btn>
        </template>
        <template v-else-if="auth.isCoach">
          <v-btn variant="text" color="white" @click="go('/coach/dashboard')">Dashboard</v-btn>
        </template>
        <template v-else-if="auth.isAdmin">
          <v-btn variant="text" color="white" @click="go('/admin/dashboard')">Dashboard</v-btn>
        </template>
        <ThemeToggle class="ml-2" />
        <v-avatar class="ms-4" color="grey-darken-1" size="32" :image="auth.userAuth?.avatar ? `${config.STORAGE_BASE_URL}/avatars/${auth.userAuth.avatar}` : ''"></v-avatar>
        <v-btn icon class="ml-2" @click="logout">
          <v-icon>mdi-export</v-icon>
        </v-btn>
      </template>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useAuthStore } from '../store/AuthStore'
import { useRouter } from 'vue-router'
import { APP_CONFIG } from '../config/constants'
import http from '../axios'

const ThemeToggle = defineAsyncComponent(() => import('./ThemeToggle.vue'))

const router = useRouter()
const auth = useAuthStore()
const config = APP_CONFIG

const go = (path: string) => router.push(path)

const logout = async () => {
  try {
    await http.post('/logout')
  } catch (e) {}
  auth.deconnexion()
  router.push('/login')
}
</script> 