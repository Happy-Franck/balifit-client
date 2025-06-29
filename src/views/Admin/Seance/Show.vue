<template>
  <v-container class="seance-show-container">
    <!-- Breadcrumbs -->
    <v-breadcrumbs 
      :items="breadcrumbItems" 
      class="breadcrumbs pa-0 mb-4"
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
      <!-- Header avec photo de couverture stylée -->
      <div class="seance-header">
        <div class="cover-section">
          <v-img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            height="300"
            cover
            class="cover-bg"
          >
            <div class="cover-overlay"></div>
            <div class="cover-content">
              <div class="seance-status-badge">
                <v-chip 
                  :color="getStatusColor(seance.validated)" 
                  size="x-large" 
                  variant="elevated"
                  class="status-chip"
                >
                  <v-icon start size="20">{{ getStatusIcon(seance.validated) }}</v-icon>
                  {{ formatValidatedStatus(seance.validated) }}
                </v-chip>
              </div>
              <h1 class="seance-title-overlay">Séance #{{ seance.id }}</h1>
              <div class="seance-meta-overlay">
                <div class="meta-item">
                  <v-icon color="white" size="20">mdi-calendar</v-icon>
                  <span>{{ formatDate(seance.created_at) }}</span>
                </div>
                <div class="meta-item">
                  <v-icon color="white" size="20">mdi-clock</v-icon>
                  <span>{{ formatTime(seance.created_at) }}</span>
                </div>
              </div>
            </div>
          </v-img>
        </div>
        
        <!-- Actions flottantes -->
        <div class="floating-actions">
          <v-btn
            variant="elevated"
            size="large"
            color="primary"
            @click="editSeance"
            class="action-btn"
          >
            <v-icon start size="20">mdi-pencil</v-icon>
            Modifier
          </v-btn>
          <v-btn
            variant="elevated"
            size="large"
            color="error"
            @click="confirmDelete"
            class="action-btn ml-3"
          >
            <v-icon start size="20">mdi-delete</v-icon>
            Supprimer
          </v-btn>
        </div>
      </div>

      <!-- Layout principal style YouTube -->
      <div class="main-layout">
        <!-- Colonne principale -->
        <div class="main-column">
          <!-- Coach assigné -->
          <v-card class="modern-card mb-4" v-if="coach">
            <v-card-text class="pa-6">
              <h3 class="section-title mb-4">
                <v-icon color="primary" class="mr-2">mdi-account-tie</v-icon>
                Coach assigné
              </h3>
              <div class="coach-info">
                <v-avatar size="80" class="mr-4 elevation-4">
                  <v-img 
                    v-if="coach.avatar" 
                    :src="`http://localhost:8000/storage/avatars/${coach.avatar}`"
                  ></v-img>
                  <v-icon v-else size="40" color="primary">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <h4 class="coach-name">{{ coach.name }}</h4>
                  <p class="coach-email">{{ coach.email }}</p>
                  <v-chip color="success" size="small" variant="elevated" class="mt-2">
                    <v-icon start size="14">mdi-star</v-icon>
                    Coach
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Exercices de la séance -->
          <v-card class="modern-card" v-if="trainings && trainings.length > 0">
            <v-card-text class="pa-6">
              <h3 class="section-title mb-4">
                <v-icon color="primary" class="mr-2">mdi-dumbbell</v-icon>
                Exercices de la séance ({{ trainings.length }})
              </h3>
              <div class="trainings-grid">
                <div
                  v-for="training in trainings"
                  :key="training.id"
                  class="training-card"
                  @click="viewTraining(training.id)"
                >
                  <div class="training-thumbnail">
                    <v-img
                      v-if="training.image"
                      :src="`http://127.0.0.1:8000/storage/trainings/${training.image}`"
                      :alt="training.name"
                      height="140"
                      cover
                      class="training-image"
                    ></v-img>
                    <div v-else class="training-placeholder">
                      <v-icon size="48" color="primary">mdi-dumbbell</v-icon>
                    </div>
                    
                    <div class="training-overlay">
                      <v-icon size="32" color="white">mdi-play-circle</v-icon>
                    </div>
                  </div>
                  
                  <div class="training-info">
                    <h4 class="training-name">{{ training.name }}</h4>
                    <p class="training-description">
                      {{ truncateText(training.description, 100) }}
                    </p>
                    
                    <!-- Muscles -->
                    <div v-if="training.categories && training.categories.length > 0" class="training-muscles">
                      <v-chip
                        v-for="category in training.categories.slice(0, 3)"
                        :key="category.id"
                        size="x-small"
                        color="secondary"
                        variant="elevated"
                        class="mr-1 mb-1"
                      >
                        {{ category.name }}
                      </v-chip>
                      <span v-if="training.categories.length > 3" class="text-caption text-primary font-weight-bold">
                        +{{ training.categories.length - 3 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Colonne latérale -->
        <div class="sidebar-column">
          <!-- Statistiques -->
          <v-card class="modern-card mb-4">
            <v-card-text class="pa-6">
              <h3 class="section-title mb-4">
                <v-icon color="primary" class="mr-2">mdi-chart-line</v-icon>
                Statistiques
              </h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon">
                    <v-icon size="24" color="primary">mdi-account-group</v-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ seance.participants_count || 0 }}</div>
                    <div class="stat-label">Participants</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <v-icon size="24" color="secondary">mdi-dumbbell</v-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ trainings?.length || 0 }}</div>
                    <div class="stat-label">Exercices</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <v-icon size="24" color="success">mdi-clock</v-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ seance.duree || 0 }}</div>
                    <div class="stat-label">Minutes</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <v-icon size="24" color="info">mdi-calendar-plus</v-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ formatDate(seance.created_at, 'short') }}</div>
                    <div class="stat-label">Créée le</div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Participant -->
          <v-card class="modern-card mb-4" v-if="challenger">
            <v-card-text class="pa-6">
              <h3 class="section-title mb-4">
                <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                Participant
              </h3>
              <div class="participant-info">
                <v-avatar size="60" class="mr-3 elevation-4">
                  <v-img 
                    v-if="challenger.avatar" 
                    :src="`http://localhost:8000/storage/avatars/${challenger.avatar}`"
                  ></v-img>
                  <v-icon v-else size="30" color="info">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <h4 class="participant-name">{{ challenger.name }}</h4>
                  <p class="participant-email">{{ challenger.email }}</p>
                  <v-chip color="info" size="small" variant="elevated" class="mt-2">
                    <v-icon start size="14">mdi-account-check</v-icon>
                    Challenger
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Actions rapides -->
          <v-card class="modern-card">
            <v-card-text class="pa-6">
              <h3 class="section-title mb-4">
                <v-icon color="primary" class="mr-2">mdi-lightning-bolt</v-icon>
                Actions rapides
              </h3>
              <div class="quick-actions">
                <v-btn
                  block
                  variant="elevated"
                  color="primary"
                  size="large"
                  class="mb-3"
                  @click="editSeance"
                  v-if="seance.validated === null"
                >
                  <v-icon start>mdi-pencil</v-icon>
                  Modifier l'assignation
                </v-btn>
                <v-btn
                  block
                  variant="elevated"
                  color="error"
                  size="large"
                  @click="confirmDelete"
                  v-if="seance.validated === null"
                >
                  <v-icon start>mdi-delete</v-icon>
                  Supprimer la séance
                </v-btn>
                <v-alert 
                  v-if="seance.validated !== null" 
                  type="info" 
                  variant="tonal"
                  class="mt-3"
                >
                  <v-icon start>mdi-information</v-icon>
                  <div v-if="seance.validated === false">
                    <strong>Séance à corriger</strong><br>
                    Le challenger a signalé une erreur. Cette séance est maintenant gérée entre le coach et le challenger.
                  </div>
                  <div v-else-if="seance.validated === true">
                    <strong>Séance validée</strong><br>
                    Cette séance a été validée par le challenger. Aucune modification n'est possible.
                  </div>
                </v-alert>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-if="!seance && !seanceStore.loading" class="empty-state">
      <v-icon size="120" color="grey-lighten-1">mdi-calendar-remove</v-icon>
      <h3 class="empty-title">Séance introuvable</h3>
      <p class="empty-subtitle">Cette séance n'existe pas ou a été supprimée.</p>
      <v-btn color="primary" size="large" @click="goBack" class="mt-6">
        <v-icon start>mdi-arrow-left</v-icon>
        Retour à la liste
      </v-btn>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card class="modern-card">
        <v-card-title class="text-h6 pa-6 bg-error text-white">
          <v-icon class="mr-2" color="white">mdi-delete</v-icon>
          Confirmer la suppression
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-h6 mb-4">Êtes-vous sûr de vouloir supprimer la séance <strong>{{ seance?.nom }}</strong> ?</p>
          <v-alert type="warning" variant="elevated" class="mt-4">
            <v-icon start>mdi-alert-triangle</v-icon>
            Cette action est irréversible.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn variant="elevated" @click="deleteDialog = false" size="large">Annuler</v-btn>
          <v-btn color="error" variant="elevated" @click="deleteSeance" size="large" class="ml-3">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
    title: seance.value?.nom || 'Détail',
    disabled: true,
    icon: 'mdi-eye'
  }
])

// Methods
const loadSeance = async () => {
  const id = Number(route.params.id)
  if (id) {
    await seanceStore.showSeance(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

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

const formatDate = (dateString: string, format: string = 'full') => {
  if (!dateString) return 'Non définie'
  const date = new Date(dateString)
  
  if (format === 'short') {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    })
  }
  
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (dateString: string) => {
  if (!dateString) return 'Non défini'
  const date = new Date(dateString)
  
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatValidatedStatus = (validated: boolean | null) => {
  if (validated === true) return 'Validée'
  if (validated === false) return 'À corriger'
  if (validated === null) return 'Assignée'
  return 'Non défini'
}

const getStatusColor = (validated: boolean | null) => {
  if (validated === true) return 'success'
  if (validated === false) return 'error'
  if (validated === null) return 'info'
  return 'grey'
}

const getStatusIcon = (validated: boolean | null) => {
  if (validated === true) return 'mdi-check-circle'
  if (validated === false) return 'mdi-alert-circle'
  if (validated === null) return 'mdi-account-group'
  return 'mdi-help-circle'
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Lifecycle
onMounted(() => {
  loadSeance()
})
</script>

<style scoped>
.seance-show-container {
  max-width: 1400px;
  padding: 16px;
}

/* Breadcrumbs */
.breadcrumbs {
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

/* Header avec couverture */
.seance-header {
  position: relative;
  margin-bottom: 32px;
}

.cover-section {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3));
  z-index: 1;
}

.cover-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  text-align: center;
  color: white;
}

.seance-title-overlay {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 16px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.seance-meta-overlay {
  display: flex;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.status-chip {
  font-size: 1.1rem !important;
  height: 48px !important;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  margin-bottom: 16px;
}

.floating-actions {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 3;
}

.action-btn {
  text-transform: none;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* Layout principal */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  align-items: start;
}

.main-column {
  min-width: 0;
}

.sidebar-column {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

/* Cards modernes */
.modern-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  display: flex;
  align-items: center;
}

.description-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

/* Coach info */
.coach-info {
  display: flex;
  align-items: center;
}

.coach-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
}

.coach-email {
  font-size: 1rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0 0 8px 0;
}

/* Exercices grid */
.trainings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.training-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgb(var(--v-theme-surface-variant));
}

.training-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.training-thumbnail {
  position: relative;
  height: 140px;
}

.training-image {
  transition: transform 0.3s ease;
}

.training-card:hover .training-image {
  transform: scale(1.05);
}

.training-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-surface));
}

.training-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.training-card:hover .training-overlay {
  opacity: 1;
}

.training-info {
  padding: 16px;
}

.training-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.training-description {
  font-size: 0.95rem;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.training-muscles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

/* Statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 12px;
  gap: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgb(var(--v-theme-surface));
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 500;
}

/* Participant */
.participant-info {
  display: flex;
  align-items: center;
}

.participant-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
}

.participant-email {
  font-size: 1rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0 0 8px 0;
}

/* Actions rapides */
.quick-actions {
  display: flex;
  flex-direction: column;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 100px 24px;
}

.empty-title {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 24px 0 12px 0;
}

.empty-subtitle {
  font-size: 1.1rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .sidebar-column {
    position: static;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .seance-show-container {
    padding: 12px;
  }
  
  .seance-title-overlay {
    font-size: 2rem;
  }
  
  .seance-meta-overlay {
    flex-direction: column;
    gap: 16px;
  }
  
  .floating-actions {
    position: static;
    margin-top: 16px;
    text-align: center;
  }
  
  .action-btn {
    display: block;
    width: 100%;
    margin: 8px 0;
  }
  
  .trainings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
