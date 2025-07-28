<template>
  <div class="profile-edit">
    <!-- Breadcrumbs -->
    <v-container>
      <v-breadcrumbs
        :items="breadcrumbItems"
        class="pa-0 mb-4"
      >
        <template v-slot:prepend>
          <v-icon size="small">mdi-home</v-icon>
        </template>
        <template v-slot:divider>
          <v-icon size="small">mdi-chevron-right</v-icon>
        </template>
      </v-breadcrumbs>
    </v-container>

    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <div class="edit-header mb-6">
            <h1 class="text-h3 font-weight-bold mb-2">Éditer mon profil</h1>
            <p class="text-subtitle-1 text-medium-emphasis">Modifiez vos informations personnelles</p>
          </div>

          <v-form @submit.prevent="updateProfile" ref="form">
            <!-- Section Avatar -->
            <v-card class="mb-6 custom-card">
              <v-card-title class="custom-card-title">Photo de profil</v-card-title>
              <v-card-text class="text-center">
                <v-avatar size="120" class="mb-4 avatar-upload">
                  <v-img 
                    v-if="avatarPreview" 
                    :src="avatarPreview"
                    cover
                  ></v-img>
                  <v-img 
                    v-else-if="currentAvatar" 
                    :src="`${APP_CONFIG.STORAGE_BASE_URL}/avatars/${currentAvatar}`"
                    cover
                  ></v-img>
                  <v-icon v-else size="60" color="grey-lighten-1">mdi-account</v-icon>
                </v-avatar>
                <div class="upload-section">
                  <v-file-input
                    v-model="avatarFile"
                    label="Choisir une nouvelle photo"
                    accept="image/*"
                    @update:model-value="onAvatarChange"
                    variant="outlined"
                    density="comfortable"
                    class="avatar-input"
                  ></v-file-input>
                </div>
              </v-card-text>
            </v-card>

            <!-- Section Informations personnelles -->
            <v-card class="mb-6 custom-card">
              <v-card-title class="custom-card-title">Informations personnelles</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profileData.name"
                      label="Nom complet"
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required]"
                      class="form-field"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profileData.email"
                      label="Adresse email"
                      variant="outlined"
                      density="comfortable"
                      type="email"
                      :rules="[rules.required, rules.email]"
                      class="form-field"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profileData.telephone"
                      label="Numéro de téléphone"
                      variant="outlined"
                      density="comfortable"
                      class="form-field"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profileData.cin"
                      label="Numéro CIN"
                      variant="outlined"
                      density="comfortable"
                      class="form-field"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="profileData.sexe"
                      label="Sexe"
                      :items="sexeOptions"
                      variant="outlined"
                      density="comfortable"
                      class="form-field"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profileData.date_naissance"
                      label="Date de naissance"
                      variant="outlined"
                      density="comfortable"
                      type="date"
                      class="form-field"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Section Informations physiques -->
            <v-card class="mb-6 custom-card">
              <v-card-title class="custom-card-title">Informations physiques</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="profileData.taille"
                      label="Taille (en mètres)"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="3.0"
                      placeholder="Ex: 1.75"
                      class="form-field"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="profileData.nouveau_poids"
                      label="Poids actuel (kg)"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      step="0.1"
                      min="20"
                      max="300"
                      placeholder="Ex: 70.5"
                      class="form-field"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="profileData.objectif"
                      label="Objectif principal"
                      :items="objectifOptions"
                      variant="outlined"
                      density="comfortable"
                      class="form-field"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Boutons d'action -->
            <div class="action-buttons">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                :loading="loading"
                class="save-btn"
              >
                Sauvegarder les modifications
              </v-btn>
              <v-btn
                color="grey-lighten-1"
                size="large"
                variant="outlined"
                @click="$router.go(-1)"
                class="cancel-btn ml-4"
              >
                Annuler
              </v-btn>
            </div>
          </v-form>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar pour les messages -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">
          Fermer
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '../../store/AuthStore'
import { useRouter, useRoute } from 'vue-router'
import type User from '../../types/User'
import { APP_CONFIG } from '../../config/constants'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const form = ref()
const loading = ref(false)
const avatarFile = ref()
const avatarPreview = ref('')
const weightHistory = ref<Array<{date: string, valeur: number}>>([])

const profileData = reactive({
  name: '',
  email: '',
  telephone: '',
  cin: '',
  taille: null as number | null,
  objectif: '',
  sexe: '',
  date_naissance: '',
  nouveau_poids: null as number | null,
  avatar: null as File | null
})

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

const currentAvatar = computed(() => authStore.userAuth?.avatar)
const currentWeight = computed(() => {
  if (weightHistory.value.length > 0) {
    return weightHistory.value[weightHistory.value.length - 1].valeur
  }
  return null
})

const sexeOptions = [
  { title: 'Homme', value: 'homme' },
  { title: 'Femme', value: 'femme' }
]

const objectifOptions = [
  { title: 'Prise de masse', value: 'prise de masse' },
  { title: 'Perte de poids', value: 'perte de poids' },
  { title: 'Maintien', value: 'maintien' },
  { title: 'Prise de force', value: 'prise de force' },
  { title: 'Endurance', value: 'endurance' },
  { title: 'Remise en forme', value: 'remise en forme' },
  { title: 'Sèche', value: 'sèche' },
  { title: 'Souplesse', value: 'souplesse' },
  { title: 'Rééducation', value: 'rééducation' },
  { title: 'Tonification', value: 'tonification' },
  { title: 'Préparation physique', value: 'préparation physique' },
  { title: 'Performance', value: 'performance' }
]

const rules = {
  required: (value: any) => !!value || 'Ce champ est requis',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email invalide'
  }
}

const onAvatarChange = (files: File[] | null) => {
  if (files && files.length > 0) {
    const file = files[0]
    profileData.avatar = file
    
    // Créer une preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    // Si aucun fichier sélectionné, réinitialiser
    profileData.avatar = null
    avatarPreview.value = ''
  }
}

const loadProfile = async () => {
  try {
    const user = await authStore.getProfile()
    
    // Remplir le formulaire avec les données existantes
    profileData.name = user.name || ''
    profileData.email = user.email || ''
    profileData.telephone = user.telephone || ''
    profileData.cin = user.cin || ''
    profileData.taille = user.taille || null
    profileData.objectif = user.objectif || ''
    profileData.sexe = user.sexe || ''
    
    // Formater la date de naissance pour l'input de type date (YYYY-MM-DD)
    if (user.date_naissance) {
      const date = new Date(user.date_naissance)
      profileData.date_naissance = date.toISOString().split('T')[0]
    } else {
      profileData.date_naissance = ''
    }
    
    // Charger l'historique de poids
    await loadWeightHistory()
  } catch (error) {
    showSnackbar('Erreur lors du chargement du profil', 'error')
  }
}

const loadWeightHistory = async () => {
  try {
    const history = await authStore.getWeightHistory()
    weightHistory.value = history || []
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
  }
}

const updateProfile = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  
  try {
    const formData = new FormData()
    
    // Ajouter TOUS les champs modifiables au FormData (même s'ils sont vides)
    formData.append('name', profileData.name || '')
    formData.append('email', profileData.email || '')
    formData.append('telephone', profileData.telephone || '')
    formData.append('cin', profileData.cin || '')
    formData.append('taille', profileData.taille ? profileData.taille.toString() : '')
    formData.append('objectif', profileData.objectif || '')
    formData.append('sexe', profileData.sexe || '')
    formData.append('date_naissance', profileData.date_naissance || '')
    
    // Ajouter le nouveau poids seulement s'il est renseigné
    if (profileData.nouveau_poids) {
      formData.append('nouveau_poids', profileData.nouveau_poids.toString())
    }
    
    // Ajouter l'avatar si présent
    if (profileData.avatar instanceof File) {
      console.log('Avatar à uploader:', profileData.avatar.name, profileData.avatar.size)
      formData.append('avatar', profileData.avatar)
    }
    
    // Debug: afficher le contenu du FormData
    console.log('FormData contents:')
    formData.forEach((value, key) => {
      console.log(key, value)
    })
    
    await authStore.updateProfile(formData)
    await loadWeightHistory() // Recharger l'historique si le poids a été mis à jour
    
    showSnackbar('Profil mis à jour avec succès !', 'success')
    
    // Réinitialiser les champs temporaires
    profileData.nouveau_poids = null
    avatarPreview.value = ''
    profileData.avatar = null
    avatarFile.value = null
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour:', error)
    let errorMessage = 'Erreur lors de la mise à jour'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const errorArray: string[] = []
      Object.values(errors).forEach((err: any) => {
        if (Array.isArray(err)) {
          errorArray.push(...err)
        } else {
          errorArray.push(err)
        }
      })
      errorMessage = errorArray.join(', ')
    }
    showSnackbar(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

const showSnackbar = (message: string, color: string) => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// Breadcrumbs selon le rôle
const breadcrumbItems = computed(() => {
  const userRole = authStore.userAuth?.roles?.[0]?.name
  const items = []
  
  switch (userRole) {
    case 'administrateur':
      items.push(
        { title: 'Dashboard', to: '/admin/dashboard' },
        { title: 'Mon Profil', to: '/admin/profile' },
        { title: 'Éditer', disabled: true }
      )
      break
    case 'coach':
      items.push(
        { title: 'Dashboard', to: '/coach/dashboard' },
        { title: 'Mon Profil', to: '/coach/profile' },
        { title: 'Éditer', disabled: true }
      )
      break
    case 'challenger':
      items.push(
        { title: 'Dashboard', to: '/challenger/dashboard' },
        { title: 'Mon Profil', to: '/challenger/profile' },
        { title: 'Éditer', disabled: true }
      )
      break
    default:
      items.push(
        { title: 'Accueil', to: '/' },
        { title: 'Mon Profil', to: '/profile' },
        { title: 'Éditer', disabled: true }
      )
  }
  
  return items
})

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-edit {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
  padding-bottom: 40px;
}

.edit-header {
  text-align: center;
  margin-bottom: 32px;
}

.avatar-upload {
  transition: transform 0.2s ease;
}

.avatar-upload:hover {
  transform: scale(1.05);
}

.upload-section {
  max-width: 300px;
  margin: 0 auto;
}

.avatar-input {
  margin-top: 16px;
}

.form-field {
  margin-bottom: 8px;
}

.form-field .v-field--focused {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.save-btn {
  padding: 12px 32px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  min-width: 200px;
}

.cancel-btn {
  padding: 12px 32px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  min-width: 120px;
}

/* Responsive */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .save-btn,
  .cancel-btn {
    width: 100%;
    margin: 0;
  }
  
  .edit-header h1 {
    font-size: 2rem;
  }
}

/* Amélioration des champs de formulaire */
.v-text-field .v-field__input {
  padding: 16px;
  font-size: 1rem;
}

.v-select .v-field__input {
  padding: 16px;
  font-size: 1rem;
}

.v-file-input .v-field__input {
  padding: 16px;
  font-size: 1rem;
}

/* Style des breadcrumbs */
.v-breadcrumbs {
  padding: 16px 0;
}

.v-breadcrumbs .v-breadcrumbs-item {
  font-size: 0.875rem;
}

.v-breadcrumbs .v-breadcrumbs-item--disabled {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
</style>
