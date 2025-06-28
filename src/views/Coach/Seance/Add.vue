<template>
  <form id="mon-formulaire" @submit.prevent="submitForm" enctype="multipart/form-data">
    <div id="all-data">
      <div v-for="(input, index) in inputs" :key="index" class="list-input">
        <div class="trainingslist">
          <v-select
            v-model="input.training"
            :items="trainingStore.trainings"
            item-title="name"
            item-value="id"
            label="Training"
            required
          ></v-select>
        </div>
        <div class="serietraining">
          <v-text-field v-model="input.series" name="series[]" label="Series" type="number" dense outlined></v-text-field>
        </div>
        <div v-if="input.useRepetitions" class="reptraining">
          <v-text-field v-model="input.repetitions" name="repetitions[]" label="Repetitions" type="number" dense outlined></v-text-field>
        </div>
        <div v-else class="dureetraining">
          <v-text-field v-model="input.duree" name="duree[]" label="Duration" type="number" dense outlined></v-text-field>
        </div>
        <div class="toggle-container">
          <v-checkbox
            v-model="input.useRepetitions"
            label="Use Repetitions"
            dense
          ></v-checkbox>
        </div>
        <button v-if="index > 0" type="button" @click="deleteInput(index)">Supprimer</button>
      </div>
    </div>
    <button type="button" @click="addInput">Ajouter un champ</button>
    <button type="submit">Envoyer</button>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useSeanceStore } from '../../../store/CoachStore/SeanceStore'
import { useTrainingStore } from '../../../store/CoachStore/TrainingStore'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const trainings = ref([
        {id:0, name:'test'},
        {id:1, name:'ok'},
        {id:2, name:'ora'},
        {id:3, name:'ko'},
      ])
    const inputs = ref([
      {
        training: null,
        series: '',
        repetitions: '',
        duree: '',
        useRepetitions: true,
      },
    ]);
    const seanceStore = useSeanceStore()
    const trainingStore = useTrainingStore()
    const route = useRoute()
    const router = useRouter()
    trainingStore.getTrainings()

    function addInput() {
      inputs.value.push({
        training: null,
        series: '',
        repetitions: '',
        duree: '',
        useRepetitions: true,
      });
    }

    function deleteInput(index: number) {
      inputs.value.splice(index, 1);
    }

    function submitForm() {
      const data = {
        traininglist: inputs.value.map((input) => Number(input.training)),
        series: inputs.value.map((input) => Number(input.series) || null),
        repetitions: inputs.value.map((input) => (input.useRepetitions ? Number(input.repetitions) : null)),
        duree: inputs.value.map((input) => (!input.useRepetitions ? Number(input.duree) : null)),
      };
      seanceStore.addTraining(Number(route.params.id), data)
      router.push('/coach/seance/'+Number(route.params.id))
    }

    return {
      trainings,
      inputs,
      trainingStore,
      seanceStore,
      addInput,
      deleteInput,
      submitForm,
    };
  },
});
</script>
