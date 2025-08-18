<template>
  <v-app>
    <AppTopBar />

    <v-main class="bg-background">
      <router-view/>
    </v-main>

  </v-app>
</template>

<script setup>
import AppTopBar from '@/components/AppTopBar.vue'
import { APP_CONFIG } from '@/config/constants'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/AuthStore'
import { useRouter, useRoute } from 'vue-router'
import http from '@/axios'
import { useSeanceStore } from '@/store/ChallengerStore/SeanceStore'
import { useTrainingStore } from '@/store/ChallengerStore/TrainingStore'
import { useProductStore } from '@/store/ChallengerStore/ProductStore'

const AuthStore = useAuthStore()
const drawer = ref(true)
const router = useRouter()
const route = useRoute()

// Charger les données utilisateur au montage du composant
onMounted(async () => {
  try {
    await AuthStore.getUserAuth()
  } catch (error) {
    console.error('Erreur lors du chargement des données utilisateur:', error)
  }
})

const links = [
  {name:'Dashboard', url:'/challenger/dashboard'},
  {name:'Produits', url:'/challenger/produit'},
  {name:'Seances', url:'/challenger/seance'},
  {name:'Exercices', url:'/challenger/exercice'},
  {name:'Blog', url:'/challenger/blog'},
  {name:'Mon Profil', url:'/challenger/profile'},
]

const redirectTo = (path) => {
  router.push(path)
}

// Fonction pour déterminer si un lien est actif
const isActive = (path) => {
  return route.path.startsWith(path)
}

// Méthode de déconnexion corrigée
const deconnexion = async () => {
  try {
    // Réinitialiser tous les stores
    const SeanceStore = useSeanceStore()
    const TrainingStore = useTrainingStore()
    const ProductStore = useProductStore()
    
    SeanceStore.$reset()
    TrainingStore.$reset()
    ProductStore.$reset()
    
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



