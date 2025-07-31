<template>
  <v-container>
    <h1>Liste des trainings</h1>
    
    <!-- Barre de recherche et filtres -->
    <v-text-field
      v-model="searchQuery"
      label="Rechercher un training..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      clearable
      @input="filterTrainings"
    ></v-text-field>

    <!-- Tabs des catégories -->
    <v-card class="mt-4 mb-6" elevation="1">
      <v-card-text>
        <div class="d-flex flex-wrap gap-2">
          <v-btn
            :variant="selectedCategoryTab === 'all' ? 'elevated' : 'outlined'"
            :color="selectedCategoryTab === 'all' ? 'primary' : 'primary'"
            size="small"
            @click="selectedCategoryTab = 'all'; filterTrainings()"
            class="mb-2"
          >
            <v-icon start size="small">mdi-dumbbell</v-icon>
            Tous
          </v-btn>
          <v-btn
            v-for="category in categoryStore.categories"
            :key="category.id"
            :variant="selectedCategoryTab === category.id ? 'elevated' : 'outlined'"
            :color="selectedCategoryTab === category.id ? 'primary' : 'primary'"
            size="small"
            @click="selectedCategoryTab = category.id; filterTrainings()"
            class="mb-2"
          >
            {{ category.name }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

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
                  <v-text-field required v-model="state.name" label="Name" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field required v-model="state.description" label="Description" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-file-input @change="uploadImage" show-size prepend-icon="mdi-camera" v-model="state.image" clearable label="Image"></v-file-input>
                </v-col>
                <v-col cols="12">
                  <v-file-input @change="uploadVideo" show-size prepend-icon="mdi-video" v-model="state.video" clearable label="Video"></v-file-input>
                </v-col>
                <v-col cols="12">
                  <v-select
                    required
                    multiple
                    v-model="state.categories"
                    label="Catégories musculaires"
                    :items="categoryStore.categories"
                    item-title="name"
                    item-value="id"
                    :loading="categoryStore.loading"
                    :disabled="categoryStore.loading"
                  >
                  <template v-slot:selection="{ item, index }">
                    <v-chip v-if="index < 4">
                      <span>{{ item.title }}</span>
                    </v-chip>
                    <span
                      v-if="index === 4"
                      class="text-grey text-caption align-self-center"
                    >
                      (+{{ state.categories.length - 4 }} autres)
                    </span>
                  </template>
                  <template v-slot:prepend-inner>
                    <v-icon v-if="categoryStore.loading" class="mr-2">mdi-loading mdi-spin</v-icon>
                  </template>
                  </v-select>
                  <div v-if="!categoryStore.loading && categoryStore.categories.length === 0" class="text-caption text-grey-darken-1 mt-1">
                    Aucune catégorie disponible. Contactez l'administrateur pour ajouter des catégories.
                  </div>
                </v-col>
                <v-col cols="12">
                  <v-select
                    multiple
                    v-model="state.equipments"
                    label="Équipements nécessaires"
                    :items="equipmentStore.equipments"
                    item-title="name"
                    item-value="id"
                    hint="Sélectionnez les équipements nécessaires pour cet exercice"
                    persistent-hint
                    :loading="equipmentStore.loading"
                    :disabled="equipmentStore.loading"
                  >
                  <template v-slot:selection="{ item, index }">
                    <v-chip v-if="index < 3">
                      <span>{{ item.title }}</span>
                    </v-chip>
                    <span
                      v-if="index === 3"
                      class="text-grey text-caption align-self-center"
                    >
                      (+{{ state.equipments.length - 3 }} autres)
                    </span>
                  </template>
                  <template v-slot:prepend-inner>
                    <v-icon v-if="equipmentStore.loading" class="mr-2">mdi-loading mdi-spin</v-icon>
                  </template>
                  </v-select>
                  <div v-if="!equipmentStore.loading && equipmentStore.equipments.length === 0" class="text-caption text-grey-darken-1 mt-1">
                    Aucun équipement disponible. Contactez l'administrateur pour ajouter des équipements.
                  </div>
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
              @click="closeDialog"
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

    <!-- Grille des trainings -->
    <v-row class="mt-6">
      <v-col 
        v-for="training in displayedTrainings" 
        :key="training.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card 
          class="training-card" 
          elevation="2" 
          hover
          @mouseenter="playVideo(training.id)"
          @mouseleave="pauseVideo(training.id)"
        >
          <div class="training-media-container">
            <!-- Image par défaut -->
            <img
              v-if="training.image"
              :src="`${APP_CONFIG.STORAGE_BASE_URL}/trainings/${training.image}`"
              :alt="training.name"
              class="training-image"
            />
            <div v-else class="training-placeholder">
              <v-icon size="64" color="grey-lighten-1">mdi-dumbbell</v-icon>
            </div>
            
            <!-- Vidéo qui apparaît au hover -->
            <video
              v-if="training.video"
              :id="`video-${training.id}`"
              :src="`${APP_CONFIG.STORAGE_BASE_URL}/training_videos/${training.video}`"
              class="training-video"
              muted
              loop
              preload="metadata"
            >
            </video>
            
            <!-- Play overlay pour les vidéos -->
            <div v-if="training.video" class="play-overlay">
              <v-icon size="20" color="white">mdi-play</v-icon>
            </div>
          </div>
          
          <v-card-title class="text-truncate">
            {{ training.name }}
            <v-chip
              v-if="AuthStore.userAuth?.id == training.user_id"
              size="small"
              color="primary"
              class="ml-2"
            >
              Moi
            </v-chip>
          </v-card-title>
          
          <v-card-text>
            <p class="text-body-2 text-grey-darken-1 mb-3">
              {{ training.description }}
            </p>
            
            <!-- Catégories -->
            <div v-if="training.categories && training.categories.length > 0" class="mb-3">
              <div class="text-caption text-grey-darken-1 mb-1">Catégories :</div>
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="category in training.categories"
                  :key="category.id"
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  {{ category.name }}
                </v-chip>
              </div>
            </div>
            
            <!-- Équipements -->
            <div v-if="training.equipments && training.equipments.length > 0">
              <div class="text-caption text-grey-darken-1 mb-1">Équipements :</div>
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="equipment in training.equipments"
                  :key="equipment.id"
                  size="small"
                  variant="outlined"
                  color="success"
                >
                  {{ equipment.name }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :to="{name: 'coachTrainingItem', params: {id: training.id}}"
              color="primary"
              variant="outlined"
              size="small"
            >
              Voir détails
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Message si aucun training -->
    <v-row v-if="!trainingStore.loading && displayedTrainings.length === 0">
      <v-col cols="12">
        <v-card class="text-center pa-6">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-dumbbell</v-icon>
          <div class="text-h6 text-grey-darken-1">
            {{ trainingStore.trainings.length === 0 ? 'Aucun training disponible' : 'Aucun training ne correspond à vos critères' }}
          </div>
          <div class="text-body-2 text-grey-darken-1 mt-2">
            {{ trainingStore.trainings.length === 0 ? 'Commencez par créer votre premier training !' : 'Essayez de modifier vos filtres de recherche.' }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, watch, computed, onMounted } from 'vue'
import { useCategoryStore } from '../../../store/CoachStore/CategoryStore'
import { useTrainingStore } from '../../../store/CoachStore/TrainingStore'
import { useEquipmentStore } from '../../../store/CoachStore/EquipmentStore'
import { useAuthStore } from '../../../store/AuthStore'
import { APP_CONFIG } from '../../../config/constants'

const dialog = ref(false)
const searchQuery = ref('')
const selectedCategoryTab = ref('all')

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

const categoryStore = useCategoryStore()
const trainingStore = useTrainingStore()
const equipmentStore = useEquipmentStore()

categoryStore.getCategories()
trainingStore.getTrainings()
equipmentStore.getEquipments()

const AuthStore = useAuthStore()
AuthStore.getUserAuth()

// Computed property pour les trainings filtrés
const displayedTrainings = computed(() => {
  let trainings = trainingStore.trainings;
  
  // Test: afficher les trainings avec vidéos
  const trainingsWithVideo = trainings.filter(t => t.video)
  console.log('Trainings avec vidéo:', trainingsWithVideo.length)
  
  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    trainings = trainings.filter(training => 
      training.name.toLowerCase().includes(query) ||
      training.description.toLowerCase().includes(query) ||
      training.categories?.some(cat => cat.name.toLowerCase().includes(query)) ||
      training.equipments?.some(eq => eq.name.toLowerCase().includes(query))
    );
  }
  
  // Filtrage par catégorie (tab sélectionné)
  if (selectedCategoryTab.value !== 'all') {
    trainings = trainings.filter(training =>
      training.categories?.some(cat => cat.id === selectedCategoryTab.value)
    );
  }
  
  return trainings;
});

const filterTrainings = () => {
  // Cette méthode est appelée par les événements de filtrage
  // La computed property se met à jour automatiquement
};

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

const playVideo = (trainingId: number) => {
  const videoElement = document.querySelector(`#video-${trainingId}`) as HTMLVideoElement
  if (videoElement) {
    videoElement.currentTime = 0
    videoElement.play().catch(error => {
      console.log('Erreur lecture vidéo:', error)
    })
  }
}

const pauseVideo = (trainingId: number) => {
  const videoElement = document.querySelector(`#video-${trainingId}`) as HTMLVideoElement
  if (videoElement) {
    videoElement.pause()
    videoElement.currentTime = 0
  }
}

const createTraining = async () => {
  try {
    trainingStore.loading = true;
    const formData = new FormData();
    
    if (state.image) {
      formData.append('image', state.sary);
    }
    if (state.video) {
      formData.append('video', state.vidaka);
    }
    
    await trainingStore.storeTraining(
      {
        name: state.name,
        description: state.description,
        categories: state.categories,
        equipments: state.equipments,
      },
      formData
    )
    
    // Reset form only on success
    resetForm()
    
    // Close dialog only on success
    dialog.value = false
  } catch (error) {
    console.error('Erreur lors de la création:', error)
  } finally {
    trainingStore.loading = false
  }
}

const resetForm = () => {
  state.name = ''
  state.description = ''
  state.categories = []
  state.equipments = []
  state.image = null
  state.sary = null
  state.video = null
  state.vidaka = null
}

const closeDialog = () => {
  dialog.value = false
  resetForm()
}

// Lifecycle
onMounted(() => {
  // Réinitialiser le modal au chargement de la page
  dialog.value = false
  resetForm()
})
</script>

<style scoped>
.training-card {
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.training-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.training-card .v-card-text {
  flex-grow: 1;
}

/* Container pour les médias */
.training-media-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #000;
}

.training-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.training-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.training-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

/* Effet hover */
.training-card:hover .training-image {
  opacity: 0;
}

.training-card:hover .training-video {
  opacity: 1;
}

.play-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0,0,0,0.8);
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.category-list {
  margin: 20px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .training-card {
    margin-bottom: 16px;
  }
}
</style>
