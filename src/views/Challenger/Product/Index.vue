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
        </v-col>

        <!-- Product list -->
        <v-col cols="12" md="9">
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
        <v-col cols="12" sm="3" v-for="(product, index) in productStore.products" :key="index">
          <div v-if="product">
            <v-card class="mx-auto my-12" max-width="374">
              <template v-slot:loader="{ isActive }">
                <v-progress-linear
                  :active="isActive"
                  color="deep-purple"
                  height="4"
                  indeterminate
                ></v-progress-linear>
              </template>
              <v-img cover height="375" :src="`${appConfig.STORAGE_BASE_URL}/produits/${product.image}`"></v-img>
              <v-card-item>
                <v-card-title>{{product.name}}</v-card-title>
                <v-card-subtitle>
                  <span class="me-1">{{product.poid}} g</span>
                  <v-icon color="error" icon="mdi-fire-circle" size="small"></v-icon>
                </v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <v-row align="center" class="mx-0">
                  <v-rating v-if="product.rating && product.advices && product.advices.length" :model-value="product.rating" color="amber" density="compact" half-increments readonly size="small"></v-rating>
                  <div v-if="product.rating && product.advices && product.advices.length" class="text-grey ms-4">{{product.rating}} ({{product.advices.length}}<v-icon color="error" icon="mdi-search-circle" size="small"></v-icon>)</div>
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
    const productStore = useProductStore();
    const authStore = useAuthStore();
    const appConfig = APP_CONFIG;
    
    let searchTimeout: number | null = null;

    // Debug authentication on component mount
    onMounted(() => {
      console.log('🔐 Auth Debug:');
      console.log('- User authenticated:', !!authStore.userAuth);
      console.log('- User data:', authStore.userAuth);
      console.log('- Token exists:', !!localStorage.getItem('token'));
    });

    const loadProducts = (page = 1) => {
      currentPage.value = page;
      productStore.getProducts(page, searchQuery.value, selectedProductTypeId.value);
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

    const filterByProductType = (productTypeId: number | null) => {
      selectedProductTypeId.value = productTypeId;
      currentPage.value = 1; // Reset to first page when filtering
      loadProducts();
    };

    const goToProductDetail = (productId: number) => {
      // Naviguer vers la page de détail du produit
      router.push({ name: 'challengerProduitShow', params: { id: productId } });
    };

    watch(
      [() => productStore.message, () => productStore.alert],
      ([newMessage, newAlert]) => {
        if (newMessage !== '' && newAlert) {
          productStore.getProducts();
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
      appConfig
    };
  },
});
</script>
