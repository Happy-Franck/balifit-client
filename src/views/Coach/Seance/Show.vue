<template>
  <v-container class="pa-6">
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

    <!-- Header Section -->
    <div class="mb-8">
      <div class="d-flex align-center mb-4">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          @click="$router.go(-1)"
          class="mr-4"
        ></v-btn>
        <h1 class="text-h3 font-weight-bold text-primary">
          Détails de la Séance
        </h1>
      </div>
      
      <!-- Status Badge -->
      <v-chip
        v-if="seanceStore.currentSeance"
        :color="getStatusColor(seanceStore.currentSeance.validated)"
        size="large"
        variant="flat"
        class="mb-4"
      >
        <v-icon start :icon="getStatusIcon(seanceStore.currentSeance.validated)"></v-icon>
        {{ getStatusText(seanceStore.currentSeance.validated) }}
      </v-chip>
    </div>

    <!-- Loading State -->
    <v-row v-if="seanceStore.loading" justify="center" class="my-12">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4 text-body-1">Chargement de la séance...</p>
      </v-col>
    </v-row>

    <!-- Séance Content -->
    <div v-else-if="seanceStore.currentSeance">
      <!-- Validation Button -->
      <v-row v-if="canValidate" class="mb-6">
        <v-col cols="12">
          <v-card class="validation-card" color="success" variant="tonal">
            <v-card-text class="d-flex align-center justify-space-between">
              <div>
                <h3 class="text-h6 mb-2">Séance prête à être validée</h3>
                <p class="text-body-2">Toutes les conditions sont remplies pour valider cette séance.</p>
              </div>
              <v-btn
                color="success"
                size="large"
                prepend-icon="mdi-check-circle"
                @click="valider(seanceStore.currentSeance.id)"
              >
                Valider la séance
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Images Section -->
      <v-row class="mb-8">
        <!-- Image Début -->
        <v-col cols="12" md="6">
          <v-card class="image-card" elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-camera</v-icon>
              Photo de début
            </v-card-title>
            
            <v-card-text>
              <div v-if="seanceStore.currentSeance.img_debut" class="text-center">
                <v-img
                  :src="`${APP_CONFIG.STORAGE_BASE_URL}/seance/${seanceStore.currentSeance.challenger_id}/${seanceStore.currentSeance.img_debut}`"
                  class="seance-image mb-3"
                  cover
                  aspect-ratio="1"
                ></v-img>
                <v-btn
                  color="error"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-delete"
                  @click="supprImgDebut"
                >
                  Supprimer
                </v-btn>
              </div>
              
              <div v-else class="upload-section">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-camera-plus</v-icon>
                <h4 class="text-h6 mb-2">Aucune photo de début</h4>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Ajoutez une photo pour documenter le début de la séance
                </p>
                <v-form @submit.prevent="changeDebut">
                  <v-file-input
                    v-model="imageDebut"
                    @change="uploadDebut"
                    show-size
                    prepend-icon="mdi-camera"
                    clearable
                    label="Sélectionner une image"
                    accept="image/*"
                    class="mb-3"
                  ></v-file-input>
                  <v-btn
                    type="submit"
                    color="primary"
                    :disabled="!saryDebut"
                  >
                    Ajouter la photo
                  </v-btn>
                </v-form>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Image Fin -->
        <v-col cols="12" md="6">
          <v-card class="image-card" elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-camera</v-icon>
              Photo de fin
            </v-card-title>
            
            <v-card-text>
              <div v-if="seanceStore.currentSeance.img_fin" class="text-center">
                <v-img
                  :src="`${APP_CONFIG.STORAGE_BASE_URL}/seance/${seanceStore.currentSeance.challenger_id}/${seanceStore.currentSeance.img_fin}`"
                  class="seance-image mb-3"
                  cover
                  aspect-ratio="1"
                ></v-img>
                <v-btn
                  color="error"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-delete"
                  @click="supprImgFin"
                >
                  Supprimer
                </v-btn>
              </div>
              
              <div v-else class="upload-section">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-camera-plus</v-icon>
                <h4 class="text-h6 mb-2">Aucune photo de fin</h4>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Ajoutez une photo pour documenter la fin de la séance
                </p>
                <v-form @submit.prevent="changeFin">
                  <v-file-input
                    v-model="imageFin"
                    @change="uploadFin"
                    show-size
                    prepend-icon="mdi-camera"
                    clearable
                    label="Sélectionner une image"
                    accept="image/*"
                    class="mb-3"
                  ></v-file-input>
                  <v-btn
                    type="submit"
                    color="primary"
                    :disabled="!saryFin"
                  >
                    Ajouter la photo
                  </v-btn>
                </v-form>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Informations Section -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title>
              <v-icon color="primary" class="mr-2">mdi-information</v-icon>
              Informations de la séance
            </v-card-title>
            
            <v-card-text>
              <v-row>
                <v-col cols="12" md="3">
                  <div class="info-item">
                    <v-icon color="primary" class="mr-2">mdi-calendar</v-icon>
                    <div>
                      <p class="text-caption text-medium-emphasis">Date de création</p>
                      <p class="text-body-1 font-weight-medium">
                        {{ formatDate(seanceStore.currentSeance.created_at) }}
                      </p>
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="12" md="4">
                  <div class="info-item">
                    <v-avatar
                      size="48"
                      class="mr-3 avatar-border"
                      :image="seanceStore.currentSeanceCoach?.image ? `${APP_CONFIG.STORAGE_BASE_URL}/users/${seanceStore.currentSeanceCoach.image}` : undefined"
                    >
                      <v-icon v-if="!seanceStore.currentSeanceCoach?.image" size="24">mdi-account-tie</v-icon>
                    </v-avatar>
                    <div>
                      <p class="text-caption text-medium-emphasis">Coach</p>
                      <p class="text-body-1 font-weight-medium">
                        {{ seanceStore.currentSeanceCoach?.name || 'Non assigné' }}
                      </p>
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="12" md="4">
                  <div class="info-item">
                    <v-avatar
                      size="48"
                      class="mr-3 avatar-border"
                      :image="seanceStore.currentSeanceChallenger?.image ? `${APP_CONFIG.STORAGE_BASE_URL}/users/${seanceStore.currentSeanceChallenger.image}` : undefined"
                    >
                      <v-icon v-if="!seanceStore.currentSeanceChallenger?.image" size="24">mdi-account</v-icon>
                    </v-avatar>
                    <div>
                      <p class="text-caption text-medium-emphasis">Challenger</p>
                      <p class="text-body-1 font-weight-medium">
                        {{ seanceStore.currentSeanceChallenger?.name || 'Non assigné' }}
                      </p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Trainings Section -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-dumbbell</v-icon>
                Exercices de la séance
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                :to="{name: 'coachSeanceItemAdd', params: {id: seanceStore.currentSeance.id}}"
              >
                Ajouter un exercice
              </v-btn>
            </v-card-title>
            
            <v-card-text>
              <div v-if="seanceStore.currentSeanceTrainings.length === 0" class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-dumbbell</v-icon>
                <h4 class="text-h6 mb-2">Aucun exercice</h4>
                <p class="text-body-2 text-medium-emphasis">
                  Aucun exercice n'a été ajouté à cette séance
                </p>
              </div>
              
              <v-list v-else>
                <v-list-item
                  v-for="(kotrana, index) in seanceStore.currentSeanceTrainings"
                  :key="index"
                  class="training-item"
                >
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-dumbbell</v-icon>
                  </template>
                  
                  <v-list-item-title class="font-weight-medium">
                    {{ kotrana.name }}
                  </v-list-item-title>
                  
                  <v-list-item-subtitle>
                    <span v-if="kotrana.pivot.series && kotrana.pivot.repetitions">
                      {{ kotrana.pivot.series }} séries × {{ kotrana.pivot.repetitions }} répétitions
                    </span>
                    <span v-else-if="kotrana.pivot.series && kotrana.pivot.duree">
                      {{ kotrana.pivot.series }} séries × {{ kotrana.pivot.duree }} secondes
                    </span>
                    <span v-else-if="kotrana.pivot.repetitions">
                      {{ kotrana.pivot.repetitions }} répétitions
                    </span>
                    <span v-else-if="kotrana.pivot.duree">
                      {{ kotrana.pivot.duree }} secondes
                    </span>
                  </v-list-item-subtitle>
                  
                  <template v-slot:append>
                    <v-btn
                      color="error"
                      variant="text"
                      size="small"
                      icon="mdi-delete"
                      @click="supprTraining(kotrana.pivot.seance_id, kotrana.pivot.training_id, kotrana.pivot.id)"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Action Buttons -->
      <v-row>
        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            color="primary"
            variant="outlined"
            size="large"
            prepend-icon="mdi-pencil"
            :to="{name: 'coachSeanceItemEdit', params: {id: seanceStore.currentSeance.id}}"
            class="mr-4"
          >
            Éditer la séance
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, watch, reactive, toRefs, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeanceStore } from '../../../store/CoachStore/SeanceStore'
import { APP_CONFIG } from '../../../config/constants'

export default defineComponent({
  setup() {
    const seanceStore = useSeanceStore()
    const route = useRoute()
    const router = useRouter()
    
    // Breadcrumbs
    const breadcrumbItems = computed(() => [
      {
        title: 'Accueil',
        href: '/coach/dashboard',
        icon: 'mdi-home'
      },
      {
        title: 'Séances',
        href: '/coach/seance',
        icon: 'mdi-calendar-check'
      },
      {
        title: `Séance #${route.params.id}`,
        disabled: true,
        icon: 'mdi-eye'
      }
    ])
    
    const state = reactive({
      imageDebut: null as null | any,
      saryDebut: null as null | any,
      imageFin: null as null | any,
      saryFin: null as null | any,
    })

    const canValidate = computed(() => {
      if (!seanceStore.currentSeance) return false
      return seanceStore.currentSeance.img_debut &&
             seanceStore.currentSeance.img_fin &&
             seanceStore.currentSeance.trainings.length > 0 &&
             seanceStore.currentSeance.validated === null
    })

    const getStatusColor = (validated: boolean | null) => {
      if (validated === null) return 'warning'
      if (validated === true) return 'success'
      return 'error'
    }

    const getStatusIcon = (validated: boolean | null) => {
      if (validated === null) return 'mdi-clock-outline'
      if (validated === true) return 'mdi-check-circle'
      return 'mdi-close-circle'
    }

    const getStatusText = (validated: boolean | null) => {
      if (validated === null) return 'En attente'
      if (validated === true) return 'Validée'
      return 'Rejetée'
    }

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const uploadDebut = (e: any) => {
      state.saryDebut = e.target.files[0]
    }

    const changeDebut = () => {
      seanceStore.updateDebut(Number(route.params.id), state.saryDebut)
    }

    const supprImgDebut = () => {
      seanceStore.supprDebut(Number(route.params.id), {
        suppr: null
      })
    }

    const uploadFin = (e: any) => {
      state.saryFin = e.target.files[0]
    }

    const changeFin = () => {
      seanceStore.updateFin(Number(route.params.id), state.saryFin)
    }

    const supprImgFin = () => {
      seanceStore.supprFin(Number(route.params.id), {
        suppr: null
      })
    }

    const supprTraining = (seanceId: number, trainingId: number, pivotId: number) => {
      seanceStore.supprTraining(seanceId, trainingId, pivotId)
    }

    const valider = (id: number) => {
      seanceStore.valider(id)
    }

    watch(
      () => seanceStore.message,
      (newMessage) => {
        if (newMessage !== '') {
          seanceStore.showSeance(Number(route.params.id))
          seanceStore.message = ''
        }
      }
    )

    if (seanceStore.currentSeance) {
      if (seanceStore.currentSeance.id != Number(route.params.id)) {
        seanceStore.loading = true
        seanceStore.currentSeance = null
        seanceStore.showSeance(Number(route.params.id))
      }
    }
    if (!seanceStore.currentSeance) {
      seanceStore.loading = true
      seanceStore.currentSeance = null
      seanceStore.showSeance(Number(route.params.id))
    }

    return {
      seanceStore,
      canValidate,
      getStatusColor,
      getStatusIcon,
      getStatusText,
      formatDate,
      supprTraining,
      valider,
      uploadDebut,
      changeDebut,
      supprImgDebut,
      uploadFin,
      changeFin,
      supprImgFin,
      APP_CONFIG,
      breadcrumbItems,
      ...toRefs(state)
    }
  }
})
</script>

<style scoped>
.image-card {
  height: 100%;
}

.seance-image {
  border-radius: 8px;
  max-width: 300px;
  margin: 0 auto;
}

.upload-section {
  text-align: center;
  padding: 2rem 0;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 1rem 0;
}

.training-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.training-item:last-child {
  border-bottom: none;
}

.validation-card {
  border-left: 4px solid rgb(76, 175, 80);
}

.avatar-border {
  border: 3px solid rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
