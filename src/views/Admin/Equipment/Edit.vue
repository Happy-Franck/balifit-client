<template>
  <v-container class="equipment-edit">
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

    <!-- Loading state -->
    <div v-if="equipmentStore.loading" class="loading-container">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p class="loading-text mt-4">Chargement...</p>
    </div>

    <!-- Form -->
    <v-card v-if="!equipmentStore.loading" elevation="3" class="mx-auto">
      <v-card-title class="text-h5 pa-4 bg-primary text-white">
        <v-icon start>mdi-pencil</v-icon>
        Modifier l'équipement
      </v-card-title>

      <v-form ref="form" v-model="valid" @submit.prevent="saveEquipment">
        <v-card-text class="pa-6">
          <v-row>
            <!-- Nom -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editedEquipment.name"
                label="Nom de l'équipement *"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-weight-lifter"
                required
              ></v-text-field>
            </v-col>

            <!-- Description -->
            <v-col cols="12" md="6">
              <v-textarea
                v-model="editedEquipment.description"
                label="Description *"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-text"
                rows="4"
                required
              ></v-textarea>
            </v-col>

            <!-- Image actuelle -->
            <v-col cols="12" md="6" v-if="equipment?.image">
              <v-card variant="outlined" class="pa-4">
                <v-card-subtitle class="pa-0 mb-2">
                  <v-icon start size="16">mdi-image</v-icon>
                  Image actuelle
                </v-card-subtitle>
                <v-img
                  :src="`http://127.0.0.1:8000/storage/equipments/${equipment.image}`"
                  :alt="equipment.name"
                  max-height="200"
                  class="rounded"
                ></v-img>
              </v-card>
            </v-col>

            <!-- Upload nouvelle image -->
            <v-col cols="12" :md="equipment?.image ? 6 : 12">
              <v-file-input
                v-model="imageFile"
                label="Nouvelle image (optionnel)"
                accept="image/*"
                variant="outlined"
                prepend-inner-icon="mdi-camera"
                show-size
                @change="previewImage"
              ></v-file-input>
              
              <!-- Aperçu nouvelle image -->
              <v-card v-if="imagePreview" variant="outlined" class="mt-2 pa-4">
                <v-card-subtitle class="pa-0 mb-2">
                  <v-icon start size="16">mdi-eye</v-icon>
                  Aperçu
                </v-card-subtitle>
                <v-img
                  :src="imagePreview"
                  max-height="200"
                  class="rounded"
                ></v-img>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            color="grey"
            variant="outlined"
            @click="goBack"
            :disabled="equipmentStore.loading"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Annuler
          </v-btn>
          
          <v-spacer></v-spacer>
          
          <v-btn
            color="primary"
            type="submit"
            :loading="equipmentStore.loading"
            :disabled="!valid"
          >
            <v-icon start>mdi-content-save</v-icon>
            Sauvegarder
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>

    <!-- Alert -->
    <v-snackbar
      v-model="equipmentStore.alert"
      :timeout="5000"
      color="success"
      location="top"
    >
      {{ equipmentStore.message }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="equipmentStore.alert = false"
        >
          Fermer
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEquipmentStore } from '../../../store/AdminStore/EquipmentStore'

const route = useRoute()
const router = useRouter()
const equipmentStore = useEquipmentStore()

// Reactive data
const form = ref()
const valid = ref(false)
const imageFile = ref<File[]>([])
const imagePreview = ref<string | null>(null)

const editedEquipment = reactive({
  name: '',
  description: ''
})

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Ce champ est requis'
}

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
    href: `/admin/equipment/${route.params.id}`,
    icon: 'mdi-eye'
  },
  {
    title: 'Modifier',
    disabled: true,
    icon: 'mdi-pencil'
  }
])

// Methods
const loadEquipment = async () => {
  const id = Number(route.params.id)
  if (id) {
    await equipmentStore.showEquipment(id)
    if (equipment.value) {
      // Pré-remplir le formulaire avec les données existantes
      editedEquipment.name = equipment.value.name
      editedEquipment.description = equipment.value.description
    }
  }
}

const previewImage = () => {
  if (imageFile.value && imageFile.value.length > 0) {
    const file = imageFile.value[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    imagePreview.value = null
  }
}

const saveEquipment = async () => {
  if (!valid.value || !equipment.value) return

  const formData = new FormData()
  
  // Ajouter les données de base
  formData.append('name', editedEquipment.name)
  formData.append('description', editedEquipment.description)

  // Ajouter l'image si présente
  if (imageFile.value && imageFile.value.length > 0) {
    formData.append('image', imageFile.value[0])
  }

  try {
    await equipmentStore.updateEquipment(equipment.value.id, {}, formData)
    if (!equipmentStore.loading) {
      router.push(`/admin/equipment/${equipment.value.id}`)
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

const goBack = () => {
  router.push(`/admin/equipment/${route.params.id}`)
}

// Lifecycle
onMounted(async () => {
  await loadEquipment()
})
</script>

<style scoped>
.equipment-edit {
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

/* Responsive */
@media (max-width: 768px) {
  .equipment-edit {
    padding: 8px;
  }
}
</style> 