<template>
  <div class="product-show">
    <v-container>
      <!-- Loading indicator -->
      <v-card
        v-if="productStore.loading"
        class="loading-card"
        elevation="0"
      >
        <v-progress-linear
          :active="productStore.loading"
          :indeterminate="productStore.loading"
          color="primary"
          height="4"
        ></v-progress-linear>
      </v-card>

      <!-- Alert messages -->
      <v-alert
        v-if="productStore.alert"
        :text="productStore.message"
        type="success"
        variant="tonal"
        closable
        class="mb-4"
      ></v-alert>

      <!-- Product details -->
      <div v-if="productStore.currentProduct && !productStore.loading">
        <!-- Breadcrumb -->
        <v-breadcrumbs class="pa-0 mb-4">
          <v-breadcrumbs-item>
            <router-link to="/admin" class="text-decoration-none">
              <v-icon class="mr-2">mdi-view-dashboard</v-icon>
              Dashboard
            </router-link>
          </v-breadcrumbs-item>
          <v-breadcrumbs-divider>/</v-breadcrumbs-divider>
          <v-breadcrumbs-item>
            <router-link to="/admin/product" class="text-decoration-none">
              Produits
            </router-link>
          </v-breadcrumbs-item>
          <v-breadcrumbs-divider>/</v-breadcrumbs-divider>
          <v-breadcrumbs-item disabled>
            {{ productStore.currentProduct.name }}
          </v-breadcrumbs-item>
        </v-breadcrumbs>

        <!-- Header with actions -->
        <v-row class="mb-6">
          <v-col cols="12">
            <div class="d-flex justify-space-between align-center">
              <div>
                <h1 class="text-h4 font-weight-bold mb-2">
                  {{ productStore.currentProduct.name }}
                </h1>
                <div class="d-flex align-center">
                  <v-chip
                    color="success"
                    variant="elevated"
                    class="mr-2"
                  >
                    <v-icon start>mdi-check-circle</v-icon>
                    Actif
                  </v-chip>
                  <span class="text-body-2 text-medium-emphasis">
                    ID: #{{ productStore.currentProduct.id }}
                  </span>
                </div>
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="dialog = true"
                  prepend-icon="mdi-pencil"
                >
                  Modifier
                </v-btn>
                <v-btn
                  color="error"
                  variant="outlined"
                  @click="confirmDelete = true"
                  prepend-icon="mdi-delete"
                >
                  Supprimer
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Main content -->
        <v-row>
          <!-- Product image -->
          <v-col cols="12" md="6">
            <v-card class="pa-4" elevation="2">
              <v-card-title class="text-h6 pb-4">
                <v-icon class="mr-2">mdi-image</v-icon>
                Image du produit
              </v-card-title>
              <div class="text-center">
                <v-img
                  v-if="productStore.currentProduct.image"
                  :src="`http://localhost:8000/storage/produits/${productStore.currentProduct.image}`"
                  class="rounded-lg"
                  height="400"
                  cover
                ></v-img>
                <div v-else class="image-placeholder">
                  <v-icon size="80" color="grey-lighten-2">mdi-image-off</v-icon>
                  <p class="text-grey-lighten-2 mt-2">Aucune image</p>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Product details -->
          <v-col cols="12" md="6">
            <v-card class="pa-4 mb-4" elevation="2">
              <v-card-title class="text-h6 pb-4">
                <v-icon class="mr-2">mdi-information</v-icon>
                Informations du produit
              </v-card-title>
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-tag</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Prix</v-list-item-title>
                  <v-list-item-subtitle class="text-h6 font-weight-bold text-success">
                    {{ formatPrice(productStore.currentProduct.price) }} Ar
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-weight</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Poids</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ productStore.currentProduct.poid }} g
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="productStore.currentProduct.rating">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-star</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Note moyenne</v-list-item-title>
                  <v-list-item-subtitle>
                    <div class="d-flex align-center">
                      <v-rating
                        :model-value="productStore.currentProduct.rating"
                        readonly
                        size="small"
                        color="amber"
                        half-increments
                      ></v-rating>
                      <span class="ml-2 text-body-2">
                        ({{ productStore.currentProduct.rating }}/5)
                      </span>
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Créé par</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ productStore.currentProduct.user_id ? `Utilisateur #${productStore.currentProduct.user_id}` : 'Système' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>

            <!-- Description -->
            <v-card class="pa-4" elevation="2">
              <v-card-title class="text-h6 pb-4">
                <v-icon class="mr-2">mdi-text</v-icon>
                Description
              </v-card-title>
              <p class="text-body-1 text-medium-emphasis">
                {{ productStore.currentProduct.description }}
              </p>
            </v-card>
          </v-col>
        </v-row>

        <!-- Metadata -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card class="pa-4" elevation="2">
              <v-card-title class="text-h6 pb-4">
                <v-icon class="mr-2">mdi-clock</v-icon>
                Informations système
              </v-card-title>
              <v-row>
                <v-col cols="12" md="6">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="success">mdi-calendar-plus</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Date de création</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatDate(productStore.currentProduct.created_at) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="warning">mdi-calendar-edit</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Dernière modification</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatDate(productStore.currentProduct.updated_at) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Empty state -->
      <v-card v-else-if="!productStore.loading" class="text-center pa-12" elevation="0">
        <v-icon size="80" color="grey-lighten-2">mdi-package-variant</v-icon>
        <h3 class="text-h5 text-grey-lighten-2 mt-4">Produit non trouvé</h3>
        <p class="text-body-1 text-grey-lighten-2 mb-4">
          Le produit demandé n'existe pas ou a été supprimé.
        </p>
        <v-btn color="primary" to="/admin/product">
          Retour à la liste
        </v-btn>
      </v-card>
    </v-container>

    <!-- Edit Dialog -->
    <v-dialog v-model="dialog" persistent max-width="800px">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white pa-4">
          <v-icon class="mr-2">mdi-pencil</v-icon>
          Modifier le produit
        </v-card-title>
        <form @submit.prevent="updateProduct(productStore.currentProduct?.id)">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="name"
                  label="Nom du produit"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-tag"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="description"
                  label="Description"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-text"
                  rows="3"
                  required
                ></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="poid"
                  label="Poids (g)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-weight"
                  suffix="g"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="price"
                  label="Prix (Ar)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-currency-usd"
                  suffix="Ar"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="image"
                  label="Image du produit"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-camera"
                  accept="image/*"
                  show-size
                  clearable
                  @change="uploadImage"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              variant="text"
              @click="dialog = false"
            >
              Annuler
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              type="submit"
              :loading="productStore.loading"
            >
              Enregistrer
            </v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="confirmDelete" persistent max-width="500px">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white pa-4">
          <v-icon class="mr-2">mdi-delete</v-icon>
          Confirmer la suppression
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1">
            Êtes-vous sûr de vouloir supprimer le produit 
            <strong>{{ productStore.currentProduct?.name }}</strong> ?
          </p>
          <p class="text-body-2 text-error mt-2">
            Cette action est irréversible !
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="confirmDelete = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteProduct"
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
import { ref, reactive, watch, onMounted } from 'vue'
import { useProductStore } from '../../../store/AdminStore/ProductStore'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const dialog = ref(false)
const confirmDelete = ref(false)

// Utiliser des refs pour les champs du formulaire
const name = ref('')
const description = ref('')
const poid = ref(0)
const price = ref(0)
const image = ref<File | null>(null)
const sary = ref<File | null>(null)

// Load product data when component mounts or route changes
const loadProduct = () => {
  const productId = Number(route.params.id)
  if (productStore.currentProduct?.id !== productId) {
    productStore.loading = true
    productStore.currentProduct = null
    productStore.showProduct(productId)
  }
}

// Watch for changes in product data
watch(
  [() => productStore.message, () => productStore.alert, () => productStore.currentProduct],
  ([newMessage, newAlert, newProduct]) => {
    if (newMessage !== '' && newAlert) {
      setTimeout(() => {
        productStore.message = ''
        productStore.alert = false
      }, 5000)
    }
    if (newProduct) {
      // Mettre à jour les valeurs du formulaire quand le produit est chargé
      name.value = newProduct.name
      description.value = newProduct.description
      price.value = newProduct.price
      poid.value = newProduct.poid
    }
  }
)

// Watch pour mettre à jour les valeurs quand on ouvre le dialog
watch(dialog, (newValue) => {
  if (newValue && productStore.currentProduct) {
    // Réinitialiser les valeurs du formulaire à chaque ouverture du dialog
    name.value = productStore.currentProduct.name
    description.value = productStore.currentProduct.description
    price.value = productStore.currentProduct.price
    poid.value = productStore.currentProduct.poid
    image.value = null
    sary.value = null
  }
})

const uploadImage = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    sary.value = target.files[0]
  }
}

const updateProduct = async (id: number | undefined) => {
  if (!id) return
  
  dialog.value = false
  const formData = new FormData()
  
  if (sary.value) {
    formData.append('image', sary.value)
  }
  
  await productStore.updateProduct(id, {
    name: name.value,
    description: description.value,
    poid: Number(poid.value),
    price: Number(price.value)
  }, formData)
  
  image.value = null
  sary.value = null
}

const deleteProduct = async () => {
  if (!productStore.currentProduct?.id) return
  
  await productStore.deleteProduct(productStore.currentProduct.id)
  confirmDelete.value = false
  router.push('/admin/product')
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR').format(price)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-show {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.loading-card {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.image-placeholder {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.v-breadcrumbs a {
  color: inherit;
  text-decoration: none;
}

.v-breadcrumbs a:hover {
  color: rgb(var(--v-theme-primary));
}
</style>
