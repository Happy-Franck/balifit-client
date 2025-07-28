<template>
  <v-container>
    <h1>Voir la seance</h1>
    <div v-if="seanceStore.currentSeance">
      <v-row>
        <v-col cols="12"
        v-if="seanceStore.currentSeance.img_debut &&
              seanceStore.currentSeance.img_fin &&
              seanceStore.currentSeance.trainings.length > 0 &&
              seanceStore.currentSeance.validated === null
        ">
          <v-btn @click="valider(seanceStore.currentSeance.id)" color="success">Valider</v-btn>
        </v-col>
        <v-col cols="12" sm="6">
          <h5>DEBUT: {{seanceStore.currentSeance.img_debut}}</h5>
          <div v-if="seanceStore.currentSeance.img_debut">
            <v-img :src="`${APP_CONFIG.STORAGE_BASE_URL}/seance/${seanceStore.currentSeance.challenger_id}/${seanceStore.currentSeance.img_debut}`" width="200px"></v-img>
            <v-btn @click="supprImgDebut">x</v-btn>
          </div>
          <div v-else-if="seanceStore.currentSeance.img_debut == null">
            <v-form enctype="multipart/form-data" @submit.prevent="changeDebut">
              <v-file-input @change="uploadDebut" show-size prepend-icon="mdi-camera" v-model="imageDebut" clearable label="ImageDebut"></v-file-input>
              <v-btn type="submit">Mettre à jour</v-btn>
            </v-form>
          </div>
        </v-col>
        <v-col cols="12" sm="6">
          <h5>FIN: {{seanceStore.currentSeance.img_fin}}</h5>
          <div v-if="seanceStore.currentSeance.img_fin">
            <v-img :src="`${APP_CONFIG.STORAGE_BASE_URL}/seance/${seanceStore.currentSeance.challenger_id}/${seanceStore.currentSeance.img_fin}`" width="200px"></v-img>
            <v-btn @click="supprImgFin">x</v-btn>
          </div>
          <div v-else-if="seanceStore.currentSeance.img_fin == null">
            <v-form enctype="multipart/form-data" @submit.prevent="changeFin">
              <v-file-input @change="uploadFin" show-size prepend-icon="mdi-camera" v-model="imageFin" clearable label="ImageFin"></v-file-input>
              <v-btn type="submit">Mettre à jour</v-btn>
            </v-form>
          </div>
        </v-col>
      </v-row>
      <p>Date: {{seanceStore.currentSeance.created_at}}</p>
      <p>Admin: {{seanceStore.currentSeanceAdmin?.name}}</p>
      <p>Coach: {{seanceStore.currentSeanceCoach?.name}}</p>
      <p>Challenger: {{seanceStore.currentSeanceChallenger?.name}}</p>
      <div>Trainings:
        <li v-for="(kotrana, index) in seanceStore.currentSeanceTrainings" :key="index">
          {{kotrana.name}}: {{kotrana.pivot.series}}x{{kotrana}} {{kotrana.pivot.repetitions || 0}}fois || {{kotrana.pivot.duree || 0}}s
          <v-btn variant="outlined"  @click="supprTraining(kotrana.pivot.seance_id, kotrana.pivot.training_id, kotrana.pivot.id)">
            Supprimer
          </v-btn>
        </li>
      </div>
      <router-link :to="{name: 'coachSeanceItemAdd', params: {id: seanceStore.currentSeance.id}}">
        Ajouter training
      </router-link>
      <router-link :to="{name: 'coachSeanceItemEdit', params: {id: seanceStore.currentSeance.id}}">
        Editer
      </router-link>
    </div>
  </v-container>
</template>
<script lang="ts">
import { defineComponent , watch, reactive, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeanceStore } from '../../../store/CoachStore/SeanceStore'
import { APP_CONFIG } from '../../../config/constants'

export default defineComponent({
  setup() {
    const seanceStore = useSeanceStore()
    const route = useRoute()
    const state = reactive({
      imageDebut:  null as null | any,
      saryDebut: null as null | any,
      imageFin:  null as null | any,
      saryFin: null as null | any,
    })
    const uploadDebut = (e: any) => {
      state.saryDebut = e.target.files[0]
    }
    const changeDebut = () => {
      seanceStore.updateDebut(Number(route.params.id), state.saryDebut)
    }
    const supprImgDebut = () => {
      seanceStore.supprDebut(Number(route.params.id), {
        suppr: null
      })
    }
    const uploadFin = (e: any) => {
      state.saryFin = e.target.files[0]
    }
    const changeFin = () => {
      seanceStore.updateFin(Number(route.params.id), state.saryFin)
    }
    const supprImgFin = () => {
      seanceStore.supprFin(Number(route.params.id), {
        suppr: null
      })
    }
    watch(
      () => seanceStore.message,
      (newMessage) => {
        if (newMessage !== '') {
          seanceStore.showSeance(Number(route.params.id))
          seanceStore.message = '';
        }
      }
    );
    if(seanceStore.currentSeance){
      if(seanceStore.currentSeance.id != Number(route.params.id)){
        seanceStore.loading = true
        seanceStore.currentSeance = null
        seanceStore.showSeance(Number(route.params.id))
      }
    }
    if(!seanceStore.currentSeance){
      seanceStore.loading = true
      seanceStore.currentSeance = null
      seanceStore.showSeance(Number(route.params.id))
    }

    function supprTraining(seanceId :number, trainingId :number, pivotId :number) {
      seanceStore.supprTraining(seanceId, trainingId, pivotId)
    };

    const valider = (id : number) => {
      seanceStore.valider(id)
    }

    return { valider , seanceStore, supprTraining, uploadDebut, changeDebut, supprImgDebut, uploadFin, changeFin, supprImgFin, ...toRefs(state) }
  }
})
</script>
