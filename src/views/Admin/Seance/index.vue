<template>
  <div class="seance-admin">
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Gestion des Séances</h1>
      <v-btn color="primary" size="large" @click="openCreateDialog">
        <v-icon start>mdi-plus</v-icon>
        Nouvelle Séance
      </v-btn>
    </div>

    <!-- Barre de recherche -->
    <v-row align="center">
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          label="Rechercher une séance..."
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
          {{ seanceStore.pagination.total }} résultat(s) trouvé(s) pour "{{ searchQuery }}"
        </span>
        <span v-else>
          {{ seanceStore.pagination.total }} séance(s) au total
        </span>
      </div>
      <div class="text-body-2 text-grey-darken-1">
        Page {{ seanceStore.pagination.current_page }} sur {{ seanceStore.pagination.last_page }}
      </div>
    </div>

    <!-- Loading bar -->
    <!-- <v-progress-linear
      v-if="seanceStore.loading"
      indeterminate
      color="primary"
      class="mb-4"
    ></v-progress-linear> -->

    <!-- Alert messages -->
    <v-alert
      v-if="seanceStore.alert"
      :text="seanceStore.message"
      color="success"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="seanceStore.alert = false"
    ></v-alert>

    <!-- Data table -->
    <v-card elevation="3">
      <v-card-title class="text-h6 pa-4 bg-primary text-white">
        <v-icon start>mdi-calendar-clock</v-icon>
        Liste des Séances
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
                @click="setSortBy('challenger_id')"
                class="pa-0"
              >
                Challenger
                <v-icon v-if="sortBy === 'challenger_id'" size="small" class="ml-1">
                  {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </v-btn>
            </th>
            <th class="text-left">
              <v-btn 
                variant="text" 
                size="small" 
                @click="setSortBy('coach_id')"
                class="pa-0"
              >
                Coach
                <v-icon v-if="sortBy === 'coach_id'" size="small" class="ml-1">
                  {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </v-btn>
            </th>
            <th class="text-left">
              <v-btn 
                variant="text" 
                size="small" 
                @click="setSortBy('admin_id')"
                class="pa-0"
              >
                Admin
                <v-icon v-if="sortBy === 'admin_id'" size="small" class="ml-1">
                  {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </v-btn>
            </th>
            <th class="text-left">
              <v-btn 
                variant="text" 
                size="small" 
                @click="setSortBy('created_at')"
                class="pa-0"
              >
                Date
                <v-icon v-if="sortBy === 'created_at'" size="small" class="ml-1">
                  {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </v-btn>
            </th>
            <th class="text-left">
              <v-btn 
                variant="text" 
                size="small" 
                @click="setSortBy('trainings_count')"
                class="pa-0"
              >
                Exercices
                <v-icon v-if="sortBy === 'trainings_count'" size="small" class="ml-1">
                  {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </v-btn>
            </th>
            <th class="text-left">
              <v-btn 
                variant="text" 
                size="small" 
                @click="setSortBy('validated')"
                class="pa-0"
              >
                Statut
                <v-icon v-if="sortBy === 'validated'" size="small" class="ml-1">
                  {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </v-btn>
            </th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in seanceStore.seances" 
            :key="item.id"
            :class="{ 'row-locked': item.validated !== null }"
          >
            <td>
              <div class="d-flex align-center">
                <span class="font-weight-medium">{{ item.id }}</span>
                <!-- <v-chip
                  v-if="item.validated === null"
                  color="success"
                  size="x-small"
                  variant="flat"
                  class="ml-2"
                >
                  <v-icon start size="10">mdi-pencil</v-icon>
                  Modifiable
                </v-chip> -->
              </div>
            </td>
            
            <!-- Challenger -->
            <td>
              <div v-if="item.challenger" class="d-flex align-center">
                <v-avatar size="32" class="mr-3">
                  <v-img 
                    v-if="item.challenger.avatar" 
                    :src="`http://localhost:8000/storage/avatars/${item.challenger.avatar}`"
                  ></v-img>
                  <v-icon v-else size="18" color="info">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.challenger.name }}</div>
                </div>
              </div>
              <span v-else class="text-grey">Non assigné</span>
            </td>
            
            <!-- Coach -->
            <td>
              <div v-if="item.coach" class="d-flex align-center">
                <v-avatar size="32" class="mr-3">
                  <v-img 
                    v-if="item.coach.avatar" 
                    :src="`http://localhost:8000/storage/avatars/${item.coach.avatar}`"
                  ></v-img>
                  <v-icon v-else size="18" color="success">mdi-account-tie</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.coach.name }}</div>
                </div>
              </div>
              <span v-else class="text-grey">Non assigné</span>
            </td>
            
            <!-- Admin -->
            <td>
              <div v-if="item.admin" class="d-flex align-center">
                <v-avatar size="32" class="mr-3">
                  <v-img 
                    v-if="item.admin.avatar" 
                    :src="`http://localhost:8000/storage/avatars/${item.admin.avatar}`"
                  ></v-img>
                  <v-icon v-else size="18" color="primary">mdi-shield-account</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.admin.name }}</div>
                </div>
              </div>
              <span v-else class="text-grey">-</span>
            </td>
            
            <!-- Date -->
            <td>
              <div class="font-weight-medium">{{ formatDate(item.created_at) }} {{ formatTime(item.created_at) }}</div>
            </td>
            
            <!-- Nombre d'exercices -->
            <td>
              <v-chip
                color="secondary"
                size="small"
                variant="tonal"
              >
                <v-icon start size="14">mdi-dumbbell</v-icon>
                {{ item.trainings_count || 0 }} exercice{{ (item.trainings_count || 0) > 1 ? 's' : '' }}
              </v-chip>
            </td>
            
            <!-- Statut -->
            <td>
              <v-chip 
                :color="getStatusColor(item.validated)" 
                size="small" 
                variant="flat"
              >
                <v-icon start size="14">{{ getStatusIcon(item.validated) }}</v-icon>
                {{ formatValidatedStatus(item.validated) }}
              </v-chip>
            </td>
            
            <!-- Actions -->
            <td>
              <v-btn
                icon="mdi-eye"
                size="small"
                color="info"
                variant="text"
                @click="viewSeance(item.id)"
              ></v-btn>
              <v-btn
                v-if="item.validated === null"
                icon="mdi-pencil"
                size="small"
                color="warning"
                variant="text"
                @click="editSeance(item)"
              ></v-btn>
              <v-btn
                v-if="item.validated === null"
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="confirmDelete(item)"
              ></v-btn>
              <v-tooltip
                v-if="item.validated !== null"
                text="Séance en cours de traitement - Modification impossible"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-lock"
                    size="small"
                    color="grey"
                    variant="text"
                    disabled
                  ></v-btn>
                </template>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Loading overlay -->
      <v-overlay v-if="seanceStore.loading" contained class="d-flex align-center justify-center">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>

      <!-- Pagination -->
      <v-card-actions class="justify-center">
        <v-pagination
          v-model="currentPage"
          :length="seanceStore.pagination.last_page"
          :total-visible="7"
          @update:modelValue="loadSeances"
        ></v-pagination>
      </v-card-actions>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4 bg-primary text-white">
          <v-icon start>{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Modifier la Séance' : 'Nouvelle Séance' }}
        </v-card-title>

        <v-form ref="form" v-model="valid" @submit.prevent="saveSeance">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="editedSeance.coach_id"
                  :items="coachOptions"
                  item-title="name"
                  item-value="id"
                  label="Coach assigné"
                  :rules="[rules.required]"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-tie"
                  clearable
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="editedSeance.challenger_id"
                  :items="challengerOptions"
                  item-title="name"
                  item-value="id"
                  label="Challenger"
                  :rules="[rules.required]"
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  clearable
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
          <p>Êtes-vous sûr de vouloir supprimer la séance 
          <strong>#{{ itemToDelete?.id }}</strong> ?</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Cette action est irréversible.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Annuler
          </v-btn>
          <v-btn color="error" variant="elevated" @click="deleteSeance">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useSeanceStore } from '../../../store/AdminStore/SeanceStore'
import { useUserStore } from '../../../store/AdminStore/UserStore'
import { useRouter } from 'vue-router'

const seanceStore = useSeanceStore()
const userStore = useUserStore()
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
const sortOrder = ref('desc')
let searchTimeout: number | null = null

const editedSeance = reactive({
  id: null,
  coach_id: null,
  challenger_id: null,
  validated: null
})

const defaultSeance = {
  id: null,
  coach_id: null,
  challenger_id: null,
  validated: null
}

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Ce champ est requis',
  positive: (value: number) => value > 0 || 'La valeur doit être positive'
}

// Computed
const coachOptions = computed(() => {
  return userStore.users?.filter(user => 
    user.roles?.some(role => role.name === 'coach')
  ) || []
})

const challengerOptions = computed(() => {
  return userStore.users?.filter(user => 
    user.roles?.some(role => role.name === 'challenger')
  ) || []
})

// Methods
const loadSeances = (page = 1) => {
  currentPage.value = page
  seanceStore.getSeances(page, searchQuery.value, sortBy.value, sortOrder.value)
}

const openCreateDialog = () => {
  isEditing.value = false
  Object.assign(editedSeance, defaultSeance)
  dialog.value = true
}

const editSeance = (seance: any) => {
  isEditing.value = true
  Object.assign(editedSeance, {
    id: seance.id,
    coach_id: seance.coach_id,
    challenger_id: seance.challenger_id,
    validated: seance.validated
  })
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  Object.assign(editedSeance, defaultSeance)
}

const saveSeance = async () => {
  try {
    const seanceData = { ...editedSeance }
    
    if (isEditing.value) {
      await seanceStore.updateSeance(editedSeance.id, seanceData)
    } else {
      await seanceStore.storeSeance(seanceData)
    }
    
    closeDialog()
    loadSeances(currentPage.value)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

const viewSeance = (id: number) => {
  router.push(`/admin/seance/${id}`)
}

const confirmDelete = (seance: any) => {
  itemToDelete.value = seance
  deleteDialog.value = true
}

const deleteSeance = async () => {
  if (itemToDelete.value) {
    try {
      await seanceStore.destroySeance(itemToDelete.value.id)
      deleteDialog.value = false
      loadSeances(currentPage.value)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadSeances(1)
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadSeances(1)
}

const setSortBy = (newSortBy: string) => {
  if (sortBy.value === newSortBy) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = newSortBy
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
  loadSeances(1)
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Non définie'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  if (!dateString) return 'Non définie'
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatValidatedStatus = (validated: boolean | null) => {
  if (validated == true) return 'Validée'
  if (validated == false) return 'À corriger'
  if (validated == null) return 'Assignée'
  return 'Non défini'
}

const getStatusColor = (validated: boolean | null) => {
  if (validated == true) return 'success'
  if (validated == false) return 'error'
  if (validated == null) return 'info'
  return 'grey'
}

const getStatusIcon = (validated: boolean | null) => {
  if (validated == true) return 'mdi-check-circle'
  if (validated == false) return 'mdi-alert-circle'
  if (validated == null) return 'mdi-account-group'
  return 'mdi-help-circle'
}

// Lifecycle
onMounted(() => {
  loadSeances()
  userStore.getUsers() // Charger les utilisateurs pour les coaches
})
</script>

<style scoped>
.seance-admin {
  padding: 20px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-locked {
  background-color: rgba(0, 0, 0, 0.03);
  opacity: 0.8;
}

.row-locked td {
  color: rgba(0, 0, 0, 0.6) !important;
}
</style>
