<template>
  <v-container>
    <v-card class="mx-auto" max-width="1200" elevation="3">
      <v-card-title class="text-h4 font-weight-bold text-center py-6 bg-primary text-white">
        <v-icon size="large" class="mr-3">mdi-dumbbell</v-icon>
        Éditer la Séance
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form @submit.prevent="editSeance" enctype="multipart/form-data">
          <div class="mb-6">
            <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-format-list-checks</v-icon>
              Configuration des Exercices
            </h2>
            <p class="text-caption text-medium-emphasis mb-4">
              Modifiez les paramètres de chaque exercice pour optimiser l'entraînement
            </p>
          </div>

          <v-row v-for="(kotrana, index) in seanceStore.currentSeanceTrainings" :key="index" class="mb-4">
            <v-col cols="12">
              <v-card variant="outlined" class="pa-4">
                <div class="d-flex align-center mb-3">
                  <v-icon color="primary" class="mr-2">mdi-dumbbell</v-icon>
                  <span class="text-h6 font-weight-medium">Exercice #{{ index + 1 }}</span>
                </div>
                
                <v-row>
                  <v-col cols="12" sm="6" md="3">
                    <v-select
                      v-model="kotrana.pivot.training_id"
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
                      v-model="kotrana.pivot.series" 
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
                      v-model="kotrana.pivot.repetitions" 
                      label="Répétitions" 
                      type="number" 
                      variant="outlined"
                      prepend-icon="mdi-counter"
                      class="mb-2"
                      v-show="kotrana.pivot.useRepetitions"
                    ></v-text-field>
                    <v-text-field 
                      v-model="kotrana.pivot.duree" 
                      label="Durée (secondes)" 
                      type="number" 
                      variant="outlined"
                      prepend-icon="mdi-timer"
                      class="mb-2"
                      v-show="!kotrana.pivot.useRepetitions"
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
                      v-model="kotrana.pivot.useRepetitions"
                      label="Utiliser les répétitions (décochez pour utiliser la durée)"
                      color="primary"
                      class="mt-2"
                      :true-value="true"
                      :false-value="false"
                      @update:model-value="(val) => {
                        kotrana.pivot.useRepetitions = val;
                        if (!val) {
                          kotrana.pivot.repetitions = null;
                        } else {
                          kotrana.pivot.duree = null;
                        }
                      }"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

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
              Enregistrer les Modifications
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeanceStore } from '../../../store/CoachStore/SeanceStore'
import { useTrainingStore } from '../../../store/CoachStore/TrainingStore'

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
          
          // Initialiser useRepetitions pour chaque exercice
          seanceStore.currentSeanceTrainings?.forEach((elem) => {
            if (elem.pivot.useRepetitions === undefined) {
              elem.pivot.useRepetitions = elem.pivot.repetitions ? true : false;
            }
          });
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
