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
      <h1>Product</h1>
      
      <!-- Search bar -->
      <v-row class="mb-4" justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-text-field
            v-model="searchQuery"
            label="Rechercher des produits..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            @input="onSearchInput"
          ></v-text-field>
        </v-col>
      </v-row>
 
      <v-row>
        <!-- Sidebar with product types -->
        <v-col cols="12" md="2">
          <div class="sticky-sidebar">
            <v-card class="mb-4 sidebar-card">
              <v-card-title class="text-h6 sticky-title">
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

            <!-- Price filter -->
            <v-card class="mb-4 sidebar-card">
              <v-card-title class="text-h6 sticky-title">
                <v-icon start>mdi-currency-usd</v-icon>
                Prix
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <div class="d-flex justify-space-between mb-2 text-caption">
                  <span>{{ displayCurrency(priceRange[0]) }}</span>
                  <span>{{ displayCurrency(priceRange[1]) }}</span>
                </div>
                <v-range-slider
                  v-model="priceRange"
                  :min="priceMin"
                  :max="priceMax"
                  :step="priceStep"
                  thumb-label
                  @update:modelValue="onPriceChange"
                ></v-range-slider>
                <div class="d-flex justify-space-between mt-2 text-caption">
                  <span>{{ displayCurrency(priceMin) }}</span>
                  <span>{{ displayCurrency(priceMax) }}</span>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
 
        <!-- Product list -->
        <v-col cols="12" md="10">
          <!-- Debug info -->
          <v-card v-if="!productStore.products || productStore.products.length === 0" class="mb-4 pa-4">
            <v-card-title>Debug Info</v-card-title>
            <v-card-text>
              <p><strong>Loading:</strong> {{ productStore.loading }}</p>
              <p><strong>Loading Product:</strong> {{ productStore.loadingProduct }}</p>
              <p><strong>User authenticated:</strong> {{ !!authStore.userAuth }}</p>
              <p><strong>User:</strong> {{ authStore.userAuth ? authStore.userAuth.name : 'Non connecté' }}</p>
              <p><strong>Products count:</strong> {{ productStore.products ? productStore.products.length : 'undefined' }}</p>
              <p><strong>Alert:</strong> {{ productStore.alert }}</p>
              <p><strong>Message:</strong> {{ productStore.message }}</p>
            </v-card-text>
          </v-card>
          
          <v-row class="product-list">
        <v-col cols="12" sm="6" md="4" v-for="(product, index) in productStore.products" :key="index">
          <div v-if="product">
            <v-hover v-slot="{ isHovering, props }">
              <v-card class="mx-auto my-12" max-width="374" v-bind="props">
                <template v-slot:loader="{ isActive }">
                  <v-progress-linear
                    :active="isActive"
                    color="deep-purple"
                    height="4"
                    indeterminate
                  ></v-progress-linear>
                </template>
                <v-img cover height="375" :src="`${appConfig.STORAGE_BASE_URL}/produits/${product.image}`">
                  <v-expand-transition>
                    <div
                      v-if="isHovering"
                      class="d-flex transition-fast-in-fast-out bg-primary text-white v-card--reveal text-h5"
                      style="height: 100%;"
                    >
                      MGA • {{ product.price }}
                    </div>
                  </v-expand-transition>
                </v-img>
                <v-card-item>
                  <v-card-title>{{product.name}}</v-card-title>
                  <v-card-subtitle>
                    <span class="me-1">{{product.poid}} g</span>
                    <v-icon color="error" icon="mdi-fire-circle" size="small"></v-icon>
                  </v-card-subtitle>
                </v-card-item>
                <v-card-text>
                  <v-row align="center" class="mx-0">
                    <v-rating :model-value="Number(product.rating) || 0" color="amber" density="compact" half-increments readonly size="small"></v-rating>
                    <div class="text-grey ms-3">
                      {{ Number(product.rating) ? product.rating : 0 }}
                      <span v-if="product.advices && product.advices.length"> ({{ product.advices.length }})</span>
                    </div>
                  </v-row>
                  <div class="my-4 text-subtitle-1">MGA • {{product.price}}</div>
                  <div>{{product.description}}</div>
                </v-card-text>
                <v-card-actions>
                  <v-btn 
                    color="primary" 
                    @click="goToProductDetail(product.id)"
                    :loading="productStore.loadingProduct"
                    :disabled="productStore.loadingProduct"
                  >
                    Explorer
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-hover>
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
 import { defineComponent, ref, watch, onMounted } from 'vue';
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
     const priceMin = ref(0);
     const priceMax = ref(100000); // valeur plafond par défaut, à ajuster selon vos données
     const priceStep = ref(1000);
     const priceRange = ref<[number, number]>([priceMin.value, priceMax.value]);
     const productStore = useProductStore();
     const authStore = useAuthStore();
     const appConfig = APP_CONFIG;
     
     let searchTimeout: number | null = null;
     let priceTimeout: number | null = null;
 
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
         priceRange.value[1],
         12,
         true
       );
     };
 
     const onSearchInput = () => {
       if (searchTimeout) {
         clearTimeout(searchTimeout);
       }
       searchTimeout = setTimeout(() => {
         currentPage.value = 1; // Reset to first page when searching
         productStore.getProducts(
          1,
          searchQuery.value,
          selectedProductTypeId.value,
          priceRange.value[0],
          priceRange.value[1],
          12,
          false
        );
       }, 500); // Debounce search for 500ms
     };
 
     const filterByProductType = (productTypeId: number | null) => {
       selectedProductTypeId.value = productTypeId;
       currentPage.value = 1; // Reset to first page when filtering
       productStore.getProducts(
        1,
        searchQuery.value,
        selectedProductTypeId.value,
        priceRange.value[0],
        priceRange.value[1],
        12,
        false
      );
     };
 
     const onPriceChange = () => {
       if (priceTimeout) {
         clearTimeout(priceTimeout);
       }
       priceTimeout = setTimeout(() => {
         currentPage.value = 1;
         productStore.getProducts(
          1,
          searchQuery.value,
          selectedProductTypeId.value,
          priceRange.value[0],
          priceRange.value[1],
          12,
          false
        );
       }, 400);
     };

     const displayCurrency = (value: number) => `MGA ${value.toLocaleString()}`;
 
     const goToProductDetail = (productId: number) => {
       // Naviguer vers la page de détail du produit
       router.push({ name: 'challengerProduitShow', params: { id: productId } });
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
 
     // Initialize price bounds once from loaded products
     let didInitPriceBounds = false;
     watch(
       () => productStore.products,
       (list) => {
         if (!didInitPriceBounds && list && list.length) {
           const prices = list
             .map((p: any) => Number(p.price))
             .filter((n: number) => !Number.isNaN(n));
           if (prices.length) {
             priceMin.value = Math.min(...prices);
             priceMax.value = Math.max(...prices);
             priceRange.value = [priceMin.value, priceMax.value];
             didInitPriceBounds = true;
           }
         }
       },
       { deep: false }
     );

     return { 
       currentPage,
       searchQuery,
       selectedProductTypeId,
       priceMin,
       priceMax,
       priceStep,
       priceRange,
       productStore, 
       authStore,
       loadProducts,
       onSearchInput,
       filterByProductType,
       onPriceChange,
       displayCurrency,
       goToProductDetail,
       appConfig
     };
   },
 });
 </script>
 
 <style>
   .v-card--reveal {
     align-items: center;
     bottom: 0;
     justify-content: center;
     opacity: .9;
     position: absolute;
     width: 100%;
   }
   .sticky-sidebar {
     position: sticky;
     top: 16px;
     z-index: 1;
     max-height: calc(100vh - 32px);
     overflow: auto;
   }
   .sticky-title {
     position: sticky;
     top: 0;
     z-index: 2;
     background: white;
   }
   .sidebar-card {
     overflow: visible;
   }
 </style>
