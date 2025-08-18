<template>
  <v-container class="py-8">
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap">
      <h1 class="mb-2">Produits</h1>
      <div class="d-flex align-center" style="gap: 12px;">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          item-title="label"
          item-value="value"
          density="comfortable"
          variant="outlined"
          hide-details
          label="Trier"
          style="min-width: 220px;"
        />
      </div>
    </div>

    <div class="d-flex flex-wrap gap-2 mb-4" v-if="hasActiveFilters">
      <v-chip color="primary" variant="tonal" v-if="searchQuery" closable @click:close="removeFilter('search')">
        <v-icon start size="small">mdi-magnify</v-icon>
        {{ searchQuery }}
      </v-chip>
      <v-chip color="secondary" variant="tonal" v-if="selectedProductTypeId !== null" closable @click:close="removeFilter('type')">
        <v-icon start size="small">mdi-tag</v-icon>
        {{ selectedProductTypeName }}
      </v-chip>
      <v-chip color="deep-purple-accent-4" variant="tonal" v-if="!isFullPriceRange" closable @click:close="removeFilter('price')">
        <v-icon start size="small">mdi-currency-usd</v-icon>
        {{ priceRange[0] }} - {{ priceRange[1] }} MGA
      </v-chip>
      <v-btn size="small" variant="text" @click="clearFilters">
        Réinitialiser
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="Rechercher des produits..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          @input="onSearchInput"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="3">
        <div class="sticky-sidebar">
          <v-card class="mb-4">
            <v-card-title class="text-h6">
              <v-icon start>mdi-currency-usd</v-icon>
              Prix
            </v-card-title>
            <v-divider />
            <v-card-text>
              <v-range-slider
                v-model="priceRange"
                :min="priceMinLimit"
                :max="priceMaxLimit"
                :step="priceStep"
                thumb-label
                @update:modelValue="onPriceChange"
              />
              <div class="d-flex justify-space-between">
                <div class="text-caption">Min: {{ priceRange[0] }}</div>
                <div class="text-caption">Max: {{ priceRange[1] }}</div>
              </div>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title class="text-h6">
              <v-icon start>mdi-shape</v-icon>
              Catégories
            </v-card-title>
            <v-divider />
            <v-list>
              <v-list-item
                :class="{ 'bg-primary': selectedProductTypeId === null }"
                @click="filterByProductType(null)"
                style="cursor: pointer;"
              >
                <v-list-item-title>
                  <v-icon start>mdi-view-grid</v-icon>
                  Tous les produits
                </v-list-item-title>
                <template #append>
                  <v-chip size="small" color="primary">
                    {{ totalProductsCount }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item
                v-for="productType in productTypes"
                :key="productType.id"
                :class="{ 'bg-primary': selectedProductTypeId === productType.id }"
                @click="filterByProductType(productType.id)"
                style="cursor: pointer;"
              >
                <v-list-item-title>
                  <v-icon start>mdi-tag</v-icon>
                  {{ productType.name }}
                </v-list-item-title>
                <template #append>
                  <v-chip size="small" color="secondary">
                    {{ productType.active_produits_count ?? productType.produits_count ?? 0 }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </div>
      </v-col>

      <v-col cols="12" md="9">
        <v-row v-if="loading" class="product-list">
          <v-col cols="12" sm="6" md="4" lg="3" v-for="n in 8" :key="n">
            <v-card class="mx-auto my-6" max-width="374">
              <v-skeleton-loader type="image, text, text" />
            </v-card>
          </v-col>
        </v-row>

        <v-card v-else-if="!sortedProducts || sortedProducts.length === 0" class="mb-6 pa-8 text-center" variant="tonal">
          <v-icon size="48" color="deep-purple-accent-4">mdi-package-variant</v-icon>
          <div class="text-h6 mt-2">Aucun produit trouvé</div>
          <div class="text-body-2 mb-4">Essayez d'ajuster les filtres ou la recherche.</div>
          <v-btn color="deep-purple-accent-4" variant="flat" @click="clearFilters">Réinitialiser les filtres</v-btn>
        </v-card>

        <v-row v-else class="product-list">
          <v-col cols="12" sm="6" md="4" lg="3" v-for="(product, index) in sortedProducts" :key="index">
            <div v-if="product">
              <v-card class="mx-auto my-6 product-card" max-width="374" hover @click="goToProductDetail(product.id)">
                <template #loader="{ isActive }">
                  <v-progress-linear :active="isActive" color="deep-purple" height="4" indeterminate />
                </template>
                <v-img cover height="220" :src="`${config.STORAGE_BASE_URL}/produits/${product.image}`" />
                <v-card-item>
                  <v-card-title class="text-truncate-2">{{ product.name }}</v-card-title>
                </v-card-item>
                <v-card-text>
                  <v-row align="center" class="mx-0">
                    <v-rating :model-value="Number(product.rating) || 0" color="amber" density="compact" half-increments readonly size="small" />
                    <div class="text-grey ms-4 d-flex align-center" style="gap: 4px;">
                      {{ Number(product.rating || 0).toFixed(1) }}
                      <v-chip size="x-small" color="error" variant="tonal" class="ms-1">
                        <v-icon start color="error" icon="mdi-comment-multiple-outline" size="x-small" />
                        {{ product.comments_count !== undefined ? product.comments_count : 0 }}
                      </v-chip>
                    </div>
                  </v-row>
                  <div class="my-3 text-subtitle-1 font-weight-medium">{{ formatPriceMGA(product.price) }}</div>
                  <div class="text-body-2 text-truncate-2">{{ product.description }}</div>
                </v-card-text>
              </v-card>
            </div>
          </v-col>
        </v-row>

        <div class="d-flex justify-center mt-6" v-if="pagination.last_page > 1">
          <v-pagination
            v-model="currentPage"
            :length="pagination.last_page"
            :total-visible="7"
            @update:modelValue="loadProducts"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePublicProductStore } from '../../store/PublicProductStore'
import { useProductStore as useChallengerProductStore } from '../../store/ChallengerStore/ProductStore'
import { APP_CONFIG } from '../../config/constants'

const props = defineProps<{ source: 'public' | 'challenger' }>()

const router = useRouter()
const config = APP_CONFIG
const currentPage = ref(1)
const searchQuery = ref('')
const selectedProductTypeId = ref<number | null>(null)
const sortBy = ref<'popularity' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('popularity')
const sortOptions = [
  { label: 'Populaires', value: 'popularity' },
  { label: 'Prix: croissant', value: 'price-asc' },
  { label: 'Prix: décroissant', value: 'price-desc' },
  { label: 'Nom: A → Z', value: 'name-asc' },
  { label: 'Nom: Z → A', value: 'name-desc' },
]

const priceMinLimit = 0
const priceMaxLimit = 150000
const priceStep = 5000
const priceRange = ref<[number, number]>([priceMinLimit, priceMaxLimit])

const isFullPriceRange = computed(() => priceRange.value[0] === priceMinLimit && priceRange.value[1] === priceMaxLimit)

const store = props.source === 'public' ? usePublicProductStore() : useChallengerProductStore()

const productTypes = computed(() => (store as any).productTypes || [])
const totalProductsCount = computed(() => (store as any).totalProductsCount || 0)
const loading = computed(() => (store as any).loading)
const pagination = computed(() => (store as any).pagination)

const selectedProductTypeName = computed(() => {
  if (selectedProductTypeId.value === null) return 'Tous les produits'
  const found = productTypes.value.find((t: any) => t.id === selectedProductTypeId.value)
  return found ? found.name : 'Catégorie'
})

const hasActiveFilters = computed(() => !!searchQuery.value || selectedProductTypeId.value !== null || !isFullPriceRange.value)

const sortedProducts = computed(() => {
  const list = ((store as any).products || []).slice()
  switch (sortBy.value) {
    case 'price-asc':
      return list.sort((a: any, b: any) => Number(a.price || 0) - Number(b.price || 0))
    case 'price-desc':
      return list.sort((a: any, b: any) => Number(b.price || 0) - Number(a.price || 0))
    case 'name-asc':
      return list.sort((a: any, b: any) => String(a.name || '').localeCompare(String(b.name || '')))
    case 'name-desc':
      return list.sort((a: any, b: any) => String(b.name || '').localeCompare(String(a.name || '')))
    case 'popularity':
    default:
      return list.sort((a: any, b: any) => {
        const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0)
        if (ratingDiff !== 0) return ratingDiff
        return Number((b.comments_count ?? 0)) - Number((a.comments_count ?? 0))
      })
  }
})

const loadTypes = async () => {
  if (props.source === 'public' && (store as any).getProductTypes) {
    await (store as any).getProductTypes()
  } else {
    // challenger types are returned by getProducts; nothing to do
  }
}

const loadProducts = (page = 1) => {
  currentPage.value = page
  if (props.source === 'public') {
    ;(store as any).getProducts(page, searchQuery.value, selectedProductTypeId.value, priceRange.value[0], priceRange.value[1], sortBy.value, 10)
  } else {
    ;(store as any).getProducts(page, searchQuery.value, selectedProductTypeId.value, priceRange.value[0], priceRange.value[1])
  }
}

const onSearchInput = () => {
  ;(onSearchInput as any)._t && clearTimeout((onSearchInput as any)._t)
  ;(onSearchInput as any)._t = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 500)
}

const onPriceChange = () => {
  ;(onPriceChange as any)._t && clearTimeout((onPriceChange as any)._t)
  ;(onPriceChange as any)._t = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 400)
}

const filterByProductType = (productTypeId: number | null) => {
  selectedProductTypeId.value = productTypeId
  currentPage.value = 1
  loadProducts()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedProductTypeId.value = null
  priceRange.value = [priceMinLimit, priceMaxLimit]
  currentPage.value = 1
  loadProducts()
}

const removeFilter = (which: 'search' | 'type' | 'price') => {
  if (which === 'search') searchQuery.value = ''
  if (which === 'type') selectedProductTypeId.value = null
  if (which === 'price') priceRange.value = [priceMinLimit, priceMaxLimit]
  currentPage.value = 1
  loadProducts()
}

const formatPriceMGA = (amount: number | string) => {
  const value = Number(amount || 0)
  try {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value)
  } catch (e) {
    return `MGA ${value.toLocaleString('fr-FR')}`
  }
}

const goToProductDetail = (productId: number) => {
  const routeName = props.source === 'public' ? 'publicProduitShow' : 'challengerProduitShow'
  router.push({ name: routeName, params: { id: productId } })
}

watch(
  [() => (store as any).message, () => (store as any).alert],
  ([newMessage, newAlert]) => {
    if (newMessage !== '' && newAlert) {
      loadProducts()
      setTimeout(() => {
        ;(store as any).message = ''
        ;(store as any).alert = false
      }, 5000)
    }
  }
)

onMounted(async () => {
  await loadTypes()
  loadProducts()
})
</script>

<script lang="ts">
export default { name: 'ProductList' }
</script>

<style scoped>
.sticky-sidebar { position: sticky; top: 88px; }
.product-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
.product-card:hover { transform: translateY(-2px); }
.text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style> 