<template>
  <v-container>
    <!-- Breadcrumbs -->
    <v-breadcrumbs 
      :items="breadcrumbItems" 
      class="pa-0 mb-4"
      divider="/"
    >
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item
          :to="item.href"
          :disabled="item.disabled"
        >
          <v-icon v-if="item.icon" :icon="item.icon" size="16" class="mr-1"></v-icon>
          {{ item.title }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <!-- Header Section -->
    <div class="mb-6">
      <h1 class="text-h3 font-weight-bold text-primary mb-2">
        Mes Trainings
      </h1>
      <p class="text-subtitle-1 text-medium-emphasis">
        Gérez et explorez vos exercices d'entraînement
      </p>
    </div>
    
    <!-- Barre de recherche et filtres -->
    <v-card class="mb-6" elevation="1">
      <v-card-text>
        <v-row>
          <!-- Barre de recherche -->
          <v-col cols="12" md="6">
    <v-text-field
      v-model="searchQuery"
      label="Rechercher un training..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      clearable
              hide-details
              @input="onSearchInput"
    ></v-text-field>
          </v-col>

          <!-- Tri par muscle -->
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedCategoryTab"
              :items="categoryOptions"
              label="Filtrer par muscle"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="onCategoryChange"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Bouton Ajouter Training -->
    <div class="mb-6">
          <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="dialog = true"
      >
        Ajouter un training
      </v-btn>
    </div>

    <!-- Loading State -->
    <div v-if="loading && displayedTrainings.length === 0" class="text-center my-12">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p class="mt-4 text-body-1">Chargement des trainings...</p>
    </div>

    <!-- Grille des trainings avec Infinite Scroll -->
    <v-row>
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
          @click="viewTraining(training.id)"
        >
          <!-- Image du training -->
          <div class="training-image-container">
            <v-img
              v-if="training.image"
              :src="`${APP_CONFIG.STORAGE_BASE_URL}/trainings/${training.image}`"
              :alt="training.name"
              class="training-image"
              cover
              aspect-ratio="16/9"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-icon size="64" color="grey-lighten-1">mdi-dumbbell</v-icon>
                </div>
              </template>
            </v-img>
            <div v-else class="training-placeholder">
              <v-icon size="64" color="grey-lighten-1">mdi-dumbbell</v-icon>
            </div>
            
            <!-- Badge vidéo si disponible -->
            <v-chip
              v-if="training.video"
              color="primary"
              size="small"
              class="video-badge"
            >
              <v-icon start size="16">mdi-video</v-icon>
              Vidéo
            </v-chip>
          </div>
          
          <v-card-title class="text-truncate pa-4 pb-2">
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
          
          <v-card-text class="pt-0">
            <p class="text-body-2 text-grey-darken-1 mb-3 line-clamp-2">
              {{ training.description }}
            </p>
            
            <!-- Catégories musculaires -->
            <div v-if="training.categories && training.categories.length > 0" class="mb-3">
              <div class="text-caption text-grey-darken-1 mb-1">Muscles ciblés :</div>
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

          <v-card-actions class="pa-4 pt-0">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              prepend-icon="mdi-eye"
            >
              Voir détails
            </v-btn>
          </v-card-actions>
    </v-card>
      </v-col>
    </v-row>

    <!-- Loading More State -->
    <div v-if="loadingMore" class="text-center my-4">
      <v-progress-circular indeterminate size="32" color="primary"></v-progress-circular>
      <p class="mt-2 text-caption">Chargement...</p>
    </div>

    <!-- Message si aucun training -->
    <div v-if="!loading && displayedTrainings.length === 0" class="text-center my-12">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-dumbbell</v-icon>
      <h3 class="text-h5 mb-2">Aucun training trouvé</h3>
      <p class="text-body-1 text-medium-emphasis">
        {{ searchQuery || selectedCategoryTab !== 'all' ? 'Aucun training ne correspond à vos critères' : 'Vous n\'avez pas encore créé de trainings' }}
      </p>
      <v-btn
        v-if="!searchQuery && selectedCategoryTab === 'all'"
        color="primary"
        class="mt-4"
        @click="dialog = true"
      >
        Créer votre premier training
      </v-btn>
    </div>

    <!-- Dialog Ajouter Training -->
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
      persistent
      scrollable
      width="1024"
    >
      <form @submit.prevent="createTraining()">
        <v-card>
          <v-card-title>
            <span class="text-h5">Ajouter un training</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field required v-model="state.name" label="Nom" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field required v-model="state.description" label="Description" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-file-input @change="uploadImage" show-size prepend-icon="mdi-camera" v-model="state.image" clearable label="Image"></v-file-input>
                </v-col>
                <v-col cols="12">
                  <v-file-input @change="uploadVideo" show-size prepend-icon="mdi-video" v-model="state.video" clearable label="Vidéo"></v-file-input>
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
              Fermer
            </v-btn>
            <v-btn
              color="blue-darken-1"
              variant="text"
              type="submit"
            >
              Enregistrer
            </v-btn>
          </v-card-actions>
        </v-card>
      </form>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue'
import { useCategoryStore } from '../../../store/CoachStore/CategoryStore'
import { useTrainingStore } from '../../../store/CoachStore/TrainingStore'
import { useEquipmentStore } from '../../../store/CoachStore/EquipmentStore'
import { useAuthStore } from '../../../store/AuthStore'
import { APP_CONFIG } from '../../../config/constants'
import { useRouter } from 'vue-router'

const dialog = ref(false)
const searchQuery = ref('')
const selectedCategoryTab = ref('all')
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(12)

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
const AuthStore = useAuthStore()
const router = useRouter()

// Breadcrumbs
const breadcrumbItems = computed(() => [
  {
    title: 'Accueil',
    href: '/coach/dashboard',
    icon: 'mdi-home'
  },
  {
    title: 'Trainings',
    disabled: true,
    icon: 'mdi-dumbbell'
  }
])

// Options pour le select des catégories
const categoryOptions = computed(() => [
  { title: 'Tous les muscles', value: 'all' },
  ...categoryStore.categories.map(cat => ({
    title: cat.name,
    value: cat.id
  }))
])

// Computed property pour les trainings filtrés avec pagination
const displayedTrainings = computed(() => {
  let trainings = trainingStore.trainings;
  
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
  
  // Filtrage par catégorie
  if (selectedCategoryTab.value !== 'all') {
    trainings = trainings.filter(training =>
      training.categories?.some(cat => cat.id === selectedCategoryTab.value)
    );
  }
  
  // Pagination
  return trainings.slice(0, currentPage.value * itemsPerPage.value);
});

// Vérifier s'il y a plus de trainings à charger
const hasMoreTrainings = computed(() => {
  let totalTrainings = trainingStore.trainings;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    totalTrainings = totalTrainings.filter(training => 
      training.name.toLowerCase().includes(query) ||
      training.description.toLowerCase().includes(query) ||
      training.categories?.some(cat => cat.name.toLowerCase().includes(query)) ||
      training.equipments?.some(eq => eq.name.toLowerCase().includes(query))
    );
  }
  
  if (selectedCategoryTab.value !== 'all') {
    totalTrainings = totalTrainings.filter(training =>
      training.categories?.some(cat => cat.id === selectedCategoryTab.value)
    );
  }
  
  return totalTrainings.length > displayedTrainings.value.length;
});

// Infinite scroll automatique
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // Si on est proche du bas de la page et qu'il y a plus de trainings
  if (scrollTop + windowHeight >= documentHeight - 100 && hasMoreTrainings.value && !loadingMore.value) {
    loadMoreTrainings()
  }
}

// Gestion de la recherche avec debounce
let searchTimeout: number;
const onSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    filterTrainings();
  }, 300);
};

// Gestion du changement de catégorie
const onCategoryChange = () => {
  currentPage.value = 1;
  filterTrainings();
};

// Charger plus de trainings
const loadMoreTrainings = () => {
  if (!loadingMore.value && hasMoreTrainings.value) {
    loadingMore.value = true;
    currentPage.value++;
    
    // Simuler un délai pour l'UX
    setTimeout(() => {
      loadingMore.value = false;
    }, 500);
  }
};

const filterTrainings = () => {
  // Cette méthode est appelée par les événements de filtrage
  // La computed property se met à jour automatiquement
};

const viewTraining = (id: number) => {
  // Navigation vers la vue détaillée du training
  router.push(`/coach/training/${id}`)
}

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
onMounted(async () => {
  try {
    loading.value = true
    console.log('Chargement des données...')
    
    await Promise.all([
      categoryStore.getCategories(),
      trainingStore.getTrainings(),
      equipmentStore.getEquipments()
    ])
    
    console.log('Données chargées:', {
      categories: categoryStore.categories.length,
      trainings: trainingStore.trainings.length,
      equipments: equipmentStore.equipments.length
    })
    
    // Ajouter l'écouteur de scroll pour l'infinite scroll
    window.addEventListener('scroll', handleScroll)
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  } finally {
    loading.value = false
  }
})

// Watch pour les changements de données
watch(
  () => trainingStore.trainings,
  (newTrainings) => {
    console.log('Trainings mis à jour:', newTrainings.length)
    if (newTrainings.length > 0) {
      console.log('Premier training:', newTrainings[0])
    }
  },
  { immediate: true }
)

watch(
  () => displayedTrainings.value,
  (newDisplayed) => {
    console.log('Trainings affichés mis à jour:', newDisplayed.length)
  }
)

// Nettoyer l'écouteur de scroll
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.training-card {
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.training-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.training-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.training-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.training-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.video-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.training-card .v-card-text {
  flex-grow: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .training-card {
    margin-bottom: 16px;
  }
}
</style>
