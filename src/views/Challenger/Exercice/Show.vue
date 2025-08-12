<template>
  <v-container class="training-show">
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
      <v-card class="training-header-card" elevation="2">
        <div class="media-section">
          <!-- Video -->
          <div v-if="training.video" class="video-container">
            <video
              :src="`${APP_CONFIG.STORAGE_BASE_URL}/training_videos/${training.video}`"
              controls
              class="main-video"
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>

          <!-- Image -->
          <div v-else-if="training.image" class="image-container">
            <v-img
              :src="`${APP_CONFIG.STORAGE_BASE_URL}/trainings/${training.image}`"
              :alt="training.name"
              class="main-image"
              cover
            ></v-img>
          </div>

          <!-- Placeholder -->
          <div v-else class="no-media">
            <v-icon size="80" color="grey-lighten-2">mdi-play-circle-outline</v-icon>
            <p class="no-media-text">Aucun média disponible</p>
          </div>
        </div>

        <!-- Informations principales -->
        <div class="info-section">
          <div class="training-header">
            <h1 class="training-title">{{ training.name }}</h1>
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

          <v-divider class="my-4"></v-divider>
          <v-btn color="primary" variant="text" @click="goBack">
            <v-icon start>mdi-arrow-left</v-icon>
            Retour à la liste
          </v-btn>
        </div>
      </v-card>

      <!-- Autres exercices similaires -->
      <div v-if="relatedTrainings.length > 0" class="mt-6">
        <h3 class="section-title mb-3">Autres exercices similaires</h3>
        <v-row>
          <v-col
            v-for="rt in relatedTrainings"
            :key="rt.id"
            cols="12" sm="6" md="3"
          >
            <v-card class="hoverable" @click="viewTraining(rt.id)" style="cursor: pointer;">
              <v-img
                :src="rt.image ? `${APP_CONFIG.STORAGE_BASE_URL}/trainings/${rt.image}` : ''"
                height="160"
                cover
              >
                <v-card-title class="text-truncate">{{ rt.name }}</v-card-title>
              </v-img>
              <v-card-text class="text-truncate">
                {{ rt.description }}
              </v-card-text>
              <v-card-actions>
                <v-btn variant="text" color="primary" @click.stop="viewTraining(rt.id)">
                  Voir
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- État vide -->
    <div v-if="!training && !trainingStore.loading" class="empty-state">
      <v-icon size="80" color="grey-lighten-1">mdi-dumbbell-off</v-icon>
      <h3 class="empty-title">Exercice introuvable</h3>
      <p class="empty-subtitle">Cet exercice n'existe pas ou a été supprimé.</p>
      <v-btn color="primary" @click="goBack" class="mt-4">
        <v-icon start>mdi-arrow-left</v-icon>
        Retour à la liste
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrainingStore } from '../../../store/ChallengerStore/TrainingStore'
import { APP_CONFIG } from '../../../config/constants'

const route = useRoute()
const router = useRouter()
const trainingStore = useTrainingStore()

const training = computed(() => trainingStore.currentTraining)

const relatedTrainings = computed(() => {
  const current = training.value
  const all = trainingStore.trainings || []
  if (!current || !Array.isArray(current.categories) || current.categories.length === 0) return []
  const currentCategoryIds = new Set(current.categories.map(c => c.id))
  const candidates = all
    .filter(t => t && t.id !== current.id)
    .filter(t => Array.isArray(t.categories) && t.categories.some(c => currentCategoryIds.has(c.id)))
  // shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  return candidates.slice(0, 4)
})

const loadTraining = async () => {
  const id = Number(route.params.id)
  if (id) {
    await trainingStore.showTraining(id)
  }
}

const goBack = () => {
  router.push('/challenger/exercice')
}

const viewTraining = (id: number) => {
  router.push({ name: 'challengerExerciceShow', params: { id } })
}

onMounted(async () => {
  await loadTraining()
  if (!trainingStore.trainings || trainingStore.trainings.length === 0) {
    await trainingStore.getTrainings()
  }
})

watch(() => route.params.id, async () => {
  await loadTraining()
})
</script>

<style scoped>
.training-show {
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

.training-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

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
</style> 