<template>
  <v-app>
    <v-app-bar flat>
      <v-container class="fill-height d-flex align-center">
        <v-toolbar-title>Challenger</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn
          v-for="link in links"
          :key="link"
          variant="text"
          @click="redirectTo(link.url)"
          :color="isActive(link.url) ? 'primary' : 'default'"
          :class="{ 'v-btn--active': isActive(link.url) }"
        >
          {{ link.name }}
          <template v-slot:append>
            <v-badge
              color="error"
              content="6"
              inline
            ></v-badge>
          </template>
        </v-btn>

        <ThemeToggle />
        <v-btn icon @click="deconnexion">
          <v-icon>mdi-export</v-icon>
        </v-btn>
        <v-avatar
          class="me-10 ms-4"
          color="grey-darken-1"
          size="32"
          :image="AuthStore.userAuth?.avatar ? `http://localhost:8000/storage/avatars/${AuthStore.userAuth.avatar}` : ''"
        ></v-avatar>
      </v-container>
    </v-app-bar>

    <v-main class="bg-background">
      <router-view/>
    </v-main>

    <!-- <v-footer class="bg-grey-lighten-1">
      <v-row justify="center" no-gutters>
        <v-btn
          v-for="link in ['bali','happy','zappy','icey','gloody','yummyni']"
          :key="link"
          color="white"
          variant="text"
          class="mx-2"
          rounded="xl"
        >
          {{ link }}
        </v-btn>
        <v-col class="text-center mt-4" cols="12">
          {{ new Date().getFullYear() }} — <strong>Vuetify</strong>
        </v-col>
      </v-row>
    </v-footer>

    <v-footer
      class="bg-indigo-lighten-1 text-center d-flex flex-column"
    >
      <div>
        <v-btn
          v-for="icon in icons"
          :key="icon"
          class="mx-4"
          :icon="icon"
          variant="text"
        ></v-btn>
      </div>

      <div class="pt-0">
        Phasellus feugiat arcu sapien, et iaculis ipsum elementum sit amet. Mauris cursus commodo interdum. Praesent ut risus eget metus luctus accumsan id ultrices nunc. Sed at orci sed massa consectetur dignissim a sit amet dui. Duis commodo vitae velit et faucibus. Morbi vehicula lacinia malesuada. Nulla placerat augue vel ipsum ultrices, cursus iaculis dui sollicitudin. Vestibulum eu ipsum vel diam elementum tempor vel ut orci. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
      </div>

      <v-divider></v-divider>

      <div>
        {{ new Date().getFullYear() }} — <strong>Vuetify</strong>
      </div>
    </v-footer>

    <v-footer class="d-flex flex-column">
      <div class="bg-teal d-flex w-100 align-center">
        <strong>Get connected with us on social networks!</strong>

        <v-spacer></v-spacer>

        <v-btn
          v-for="icon in icons"
          :key="icon"
          class="mx-4"
          :icon="icon"
          variant="plain"
          size="small"
        ></v-btn>
      </div>

      <div class="px-4 py-2 bg-black text-center w-100">
        {{ new Date().getFullYear() }} — <strong>Vuetify</strong>
      </div>
    </v-footer> -->

  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/AuthStore'
import { useRouter, useRoute } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import http from '@/axios'
import { useSeanceStore } from '@/store/ChallengerStore/SeanceStore'
import { useTrainingStore } from '@/store/ChallengerStore/TrainingStore'
import { useProductStore } from '@/store/ChallengerStore/ProductStore'

const AuthStore = useAuthStore()
const drawer = ref(true)
const router = useRouter()
const route = useRoute()

AuthStore.getUserAuth()

const links = [
  {name:'Dashboard', url:'/challenger/dashboard'},
  {name:'Produits', url:'/challenger/produit'},
  {name:'Seances', url:'/challenger/seance'},
  {name:'Exercices', url:'/challenger/exercice'},
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



