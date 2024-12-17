<template>
  <v-container>
    <h1>Liste des trainings</h1>
    <v-card
      class="mx-auto mt-6"
      width="344"
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
      close-label="Close Alert"
      color="deep-purple-accent-4" v-if="trainingStore.alert" closable :text="trainingStore.message"></v-alert>

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
          Ajouter training
        </v-btn>
      </template>
      <form @submit.prevent="createTraining()">
        <v-card>
          <v-card-title>
            <span class="text-h5">Ajouter un training</span>
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
                  <v-select
                    required
                    multiple
                    v-model="categories"
                    label="Select"
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
                      (+{{ value.length - 4 }} autres)
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

    <div class="category-list">
      <span v-for="(item , index) in categoryStore.categories" :key="index">
        {{item.name}} ----
      </span>
    </div>
    <div class="training-list">
      <li v-for="(training , index) in trainingStore.trainings" :key="index">
        {{training.name}}
        <span v-if="AuthStore.userAuth?.id == training.user_id">**</span>
        <div>
          <span v-for="(elem , index) in training.categories" :key="index">
            {{elem.name}} -
          </span>
        </div>

        <router-link :to="{name: 'coachTrainingItem', params: {id: training.id}}">
          Voir
        </router-link>
      </li>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent , ref , reactive , toRefs , watch } from 'vue'
import { useCategoryStore } from '@/store/CoachStore/CategoryStore'
import { useTrainingStore } from '@/store/CoachStore/TrainingStore'
import { useAuthStore } from '@/store/AuthStore'

export default defineComponent({
  setup() {
    const dialog = ref(false)
    const state = reactive({
      name: '',
      description: '',
      image: null as null | any,
      video: null as null | any,
      categories: [] as any,
      sary: null as null | any,
      vidaka: null as null | any,
    })
    const categoryStore = useCategoryStore()
    const trainingStore = useTrainingStore()
    categoryStore.getCategories()
    trainingStore.getTrainings()
    const AuthStore = useAuthStore()
    AuthStore.getUserAuth()
    watch(
      [() => trainingStore.message, () => trainingStore.alert],
      ([newMessage, newAlert]) => {
        if (newMessage !== '' && newAlert) {
          trainingStore.getTrainings()
          setTimeout(() => {
            trainingStore.message = '';
            trainingStore.alert = false;
          }, 5000);
        }
      }
    );
    const uploadImage = (e: any) => {
      state.sary = e.target.files[0]
    }
    const uploadVideo = (e: any) => {
      state.vidaka = e.target.files[0]
    }
    const createTraining = () => {
      dialog.value = false
      trainingStore.loading = true;
      const formData = new FormData();
      if (state.image) {
        formData.append('image', state.sary);
      }
      if (state.video) {
        formData.append('video', state.vidaka);
      }
      trainingStore.storeTraining(
        {
          name: state.name,
          description: state.description,
          categories: state.categories,
        },
        formData
      )
      state.name = ''
      state.description = ''
      state.categories = []
      state.image = null
      state.sary = null
      state.video = null
      state.vidaka = null
    }
    return {categoryStore , createTraining , trainingStore , AuthStore , dialog , ...toRefs(state) , uploadImage , uploadVideo }
  }
})
</script>
