<template>
  <v-container class="seance-show-youtube">
    <!-- Breadcrumbs -->
    <v-breadcrumbs 
      :items="breadcrumbItems" 
      class="youtube-breadcrumbs pa-0 mb-4"
      divider="/"
    >
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item
          :to="item.href"
          :disabled="item.disabled"
          class="breadcrumb-item"
        >
          <v-icon v-if="item.icon" :icon="item.icon" size="16" class="mr-1"></v-icon>
          {{ item.title }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <!-- Loading state -->
    <div v-if="seanceStore.loading" class="loading-container">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p class="loading-text mt-4">Chargement...</p>
    </div>

    <!-- Seance Content -->
    <div v-if="seance && !seanceStore.loading" class="seance-content">
      <!-- Titre -->
      <h1 class="video-title">Séance #{{ seance.id }}</h1>

      <!-- Métadonnées et actions -->
      <div class="video-meta">
        <div class="meta-left">
          <span class="meta-text">{{ formatDate(seance.created_at) }}</span>
          <span class="meta-divider">•</span>
          <span class="meta-text">{{ formatTime(seance.created_at) }}</span>
          <span class="meta-divider">•</span>
          <span class="meta-text">{{ trainings?.length || 0 }} exercice{{ (trainings?.length || 0) > 1 ? 's' : '' }}</span>
        </div>
        <div class="meta-actions">
          <v-chip 
            :color="getStatusColor(seance.validated)" 
            size="small" 
            variant="flat"
            class="status-chip"
          >
            <v-icon start size="14">{{ getStatusIcon(seance.validated) }}</v-icon>
            {{ formatValidatedStatus(seance.validated) }}
          </v-chip>
          <v-btn
            v-if="seance.validated === null"
            variant="outlined"
            size="small"
            @click="editSeance"
            class="action-btn ml-2"
          >
            <v-icon start size="16">mdi-pencil</v-icon>
            Modifier
          </v-btn>
          <v-btn
            v-if="seance.validated === null"
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

      <!-- Participants -->
      <div class="participants-section">
        <div class="participant">
          <v-avatar 
            size="40" 
            class="perfect-avatar"
            :image="challenger?.avatar ? `http://127.0.0.1:8000/storage/avatars/${challenger.avatar}` : ''"
          >
            <v-icon v-if="!challenger?.avatar">mdi-account</v-icon>
          </v-avatar>
          <div class="participant-info">
            <div class="participant-label">Challenger</div>
            <div class="participant-name">{{ challenger?.name || 'Non défini' }}</div>
            <div class="participant-email">{{ challenger?.email || 'Non défini' }}</div>
          </div>
        </div>
        <div v-if="coach" class="participant">
          <v-avatar 
            size="40" 
            class="perfect-avatar"
            :image="coach?.avatar ? `http://127.0.0.1:8000/storage/avatars/${coach.avatar}` : ''"
          >
            <v-icon v-if="!coach?.avatar">mdi-account-tie</v-icon>
          </v-avatar>
          <div class="participant-info">
            <div class="participant-label">Coaché par</div>
            <div class="participant-name">{{ coach?.name || 'Non défini' }}</div>
            <div class="participant-email">{{ coach?.email || 'Non défini' }}</div>
          </div>
        </div>
        <div v-else class="participant">
          <v-chip color="primary" variant="flat" size="small" class="solo-badge">
            <v-icon start size="16">mdi-account-solo</v-icon>
            Solo
          </v-chip>
        </div>
      </div>

      <!-- Muscles entraînés -->
      <div v-if="uniqueMuscles.length > 0" class="muscles-section">
        <h3 class="section-title">Muscles entraînés</h3>
        <div class="muscles-list">
          <v-chip
            v-for="muscle in uniqueMuscles"
            :key="muscle"
            color="primary"
            variant="outlined"
            size="small"
            class="muscle-badge"
          >
            <v-icon start size="16">mdi-arm-flex</v-icon>
            {{ muscle }}
          </v-chip>
        </div>
      </div>

      <!-- Images Before/After -->
      <div v-if="seance.img_debut || seance.img_fin" class="images-section">
        <h3 class="section-title">Photos de la séance</h3>
        <div class="images-grid">
          <div class="image-item">
            <div class="image-label">
              <v-icon size="16" class="mr-1">mdi-camera-outline</v-icon>
              Avant
            </div>
            <div v-if="seance.img_debut" class="image-container">
              <v-img
                :src="`http://127.0.0.1:8000/storage/seance/${challenger?.id}/${seance.img_debut}`"
                :alt="'Image avant séance'"
                class="seance-image"
                cover
              ></v-img>
            </div>
            <div v-else class="no-image">
              <v-icon size="32" color="grey-lighten-2">mdi-camera-off</v-icon>
              <p class="no-image-text">Aucune image</p>
            </div>
          </div>
          <div class="image-item">
            <div class="image-label">
              <v-icon size="16" class="mr-1">mdi-camera-check</v-icon>
              Après
            </div>
            <div v-if="seance.img_fin" class="image-container">
              <v-img
                :src="`http://127.0.0.1:8000/storage/seance/${challenger?.id}/${seance.img_fin}`"
                :alt="'Image après séance'"
                class="seance-image"
                cover
              ></v-img>
            </div>
            <div v-else class="no-image">
              <v-icon size="32" color="grey-lighten-2">mdi-camera-off</v-icon>
              <p class="no-image-text">Aucune image</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Exercices -->
      <div v-if="trainings && trainings.length > 0" class="exercises-section">
        <h3 class="section-title">Exercices de la séance</h3>
        <div class="exercises-table">
          <div class="table-header">
            <div class="col-exercise">Exercice</div>
            <div class="col-series">Séries</div>
            <div class="col-reps-duration">Rép./Durée</div>
            <div class="col-muscles">Muscles</div>
          </div>
          <div 
            v-for="training in trainings" 
            :key="training.id"
            class="table-row"
            @click="viewTraining(training.id)"
            @mouseenter="playVideo(training.id)"
            @mouseleave="pauseVideo(training.id)"
          >
            <div class="col-exercise">
              <div class="exercise-info">
                <div class="exercise-thumbnail">
                  <!-- Image par défaut -->
                  <v-img
                    v-if="training.image"
                    :src="`http://127.0.0.1:8000/storage/trainings/${training.image}`"
                    :alt="training.name"
                    height="60"
                    width="80"
                    cover
                    class="training-image"
                  ></v-img>
                  <div v-else class="training-placeholder">
                    <v-icon size="24" color="grey-lighten-1">mdi-dumbbell</v-icon>
                  </div>
                  
                  <!-- Vidéo qui apparaît au hover -->
                  <video
                    v-if="training.video"
                    :id="`video-${training.id}`"
                    :src="`http://127.0.0.1:8000/storage/training_videos/${training.video}`"
                    class="training-video"
                    muted
                    loop
                    preload="metadata"
                  >
                  </video>
                  
                  <!-- Play overlay pour les vidéos -->
                  <div v-if="training.video" class="play-overlay">
                    <v-icon size="16" color="white">mdi-play</v-icon>
                  </div>
                </div>
                <div class="exercise-details">
                  <div class="exercise-name">{{ training.name }}</div>
                  <div class="exercise-id">#{{ training.id }}</div>
                </div>
              </div>
            </div>
            <div class="col-series">
              <span class="value">{{ training.pivot.series || '-' }}</span>
            </div>
            <div class="col-reps-duration">
              <span v-if="training.pivot.repetitions && training.pivot.repetitions > 0" class="value">
                {{ training.pivot.repetitions }} rép.
              </span>
              <span v-else-if="training.pivot.duree && training.pivot.duree > 0" class="value">
                {{ training.pivot.duree }}s
              </span>
              <span v-else class="value">-</span>
            </div>
            <div class="col-muscles">
              <div class="muscles-badges">
                <v-chip
                  v-for="category in training.categories?.slice(0, 2)"
                  :key="category.id"
                  size="x-small"
                  color="primary"
                  variant="flat"
                  class="muscle-chip"
                >
                  {{ category.name }}
                </v-chip>
                <span v-if="training.categories?.length > 2" class="more-muscles">
                  +{{ training.categories.length - 2 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si pas d'exercices -->
      <div v-if="!trainings || trainings.length === 0" class="no-exercises">
        <v-icon size="40" color="grey-lighten-1">mdi-dumbbell-off</v-icon>
        <p class="no-exercises-text">Aucun exercice dans cette séance</p>
      </div>
    </div>

    <!-- État vide -->
    <div v-if="!seance && !seanceStore.loading" class="empty-state">
      <v-icon size="80" color="grey-lighten-1">mdi-calendar-remove</v-icon>
      <h3 class="empty-title">Séance introuvable</h3>
      <p class="empty-subtitle">Cette séance n'existe pas ou a été supprimée.</p>
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
          <p>Êtes-vous sûr de vouloir supprimer la séance <strong>#{{ seance?.id }}</strong> ?</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Cette action est irréversible.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Annuler</v-btn>
          <v-btn color="error" variant="flat" @click="deleteSeance">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeanceStore } from '../../../store/AdminStore/SeanceStore'

const route = useRoute()
const router = useRouter()
const seanceStore = useSeanceStore()

// Reactive data
const deleteDialog = ref(false)

// Computed
const seance = computed(() => seanceStore.currentSeance)
const coach = computed(() => seanceStore.currentSeanceCoach)
const challenger = computed(() => seanceStore.currentSeanceChallenger)
const trainings = computed(() => seanceStore.currentSeanceTrainings)

// Calcul des muscles uniques entraînés dans la séance
const uniqueMuscles = computed(() => {
  if (!trainings.value || trainings.value.length === 0) return []
  
  const muscles = new Set<string>()
  trainings.value.forEach(training => {
    if (training.categories && training.categories.length > 0) {
      training.categories.forEach(category => {
        muscles.add(category.name)
      })
    }
  })
  
  return Array.from(muscles).sort()
})

const breadcrumbItems = computed(() => [
  {
    title: 'Accueil',
    href: '/admin/dashboard',
    icon: 'mdi-home'
  },
  {
    title: 'Séances',
    href: '/admin/seance',
    icon: 'mdi-calendar-clock'
  },
  {
    title: seance.value ? `Séance #${seance.value.id}` : 'Détail',
    disabled: true,
    icon: 'mdi-eye'
  }
])

// Methods
const loadSeance = async () => {
  const id = Number(route.params.id)
  if (id) {
    // Nettoyer d'abord les données précédentes
    seanceStore.currentSeance = null
    seanceStore.currentSeanceTrainings = []
    seanceStore.currentSeanceCoach = null
    seanceStore.currentSeanceChallenger = null
    seanceStore.currentSeanceAdmin = null
    
    await seanceStore.showSeance(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Watcher sur les paramètres de route pour recharger automatiquement
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId && newId) {
      loadSeance()
    }
  }
)

const goBack = () => {
  router.push('/admin/seance')
}

const editSeance = () => {
  router.push(`/admin/seance/${seance.value?.id}/edit`)
}

const viewTraining = (id: number) => {
  router.push(`/admin/training/${id}`)
}

const confirmDelete = () => {
  deleteDialog.value = true
}

const deleteSeance = async () => {
  if (seance.value) {
    await seanceStore.destroySeance(seance.value.id)
    deleteDialog.value = false
    router.push('/admin/seance')
  }
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
  if (!dateString) return 'Non défini'
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
  loadSeance()
})
</script>

<style scoped>
.seance-show-youtube {
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

/* Layout simple - une seule colonne */
.seance-content {
  max-width: 900px;
  margin: 0 auto;
}

/* Titre */
.video-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 8px 0;
  color: rgb(var(--v-theme-on-surface));
}

/* Métadonnées */
.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-text {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.meta-divider {
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0 4px;
}

.meta-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  text-transform: none;
  font-size: 0.875rem;
}

.status-chip {
  font-size: 0.75rem;
  height: 24px;
}

/* Participants */
.participants-section {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px;
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  align-items: center;
}

.participant {
  display: flex;
  align-items: center;
  gap: 12px;
}

.solo-badge {
  font-weight: 500;
}

.perfect-avatar {
  border-radius: 50% !important;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.participant-label {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  font-weight: 500;
}

.participant-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.participant-email {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Sections */
.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: rgb(var(--v-theme-on-surface));
}

/* Images */
.images-section {
  margin-bottom: 24px;
}

.images-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.image-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  display: flex;
  align-items: center;
}

.image-container {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.seance-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  border: 2px dashed rgb(var(--v-theme-outline));
}

.no-image-text {
  margin-top: 8px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.875rem;
}

/* Exercices */
.exercises-section {
  margin-bottom: 24px;
}

.exercises-table {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 80px 120px 1fr;
  gap: 16px;
  padding: 12px 16px;
  background: rgb(var(--v-theme-surface-variant));
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 80px 120px 1fr;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: rgb(var(--v-theme-surface-variant));
}

.table-row:hover .training-image {
  opacity: 0;
}

.table-row:hover .training-video {
  opacity: 1;
}

.col-exercise,
.col-series,
.col-reps-duration,
.col-muscles {
  display: flex;
  align-items: center;
}

.exercise-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exercise-thumbnail {
  position: relative;
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
  flex-shrink: 0;
}

.training-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
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

.training-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-surface-variant));
}

.play-overlay {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0,0,0,0.8);
  padding: 2px 4px;
  border-radius: 2px;
}

.exercise-details {
  flex: 1;
  min-width: 0;
}

.exercise-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exercise-id {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.value {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.muscles-badges {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.muscle-chip {
  font-size: 0.625rem;
  height: 20px;
}

.more-muscles {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* No exercises */
.no-exercises {
  text-align: center;
  padding: 40px 16px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.no-exercises-text {
  margin-top: 8px;
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
  .seance-show-youtube {
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
  
  .participants-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .images-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .exercise-thumbnail {
    width: 60px;
    height: 45px;
  }
}

/* Muscles entraînés */
.muscles-section {
  margin-bottom: 24px;
  padding: 16px;
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
}

.muscles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.muscle-badge {
  font-weight: 500;
}
</style>
