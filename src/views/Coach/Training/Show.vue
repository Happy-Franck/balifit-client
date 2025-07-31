<template>
  <v-container class="training-show">
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

    <!-- Alert messages -->
    <v-alert
      v-if="trainingStore.alert"
      :text="trainingStore.message"
      color="success"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="trainingStore.alert = false"
    ></v-alert>

    <!-- Training Content -->
    <div v-if="training && !trainingStore.loading" class="training-content">
      <!-- Debug info -->
      <v-img v-if="training.image" :src="`${APP_CONFIG.STORAGE_BASE_URL}/trainings/${training.image}`" width="100%" height="100%"></v-img>
      
      <!-- Header avec image/vidéo et infos principales -->
      <v-card class="training-header-card" elevation="2">
        <div class="media-section">
          
          <!-- Vidéo -->
          <div v-if="training.video" class="video-container">
            <video
              :src="`${APP_CONFIG.STORAGE_BASE_URL}/training_videos/${training.video}`"
              controls
              class="main-video"
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>
          
          <!-- Placeholder si pas de média -->
          <div v-if="!training.image && !training.video" class="no-media">
            <v-icon size="80" color="grey-lighten-2">mdi-play-circle-outline</v-icon>
            <p class="no-media-text">Aucun média disponible</p>
          </div>
        </div>

        <!-- Informations principales -->
        <div class="info-section">
          <div class="training-header">
            <h1 class="training-title">{{ training.name }}</h1>
            <div class="training-meta">
              <v-chip
                v-if="AuthStore.userAuth?.id == training.user_id"
                color="primary"
                size="small"
                class="ml-2"
              >
                <v-icon start size="16">mdi-account</v-icon>
                Mon training
              </v-chip>
            </div>
          </div>

          <!-- Description -->
          <div class="description-section">
            <h3 class="section-title">Description</h3>
            <p class="description-text">{{ training.description || 'Aucune description disponible' }}</p>
          </div>

          <!-- Catégories musculaires -->
          <div v-if="training.categories && training.categories.length > 0" class="categories-section">
            <h3 class="section-title">Muscles ciblés</h3>
            <div class="categories-list">
              <v-chip
                v-for="category in training.categories"
                :key="category.id"
                size="small"
                color="primary"
                variant="flat"
                class="category-chip"
              >
                <v-icon start size="14">mdi-muscle</v-icon>
                {{ category.name }}
              </v-chip>
            </div>
          </div>

          <!-- Équipements -->
          <div v-if="training.equipments && training.equipments.length > 0" class="equipment-section">
            <h3 class="section-title">Équipements nécessaires</h3>
            <div class="equipment-list">
              <v-chip
                v-for="equipment in training.equipments"
                :key="equipment.id"
                size="small"
                color="success"
                variant="flat"
                class="equipment-chip"
              >
                <v-icon start size="14">mdi-weight-lifter</v-icon>
                {{ equipment.name }}
              </v-chip>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="AuthStore.userAuth?.id == training.user_id" class="actions-section">
            <v-divider class="my-4"></v-divider>
            <div class="actions-buttons">
              <v-btn
                color="primary"
                variant="outlined"
                @click="editTraining"
                class="action-btn"
              >
                <v-icon start>mdi-pencil</v-icon>
                Modifier
              </v-btn>
              <v-btn
                color="error"
                variant="outlined"
                @click="confirmDelete"
                class="action-btn"
              >
                <v-icon start>mdi-delete</v-icon>
                Supprimer
              </v-btn>
            </div>
          </div>
        </div>
      </v-card>
    </div>

    <!-- État vide -->
    <div v-if="!training && !trainingStore.loading" class="empty-state">
      <v-icon size="80" color="grey-lighten-1">mdi-dumbbell-off</v-icon>
      <h3 class="empty-title">Training introuvable</h3>
      <p class="empty-subtitle">Ce training n'existe pas ou a été supprimé.</p>
      <v-btn color="primary" @click="goBack" class="mt-4">
        <v-icon start>mdi-arrow-left</v-icon>
        Retour à la liste
      </v-btn>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          <v-icon class="mr-2" color="error">mdi-delete</v-icon>
          Confirmer la suppression
        </v-card-title>
        <v-card-text class="pa-4">
          <p>Êtes-vous sûr de vouloir supprimer le training <strong>{{ training?.name }}</strong> ?</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Cette action est irréversible.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Annuler</v-btn>
          <v-btn color="error" variant="flat" @click="deleteTraining">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Training Dialog -->
    <v-dialog v-model="editDialog" max-width="800px" persistent scrollable>
      <v-card>
        <v-card-title class="text-h5 pa-4 bg-primary text-white">
          <v-icon start>mdi-pencil</v-icon>
          Modifier l'entraînement
        </v-card-title>

        <v-form ref="editForm" v-model="editValid" @submit.prevent="saveTraining">
          <v-card-text class="pa-6">
            <v-row>
              <!-- Nom -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editFormData.name"
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
                  v-model="editFormData.description"
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
                  v-model="editFormData.category_ids"
                  :items="categoryOptions"
                  item-title="name"
                  item-value="id"
                  label="Muscles ciblés"
                  variant="outlined"
                  prepend-inner-icon="mdi-muscle"
                  multiple
                  chips
                  closable-chips
                  :loading="categoryStore.loading"
                  :disabled="categoryStore.loading"
                >
                  <template v-slot:prepend-inner>
                    <v-icon v-if="categoryStore.loading" class="mr-2">mdi-loading mdi-spin</v-icon>
                  </template>
                </v-select>
                <div v-if="!categoryStore.loading && categoryOptions.length === 0" class="text-caption text-grey-darken-1 mt-1">
                  Aucune catégorie disponible.
                </div>
              </v-col>

              <!-- Équipements -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="editFormData.equipment_ids"
                  :items="equipmentOptions"
                  item-title="name"
                  item-value="id"
                  label="Équipements nécessaires"
                  variant="outlined"
                  prepend-inner-icon="mdi-weight-lifter"
                  multiple
                  chips
                  closable-chips
                  :loading="equipmentStore.loading"
                  :disabled="equipmentStore.loading"
                >
                  <template v-slot:prepend-inner>
                    <v-icon v-if="equipmentStore.loading" class="mr-2">mdi-loading mdi-spin</v-icon>
                  </template>
                </v-select>
                <div v-if="!equipmentStore.loading && equipmentOptions.length === 0" class="text-caption text-grey-darken-1 mt-1">
                  Aucun équipement disponible.
                </div>
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
              @click="closeEditDialog"
              :disabled="trainingStore.loading"
            >
              <v-icon start>mdi-close</v-icon>
              Annuler
            </v-btn>
            
            <v-spacer></v-spacer>
            
            <v-btn
              color="primary"
              type="submit"
              :loading="trainingStore.loading"
              :disabled="!editValid"
            >
              <v-icon start>mdi-content-save</v-icon>
              Sauvegarder
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrainingStore } from '../../../store/CoachStore/TrainingStore'
import { useAuthStore } from '../../../store/AuthStore'
import { APP_CONFIG } from '../../../config/constants'
import { useCategoryStore } from '../../../store/CoachStore/CategoryStore'
import { useEquipmentStore } from '../../../store/CoachStore/EquipmentStore'

const route = useRoute()
const router = useRouter()
const trainingStore = useTrainingStore()
const AuthStore = useAuthStore()
const categoryStore = useCategoryStore()
const equipmentStore = useEquipmentStore()

// Reactive data
const deleteDialog = ref(false)
const editDialog = ref(false)
const editValid = ref(false)
const editForm = ref(null)
const imageFile = ref<File | null>(null)
const videoFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

// Form data for editing
const editFormData = reactive({
  name: '',
  description: '',
  category_ids: [] as number[],
  equipment_ids: [] as number[]
})

// Computed
const training = computed(() => trainingStore.currentTraining)

const breadcrumbItems = computed(() => [
  {
    title: 'Accueil',
    href: '/coach/dashboard',
    icon: 'mdi-home'
  },
  {
    title: 'Trainings',
    href: '/coach/training',
    icon: 'mdi-dumbbell'
  },
  {
    title: training.value?.name || 'Détail',
    disabled: true,
    icon: 'mdi-eye'
  }
])

const categoryOptions = computed(() => categoryStore.categories.map(c => ({
  id: c.id,
  name: c.name
})))

const equipmentOptions = computed(() => equipmentStore.equipments.map(e => ({
  id: e.id,
  name: e.name
})))

const rules = {
  required: (value: string) => !!value || 'Champ requis',
}

// Methods
const loadTraining = async () => {
  const id = Number(route.params.id)
  if (id) {
    await trainingStore.showTraining(id)
  }
}

const goBack = () => {
  router.push('/coach/training')
}

const editTraining = () => {
  editDialog.value = true
  // Charger les données si pas encore fait
  if (categoryStore.categories.length === 0) {
    categoryStore.getCategories()
  }
  if (equipmentStore.equipments.length === 0) {
    equipmentStore.getEquipments()
  }
  
  // Préremplir le formulaire avec les données actuelles
  if (training.value) {
    editFormData.name = training.value.name
    editFormData.description = training.value.description
    editFormData.category_ids = training.value.categories?.map(c => c.id) || []
    editFormData.equipment_ids = training.value.equipments?.map(e => e.id) || []
  }
}

const viewTraining = (id: number) => {
  router.push(`/coach/training/${id}`)
}

const confirmDelete = () => {
  deleteDialog.value = true
}

const deleteTraining = async () => {
  if (training.value) {
    await trainingStore.deleteTraining(training.value.id)
    deleteDialog.value = false
    router.push('/coach/training')
  }
}

const previewImage = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    imagePreview.value = URL.createObjectURL(file);
  } else {
    imagePreview.value = null;
  }
};

const closeEditDialog = () => {
  editDialog.value = false;
  editForm.value?.reset();
  imagePreview.value = null;
  videoFile.value = null;
  // Réinitialiser les données du formulaire
  editFormData.name = '';
  editFormData.description = '';
  editFormData.category_ids = [];
  editFormData.equipment_ids = [];
};

const saveTraining = async () => {
  if (!editForm.value) return;

  const isValid = await editForm.value.validate();
  if (!isValid) {
    return;
  }

  const formData = new FormData();
  formData.append('name', editFormData.name);
  formData.append('description', editFormData.description);
  
  // Ajouter les catégories
  editFormData.category_ids.forEach((id, index) => {
    formData.append(`categories[${index}]`, id.toString());
  });

  // Ajouter les équipements
  editFormData.equipment_ids.forEach((id, index) => {
    formData.append(`equipments[${index}]`, id.toString());
  });

  if (imageFile.value) {
    formData.append('image', imageFile.value);
  }
  if (videoFile.value) {
    formData.append('video', videoFile.value);
  }

  try {
    await trainingStore.updateTraining(
      training.value?.id || 0,
      {
        name: editFormData.name,
        description: editFormData.description,
        categories: editFormData.category_ids,
        equipments: editFormData.equipment_ids,
      },
      formData
    );
    editDialog.value = false;
    await trainingStore.showTraining(training.value?.id || 0); // Refresh training data
  } catch (error) {
    console.error('Error saving training:', error);
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'Non défini'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Watchers
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      loadTraining()
    }
  }
)

// Watcher pour les alertes
watch(
  [() => trainingStore.message, () => trainingStore.alert],
  ([newMessage, newAlert]) => {
    if (newMessage !== '' && newAlert) {
      setTimeout(() => {
        trainingStore.message = '';
        trainingStore.alert = false;
      }, 5000);
    }
  }
)

// Lifecycle
onMounted(() => {
  loadTraining()
  AuthStore.getUserAuth()
  categoryStore.getCategories()
  equipmentStore.getEquipments()
})
</script>

<style scoped>
.training-show {
  max-width: 1200px;
  padding: 16px;
}

/* Loading */
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

/* Training content */
.training-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header card */
.training-header-card {
  overflow: hidden;
}

.media-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-container {
  width: 100%;
}

.main-image {
  width: 100%;
  border-radius: 8px;
}

.video-container {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.main-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-media {
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

.no-media-text {
  margin-top: 8px;
  color: #606060;
  font-size: 0.875rem;
}

/* Info section */
.info-section {
  padding: 24px;
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.training-title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
  color: rgb(var(--v-theme-on-surface));
}

.training-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Sections */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: rgb(var(--v-theme-on-surface));
}

.description-section {
  margin-bottom: 24px;
}

.description-text {
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
  color: rgb(var(--v-theme-on-surface-variant));
}

.categories-section,
.equipment-section {
  margin-bottom: 24px;
}

.categories-list,
.equipment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-chip,
.equipment-chip {
  font-size: 0.75rem;
  height: 24px;
}

/* Actions */
.actions-section {
  margin-top: 16px;
}

.actions-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  text-transform: none;
  font-size: 0.875rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 24px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 16px 0 8px 0;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .training-show {
    padding: 8px;
  }
  
  .training-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .info-section {
    padding: 16px;
  }
  
  .actions-buttons {
    flex-direction: column;
  }
  
  .suggestion-card {
    margin-bottom: 16px;
  }
}
</style>
