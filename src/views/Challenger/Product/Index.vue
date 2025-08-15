<template>
  <div class="product">
    <v-card class="mx-auto mt-6" width="344">
      <v-progress-linear
        :active="productStore.loading"
        :indeterminate="productStore.loading"
        bottom
        color="deep-purple-accent-4"
      ></v-progress-linear>
    </v-card>
    <v-alert
      border="start"
      variant="tonal"
      close-label="Close Alert"
      color="deep-purple-accent-4"
      v-if="productStore.alert"
      closable
      :text="productStore.message"
    ></v-alert>
    <v-container>
      <div class="d-flex align-center justify-space-between mb-4 flex-wrap">
        <h1 class="mb-2">Product</h1>
        <div class="d-flex align-center gap-3" style="gap: 12px;">
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
          ></v-select>
        </div>
      </div>

      <!-- Active filters chips -->
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
      
      <!-- Search bar -->
      <v-row class="mb-4">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="searchQuery"
            label="Rechercher des produits..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            clearable
            @input="onSearchInput"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <!-- Sidebar with product types -->
        <v-col cols="12" md="3">
          <div class="sticky-sidebar">
            <!-- Price range filter -->
            <v-card class="mb-4">
              <v-card-title class="text-h6">
                <v-icon start>mdi-currency-usd</v-icon>
                Prix
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-range-slider
                  v-model="priceRange"
                  :min="priceMinLimit"
                  :max="priceMaxLimit"
                  :step="priceStep"
                  thumb-label
                  @update:modelValue="onPriceChange"
                ></v-range-slider>
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
              <v-divider></v-divider>
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
                  <template v-slot:append>
                    <v-chip size="small" color="primary">
                      {{ productStore.totalProductsCount }}
                    </v-chip>
                  </template>
                </v-list-item>
                <v-list-item
                  v-for="productType in productStore.productTypes"
                  :key="productType.id"
                  :class="{ 'bg-primary': selectedProductTypeId === productType.id }"
                  @click="filterByProductType(productType.id)"
                  style="cursor: pointer;"
                >
                  <v-list-item-title>
                    <v-icon start>mdi-tag</v-icon>
                    {{ productType.name }}
                  </v-list-item-title>
                  <template v-slot:append>
                    <v-chip size="small" color="secondary">
                      {{ productType.produits_count }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-col>

        <!-- Product list -->
        <v-col cols="12" md="9">
          <!-- Loading skeleton -->
          <v-row v-if="productStore.loading" class="product-list">
            <v-col cols="12" sm="6" md="4" lg="3" v-for="n in 8" :key="n">
              <v-card class="mx-auto my-6" max-width="374">
                <v-skeleton-loader type="image, text, text"></v-skeleton-loader>
              </v-card>
            </v-col>
          </v-row>

          <!-- Empty state -->
          <v-card v-else-if="!sortedProducts || sortedProducts.length === 0" class="mb-6 pa-8 text-center" variant="tonal">
            <v-icon size="48" color="deep-purple-accent-4">mdi-package-variant</v-icon>
            <div class="text-h6 mt-2">Aucun produit trouvé</div>
            <div class="text-body-2 mb-4">Essayez d'ajuster les filtres ou la recherche.</div>
            <v-btn color="deep-purple-accent-4" variant="flat" @click="clearFilters">Réinitialiser les filtres</v-btn>
          </v-card>

          <!-- Products grid -->
          <v-row v-else class="product-list">
            <v-col cols="12" sm="6" md="4" lg="3" v-for="(product, index) in sortedProducts" :key="index">
              <div v-if="product">
                <v-card class="mx-auto my-6 product-card" max-width="374" hover @click="goToProductDetail(product.id)">
                  <template v-slot:loader="{ isActive }">
                    <v-progress-linear
                      :active="isActive"
                      color="deep-purple"
                      height="4"
                      indeterminate
                    ></v-progress-linear>
                  </template>
                  <v-img cover height="220" :src="`${appConfig.STORAGE_BASE_URL}/produits/${product.image}`"></v-img>
                  <v-card-item>
                    <v-card-title class="text-truncate-2">{{ product.name }}</v-card-title>
                  </v-card-item>
                  <v-card-text>
                    <v-row align="center" class="mx-0">
                      <v-rating :model-value="Number(product.rating) || 0" color="amber" density="compact" half-increments readonly size="small"></v-rating>
                      <div class="text-grey ms-4 d-flex align-center gap-1">
                        {{ Number(product.rating || 0).toFixed(1) }}
                        <v-chip size="x-small" color="error" variant="tonal" class="ms-1">
                          <v-icon start color="error" icon="mdi-comment-multiple-outline" size="x-small"></v-icon>
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

          <!-- Pagination -->
          <div class="d-flex justify-center mt-6" v-if="productStore.pagination.last_page > 1">
            <v-pagination
              v-model="currentPage"
              :length="productStore.pagination.last_page"
              :total-visible="7"
              @update:modelValue="loadProducts"
            ></v-pagination>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '../../../store/ChallengerStore/ProductStore';
import { useAuthStore } from '../../../store/AuthStore';
import { APP_CONFIG } from '../../../config/constants';

export default defineComponent({
  setup() {
    const router = useRouter();
    const currentPage = ref(1);
    const searchQuery = ref('');
    const selectedProductTypeId = ref<number | null>(null);
    const productStore = useProductStore();
    const authStore = useAuthStore();
    const appConfig = APP_CONFIG;
    
    let searchTimeout: number | null = null;
    let priceTimeout: number | null = null;

    // Sorting
    const sortBy = ref<'popularity' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('popularity');
    const sortOptions = [
      { label: 'Populaires', value: 'popularity' },
      { label: 'Prix: croissant', value: 'price-asc' },
      { label: 'Prix: décroissant', value: 'price-desc' },
      { label: 'Nom: A → Z', value: 'name-asc' },
      { label: 'Nom: Z → A', value: 'name-desc' },
    ];

    // Price filter state
    const priceMinLimit = 0;
    const priceMaxLimit = 150000;
    const priceStep = 5000;
    const priceRange = ref<[number, number]>([priceMinLimit, priceMaxLimit]);

    const isFullPriceRange = computed(() => priceRange.value[0] === priceMinLimit && priceRange.value[1] === priceMaxLimit);

    const selectedProductTypeName = computed(() => {
      if (selectedProductTypeId.value === null) return 'Tous les produits';
      const found = productStore.productTypes.find((t: any) => t.id === selectedProductTypeId.value);
      return found ? found.name : 'Catégorie';
    });

    const hasActiveFilters = computed(() => {
      return !!searchQuery.value || selectedProductTypeId.value !== null || !isFullPriceRange.value;
    });

    const sortedProducts = computed(() => {
      const list = (productStore.products || []).slice();
      switch (sortBy.value) {
        case 'price-asc':
          return list.sort((a: any, b: any) => Number(a.price || 0) - Number(b.price || 0));
        case 'price-desc':
          return list.sort((a: any, b: any) => Number(b.price || 0) - Number(a.price || 0));
        case 'name-asc':
          return list.sort((a: any, b: any) => String(a.name || '').localeCompare(String(b.name || '')));
        case 'name-desc':
          return list.sort((a: any, b: any) => String(b.name || '').localeCompare(String(a.name || '')));
        case 'popularity':
        default:
          return list.sort((a: any, b: any) => {
            const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0);
            if (ratingDiff !== 0) return ratingDiff;
            return Number((b.comments_count ?? 0)) - Number((a.comments_count ?? 0));
          });
      }
    });

    // Debug authentication on component mount
    onMounted(() => {
      console.log('🔐 Auth Debug:');
      console.log('- User authenticated:', !!authStore.userAuth);
      console.log('- User data:', authStore.userAuth);
      console.log('- Token exists:', !!localStorage.getItem('token'));
    });

    const loadProducts = (page = 1) => {
      currentPage.value = page;
      productStore.getProducts(
        page,
        searchQuery.value,
        selectedProductTypeId.value,
        priceRange.value[0],
        priceRange.value[1]
      );
    };

    const onSearchInput = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      searchTimeout = setTimeout(() => {
        currentPage.value = 1; // Reset to first page when searching
        loadProducts();
      }, 500); // Debounce search for 500ms
    };

    const onPriceChange = () => {
      if (priceTimeout) {
        clearTimeout(priceTimeout);
      }
      priceTimeout = setTimeout(() => {
        currentPage.value = 1; // Reset to first page when filtering
        loadProducts();
      }, 400);
    };

    const filterByProductType = (productTypeId: number | null) => {
      selectedProductTypeId.value = productTypeId;
      currentPage.value = 1; // Reset to first page when filtering
      loadProducts();
    };

    const goToProductDetail = (productId: number) => {
      // Naviguer vers la page de détail du produit
      router.push({ name: 'challengerProduitShow', params: { id: productId } });
    };

    const clearFilters = () => {
      searchQuery.value = '';
      selectedProductTypeId.value = null;
      priceRange.value = [priceMinLimit, priceMaxLimit];
      currentPage.value = 1;
      loadProducts();
    };

    const removeFilter = (which: 'search' | 'type' | 'price') => {
      if (which === 'search') searchQuery.value = '';
      if (which === 'type') selectedProductTypeId.value = null;
      if (which === 'price') priceRange.value = [priceMinLimit, priceMaxLimit];
      currentPage.value = 1;
      loadProducts();
    };

    const formatPriceMGA = (amount: number | string) => {
      const value = Number(amount || 0);
      try {
        return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value);
      } catch (e) {
        return `MGA ${value.toLocaleString('fr-FR')}`;
      }
    };

    watch(
      [() => productStore.message, () => productStore.alert],
      ([newMessage, newAlert]) => {
        if (newMessage !== '' && newAlert) {
          loadProducts();
          setTimeout(() => {
            productStore.message = '';
            productStore.alert = false;
          }, 5000);
        }
      }
    );

    // Charger les produits au montage du composant
    loadProducts();

    return { 
      currentPage,
      searchQuery,
      selectedProductTypeId,
      productStore, 
      authStore,
      loadProducts,
      onSearchInput,
      filterByProductType,
      goToProductDetail,
      appConfig,
      // price filter
      priceRange,
      priceMinLimit,
      priceMaxLimit,
      priceStep,
      onPriceChange,
      // sorting
      sortBy,
      sortOptions,
      sortedProducts,
      // filters chips helpers
      selectedProductTypeName,
      hasActiveFilters,
      isFullPriceRange,
      clearFilters,
      removeFilter,
      // formatting
      formatPriceMGA,
    };
  },
});
</script>

<style scoped>
.sticky-sidebar {
  position: sticky;
  top: 88px;
}
.product-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.product-card:hover {
  transform: translateY(-2px);
}
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
