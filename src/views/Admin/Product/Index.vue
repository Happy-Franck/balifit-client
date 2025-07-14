<template>
  <div class="product-admin">
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Gestion des Produits</h1>
      <v-btn color="primary" size="large" @click="$router.push('/admin/product/create')">
        <v-icon start>mdi-plus</v-icon>
        Nouveau Produit
      </v-btn>
    </div>

    <!-- Barre de recherche -->
    <v-row align="center">
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          label="Rechercher un produit..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          @update:modelValue="onSearchInput"
          @click:clear="clearSearch"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Indicateur de résultats -->
    <div class="d-flex justify-space-between align-center mb-3">
      <div class="text-body-2 text-grey-darken-1">
        <span v-if="searchQuery">
          {{ productStore.pagination.total }} résultat(s) trouvé(s) pour "{{ searchQuery }}"
        </span>
        <span v-else>
          {{ productStore.pagination.total }} produit(s) au total
        </span>
      </div>
      <div class="text-body-2 text-grey-darken-1">
        Page {{ productStore.pagination.current_page }} sur {{ productStore.pagination.last_page }}
      </div>
    </div>

    <!-- Alert messages -->
    <v-alert
      v-if="productStore.alert"
      :text="productStore.message"
      color="success"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="productStore.alert = false"
    ></v-alert>

    <!-- Data table -->
    <div class="products-table-container">
      <div class="products-table">
        <div class="table-header">
          <div class="col-id">
            <v-btn 
              variant="text" 
              size="small" 
              @click="setSortBy('id')"
              class="sort-btn"
            >
              ID
              <v-icon v-if="sortBy === 'id'" size="small" class="ml-1">
                {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
            </v-btn>
          </div>
          <div class="col-image">Image</div>
          <div class="col-name">
            <v-btn 
              variant="text" 
              size="small" 
              @click="setSortBy('name')"
              class="sort-btn"
            >
              Nom
              <v-icon v-if="sortBy === 'name'" size="small" class="ml-1">
                {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
            </v-btn>
          </div>
          <div class="col-type">
            <v-btn 
              variant="text" 
              size="small" 
              @click="setSortBy('product_type_id')"
              class="sort-btn"
            >
              Type
              <v-icon v-if="sortBy === 'product_type_id'" size="small" class="ml-1">
                {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
            </v-btn>
          </div>
          <div class="col-description">Description</div>
          <div class="col-stock">
            <v-btn 
              variant="text" 
              size="small" 
              @click="setSortBy('stock_quantity')"
              class="sort-btn"
            >
              Stock
              <v-icon v-if="sortBy === 'stock_quantity'" size="small" class="ml-1">
                {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
            </v-btn>
          </div>
          <div class="col-status">
            <v-btn 
              variant="text" 
              size="small" 
              @click="setSortBy('is_active')"
              class="sort-btn"
            >
              Statut
              <v-icon v-if="sortBy === 'is_active'" size="small" class="ml-1">
                {{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
            </v-btn>
          </div>
          <div class="col-actions">Actions</div>
        </div>

        <div 
          v-for="product in productStore.products" 
          :key="product.id"
          class="table-row"
          @click="viewProduct(product.id)"
        >
          <div class="col-id">
            <span class="product-id">#{{ product.id }}</span>
          </div>

          <div class="col-image" @click.stop>
            <div class="image-preview" v-if="product.image">
              <v-img
                :src="`http://localhost:8000/storage/produits/${product.image}`"
                :alt="product.name"
                width="50"
                height="50"
                cover
                class="rounded"
                @error="onImageError"
              ></v-img>
            </div>
          </div>
          
          <div class="col-name">
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">{{ formatPrice(product.price) }} Ar</div>
              <div v-if="product.has_variants" class="product-variants">
                <div class="d-flex flex-wrap gap-1 mt-1">
                  <v-chip
                    color="info"
                    variant="tonal"
                    size="x-small"
                  >
                    <v-icon start size="12">mdi-tune</v-icon>
                    {{ product.variants_count }} variante(s)
                  </v-chip>
                  <v-chip
                    v-if="product.price_range"
                    color="success"
                    variant="tonal"
                    size="x-small"
                  >
                    <v-icon start size="12">mdi-currency-usd</v-icon>
                    {{ formatPrice(product.price_range.min) }} - {{ formatPrice(product.price_range.max) }} Ar
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-type">
            <v-chip
              v-if="product.product_type"
              :color="getTypeColor(product.product_type.slug)"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              {{ product.product_type.name }}
            </v-chip>
            <span v-else class="text-medium-emphasis">Non défini</span>
          </div>
          
          <div class="col-description">
            <div class="description-text">
              {{ product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description }}
            </div>
          </div>
          
          <div class="col-stock">
            <div class="d-flex flex-column gap-1">
              <v-chip
                :color="getStockColor(product.stock_quantity)"
                size="small"
                variant="flat"
                class="stock-chip"
              >
                <v-icon start size="14">{{ getStockIcon(product.stock_quantity) }}</v-icon>
                {{ product.stock_quantity }}
              </v-chip>
              <div v-if="product.has_variants" class="text-caption text-center">
                <v-tooltip text="Stock total de toutes les variantes">
                  <template v-slot:activator="{ props }">
                    <span v-bind="props" class="text-info">
                      {{ product.total_stock }} total
                    </span>
                  </template>
                </v-tooltip>
              </div>
            </div>
          </div>
          
          <div class="col-status" @click.stop>
            <v-switch
              :model-value="product.is_active"
              @update:model-value="toggleStatus(product.id)"
              color="success"
              size="small"
              density="compact"
              hide-details
              :loading="productStore.loading"
            ></v-switch>
          </div>
          
          <div class="col-actions" @click.stop>
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              variant="text"
              @click="viewProduct(product.id)"
            ></v-btn>
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="warning"
              variant="text"
              @click="editProduct(product.id)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="text"
              @click="confirmDelete(product)"
            ></v-btn>
          </div>
        </div>
      </div>

      <!-- Loading overlay -->
      <v-overlay v-if="productStore.loading" contained class="d-flex align-center justify-center">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>

      <!-- Empty state -->
      <div v-if="!productStore.loading && productStore.products.length === 0" class="empty-state">
        <v-icon size="80" color="grey-lighten-2">mdi-package-variant-closed</v-icon>
        <h3 class="text-h6 text-grey-lighten-2 mt-4">Aucun produit trouvé</h3>
        <p class="text-body-2 text-grey-lighten-2 mb-4">
          {{ searchQuery ? 'Aucun produit ne correspond à votre recherche.' : 'Commencez par créer votre premier produit.' }}
        </p>
        <v-btn v-if="!searchQuery" color="primary" @click="$router.push('/admin/product/create')">
          Créer un produit
        </v-btn>
      </div>

      <!-- Pagination -->
      <div class="table-pagination" v-if="productStore.pagination.last_page > 1">
        <v-pagination
          v-model="currentPage"
          :length="productStore.pagination.last_page"
          :total-visible="7"
          @update:modelValue="loadProducts"
        ></v-pagination>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 bg-error text-white pa-4">
          <v-icon start>mdi-delete</v-icon>
          Confirmer la suppression
        </v-card-title>
        <v-card-text class="pa-6">
          <p>Êtes-vous sûr de vouloir supprimer le produit 
          <strong>{{ itemToDelete?.name }}</strong> ?</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Cette action est irréversible.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Annuler
          </v-btn>
          <v-btn color="error" variant="elevated" @click="deleteProduct">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useProductStore } from '../../../store/AdminStore/ProductStore'
import { useRouter } from 'vue-router'

const productStore = useProductStore()
const router = useRouter()

// Configuration
const baseURL = 'http://localhost:8000'

// Reactive data
const deleteDialog = ref(false)
const itemToDelete = ref(null)
const currentPage = ref(1)
const searchQuery = ref('')
const sortBy = ref('id')
const sortOrder = ref('desc')
let searchTimeout: number | null = null

// Methods
const loadProducts = (page = 1) => {
  currentPage.value = page
  productStore.getProducts(page, searchQuery.value, sortBy.value, sortOrder.value)
}

const viewProduct = (id: number) => {
  router.push(`/admin/product/${id}`)
}

const editProduct = (id: number) => {
  router.push(`/admin/product/${id}/edit`)
}

const confirmDelete = (product: any) => {
  itemToDelete.value = product
  deleteDialog.value = true
}

const deleteProduct = async () => {
  if (itemToDelete.value) {
    try {
      await productStore.deleteProduct(itemToDelete.value.id)
      deleteDialog.value = false
      loadProducts(currentPage.value)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const toggleStatus = async (id: number) => {
  try {
    await productStore.toggleProductStatus(id)
    loadProducts(currentPage.value)
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
  }
}

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadProducts(1)
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadProducts(1)
}

// Watch for search query changes
watch(searchQuery, () => {
  onSearchInput()
})

const setSortBy = (newSortBy: string) => {
  if (sortBy.value === newSortBy) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = newSortBy
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
  loadProducts(1)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR').format(price)
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

const getStockColor = (stock: number) => {
  if (stock === 0) return 'error'
  if (stock < 10) return 'warning'
  return 'success'
}

const getStockIcon = (stock: number) => {
  if (stock === 0) return 'mdi-alert-circle'
  if (stock < 10) return 'mdi-alert'
  return 'mdi-check-circle'
}

const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  return `${baseURL}/storage/images/produits/${imagePath}`
}

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target && target.style) {
    target.style.display = 'none'
  }
}

// Lifecycle
onMounted(() => {
  loadProducts()
  productStore.getProductTypes()
})
</script>

<style scoped>
.product-admin {
  padding: 20px;
}

/* Table Container */
.products-table-container {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  position: relative;
}

/* Table Styles */
.products-table {
  position: relative;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 80px 200px 200px 250px 100px 80px 120px;
  gap: 16px;
  padding: 12px 16px;
  background: rgb(var(--v-theme-surface-variant));
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.table-row {
  display: grid;
  grid-template-columns: 60px 80px 200px 200px 250px 100px 80px 120px;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: rgb(var(--v-theme-surface-variant));
}

.table-row:last-child {
  border-bottom: none;
}

/* Column Styles */
.col-id,
.col-image,
.col-name,
.col-type,
.col-description,
.col-stock,
.col-status,
.col-actions {
  display: flex;
  align-items: center;
}

.col-actions {
  gap: 4px;
}

/* Sort Buttons */
.sort-btn {
  padding: 0 !important;
  min-width: auto !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface)) !important;
}

/* Data Styles */
.product-id {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.image-preview {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgb(var(--v-theme-outline-variant));
  background: rgb(var(--v-theme-surface-variant));
}

.product-info {
  min-width: 0;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.product-price {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-success));
  font-weight: 600;
}

.product-variants {
  margin-top: 4px;
}

.description-text {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.4;
}

.stock-chip {
  font-size: 0.75rem;
  height: 24px;
  min-width: 60px;
  justify-content: center;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

/* Pagination */
.table-pagination {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
}

/* Responsive */
@media (max-width: 768px) {
  .product-admin {
    padding: 8px;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .col-id,
  .col-image,
  .col-name,
  .col-type,
  .col-description,
  .col-stock,
  .col-status,
  .col-actions {
    justify-content: flex-start;
  }
}
</style>
