<template>
  <div class="product-type">
    <v-container>
      <!-- En-tête -->
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4 font-weight-bold">Types de Produits</h1>
        <v-btn color="primary" size="large" @click="openCreateDialog">
          <v-icon start>mdi-plus</v-icon>
          Nouveau Type
        </v-btn>
      </div>

      <!-- Alert messages -->
      <v-alert
        v-if="productStore.alert"
        :text="productStore.message"
        type="success"
        variant="tonal"
        closable
        class="mb-4"
      ></v-alert>

      <!-- Liste des types -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="productStore.productTypes"
          :loading="productStore.loading"
          class="elevation-1"
        >
          <!-- Colonne Image -->
          <template #[`item.image`]="{ item }">
            <v-img
              v-if="item.image"
              :src="`http://localhost:8000/storage/product_types/${item.image}`"
              width="50"
              height="50"
              cover
              class="rounded"
            ></v-img>
          </template>

          <!-- Colonne Nom -->
          <template #[`item.name`]="{ item }">
            <div class="d-flex align-center">
              <v-icon :color="getTypeColor(item.slug)" class="mr-2">
                mdi-shape
              </v-icon>
              {{ item.name }}
            </div>
          </template>

          <!-- Colonne Slug -->
          <template #[`item.slug`]="{ item }">
            <v-chip size="small" variant="outlined">
              {{ item.slug }}
            </v-chip>
          </template>

          <!-- Colonne Statut -->
          <template #[`item.is_active`]="{ item }">
            <v-switch
              v-model="item.is_active"
              color="success"
              hide-details
              @change="toggleStatus(item)"
            ></v-switch>
          </template>

          <!-- Colonne Actions -->
          <template #[`item.actions`]="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="warning"
              variant="text"
              @click="openEditDialog(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="text"
              @click="confirmDelete(item)"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- Dialog de création/édition -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white pa-4">
          {{ isEditing ? 'Modifier le type' : 'Nouveau type de produit' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" v-model="valid" @submit.prevent="saveType">
            <v-text-field
              v-model="editedItem.name"
              label="Nom"
              required
              :rules="[rules.required]"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="editedItem.description"
              label="Description"
              rows="3"
              class="mb-4"
            ></v-textarea>

            <v-file-input
              v-model="image"
              label="Image"
              accept="image/*"
              prepend-icon="mdi-camera"
              @change="onImageSelected"
              class="mb-4"
            ></v-file-input>

            <v-switch
              v-model="editedItem.is_active"
              label="Actif"
              color="success"
              class="mb-4"
            ></v-switch>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog">
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            @click="saveType"
            :loading="productStore.loading"
            :disabled="!valid"
          >
            {{ isEditing ? 'Modifier' : 'Créer' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmation de suppression -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 bg-error text-white pa-4">
          Confirmer la suppression
        </v-card-title>
        <v-card-text class="pa-4">
          Êtes-vous sûr de vouloir supprimer ce type de produit ?
          <v-alert
            type="warning"
            variant="tonal"
            class="mt-4"
          >
            Cette action est irréversible.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Annuler
          </v-btn>
          <v-btn
            color="error"
            @click="deleteType"
            :loading="productStore.loading"
          >
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '../../../store/AdminStore/ProductStore'

const productStore = useProductStore()

// Data
const dialog = ref(false)
const deleteDialog = ref(false)
const valid = ref(false)
const isEditing = ref(false)
const image = ref<File | null>(null)

const editedItem = ref({
  id: null,
  name: '',
  description: '',
  image: '',
  is_active: true
})

const defaultItem = {
  id: null,
  name: '',
  description: '',
  image: '',
  is_active: true
}

const headers = [
  { title: 'Image', key: 'image', sortable: false },
  { title: 'Nom', key: 'name', align: 'start', sortable: true },
  { title: 'Slug', key: 'slug', align: 'start', sortable: true },
  { title: 'Description', key: 'description', align: 'start', sortable: false },
  { title: 'Actif', key: 'is_active', align: 'center', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

const rules = {
  required: (v: string) => !!v || 'Ce champ est requis'
}

// Methods
const openCreateDialog = () => {
  isEditing.value = false
  editedItem.value = { ...defaultItem }
  dialog.value = true
}

const openEditDialog = (item: any) => {
  isEditing.value = true
  editedItem.value = { ...item }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  image.value = null
}

const onImageSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    image.value = target.files[0]
  }
}

const saveType = async () => {
  if (!valid.value) return

  const formData = new FormData()
  if (image.value) {
    formData.append('image', image.value)
  }
  
  Object.keys(editedItem.value).forEach(key => {
    if (key !== 'image') {
      formData.append(key, editedItem.value[key])
    }
  })

  try {
    if (isEditing.value) {
      await productStore.updateProductType(editedItem.value.id, formData)
    } else {
      await productStore.createProductType(formData)
    }
    closeDialog()
    productStore.getProductTypes()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

const confirmDelete = (item: any) => {
  editedItem.value = { ...item }
  deleteDialog.value = true
}

const deleteType = async () => {
  try {
    await productStore.deleteProductType(editedItem.value.id)
    deleteDialog.value = false
    productStore.getProductTypes()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

const toggleStatus = async (item: any) => {
  try {
    await productStore.toggleProductTypeStatus(item.id)
    productStore.getProductTypes()
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
  }
}

const getTypeColor = (slug: string) => {
  const colors: { [key: string]: string } = {
    'proteines': 'blue',
    'creatine': 'green',
    'gainers': 'orange',
    'bruleurs-de-graisse': 'red',
    'vitamines-mineraux': 'purple',
    'barres-energetiques': 'teal',
    'vetements': 'indigo',
    'materiel': 'brown'
  }
  return colors[slug] || 'grey'
}

// Lifecycle
onMounted(() => {
  productStore.getProductTypes()
})
</script>

<style scoped>
.product-type {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.v-data-table {
  background: white;
  border-radius: 8px;
}
</style> 