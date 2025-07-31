<template>
  <div class="training-admin">
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Gestion des Entraînements</h1>
      <v-btn color="primary" size="large" @click="dialog = true">
        <v-icon start>mdi-plus</v-icon>
        Nouvel Entraînement
      </v-btn>
    </div>

    <!-- Barre de recherche et tri -->
    <v-row align="center">
        <v-col cols="12">
        <v-text-field
            v-model="searchQuery"
            label="Rechercher un exercice..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            @input="onSearchInput"
            @click:clear="clearSearch"
        ></v-text-field>
        </v-col>
    </v-row>

    <!-- Indicateur de résultats -->
    <div class="d-flex justify-space-between align-center mb-3">
      <div class="text-body-2 text-grey-darken-1">
        <span v-if="searchQuery">
          {{ trainingStore.pagination.total }} résultat(s) trouvé(s) pour "{{ searchQuery }}"
        </span>
        <span v-else>
          {{ trainingStore.pagination.total }} entraînement(s) au total
        </span>
      </div>
      <div class="text-body-2 text-grey-darken-1">
        Page {{ trainingStore.pagination.current_page }} sur {{ trainingStore.pagination.last_page }}
      </div>
    </div>

    <!-- Loading bar -->
    <!-- <v-progress-linear
      v-if="trainingStore.loading"
      indeterminate
      color="primary"
      class="mb-4"
    ></v-progress-linear> -->

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

    <!-- Data table -->
    <v-card elevation="3">
      <v-card-title class="text-h6 pa-4 bg-primary text-white">
        <v-icon start>mdi-dumbbell</v-icon>
        Liste des Entraînements
      </v-card-title>

      <v-table>
        <thead>
          <tr>
            <th class="text-left">
              <v-btn 
                variant="text" 
                size="small" 
                @click="setSortBy('id')"
                class="pa-0"
              >
                ID
                <v-icon v-if="sortBy === 'id'" size="small" class="ml-1">
                  {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </v-btn>
            </th>
            <th class="text-left">
              <v-btn 
                variant="text" 
                size="small" 
                @click="setSortBy('name')"
                class="pa-0"
              >
                Nom
                <v-icon v-if="sortBy === 'name'" size="small" class="ml-1">
                  {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </v-btn>
            </th>
            <th class="text-left">
              <v-btn 
                variant="text" 
                size="small" 
                @click="setSortBy('description')"
                class="pa-0"
              >
                Description
                <v-icon v-if="sortBy === 'description'" size="small" class="ml-1">
                  {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </v-btn>
            </th>
            <th class="text-left">Muscles</th>
            <th class="text-left">Équipements</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in trainingStore.trainings" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>
              <span class="text-truncate" style="max-width: 300px; display: block;">
                {{ item.description }}
              </span>
            </td>
            <td>
              <div v-if="item.categories && item.categories.length > 0" class="d-flex flex-wrap ga-1 align-center">
                <v-chip 
                  v-for="category in item.categories.slice(0, 2)" 
                  :key="category.id"
                  color="secondary" 
                  size="small" 
                  variant="tonal"
                  class="ma-1"
                >
                  {{ category.name }}
                </v-chip>
                <v-chip 
                  v-if="item.categories.length > 2"
                  color="primary" 
                  size="small" 
                  variant="outlined"
                  class="ma-1"
                >
                  +{{ item.categories.length - 2 }}
                </v-chip>
              </div>
              <span v-else class="text-grey">Non défini</span>
            </td>
            <td>
              <div v-if="item.equipments && item.equipments.length > 0" class="d-flex flex-wrap ga-1 align-center">
                <v-chip 
                  v-for="equipment in item.equipments.slice(0, 2)" 
                  :key="equipment.id"
                  color="orange" 
                  size="small" 
                  variant="tonal"
                  class="ma-1"
                >
                  {{ equipment.name }}
                </v-chip>
                <v-chip 
                  v-if="item.equipments.length > 2"
                  color="orange-darken-2" 
                  size="small" 
                  variant="outlined"
                  class="ma-1"
                >
                  +{{ item.equipments.length - 2 }}
                </v-chip>
              </div>
              <span v-else class="text-grey">Aucun</span>
            </td>
            <td>
              <v-btn
                icon="mdi-eye"
                size="small"
                color="info"
                variant="text"
                @click="viewTraining(item.id)"
              ></v-btn>
              <v-btn
                icon="mdi-pencil"
                size="small"
                color="warning"
                variant="text"
                @click="editTraining(item)"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="confirmDelete(item)"
              ></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Loading overlay -->
      <v-overlay v-if="trainingStore.loading" contained class="d-flex align-center justify-center">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>

      <!-- Pagination -->
      <v-card-actions class="justify-center">
        <v-pagination
          v-model="currentPage"
          :length="trainingStore.pagination.last_page"
          :total-visible="7"
          @update:modelValue="loadTrainings"
        ></v-pagination>
      </v-card-actions>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="800px" persistent scrollable>
      <v-card>
        <v-card-title class="text-h5 pa-4 bg-primary text-white">
          <v-icon start>mdi-plus</v-icon>
          Nouvel Entraînement
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

              <!-- Upload Image -->
              <v-col cols="12" md="6">
                <v-file-input
                  v-model="imageFile"
                  label="Image de l'entraînement"
                  accept="image/*"
                  variant="outlined"
                  prepend-inner-icon="mdi-camera"
                  show-size
                  @change="previewImage"
                ></v-file-input>
                
                <!-- Aperçu image -->
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

              <!-- Upload Vidéo -->
              <v-col cols="12" md="6">
                <v-file-input
                  v-model="videoFile"
                  label="Vidéo de l'entraînement"
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
              @click="closeDialog"
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
              :disabled="!valid"
            >
              <v-icon start>mdi-content-save</v-icon>
              Créer
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 bg-error text-white pa-4">
          <v-icon start>mdi-delete</v-icon>
          Confirmer la suppression
        </v-card-title>
        <v-card-text class="pa-6">
          Êtes-vous sûr de vouloir supprimer l'entraînement 
          <strong>{{ itemToDelete?.name }}</strong> ?
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Annuler
          </v-btn>
          <v-btn color="error" variant="elevated" @click="deleteTraining">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useTrainingStore } from '../../../store/AdminStore/TrainingStore'
import { useCategoryStore } from '../../../store/AdminStore/CategoryStore'
import { useEquipmentStore } from '../../../store/AdminStore/EquipmentStore'
import { useRouter } from 'vue-router'

const trainingStore = useTrainingStore()
const categoryStore = useCategoryStore()
const equipmentStore = useEquipmentStore()
const router = useRouter()

// Reactive data
const dialog = ref(false)
const deleteDialog = ref(false)
const valid = ref(false)
const currentPage = ref(1)
const searchQuery = ref('')
const sortBy = ref('id')
const sortOrder = ref('asc')
const itemToDelete = ref(null)
const imageFile = ref<File[]>([])
const videoFile = ref<File[]>([])
const imagePreview = ref<string | null>(null)
let searchTimeout: number | null = null

const editedTraining = reactive({
  name: '',
  description: '',
  category_ids: [],
  equipment_ids: []
})

const difficulties = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']

const sortOptions = [
  { title: 'ID', value: 'id' },
  { title: 'Nom', value: 'name' },
  { title: 'Description', value: 'description' },
  { title: 'Date de création', value: 'created_at' },
  { title: 'Date de modification', value: 'updated_at' }
]

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Ce champ est requis',
  positive: (value: number) => value > 0 || 'La valeur doit être positive'
}

// Computed
const categoryOptions = computed(() => categoryStore.categories || [])
const equipmentOptions = computed(() => equipmentStore.equipments || [])

// Methods
const loadTrainings = (page = 1) => {
  currentPage.value = page
  trainingStore.getTrainings(page, searchQuery.value, sortBy.value, sortOrder.value)
}

const editTraining = (training: any) => {
  router.push(`/admin/training/${training.id}/edit`)
}

const closeDialog = () => {
  dialog.value = false
  Object.assign(editedTraining, { name: '', description: '', category_ids: [], equipment_ids: [] })
  imageFile.value = []
  videoFile.value = []
  imagePreview.value = null
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
    await trainingStore.storeTraining({}, formData)
    closeDialog()
    loadTrainings(currentPage.value)
  } catch (error) {
    console.error('Erreur lors de la création:', error)
  }
}

const viewTraining = (id: number) => {
  router.push(`/admin/training/${id}`)
}

const confirmDelete = (training: any) => {
  itemToDelete.value = training
  deleteDialog.value = true
}

const deleteTraining = async () => {
  if (itemToDelete.value?.id) {
    await trainingStore.deleteTraining(itemToDelete.value.id)
    deleteDialog.value = false
    loadTrainings()
  }
}

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadTrainings(1)
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadTrainings(1)
}

const onSortChange = () => {
  currentPage.value = 1
  loadTrainings(1)
}

const setSortBy = (newSortBy: string) => {
  if (sortBy.value === newSortBy) {
    // Si on clique sur la même colonne, on inverse l'ordre
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Si on change de colonne, on remet en ordre croissant
    sortBy.value = newSortBy
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
  loadTrainings(1)
}

const resetFilters = () => {
  currentPage.value = 1
  loadTrainings(1)
  searchQuery.value = ''
  sortBy.value = 'id'
  sortOrder.value = 'asc'
}

// Lifecycle
onMounted(() => {
  loadTrainings()
  categoryStore.getCategories()
  equipmentStore.getEquipments()
})
</script>

<style scoped>
.training-admin {
  padding: 20px;
}
</style> 