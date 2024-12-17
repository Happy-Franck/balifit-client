<template>
  <v-container>
    <h1>Editer la seance</h1>
    <v-form @submit.prevent="editSeance" enctype="multipart/form-data">
      <h2>Trainings:</h2>
      <v-row v-for="(kotrana, index) in seanceStore.currentSeanceTrainings" :key="index">
        <v-col cols="12" sm="3">
          <v-select
            v-model="kotrana.pivot.training_id"
            :items="trainingStore.trainings"
            item-title="name"
            item-value="id"
            label="Training"
            required
          ></v-select>
        </v-col>
        <v-col cols="12" sm="3">
          <v-text-field v-model="kotrana.pivot.series" label="Series" type="number" required></v-text-field>
        </v-col>
        <v-col cols="12" sm="3">
          <v-text-field v-model="kotrana.pivot.repetitions" label="Repetitions" type="number" required></v-text-field>
        </v-col>
        <v-col cols="12" sm="3">
          <v-text-field v-model="kotrana.pivot.duree" label="Duration" type="number" required></v-text-field>
        </v-col>
      </v-row>

      <v-btn type="submit" color="primary">Enregistrer</v-btn>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeanceStore } from '@/store/CoachStore/SeanceStore'
import { useTrainingStore } from '@/store/CoachStore/TrainingStore'

export default defineComponent({
  setup() {
    const inputs = reactive({
      training: null,
      series: null,
      repetitions: null,
      duree: null,
      useRepetitions: true,
    });
    const seanceStore = useSeanceStore()
    const route = useRoute()
    const router = useRouter()
    const trainingStore = useTrainingStore()
    trainingStore.getTrainings()
    watch(
      () => seanceStore.currentSeanceTrainings,
      (newTraining) => {
        if(newTraining !== null){
          inputs.training = seanceStore.currentSeanceTrainings?.map(function(elem) {
            return elem.pivot.training_id;
          })
          inputs.series = seanceStore.currentSeanceTrainings?.map(function(elem) {
            return elem.pivot.series;
          })
          inputs.repetitions = seanceStore.currentSeanceTrainings?.map(function(elem) {
            return elem.pivot.repetitions;
          })
          inputs.duree = seanceStore.currentSeanceTrainings?.map(function(elem) {
            return elem.pivot.duree;
          })
        }
      }
    );


    // Assurez-vous que les données sont chargées
    if (!seanceStore.currentSeance || seanceStore.currentSeance.id !== Number(route.params.id)) {
      seanceStore.loading = true
      seanceStore.currentSeance = null
      seanceStore.showSeance(Number(route.params.id))
    }

    /*function editSeance() {
      const data = {
        trainings: seanceStore.currentSeanceTrainings.map((kotrana) => ({
          training: Number(kotrana.pivot.training_id),
          series: Number(kotrana.pivot.series),
          repetitions: Number(kotrana.pivot.repetitions),
          duree: Number(kotrana.pivot.duree),
        })),
      }
      console.log(data)
      seanceStore.editTraining(Number(route.params.id), data)
    }*/
    /*function editSeance() {
      const seanceId = Number(route.params.id);
      const data = {
        trainings: seanceStore.currentSeanceTrainings.map((kotrana) => ({
          training_id: Number(kotrana.pivot.training_id),
          series: Number(kotrana.pivot.series),
          repetitions: (kotrana.pivot.repetitions == '' || kotrana.pivot.repetitions == 0) ? Number(kotrana.pivot.repetitions) : null,
          duree: (kotrana.pivot.duree == '' || kotrana.pivot.duree == 0) ? Number(kotrana.pivot.duree) : null,
        })),
      };
      seanceStore.editTraining(seanceId, data);
    }*/
    function editSeance() {
      const seanceId = Number(route.params.id);
      const data = {
        traininglist: seanceStore.currentSeanceTrainings.map((kotrana) => Number(kotrana.pivot.training_id)),
        series: seanceStore.currentSeanceTrainings.map((kotrana) => Number(kotrana.pivot.series)),
        repetitions: seanceStore.currentSeanceTrainings.map((kotrana) => (kotrana.pivot.repetitions == '' || kotrana.pivot.repetitions == 0) ? null : Number(kotrana.pivot.repetitions)),
        duree: seanceStore.currentSeanceTrainings.map((kotrana) => (kotrana.pivot.duree == '' || kotrana.pivot.duree == 0) ? null : Number(kotrana.pivot.duree)),
      };
      console.log(data)
      seanceStore.editTraining(seanceId, data);
      router.push('/coach/seance/'+Number(route.params.id))
    }




    return { seanceStore, trainingStore, editSeance , ...toRefs(inputs)}
  },
})
</script>
