<template>
  <div class="product-edit">
    <v-container>
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
          Modifier {{ productStore.currentProduct?.name }}
        </v-breadcrumbs-item>
      </v-breadcrumbs>

      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4 font-weight-bold">Modifier le produit</h1>
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

      <!-- Edit Form -->
      <v-card class="pa-4">
        <form @submit.prevent="updateProduct">
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
            <v-col cols="12" sm="6">
              <v-select
                v-model="product_type_id"
                :items="productStore.activeProductTypes"
                item-title="name"
                item-value="id"
                label="Type de produit"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-shape"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-switch
                v-model="is_active"
                label="Produit actif"
                color="success"
                inset
                :true-value="true"
                :false-value="false"
              ></v-switch>
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
            <v-col cols="12" sm="4">
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
            <v-col cols="12" sm="4">
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
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="stock_quantity"
                label="Stock (unités)"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-package"
                suffix="unités"
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

          <div class="d-flex justify-end gap-2 mt-4">
            <v-btn
              color="error"
              variant="text"
              @click="$router.push('/admin/product')"
            >
              Annuler
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="productStore.loading"
            >
              Enregistrer
            </v-btn>
          </div>
        </form>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useProductStore } from '../../../store/AdminStore/ProductStore'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

// Form fields
const name = ref('')
const description = ref('')
const poid = ref(0)
const price = ref(0)
const image = ref<File | null>(null)
const sary = ref<File | null>(null)
const product_type_id = ref(0)
const is_active = ref(true)
const stock_quantity = ref(0)

// Methods
const loadProduct = async () => {
  const productId = Number(route.params.id)
  await productStore.showProduct(productId)
}

const uploadImage = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    sary.value = target.files[0]
  }
}

const updateProduct = async () => {
  if (!productStore.currentProduct?.id) return
  
  const formData = new FormData()
  if (sary.value) {
    formData.append('image', sary.value)
  }
  
  const productData = {
    name: name.value,
    description: description.value,
    poid: Number(poid.value),
    price: Number(price.value),
    product_type_id: Number(product_type_id.value),
    is_active: is_active.value,
    stock_quantity: Number(stock_quantity.value)
  }

  // Ajouter les données du produit au FormData
  Object.keys(productData).forEach(key => {
    formData.append(key, productData[key])
  })
  
  await productStore.updateProduct(productStore.currentProduct.id, productData, formData)
  
  router.push('/admin/product')
}

// Watch for product data changes
watch(() => productStore.currentProduct, (newProduct) => {
  if (newProduct) {
    name.value = newProduct.name
    description.value = newProduct.description
    price.value = newProduct.price
    poid.value = newProduct.poid
    product_type_id.value = newProduct.product_type_id || 0
    is_active.value = newProduct.is_active
    stock_quantity.value = newProduct.stock_quantity
  }
})

// Lifecycle
onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-edit {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.v-breadcrumbs a {
  color: inherit;
  text-decoration: none;
}

.v-breadcrumbs a:hover {
  color: rgb(var(--v-theme-primary));
}
</style> 