<template>
  <v-container class="training-edit">
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

    <!-- Loading state -->
    <div v-if="trainingStore.loading" class="loading-container">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p class="loading-text mt-4">Chargement...</p>
    </div>

    <!-- Form -->
    <v-card v-if="!trainingStore.loading" elevation="3" class="mx-auto">
      <v-card-title class="text-h5 pa-4 bg-primary text-white">
        <v-icon start>mdi-pencil</v-icon>
        Modifier l'entraînement
      </v-card-title>

      <v-form ref="form" v-model="valid" @submit.prevent="saveTraining">
        <v-card-text class="pa-6">
          <v-row>
            <!-- Nom -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editedTraining.name"
                label="Nom de l'entraînement *"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-dumbbell"
                required
              ></v-text-field>
            </v-col>

            <!-- Description -->
            <v-col cols="12" md="6">
              <v-textarea
                v-model="editedTraining.description"
                label="Description *"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-text"
                rows="4"
                required
              ></v-textarea>
            </v-col>

            <!-- Catégories (Muscles) -->
            <v-col cols="12" md="6">
              <v-select
                v-model="editedTraining.category_ids"
                :items="categoryOptions"
                item-title="name"
                item-value="id"
                label="Muscles ciblés"
                variant="outlined"
                prepend-inner-icon="mdi-muscle"
                multiple
                chips
                closable-chips
              ></v-select>
            </v-col>

            <!-- Équipements -->
            <v-col cols="12" md="6">
              <v-select
                v-model="editedTraining.equipment_ids"
                :items="equipmentOptions"
                item-title="name"
                item-value="id"
                label="Équipements nécessaires"
                variant="outlined"
                prepend-inner-icon="mdi-weight-lifter"
                multiple
                chips
                closable-chips
              ></v-select>
            </v-col>

            <!-- Image actuelle -->
            <v-col cols="12" md="6" v-if="training?.image">
              <v-card variant="outlined" class="pa-4">
                <v-card-subtitle class="pa-0 mb-2">
                  <v-icon start size="16">mdi-image</v-icon>
                  Image actuelle
                </v-card-subtitle>
                <v-img
                  :src="`${APP_CONFIG.STORAGE_BASE_URL}/trainings/${training.image}`"
                  :alt="training.name"
                  max-height="200"
                  class="rounded"
                ></v-img>
              </v-card>
            </v-col>

            <!-- Upload nouvelle image -->
            <v-col cols="12" :md="training?.image ? 6 : 12">
              <v-file-input
                v-model="imageFile"
                label="Nouvelle image (optionnel)"
                accept="image/*"
                variant="outlined"
                prepend-inner-icon="mdi-camera"
                show-size
                @change="previewImage"
              ></v-file-input>
              
              <!-- Aperçu nouvelle image -->
              <v-card v-if="imagePreview" variant="outlined" class="mt-2 pa-4">
                <v-card-subtitle class="pa-0 mb-2">
                  <v-icon start size="16">mdi-eye</v-icon>
                  Aperçu
                </v-card-subtitle>
                <v-img
                  :src="imagePreview"
                  max-height="200"
                  class="rounded"
                ></v-img>
              </v-card>
            </v-col>

            <!-- Vidéo actuelle -->
            <v-col cols="12" md="6" v-if="training?.video">
              <v-card variant="outlined" class="pa-4">
                <v-card-subtitle class="pa-0 mb-2">
                  <v-icon start size="16">mdi-video</v-icon>
                  Vidéo actuelle
                </v-card-subtitle>
                <video
                  :src="`${APP_CONFIG.STORAGE_BASE_URL}/training_videos/${training.video}`"
                  controls
                  style="width: 100%; max-height: 200px;"
                  class="rounded"
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </v-card>
            </v-col>

            <!-- Upload nouvelle vidéo -->
            <v-col cols="12" :md="training?.video ? 6 : 12">
              <v-file-input
                v-model="videoFile"
                label="Nouvelle vidéo (optionnel)"
                accept="video/*"
                variant="outlined"
                prepend-inner-icon="mdi-video"
                show-size
              ></v-file-input>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            color="grey"
            variant="outlined"
            @click="goBack"
            :disabled="trainingStore.loading"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Annuler
          </v-btn>
          
          <v-spacer></v-spacer>
          
          <v-btn
            color="primary"
            type="submit"
            :loading="trainingStore.loading"
            :disabled="!valid"
          >
            <v-icon start>mdi-content-save</v-icon>
            Sauvegarder
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>

    <!-- Alert -->
    <v-snackbar
      v-model="trainingStore.alert"
      :timeout="5000"
      color="success"
      location="top"
    >
      {{ trainingStore.message }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="trainingStore.alert = false"
        >
          Fermer
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrainingStore } from '../../../store/AdminStore/TrainingStore'
import { useCategoryStore } from '../../../store/AdminStore/CategoryStore'
import { useEquipmentStore } from '../../../store/AdminStore/EquipmentStore'
import { APP_CONFIG } from '../../../config/constants'

const route = useRoute()
const router = useRouter()
const trainingStore = useTrainingStore()
const categoryStore = useCategoryStore()
const equipmentStore = useEquipmentStore()

// Reactive data
const form = ref()
const valid = ref(false)
const imageFile = ref<File[]>([])
const videoFile = ref<File[]>([])
const imagePreview = ref<string | null>(null)

const editedTraining = reactive({
  name: '',
  description: '',
  category_ids: [] as number[],
  equipment_ids: [] as number[]
})

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Ce champ est requis',
  positive: (value: number) => !value || value > 0 || 'La valeur doit être positive'
}

// Computed
const training = computed(() => trainingStore.currentTraining)
const categoryOptions = computed(() => categoryStore.categories || [])
const equipmentOptions = computed(() => equipmentStore.equipments || [])

const breadcrumbItems = computed(() => [
  {
    title: 'Accueil',
    href: '/admin/dashboard',
    icon: 'mdi-home'
  },
  {
    title: 'Entraînements',
    href: '/admin/training',
    icon: 'mdi-dumbbell'
  },
  {
    title: training.value?.name || 'Détail',
    href: `/admin/training/${route.params.id}`,
    icon: 'mdi-eye'
  },
  {
    title: 'Modifier',
    disabled: true,
    icon: 'mdi-pencil'
  }
])

// Methods
const loadTraining = async () => {
  const id = Number(route.params.id)
  if (id) {
    await trainingStore.showTraining(id)
    if (training.value) {
      // Pré-remplir le formulaire avec les données existantes
      editedTraining.name = training.value.name
      editedTraining.description = training.value.description
      editedTraining.category_ids = training.value.categories?.map(c => c.id) || []
      editedTraining.equipment_ids = training.value.equipments?.map(e => e.id) || []
    }
  }
}

const loadDependencies = async () => {
  await Promise.all([
    categoryStore.getCategories(),
    equipmentStore.getEquipments()
  ])
}

const previewImage = () => {
  if (imageFile.value && imageFile.value.length > 0) {
    const file = imageFile.value[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    imagePreview.value = null
  }
}

const saveTraining = async () => {
  if (!valid.value || !training.value) return

  const formData = new FormData()
  
  // Ajouter les données de base
  formData.append('name', editedTraining.name)
  formData.append('description', editedTraining.description)

  // Ajouter les catégories
  editedTraining.category_ids.forEach((id, index) => {
    formData.append(`categories[${index}]`, id.toString())
  })

  // Ajouter les équipements
  editedTraining.equipment_ids.forEach((id, index) => {
    formData.append(`equipments[${index}]`, id.toString())
  })

  // Ajouter les fichiers si présents
  if (imageFile.value && imageFile.value.length > 0) {
    formData.append('image', imageFile.value[0])
  }

  if (videoFile.value && videoFile.value.length > 0) {
    formData.append('video', videoFile.value[0])
  }

  try {
    await trainingStore.updateTraining(training.value.id, {}, formData)
    if (!trainingStore.loading) {
      router.push(`/admin/training/${training.value.id}`)
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

const goBack = () => {
  router.push(`/admin/training/${route.params.id}`)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadTraining(),
    loadDependencies()
  ])
})
</script>

<style scoped>
.training-edit {
  max-width: 1200px;
  padding: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-text {
  font-size: 1rem;
  color: #606060;
}

/* Responsive */
@media (max-width: 768px) {
  .training-edit {
    padding: 8px;
  }
}
</style> 