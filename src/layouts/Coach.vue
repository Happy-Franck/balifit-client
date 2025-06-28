<template>
  <v-app id="inspire">
    <v-app-bar flat>
      <v-container class="fill-height d-flex align-center">
        <v-avatar
          class="me-10 ms-4"
          color="grey-darken-1"
          size="32"
          :image="AuthStore.userAuth?.avatar ? `http://localhost:8000/storage/avatars/${AuthStore.userAuth.avatar}` : ''"
        ></v-avatar>

        <v-btn
          v-for="link in links"
          :key="link"
          variant="text"
          @click="redirectTo(link.path)"
          :color="isActive(link.path) ? 'primary' : 'default'"
          :class="{ 'v-btn--active': isActive(link.path) }"
        >
          {{ link.text }}
        </v-btn>
        <v-btn icon @click="deconnexion">
          <v-icon>mdi-export</v-icon>
        </v-btn>

        <v-spacer></v-spacer>

        <v-responsive max-width="260">
          <v-text-field
            density="compact"
            hide-details
            variant="solo"
          ></v-text-field>
        </v-responsive>
      </v-container>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <router-view/>
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '@/store/AuthStore'
  import { useRouter, useRoute } from 'vue-router'
  
  const AuthStore = useAuthStore()
  const drawer = ref(true)
  const router = useRouter()
  const route = useRoute()
  
  AuthStore.getUserAuth()
  
  const redirectTo = (path) =>{
    router.push(path)
  }

  // Fonction pour déterminer si un lien est actif
  const isActive = (path) => {
    return route.path.startsWith(path)
  }
</script>

<script>
import http from '@/axios'
import { useCategoryStore } from '@/store/CoachStore/CategoryStore'
import { useChallengerStore } from '@/store/CoachStore/ChallengerStore'
import { useSeanceStore } from '@/store/CoachStore/SeanceStore'
import { useTrainingStore } from '@/store/CoachStore/TrainingStore'

  export default {
    data: () => ({
      links: [
        {icon:'mdi-folder',text:'Dashboard', path:'/coach/dashboard'},
        {icon:'mdi-folder',text:'Trainings', path:'/coach/training'},
        {icon:'mdi-folder',text:'Challengers', path:'/coach/challenger'},
        {icon:'mdi-folder',text:'Seances', path:'/coach/seance'},
        {icon:'mdi-account-edit',text:'Mon Profil', path:'/coach/profile'},
      ],
    }),
    methods: {
      deconnexion(){
        const CategoryStore = useCategoryStore()
        const ChallengerStore = useChallengerStore()
        const SeanceStore = useSeanceStore()
        const TrainingStore = useTrainingStore()
        CategoryStore.$reset()
        ChallengerStore.$reset()
        SeanceStore.$reset()
        TrainingStore.$reset()
        http.post("/logout").then((response) => {
          this.$router.push('/login');
          localStorage.clear();
        }).catch((err) => {
          console.log(err)
          this.alert = true
        })
      },
    },
  }
</script>
