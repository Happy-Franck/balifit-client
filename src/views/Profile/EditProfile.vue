 <template>
  <div class="profile-edit">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="pa-6">
            <v-card-title class="text-h5 mb-4">
              <v-icon class="mr-2">mdi-account-edit</v-icon>
              Éditer mon profil
            </v-card-title>

            <v-form @submit.prevent="updateProfile" ref="form">
              <!-- Avatar -->
              <v-row>
                <v-col cols="12" class="text-center">
                  <v-avatar size="120" class="mb-4">
                    <v-img 
                      v-if="avatarPreview" 
                      :src="avatarPreview"
                      cover
                    ></v-img>
                    <v-img 
                      v-else-if="currentAvatar" 
                      :src="`http://localhost:8000/storage/avatars/${currentAvatar}`"
                      cover
                    ></v-img>
                    <v-icon v-else size="60">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <v-file-input
                      v-model="avatarFile"
                      label="Changer l'avatar"
                      accept="image/*"
                      prepend-icon="mdi-camera"
                      @update:model-value="onAvatarChange"
                      variant="outlined"
                      density="compact"
                    ></v-file-input>
                  </div>
                </v-col>
              </v-row>

              <!-- Informations personnelles -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileData.name"
                    label="Nom complet"
                    prepend-icon="mdi-account"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileData.email"
                    label="Email"
                    prepend-icon="mdi-email"
                    variant="outlined"
                    type="email"
                    :rules="[rules.required, rules.email]"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileData.telephone"
                    label="Téléphone"
                    prepend-icon="mdi-phone"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileData.cin"
                    label="CIN"
                    prepend-icon="mdi-card-account-details"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Informations physiques -->
              <v-row>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="profileData.sexe"
                    label="Sexe"
                    prepend-icon="mdi-human-male-female"
                    :items="sexeOptions"
                    variant="outlined"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="profileData.taille"
                    label="Taille (m)"
                    prepend-icon="mdi-human-male-height"
                    variant="outlined"
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="3.0"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="profileData.date_naissance"
                    label="Date de naissance"
                    prepend-icon="mdi-calendar"
                    variant="outlined"
                    type="date"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Objectif -->
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="profileData.objectif"
                    label="Objectif"
                    prepend-icon="mdi-target"
                    :items="objectifOptions"
                    variant="outlined"
                  ></v-select>
                </v-col>
              </v-row>

              <!-- Nouveau poids -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileData.nouveau_poids"
                    label="Nouveau poids (kg)"
                    prepend-icon="mdi-scale-bathroom"
                    variant="outlined"
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    hint="Laisser vide si pas de changement"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" v-if="currentWeight">
                  <v-text-field
                    :value="`${currentWeight} kg`"
                    label="Poids actuel"
                    prepend-icon="mdi-scale"
                    variant="outlined"
                    readonly
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Boutons d'action -->
              <v-row class="mt-4">
                <v-col cols="12">
                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    :loading="loading"
                    block
                  >
                    <v-icon class="mr-2">mdi-content-save</v-icon>
                    Sauvegarder
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>

            <!-- Historique de poids -->
            <v-divider class="my-6"></v-divider>
            <v-card-title class="text-h6">
              <v-icon class="mr-2">mdi-chart-line</v-icon>
              Historique de poids
            </v-card-title>
            <v-list v-if="weightHistory.length > 0">
              <v-list-item
                v-for="(entry, index) in weightHistory.slice().reverse()"
                :key="index"
              >
                <v-list-item-title>{{ entry.valeur }} kg</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(entry.date) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info" variant="tonal">
              Aucun historique de poids disponible
            </v-alert>
          </v-card>
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
import type User from '../../types/User'

const authStore = useAuthStore()
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

onMounted(() => {
  loadProfile()
})
</script>
