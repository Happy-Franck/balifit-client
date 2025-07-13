<template>
  <div class="category-admin">
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Gestion des Muscles</h1>
      <v-btn color="primary" size="large" @click="openCreateDialog">
        <v-icon start>mdi-plus</v-icon>
        Nouveau Muscle
      </v-btn>
    </div>

    <!-- Barre de recherche -->
    <v-row align="center">
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          label="Rechercher un muscle..."
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
          {{ filteredCategories.length }} résultat(s) trouvé(s) pour "{{ searchQuery }}"
        </span>
        <span v-else>
          {{ categoryStore.categories.length }} muscle(s) au total
        </span>
      </div>
    </div>

    <!-- Loading bar -->
    <v-progress-linear
      v-if="categoryStore.loading"
      indeterminate
      color="primary"
      class="mb-4"
    ></v-progress-linear>

    <!-- Alert messages -->
    <v-alert
      v-if="categoryStore.alert"
      :text="categoryStore.message"
      color="success"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="categoryStore.alert = false"
    ></v-alert>

    <v-row>
      <!-- Liste des catégories -->
      <v-col cols="12" md="7">
        <v-card elevation="3">
          <v-card-title class="text-h6 pa-4 bg-primary text-white">
            <v-icon start>mdi-muscle</v-icon>
            Liste des Muscles
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
                <th class="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="item in filteredCategories" 
                :key="item.id"
                :class="{ 'v-data-table__tr--active': selectedCategory?.id === item.id }"
                @click="selectCategory(item)"
                style="cursor: pointer;"
              >
                <td>{{ item.id }}</td>
                <td>
                  <v-img
                    v-if="item.image"
                    :src="`http://127.0.0.1:8000/storage/categories/${item.image}`"
                    :alt="item.name"
                    width="50"
                    height="50"
                    cover
                    class="table-muscle-image"
                  ></v-img>
                </td>
                <td>{{ item.name }}</td>
                <td>
                  <v-btn
                    icon="mdi-eye"
                    size="small"
                    color="info"
                    variant="text"
                    @click.stop="selectCategory(item)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    color="warning"
                    variant="text"
                    @click.stop="editCategory(item.id)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    color="error"
                    variant="text"
                    @click.stop="confirmDelete(item)"
                  ></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <!-- Colonne trainings inspirée de Equipment/Show.vue -->
      <v-col cols="12" md="5">
        <div v-if="selectedCategory" class="suggestions-column">
          <!-- Image et nom du muscle -->
          <div class="muscle-header">
            <div class="muscle-info">
              <h1 class="title">Muscle sélectionné</h1>
              <h2 class="muscle-name">{{ selectedCategory.name }}</h2>
            </div>
            <v-img
              v-if="selectedCategory.image"
              :src="`http://127.0.0.1:8000/storage/categories/${selectedCategory.image}`"
              :alt="selectedCategory.name"
              width="100%"
              height="350px"
              cover
              class="muscle-image"
            ></v-img>
            <div v-else class="muscle-placeholder">
              <v-icon size="" color="grey">mdi-muscle</v-icon>
            </div>
          </div>
          
          <v-divider class="my-4"></v-divider>
          
          <h3 class="suggestions-title">Exercices utilisant {{ selectedCategory.name }}</h3>
          <div class="suggestions-list">
            <div
              v-for="training in selectedCategory.trainings"
              :key="training.id"
              class="suggestion-item"
              @click="viewTraining(training.id)"
              @mouseenter="playVideo(training.id)"
              @mouseleave="pauseVideo(training.id)"
            >
              <!-- Thumbnail exercice -->
              <div class="suggestion-thumbnail">
                <v-img
                  v-if="training.image"
                  :src="`http://127.0.0.1:8000/storage/trainings/${training.image}`"
                  :alt="training.name"
                  height="94"
                  cover
                  class="suggestion-image"
                ></v-img>
                <div v-else class="suggestion-placeholder">
                  <v-icon size="32" color="grey-lighten-1">mdi-dumbbell</v-icon>
                </div>
                
                <!-- Vidéo qui apparaît au hover -->
                <video
                  v-if="training.video"
                  :id="`video-${training.id}`"
                  :src="`http://127.0.0.1:8000/storage/training_videos/${training.video}`"
                  class="suggestion-video"
                  muted
                  loop
                  preload="metadata"
                >
                </video>
                
                <!-- Play overlay pour les exercices -->
                <div v-if="training.video" class="play-overlay">
                  <v-icon size="20" color="white">mdi-play</v-icon>
                </div>
                <div v-else class="play-overlay">
                  <v-icon size="20" color="white">mdi-eye</v-icon>
                </div>
              </div>

              <!-- Infos exercice -->
              <div class="suggestion-info">
                <h4 class="suggestion-title">{{ training.name }}</h4>
                <p class="suggestion-description">
                  {{ truncateText(training.description, 60) }}
                </p>
                <div class="suggestion-meta">
                  <span v-if="training.categories && training.categories.length > 0" class="suggestion-categories">
                    {{ training.categories.slice(0, 2).map(c => c.name).join(', ') }}
                    <span v-if="training.categories.length > 2">...</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Message si pas d'exercices -->
          <div v-if="!selectedCategory.trainings || selectedCategory.trainings.length === 0" class="no-suggestions">
            <v-icon size="32" color="grey-lighten-1">mdi-dumbbell-off</v-icon>
            <p class="no-suggestions-text">Aucun exercice n'utilise {{ selectedCategory.name }}</p>
          </div>
        </div>

        <!-- État par défaut -->
        <v-card v-else elevation="3" class="text-center pa-8">
          <v-icon size="100" color="grey-lighten-2">mdi-muscle</v-icon>
          <v-card-title class="text-h6 mt-4">Sélectionnez un muscle</v-card-title>
          <v-card-text class="text-grey">
            Cliquez sur une ligne pour voir les exercices utilisant ce muscle
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4 bg-primary text-white">
          <v-icon start>{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Modifier le Muscle' : 'Nouveau Muscle' }}
        </v-card-title>

        <v-form ref="form" v-model="valid" @submit.prevent="saveCategory">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="name"
                  label="Nom du muscle"
                  :rules="[rules.required]"
                  variant="outlined"
                  prepend-inner-icon="mdi-muscle"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-file-input
                  v-model="image"
                  @change="uploadImage"
                  label="Image du muscle"
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
          Êtes-vous sûr de vouloir supprimer le muscle 
          <strong>{{ itemToDelete?.name }}</strong> ?
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Annuler
          </v-btn>
          <v-btn color="error" variant="elevated" @click="removeCategory(itemToDelete?.id)">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, reactive, toRefs, ref, computed, onMounted } from 'vue'
import { useCategoryStore } from '../../../store/AdminStore/CategoryStore'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const categoryStore = useCategoryStore()
    const router = useRouter()

    const state = reactive({
      name: '',
      image: null as File | null,
      sary: null as null | any,
      id: null as number | null
    })

    // New reactive data for dialog management
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const valid = ref(false)
    const isEditing = ref(false)
    const itemToDelete = ref(null)

    // Search and sort
    const searchQuery = ref('')
    const sortBy = ref('id')
    const sortOrder = ref('asc')
    const filteredCategories = computed(() => {
      let filtered = categoryStore.categories.filter(item =>
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
      
      if (sortBy.value) {
        filtered = filtered.sort((a: any, b: any) => {
          const aValue = a[sortBy.value as keyof typeof a]
          const bValue = b[sortBy.value as keyof typeof b]
          if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
          if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
          return 0
        })
      }
      
      return filtered
    })

    // Table headers
    const headers = [
      { title: 'ID', key: 'id', width: '80px' },
      { title: 'Image', key: 'image', width: '100px', sortable: false },
      { title: 'Nom', key: 'name', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false, width: '150px' }
    ]

    // Validation rules
    const rules = {
      required: (value: any) => !!value || 'Ce champ est requis'
    }

    watch(() => categoryStore.loading, (val) => {
      if (!val) return;
      setTimeout(() => {
        categoryStore.loading = false;
      }, 3000);
    });

    watch(
      [() => categoryStore.message, () => categoryStore.alert],
      ([newMessage, newAlert]) => {
        if (newMessage !== '' && newAlert) {
          categoryStore.getCategories()
          if (categoryStore.currentCategory) {
            selectCategory({ id: categoryStore.currentCategory.id })
          }
          setTimeout(() => {
            categoryStore.message = '';
            categoryStore.alert = false;
          }, 5000);
        }
      }
    );

    const removeCategory = (id: number) => {
      categoryStore.deleteCategory(id)
      categoryStore.loading = true;
      deleteDialog.value = false;
    };

    const editCategory = (id: number) => {
      isEditing.value = true
      const category = categoryStore.categories.find((c) => c.id === id);
      if (category) {
        state.id = category.id;
        state.name = category.name;
        state.image = null;
        state.sary = null;
      }
      dialog.value = true
    };

    const openCreateDialog = () => {
      isEditing.value = false
      state.name = ''
      state.image = null
      state.sary = null
      state.id = null
      dialog.value = true
    };

    const closeDialog = () => {
      dialog.value = false
      state.name = ''
      state.image = null
      state.sary = null
      state.id = null
    };

    const confirmDelete = (category: any) => {
      itemToDelete.value = category
      deleteDialog.value = true
    };

    const uploadImage = (e: any) => {
      state.sary = e.target.files[0]
    }

    const saveCategory = () => {
      if (isEditing.value) {
        updateCategory(state.id!)
      } else {
        storeCategory()
      }
    };

    const storeCategory = () => {
      categoryStore.loading = true;
      const formData = new FormData();
      if (state.image) {
        formData.append('image', state.sary);
      }
      categoryStore.storeCategory(
        {
          name: state.name,
        },
        formData
      )
      closeDialog()
    };

    const updateCategory = (id: number) => {
      categoryStore.loading = true;
      const formData = new FormData();
      if (state.sary) {
        formData.append('image', state.sary);
      }
      categoryStore.updateCategory(id,
        {
          name: state.name,
        },
        formData
      )
      closeDialog()
    }

    const onSearchInput = () => {
      // Implementation of onSearchInput
    }

    const clearSearch = () => {
      searchQuery.value = ''
      // Implementation of clearSearch
    }

    const setSortBy = (key: string) => {
      if (sortBy.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = key
        sortOrder.value = 'asc'
      }
    }

    const selectedCategory = ref(null)

    const selectCategory = async (category: any) => {
      // Appeler l'API pour récupérer la catégorie avec ses relations
      await categoryStore.showCategory(category.id)
      // Utiliser la catégorie du store qui contient les relations
      selectedCategory.value = categoryStore.currentCategory
    }

    const viewTraining = (trainingId: number) => {
      router.push(`/admin/training/${trainingId}`)
    }

    const truncateText = (text: string, maxLength: number) => {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
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

    // Lifecycle - Point 5: Sélectionner automatiquement le premier élément
    onMounted(async () => {
      await categoryStore.getCategories()
      if (categoryStore.categories.length > 0) {
        // Utiliser la même logique que selectCategory
        await selectCategory(categoryStore.categories[0])
      }
    })

    return { 
      ...toRefs(state), 
      categoryStore, 
      uploadImage, 
      removeCategory, 
      editCategory,
      openCreateDialog,
      closeDialog,
      confirmDelete,
      saveCategory,
      // New reactive data
      dialog,
      deleteDialog,
      valid,
      isEditing,
      itemToDelete,
      headers,
      rules,
      searchQuery,
      filteredCategories,
      onSearchInput,
      clearSearch,
      sortBy,
      sortOrder,
      setSortBy,
      selectedCategory,
      selectCategory,
      viewTraining,
      truncateText,
      playVideo,
      pauseVideo
    }
  },
})
</script>

<style scoped>
.category-admin {
  padding: 20px;
}

/* Colonne suggestions - Scrollable */
.suggestions-column {
  background: rgb(var(--v-theme-surface));
  padding: 16px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  border-left: 1px solid rgb(var(--v-theme-outline-variant));
}

.suggestions-column::-webkit-scrollbar {
  width: 8px;
}

.suggestions-column::-webkit-scrollbar-track {
  background: rgb(var(--v-theme-surface-variant));
}

.suggestions-column::-webkit-scrollbar-thumb {
  background: rgb(var(--v-theme-outline));
  border-radius: 4px;
}

.suggestions-column::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--v-theme-primary));
}

/* Header du muscle */
.muscle-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.muscle-image {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
}

.muscle-placeholder {
  width: 100%;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-surface-variant));
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
}

.muscle-info {
  text-align: center;
}

.muscle-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: rgb(var(--v-theme-primary));
  text-transform: capitalize;
}

.muscle-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
  font-weight: 500;
}

/* Style pour l'image dans le tableau */
.table-muscle-image {
  border-radius: 4px;
}

.suggestions-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: rgb(var(--v-theme-on-surface));
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Item exercice */
.suggestion-item {
  display: flex;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background: rgb(var(--v-theme-surface-variant));
}

.suggestion-item:hover .suggestion-image {
  opacity: 0;
}

.suggestion-item:hover .suggestion-video {
  opacity: 1;
}

.suggestion-thumbnail {
  position: relative;
  width: 168px;
  height: 94px;
  flex-shrink: 0;
  background: #000;
  overflow: hidden;
  border-radius: 8px;
}

.suggestion-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.suggestion-video {
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

.suggestion-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.play-overlay {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0,0,0,0.8);
  padding: 2px 4px;
  font-size: 0.75rem;
}

.suggestion-info {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.3;
  margin: 0 0 4px 0;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.suggestion-description {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.4;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.suggestion-meta {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.suggestion-categories {
  font-size: 0.75rem;
}

/* No suggestions */
.no-suggestions {
  text-align: center;
  padding: 32px 16px;
}

.no-suggestions-text {
  margin-top: 8px;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Active row styling */
.v-data-table__tr--active {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .category-admin {
    padding: 8px;
  }
  
  .suggestion-thumbnail {
    width: 120px;
    height: 68px;
  }
  
  .suggestions-column {
    padding: 12px;
  }
}
</style>
