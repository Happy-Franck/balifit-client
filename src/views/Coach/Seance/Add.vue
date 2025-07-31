<template>
  <v-container>
    <v-card class="mx-auto" max-width="1200" elevation="3">
      <v-card-title class="text-h4 font-weight-bold text-center py-6 bg-primary text-white">
        <v-icon size="large" class="mr-3">mdi-plus-circle</v-icon>
        Ajouter des Exercices
      </v-card-title>

      <v-card-text class="pa-6">
        <form @submit.prevent="submitForm" enctype="multipart/form-data">
          <div class="mb-6">
            <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-format-list-checks</v-icon>
              Configuration des Exercices
            </h2>
            <p class="text-caption text-medium-emphasis mb-4">
              Ajoutez et configurez les exercices pour cette séance d'entraînement
            </p>
          </div>

          <div v-for="(input, index) in inputs" :key="index" class="mb-4">
            <v-card variant="outlined" class="pa-4">
              <div class="d-flex justify-space-between align-center mb-3">
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-2">mdi-dumbbell</v-icon>
                  <span class="text-h6 font-weight-medium">Exercice #{{ index + 1 }}</span>
                </div>
                <v-btn 
                  v-if="index > 0" 
                  icon="mdi-delete" 
                  color="error" 
                  variant="text"
                  size="small"
                  @click="deleteInput(index)"
                ></v-btn>
              </div>
              
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="input.training"
                    :items="trainingStore.trainings"
                    item-title="name"
                    item-value="id"
                    label="Exercice"
                    variant="outlined"
                    prepend-icon="mdi-format-list-bulleted"
                    required
                    class="mb-2"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-text-field 
                    v-model="input.series" 
                    label="Séries" 
                    type="number" 
                    variant="outlined"
                    prepend-icon="mdi-repeat"
                    required
                    class="mb-2"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-text-field 
                    v-model="input.repetitions" 
                    label="Répétitions" 
                    type="number" 
                    variant="outlined"
                    prepend-icon="mdi-counter"
                    class="mb-2"
                    v-show="input.useRepetitions"
                  ></v-text-field>
                  <v-text-field 
                    v-model="input.duree" 
                    label="Durée (secondes)" 
                    type="number" 
                    variant="outlined"
                    prepend-icon="mdi-timer"
                    class="mb-2"
                    v-show="!input.useRepetitions"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <!-- Espace réservé pour maintenir l'alignement -->
                  <div style="height: 56px;"></div>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-checkbox
                    v-model="input.useRepetitions"
                    label="Utiliser les répétitions (décochez pour utiliser la durée)"
                    color="primary"
                    class="mt-2"
                    :true-value="true"
                    :false-value="false"
                    @update:model-value="(val) => {
                      input.useRepetitions = val;
                      if (!val) {
                        input.repetitions = null;
                      } else {
                        input.duree = null;
                      }
                    }"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-card>
          </div>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-space-between align-center mb-4">
            <v-btn 
              variant="outlined" 
              color="success" 
              prepend-icon="mdi-plus"
              @click="addInput"
            >
              Ajouter un Exercice
            </v-btn>
          </div>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-space-between align-center">
            <v-btn 
              variant="outlined" 
              color="grey" 
              prepend-icon="mdi-arrow-left"
              @click="router.back()"
            >
              Retour
            </v-btn>
            
            <v-btn 
              type="submit" 
              color="primary" 
              size="large"
              prepend-icon="mdi-content-save"
              :loading="seanceStore.loading"
            >
              Enregistrer les Exercices
            </v-btn>
          </div>
        </form>
      </v-card-text>
    </v-card>
  </v-container>
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
