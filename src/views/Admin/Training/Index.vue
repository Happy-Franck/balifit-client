<template>
  <div class="training-admin">
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Gestion des Entraînements</h1>
      <v-btn color="primary" size="large" @click="openCreateDialog">
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
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4 bg-primary text-white">
          <v-icon start>{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Modifier l\'Entraînement' : 'Nouvel Entraînement' }}
        </v-card-title>

        <v-form ref="form" v-model="valid" @submit.prevent="saveTraining">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedTraining.name"
                  label="Nom de l'entraînement"
                  :rules="[rules.required]"
                  variant="outlined"
                  prepend-inner-icon="mdi-dumbbell"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="editedTraining.description"
                  label="Description"
                  :rules="[rules.required]"
                  variant="outlined"
                  rows="3"
                  prepend-inner-icon="mdi-text"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="editedTraining.category_ids"
                  :items="categoryOptions"
                  item-title="name"
                  item-value="id"
                  label="Muscles cibles"
                  variant="outlined"
                  prepend-inner-icon="mdi-muscle"
                  multiple
                  chips
                  closable-chips
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="editedTraining.equipment_ids"
                  :items="equipmentOptions"
                  item-title="name"
                  item-value="id"
                  label="Équipements utilisés"
                  variant="outlined"
                  prepend-inner-icon="mdi-weight-lifter"
                  multiple
                  chips
                  closable-chips
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="closeDialog">
              Annuler
            </v-btn>
            <v-btn color="primary" variant="elevated" type="submit" :disabled="!valid">
              {{ isEditing ? 'Modifier' : 'Créer' }}
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
const isEditing = ref(false)
const itemToDelete = ref(null)
const currentPage = ref(1)
const searchQuery = ref('')
const sortBy = ref('id')
const sortOrder = ref('asc')
let searchTimeout: number | null = null

const editedTraining = reactive({
  id: null,
  name: '',
  description: '',
  category_ids: [],
  equipment_ids: []
})

const defaultTraining = {
  id: null,
  name: '',
  description: '',
  category_ids: [],
  equipment_ids: []
}

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

const openCreateDialog = () => {
  isEditing.value = false
  Object.assign(editedTraining, defaultTraining)
  dialog.value = true
}

const editTraining = (training: any) => {
  isEditing.value = true
  Object.assign(editedTraining, {
    ...training,
    category_ids: training.categories ? training.categories.map(c => c.id) : [],
    equipment_ids: training.equipments ? training.equipments.map(e => e.id) : []
  })
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  Object.assign(editedTraining, defaultTraining)
}

const saveTraining = async () => {
  const trainingData = {
    ...editedTraining,
    categories: editedTraining.category_ids,
    equipments: editedTraining.equipment_ids
  }
  delete trainingData.category_ids
  delete trainingData.equipment_ids

  if (isEditing.value) {
    await trainingStore.updateTraining(editedTraining.id, trainingData)
  } else {
    await trainingStore.storeTraining(trainingData)
  }
  closeDialog()
  loadTrainings(currentPage.value)
}

const viewTraining = (id: number) => {
  router.push(`/admin/training/${id}`)
}

const confirmDelete = (training: any) => {
  itemToDelete.value = training
  deleteDialog.value = true
}

const deleteTraining = async () => {
  if (itemToDelete.value) {
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