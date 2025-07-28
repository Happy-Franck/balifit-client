<template>
  <v-container>
    <v-card
      width="auto"
      absolute
      style="z-index: 50;"
    >
    <v-progress-linear
        :active="trainingStore.loading"
        :indeterminate="trainingStore.loading"
        bottom
        color="deep-purple-accent-4"
      ></v-progress-linear>
    </v-card>
    <v-alert
      border="start"
      variant="tonal"
      closable
      close-label="Close Alert"
      color="deep-purple-accent-4"
      v-if="trainingStore.alert" :text="trainingStore.message"
      ></v-alert>
    <div v-if="trainingStore.currentTraining">
      <p>Name: {{trainingStore.currentTraining.name}}</p>
      <p>Description: {{trainingStore.currentTraining.description}}</p>
      <p>Categories:
        <span v-for="(category , index) in trainingStore.currentTraining.categories" :key="index">
          <v-chip
            class="ma-2"
            color="red"
            text-color="white"
          >
            {{category.name}}
          </v-chip>
        </span>
      </p>
      <p v-if="trainingStore.currentTraining.equipments && trainingStore.currentTraining.equipments.length > 0">
        Équipements:
        <span v-for="(equipment, index) in trainingStore.currentTraining.equipments" :key="index">
          <v-chip
            class="ma-2"
            color="blue"
            text-color="white"
          >
            {{equipment.name}}
          </v-chip>
        </span>
      </p>
      <div v-if="trainingStore.currentTraining.image">
        <v-img
          class="bg-white"
          width="300"
          :aspect-ratio="1"
          :src="`${APP_CONFIG.STORAGE_BASE_URL}/trainings/${trainingStore.currentTraining.image}`"
          cover
        ></v-img>
      </div>
      <div v-if="AuthStore.userAuth?.id == trainingStore.currentTraining.user_id">
        <v-btn @click="supprimerTraining(trainingStore.currentTraining.id)">Supprimer</v-btn>
        <v-dialog
          v-model="dialog"
          transition="dialog-top-transition"
          persistent
          scrollable
          width="1024"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              v-bind="props"
            >
              Editer training
            </v-btn>
          </template>
          <form @submit.prevent="editTraining(trainingStore.currentTraining.id)">
            <v-card>
              <v-card-title>
                <span class="text-h5">Editer training</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field required v-model="name" label="Name" density="compact" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field required v-model="description" label="Description" density="compact" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-file-input @change="uploadImage" show-size prepend-icon="mdi-camera" v-model="image" clearable label="Image"></v-file-input>
                    </v-col>
                    <v-col cols="12">
                      <v-file-input @change="uploadVideo" show-size prepend-icon="mdi-video" v-model="video" clearable label="Video"></v-file-input>
                    </v-col>
                    <v-col cols="12">
                      <p>{{categories}}</p>
                      <v-select
                        required
                        multiple
                        v-model="categories"
                        label="Catégories musculaires"
                        :items="categoryStore.categories"
                        item-title="name"
                        item-value="id"
                      >
                      <template v-slot:selection="{ item, index }">
                        <v-chip v-if="index < 4">
                          <span>{{ item.title }}</span>
                        </v-chip>
                        <span
                          v-if="index === 4"
                          class="text-grey text-caption align-self-center"
                        >
                          (+{{ categories.length - 4 }} autres)
                        </span>
                      </template>
                      </v-select>
                    </v-col>
                    <v-col cols="12">
                      <v-select
                        multiple
                        v-model="equipments"
                        label="Équipements nécessaires"
                        :items="equipmentStore.equipments"
                        item-title="name"
                        item-value="id"
                        hint="Sélectionnez les équipements nécessaires pour cet exercice"
                        persistent-hint
                      >
                      <template v-slot:selection="{ item, index }">
                        <v-chip v-if="index < 3">
                          <span>{{ item.title }}</span>
                        </v-chip>
                        <span
                          v-if="index === 3"
                          class="text-grey text-caption align-self-center"
                        >
                          (+{{ equipments.length - 3 }} autres)
                        </span>
                      </template>
                      </v-select>
                    </v-col>
                  </v-row>
                </v-container>
                <small>*indicates required field</small>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="dialog = false"
                >
                  Close
                </v-btn>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  type="submit"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </form>
        </v-dialog>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent , ref , toRefs , reactive , watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useTrainingStore } from '../../..//store/CoachStore/TrainingStore'
import { useAuthStore } from '../../..//store/AuthStore'
import { useCategoryStore } from '../../..//store/CoachStore/CategoryStore'
import { useEquipmentStore } from '../../../store/CoachStore/EquipmentStore'
import { APP_CONFIG } from '../../../config/constants'

export default defineComponent({
  setup() {
    const dialog = ref(false)
    const state = reactive({
      name: '',
      description: '',
      image: null as null | any,
      video: null as null | any,
      categories: [] as any,
      equipments: [] as any,
      sary: null as null | any,
      vidaka: null as null | any,
    })
    const trainingStore = useTrainingStore()
    const AuthStore = useAuthStore()
    const categoryStore = useCategoryStore()
    const equipmentStore = useEquipmentStore()
    
    categoryStore.getCategories()
    equipmentStore.getEquipments()
    
    const route = useRoute()
    const router = useRouter()
    
    watch(
      () => trainingStore.currentTraining,
      (newTraining) => {
        if (newTraining !== null) {
          state.name = newTraining.name
          state.description = newTraining.description
          state.categories = newTraining.categories?.map(function(item) {
            return item.id;
          });
          state.equipments = newTraining.equipments?.map(function(item) {
            return item.id;
          }) || [];
        }
      }
    );
    
    watch(
      [() => trainingStore.message, () => trainingStore.alert],
      ([newMessage, newAlert]) => {
        if (newMessage !== '' && newAlert) {
          trainingStore.showTraining(Number(route.params.id))
          setTimeout(() => {
            trainingStore.message = '';
            trainingStore.alert = false;
          }, 5000);
        }
      }
    )

    if(trainingStore.currentTraining){
      if(trainingStore.currentTraining.id != Number(route.params.id)){
        trainingStore.loading = true
        trainingStore.currentTraining = null
        trainingStore.showTraining(Number(route.params.id))
      }
    }
    if(!trainingStore.currentTraining){
      trainingStore.loading = true
      trainingStore.currentTraining = null
      trainingStore.showTraining(Number(route.params.id))
    }
    AuthStore.getUserAuth()
    
    const editTraining = (idTraining : number) => {
      console.log(state.categories)
      dialog.value = false
      trainingStore.loading = true;
      const formData = new FormData();
      if (state.image) {
        formData.append('image', state.sary);
      }
      if (state.video) {
        formData.append('video', state.vidaka);
      }
      trainingStore.updateTraining(
        idTraining,
        {
          name: state.name,
          description: state.description,
          categories: state.categories,
          equipments: state.equipments,
        },
        formData
      )
    }
    const supprimerTraining = (idTraining : number) => {
      trainingStore.deleteTraining(idTraining)
      router.push('/coach/training')
      trainingStore.loading = true
    }
    const uploadImage = (e: any) => {
      state.sary = e.target.files[0]
    }
    const uploadVideo = (e: any) => {
      state.vidaka = e.target.files[0]
    }
    return {trainingStore , categoryStore , equipmentStore , uploadImage , uploadVideo , AuthStore , supprimerTraining , editTraining , dialog , ...toRefs(state) }
  }
})
</script>
