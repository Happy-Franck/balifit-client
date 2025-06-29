<template>
  <div class="equipment-admin">
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Gestion des Équipements</h1>
      <v-btn color="primary" size="large" @click="openCreateDialog">
        <v-icon start>mdi-plus</v-icon>
        Nouvel Équipement
      </v-btn>
    </div>

    <!-- Barre de recherche -->
    <v-row align="center">
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          label="Rechercher un équipement..."
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
          {{ equipmentStore.pagination.total }} résultat(s) trouvé(s) pour "{{ searchQuery }}"
        </span>
        <span v-else>
          {{ equipmentStore.pagination.total }} équipement(s) au total
        </span>
      </div>
      <div class="text-body-2 text-grey-darken-1">
        Page {{ equipmentStore.pagination.current_page }} sur {{ equipmentStore.pagination.last_page }}
      </div>
    </div>

    <!-- Loading bar -->
    <v-progress-linear
      v-if="equipmentStore.loading"
      indeterminate
      color="primary"
      class="mb-4"
    ></v-progress-linear>

    <!-- Alert messages -->
    <v-alert
      v-if="equipmentStore.alert"
      :text="equipmentStore.message"
      color="success"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="equipmentStore.alert = false"
    ></v-alert>

    <!-- Data table -->
    <v-card elevation="3">
      <v-card-title class="text-h6 pa-4 bg-primary text-white">
        <v-icon start>mdi-weight-lifter</v-icon>
        Liste des Équipements
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
            <th class="text-left">Image</th>
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
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in equipmentStore.equipments" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <v-avatar
                v-if="item.image"
                :image="`http://127.0.0.1:8000/storage/equipments/${item.image}`"
                size="40"
              ></v-avatar>
              <v-icon v-else size="40" color="grey">mdi-weight-lifter</v-icon>
            </td>
            <td>{{ item.name }}</td>
            <td>
              <span class="text-truncate" style="max-width: 200px; display: block;">
                {{ item.description }}
              </span>
            </td>
            <td>
              <v-btn
                icon="mdi-eye"
                size="small"
                color="info"
                variant="text"
                @click="viewEquipment(item.id)"
              ></v-btn>
              <v-btn
                icon="mdi-pencil"
                size="small"
                color="warning"
                variant="text"
                @click="editEquipment(item)"
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
      <v-overlay v-if="equipmentStore.loading" contained class="d-flex align-center justify-center">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>

      <!-- Pagination -->
      <v-card-actions class="justify-center">
        <v-pagination
          v-model="currentPage"
          :length="equipmentStore.pagination.last_page"
          :total-visible="7"
          @update:modelValue="loadEquipments"
        ></v-pagination>
      </v-card-actions>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4 bg-primary text-white">
          <v-icon start>{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Modifier l\'Équipement' : 'Nouvel Équipement' }}
        </v-card-title>

        <v-form ref="form" v-model="valid" @submit.prevent="saveEquipment">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedEquipment.name"
                  label="Nom de l'équipement"
                  :rules="[rules.required]"
                  variant="outlined"
                  prepend-inner-icon="mdi-weight-lifter"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="editedEquipment.description"
                  label="Description"
                  :rules="[rules.required]"
                  variant="outlined"
                  rows="3"
                  prepend-inner-icon="mdi-text"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="editedEquipment.category"
                  :items="equipmentCategories"
                  label="Catégorie"
                  :rules="[rules.required]"
                  variant="outlined"
                  prepend-inner-icon="mdi-tag"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-file-input
                  v-model="equipmentImage"
                  @change="uploadImage"
                  label="Image de l'équipement"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  variant="outlined"
                  clearable
                  show-size
                ></v-file-input>
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
          Êtes-vous sûr de vouloir supprimer l'équipement 
          <strong>{{ itemToDelete?.name }}</strong> ?
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Annuler
          </v-btn>
          <v-btn color="error" variant="elevated" @click="deleteEquipment">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useEquipmentStore } from '../../../store/AdminStore/EquipmentStore'
import { useRouter } from 'vue-router'

const equipmentStore = useEquipmentStore()
const router = useRouter()

// Reactive data
const dialog = ref(false)
const deleteDialog = ref(false)
const valid = ref(false)
const isEditing = ref(false)
const itemToDelete = ref(null)
const equipmentImage = ref(null)
const imageFile = ref(null)
const currentPage = ref(1)
const searchQuery = ref('')
const sortBy = ref('id')
const sortOrder = ref('asc')
let searchTimeout: number | null = null

const editedEquipment = reactive({
  id: null,
  name: '',
  description: '',
  category: ''
})

const defaultEquipment = {
  id: null,
  name: '',
  description: '',
  category: ''
}

const equipmentCategories = [
  'Cardio',
  'Force',
  'Musculation',
  'Fonctionnel',
  'Yoga & Pilates',
  'Accessoires'
]

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Ce champ est requis'
}

// Methods
const loadEquipments = (page = 1) => {
  currentPage.value = page
  equipmentStore.getEquipments(page, searchQuery.value, sortBy.value, sortOrder.value)
}

const openCreateDialog = () => {
  isEditing.value = false
  Object.assign(editedEquipment, defaultEquipment)
  equipmentImage.value = null
  imageFile.value = null
  dialog.value = true
}

const editEquipment = (equipment: any) => {
  isEditing.value = true
  Object.assign(editedEquipment, equipment)
  equipmentImage.value = null
  imageFile.value = null
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  Object.assign(editedEquipment, defaultEquipment)
  equipmentImage.value = null
  imageFile.value = null
}

const uploadImage = (e: any) => {
  if (e.target && e.target.files && e.target.files[0]) {
    imageFile.value = e.target.files[0]
  }
}

const saveEquipment = async () => {
  const formData = imageFile.value ? new FormData() : undefined
  if (formData && imageFile.value) {
    formData.append('image', imageFile.value)
  }

  if (isEditing.value) {
    await equipmentStore.updateEquipment(editedEquipment.id, editedEquipment, formData)
  } else {
    await equipmentStore.storeEquipment(editedEquipment, formData)
  }
  closeDialog()
  loadEquipments(currentPage.value)
}

const viewEquipment = (id: number) => {
  router.push(`/admin/equipment/${id}`)
}

const confirmDelete = (equipment: any) => {
  itemToDelete.value = equipment
  deleteDialog.value = true
}

const deleteEquipment = async () => {
  if (itemToDelete.value) {
    await equipmentStore.deleteEquipment(itemToDelete.value.id)
    deleteDialog.value = false
    loadEquipments(currentPage.value)
  }
}

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadEquipments(1)
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadEquipments(1)
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
  loadEquipments(1)
}

// Lifecycle
onMounted(() => {
  loadEquipments()
})
</script>

<style scoped>
.equipment-admin {
  padding: 20px;
}

.text-truncate {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style> 