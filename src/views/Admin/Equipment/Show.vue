<template>
  <v-container class="equipment-show-youtube">
    <!-- Breadcrumbs -->
    

    <!-- Loading state -->
    <div v-if="equipmentStore.loading" class="loading-container">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p class="loading-text mt-4">Chargement...</p>
    </div>

    <!-- Equipment Content - 2 colonnes comme YouTube -->
    <div v-if="equipment && !equipmentStore.loading" class="youtube-layout">
      <!-- Colonne principale (image + infos) -->
      <div class="main-column">
        <!-- Image -->
        <div class="video-container">
          <div v-if="equipment.image" class="image-container">
            <v-img
              :src="`${APP_CONFIG.STORAGE_BASE_URL}/equipments/${equipment.image}`"
              :alt="equipment.name"
              class="youtube-image"
              cover
            ></v-img>
          </div>
          <div v-else class="no-media">
            <v-icon size="80" color="grey-lighten-2">mdi-weight-lifter</v-icon>
            <p class="no-media-text">Aucune image disponible</p>
          </div>
        </div>

        <!-- Titre -->
        <h1 class="video-title">{{ equipment.name }}</h1>

        <!-- Métadonnées et actions -->
        <div class="video-meta">
          <div class="meta-left">
            <span class="meta-text">ID: #{{ equipment.id }}</span>
            <span class="meta-divider">•</span>
            <span class="meta-text">{{ formatDate(equipment.created_at) }}</span>
          </div>
          <div class="meta-actions">
            <v-btn
              variant="outlined"
              size="small"
              @click="editEquipment"
              class="action-btn"
            >
              <v-icon start size="16">mdi-pencil</v-icon>
              Modifier
            </v-btn>
            <v-btn
              variant="outlined"
              color="error"
              size="small"
              @click="confirmDelete"
              class="action-btn ml-2"
            >
              <v-icon start size="16">mdi-delete</v-icon>
              Supprimer
            </v-btn>
          </div>
        </div>

        <!-- Description avec expand/collapse -->
        <div class="description-section mx-2">
          <v-card class="custom-card">
            <v-card-text>
              <div class="description-content" :class="{ expanded: descriptionExpanded }">
                <p class="description-text">
                  {{ descriptionExpanded ? (equipment.description || 'Aucune description disponible') : truncateText(equipment.description || 'Aucune description disponible', 150) }}
                </p>
              </div>
              <v-btn
                v-if="(equipment.description || '').length > 150"
                variant="text"
                size="small"
                @click="descriptionExpanded = !descriptionExpanded"
                class="expand-btn"
              >
                {{ descriptionExpanded ? 'Afficher moins' : 'Afficher plus' }}
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
      </div>

      <!-- Colonne exercices -->
      <div class="suggestions-column">
        <h3 class="suggestions-title">Exercices utilisant l'équipement {{ equipment.name }}</h3>
        <div class="suggestions-list">
          <div
            v-for="training in equipment.trainings"
            :key="training.id"
            class="suggestion-item"
            @click="viewTraining(training.id)"
            @mouseenter="playVideo(training.id)"
            @mouseleave="pauseVideo(training.id)"
          >
            <!-- Thumbnail exercice -->
            <div class="suggestion-thumbnail">
              <!-- Image par défaut -->
              <v-img
                v-if="training.image"
                :src="`${APP_CONFIG.STORAGE_BASE_URL}/trainings/${training.image}`"
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
                :src="`${APP_CONFIG.STORAGE_BASE_URL}/training_videos/${training.video}`"
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
        <div v-if="!equipment.trainings || equipment.trainings.length === 0" class="no-suggestions">
          <v-icon size="32" color="grey-lighten-1">mdi-dumbbell-off</v-icon>
          <p class="no-suggestions-text">Aucun exercice n'utilise cet équipement</p>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-if="!equipment && !equipmentStore.loading" class="empty-state">
      <v-icon size="80" color="grey-lighten-1">mdi-weight-lifter-off</v-icon>
      <h3 class="empty-title">Équipement introuvable</h3>
      <p class="empty-subtitle">Cet équipement n'existe pas ou a été supprimé.</p>
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
          <p>Êtes-vous sûr de vouloir supprimer l'équipement <strong>{{ equipment?.name }}</strong> ?</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Cette action est irréversible.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Annuler</v-btn>
          <v-btn color="error" variant="flat" @click="deleteEquipment">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEquipmentStore } from '../../../store/AdminStore/EquipmentStore'
import { APP_CONFIG } from '../../../config/constants'

const route = useRoute()
const router = useRouter()
const equipmentStore = useEquipmentStore()

// Reactive data
const deleteDialog = ref(false)
const descriptionExpanded = ref(false)

// Computed
const equipment = computed(() => equipmentStore.currentEquipment)

const breadcrumbItems = computed(() => [
  {
    title: 'Accueil',
    href: '/admin/dashboard',
    icon: 'mdi-home'
  },
  {
    title: 'Équipements',
    href: '/admin/equipment',
    icon: 'mdi-weight-lifter'
  },
  {
    title: equipment.value?.name || 'Détail',
    disabled: true,
    icon: 'mdi-eye'
  }
])

// Methods
const loadEquipment = async () => {
  const id = Number(route.params.id)
  if (id) {
    // Réinitialiser l'état de description lors du changement d'équipement
    descriptionExpanded.value = false
    await equipmentStore.showEquipment(id)
    // Faire défiler vers le haut lors du changement d'équipement
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goBack = () => {
  router.push('/admin/equipment')
}

const editEquipment = () => {
  router.push(`/admin/equipment/${equipment.value?.id}/edit`)
}

const viewTraining = (id: number) => {
  router.push(`/admin/training/${id}`)
}

const confirmDelete = () => {
  deleteDialog.value = true
}

const deleteEquipment = async () => {
  if (equipment.value) {
    await equipmentStore.deleteEquipment(equipment.value.id)
    deleteDialog.value = false
    router.push('/admin/equipment')
  }
}

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

// Lifecycle
onMounted(() => {
  loadEquipment()
})
</script>

<style scoped>
.equipment-show-youtube {
  max-width: 1280px;
  padding: 16px;
}

/* Breadcrumbs */
.youtube-breadcrumbs {
  font-size: 0.875rem;
  color: #606060;
}

.breadcrumb-item {
  font-size: 0.875rem;
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

/* Layout YouTube - 2 colonnes */
.youtube-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  align-items: start;
}

/* Colonne principale - Sticky */
.main-column {
  min-width: 0; /* Pour permettre le text-overflow */
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

/* Image */
.video-container {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  margin-bottom: 12px;
}

.youtube-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-container {
  width: 100%;
  height: 100%;
}

.no-media {
  width: 100%;
  height: 100%;
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

/* Titre */
.video-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 8px 0;
  color: #0f0f0f;
}

/* Métadonnées */
.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e5e5;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-text {
  font-size: 0.875rem;
  color: #606060;
}

.meta-divider {
  color: #606060;
  margin: 0 4px;
}

.meta-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  text-transform: none;
  font-size: 0.875rem;
}

/* Description */
.description-section {
  margin-bottom: 16px;
}

.description-content {
  transition: all 0.3s ease;
}

.description-text {
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
  color: rgb(var(--v-theme-on-surface));
  white-space: pre-wrap;
}

.expand-btn {
  text-transform: none;
  font-size: 0.875rem;
  padding: 8px 12px;
  margin-top: 8px;
  min-width: auto;
  height: auto;
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
}

/* Colonne exercices - Scrollable */
.suggestions-column {
  background: rgb(var(--v-theme-surface));
  padding: 16px;
  max-height: calc(100vh - 48px);
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

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 24px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f0f0f;
  margin: 16px 0 8px 0;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #606060;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .youtube-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .suggestions-column {
    order: 2;
  }
  
  .main-column {
    order: 1;
  }
}

@media (max-width: 768px) {
  .equipment-show-youtube {
    padding: 8px;
  }
  
  .video-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .meta-actions {
    width: 100%;
    justify-content: flex-end;
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