<template>
  <v-container>
    <h1>Voir le challenger</h1>
    <div v-if="challengerStore.currentChallenger">
      <h5>{{challengerStore.currentChallenger.name}}</h5>
      <p>{{challengerStore.currentChallenger.email}}</p>
      <v-img :src="`${APP_CONFIG.STORAGE_BASE_URL}/avatars/${challengerStore.currentChallenger.avatar}`" width="100px">
      </v-img>
      <hr/>
      <v-row>
        <v-col cols="3" v-for="(item , index) in challengerStore.currentChallenger.challenger_seances" :key="index">
          <v-img :src="`${APP_CONFIG.STORAGE_BASE_URL}/seance/${item.challenger_id}/${item.img_debut}`" width="100px"></v-img>
          <v-img :src="`${APP_CONFIG.STORAGE_BASE_URL}/seance/${item.challenger_id}/${item.img_fin}`" width="100px"></v-img>
          <p>Admin : {{item.admin_id}}</p>
          <p>Coach : {{item.coach_id}}</p>
          <v-chip v-if="AuthStore.userAuth?.id == item.coach_id" color="cyan">
            By me
          </v-chip>
          <v-chip v-if="AuthStore.userAuth?.id !== item.coach_id && item.admin_id" color="primary" text-color="white">
            Coached
          </v-chip>
          <v-chip v-if="item.coach_id == null && item.admin_id == null" color="pink" text-color="white">
            Solo
          </v-chip>
          <v-chip v-if="item.validated === 1" class="ma-2" variant="outlined" color="success" text-color="white">
            Validé
          </v-chip>
          <v-chip v-if="item.validated === null" class="ma-2" variant="outlined" color="warning" text-color="white">
            En attente
          </v-chip>
          <v-chip v-if="AuthStore.userAuth?.id == item.coach_id && item.validated === null && item.trainings.length == 0" class="ma-2" variant="outlined" color="red" text-color="white">
            A remplir
          </v-chip>
          <v-chip v-if="item.validated === 0" class="ma-2" variant="outlined" color="cyan" text-color="white">
            A valider
          </v-chip>
          <ul>
            <li v-for="(i , idx) in item.trainings" :key="idx">
              {{i.name}} : {{i.pivot.series}} x {{i.pivot.repetitions}} || {{i.pivot.duree}} s
            </li>
          </ul>
          <div v-if="AuthStore.userAuth?.id == item.coach_id">
            <router-link :to="`/coach/seance/${item.id}`">Editer</router-link>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>


<script lang="ts">
import { defineComponent , ref , toRefs , reactive , watch } from 'vue'
import { useRoute } from 'vue-router'
import { useChallengerStore } from '../../../store/CoachStore/ChallengerStore'
import { useAuthStore } from '../../../store/AuthStore'
import { APP_CONFIG } from '../../../config/constants'

export default defineComponent({
  setup() {
    const challengerStore = useChallengerStore()
    const route = useRoute()
    const AuthStore = useAuthStore()
    AuthStore.getUserAuth()
    if(challengerStore.currentChallenger){
      if(challengerStore.currentChallenger.id != Number(route.params.id)){
        challengerStore.loading = true
        challengerStore.currentChallenger = null
        challengerStore.showChallenger(Number(route.params.id))
      }
    }
    if(!challengerStore.currentChallenger){
      challengerStore.loading = true
      challengerStore.currentChallenger = null
      challengerStore.showChallenger(Number(route.params.id))
    }
    return { challengerStore , AuthStore }
  }
})
</script>
