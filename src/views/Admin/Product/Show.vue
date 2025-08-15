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
        
        <!-- Header with actions -->
        <v-row class="mb-6">
          <v-col cols="12">
            <div class="d-flex justify-space-between align-center">
              
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="goToEditPage"
                  prepend-icon="mdi-pencil"
                >
                  Modifier
                </v-btn>
                <v-btn
                  color="error"
                  variant="elevated"
                  @click="deleteProduct"
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
          <v-col cols="12" md="5">
            <v-card class="product-image-card" elevation="3">
              <div class="text-center pa-6">
                <v-img
                  v-if="productStore.currentProduct.image"
                  :src="`${APP_CONFIG.STORAGE_BASE_URL}/produits/${productStore.currentProduct.image}`"
                  class="rounded-lg product-image"
                  height="auto"
                  cover
                ></v-img>
                <div v-else class="image-placeholder">
                  <v-icon size="120" color="grey-lighten-2">mdi-image-off</v-icon>
                  <p class="text-grey-lighten-2 mt-4 text-h6">Aucune image</p>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Product details -->
          <v-col cols="12" md="7">
            <v-card class="product-details-card" elevation="3">
              <v-card-text class="pa-6">
                <!-- Product header -->
                <div class="product-header mb-6">
                  <!-- Status badge -->
                  <div class="mb-3">
                    <v-chip
                      :color="productStore.currentProduct.is_active ? 'success' : 'error'"
                      variant="tonal"
                        size="small"
                      class="mb-2"
                    >
                      {{ productStore.currentProduct.is_active ? 'ACTIF' : 'INACTIF' }}
                      </v-chip>
                    </div>

                  <!-- Product title -->
                  <h1 class="text-h3 font-weight-bold mb-4">{{ productStore.currentProduct.name }}</h1>

                  <!-- Rating and reviews -->
                  <div class="d-flex align-center mb-4" v-if="productStore.currentProduct.note">
                      <v-rating
                        :model-value="productStore.currentProduct.note"
                        readonly
                        size="small"
                        color="amber"
                      density="compact"
                      class="mr-2"
                      ></v-rating>
                    <span class="text-body-2 text-medium-emphasis">
                      {{ productStore.currentProduct.note }}/5
                    </span>
                    <span class="text-body-2 text-medium-emphasis ml-2">
                      ({{ productStore.currentProduct.avis?.length || 0 }} avis)
                      </span>
                    </div>

                  <!-- Price -->
                  <div class="price-section mb-6">
                    <div v-if="productStore.currentProduct.has_variants" class="text-h4 font-weight-bold text-success">
                      {{ formatPrice(productStore.currentProduct.price_range.min) }} - {{ formatPrice(productStore.currentProduct.price_range.max) }} Ar
                    </div>
                    <div v-else class="text-h4 font-weight-bold text-success">
                      {{ formatPrice(productStore.currentProduct.price) }} Ar
                    </div>
                    <div v-if="productStore.currentProduct.has_variants" class="text-body-2 text-medium-emphasis mt-1">
                      Prix de base: {{ formatPrice(productStore.currentProduct.price) }} Ar
                    </div>
                  </div>

                  <!-- Quick stats -->
                  <div class="quick-stats mb-6">
                    <v-row>
                      <v-col cols="6" md="3">
                        <div class="stat-item">
                          <div class="stat-icon">
                            <v-icon color="primary" size="24">mdi-package</v-icon>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ productStore.currentProduct.stock_quantity }}</div>
                            <div class="stat-label">Stock</div>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="6" md="3">
                        <div class="stat-item">
                          <div class="stat-icon">
                            <v-icon color="info" size="24">mdi-weight</v-icon>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ productStore.currentProduct.poid }}g</div>
                            <div class="stat-label">Poids</div>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="6" md="3">
                        <div class="stat-item">
                          <div class="stat-icon">
                            <v-icon color="success" size="24">mdi-tune</v-icon>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ productStore.currentProduct.variants_count || 0 }}</div>
                            <div class="stat-label">Variantes</div>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="6" md="3">
                        <div class="stat-item">
                          <div class="stat-icon">
                            <v-icon color="warning" size="24">mdi-database</v-icon>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">#{{ productStore.currentProduct.id }}</div>
                            <div class="stat-label">ID</div>
                          </div>
                        </div>
          </v-col>
        </v-row>
                  </div>
                </div>

                <!-- Product details -->
                <div class="product-details">
                  <!-- Type and creator -->
                  <div class="detail-row mb-4">
                    <div class="detail-item">
                      <div class="detail-label">
                        <v-icon color="primary" size="20" class="mr-2">mdi-shape</v-icon>
                        Type
                      </div>
                      <div class="detail-value">
                <v-chip 
                          v-if="productStore.currentProduct.product_type"
                          :color="getTypeColor(productStore.currentProduct.product_type.slug)"
                  variant="tonal" 
                  size="small" 
                >
                          {{ productStore.currentProduct.product_type.name }}
                </v-chip>
                        <span v-else class="text-medium-emphasis">Non défini</span>
                      </div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">
                        <v-icon color="primary" size="20" class="mr-2">mdi-account</v-icon>
                        Créé par
                      </div>
                      <div class="detail-value">
                        {{ productStore.currentProduct.user?.name || 'Système' }}
                      </div>
                    </div>
                  </div>

                  <!-- Stock and dates -->
                  <div class="detail-row mb-4">
                    <div class="detail-item">
                      <div class="detail-label">
                        <v-icon color="primary" size="20" class="mr-2">mdi-package-variant</v-icon>
                        Stock total
                      </div>
                      <div class="detail-value">
                <v-chip 
                          :color="getStockColor(productStore.currentProduct.total_stock || productStore.currentProduct.stock_quantity)"
                          variant="flat"
                  size="small" 
                >
                          <v-icon start size="14">{{ getStockIcon(productStore.currentProduct.total_stock || productStore.currentProduct.stock_quantity) }}</v-icon>
                          {{ productStore.currentProduct.total_stock || productStore.currentProduct.stock_quantity }} unités
                </v-chip>
                      </div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">
                        <v-icon color="primary" size="20" class="mr-2">mdi-calendar-plus</v-icon>
                        Créé le
                      </div>
                      <div class="detail-value">
                        {{ formatDate(productStore.currentProduct.created_at) }}
                      </div>
                    </div>
                  </div>

                  <!-- Description -->
                  <div class="description-section">
                    <div class="detail-label mb-2">
                      <v-icon color="primary" size="20" class="mr-2">mdi-text</v-icon>
                      Description
                        </div>
                    <p class="text-body-1 text-medium-emphasis">
                      {{ productStore.currentProduct.description }}
                    </p>
                        </div>
                </div>
              </v-card-text>
                      </v-card>
                </v-col>
              </v-row>

        <!-- Attributs et variantes -->
        <v-row v-if="productStore.currentProduct.has_variants || (productStore.currentProduct.available_attributes && productStore.currentProduct.available_attributes.length > 0)" class="mt-4">
          <v-col cols="12">
            <v-card class="pa-4" elevation="2">
              <!-- Variantes du produit -->
              <v-row v-if="productStore.currentProduct.has_variants && productStore.currentProduct.variants && productStore.currentProduct.variants.length > 0">
                <v-col cols="12">
                  <h3 class="text-h6 mb-3">
                    <v-icon class="mr-2" color="primary">mdi-view-list</v-icon>
                    Variantes du produit
                    <v-chip color="info" variant="tonal" size="small" class="ml-2">
                      {{ productStore.currentProduct.variants.length }} variante(s)
                    </v-chip>
                  </h3>
                  
                  <!-- Barre de recherche et tri -->
                  <v-row align="center" class="mb-4">
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="variantSearchQuery"
                        label="Rechercher une variante..."
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                        density="compact"
                        clearable
                        @input="onVariantSearchInput"
                        @click:clear="clearVariantSearch"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-select
                        v-model="variantSortBy"
                        :items="variantSortOptions"
                        label="Trier par"
                        variant="outlined"
                        density="compact"
                        @update:modelValue="onVariantSortChange"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-btn
                        variant="outlined"
                        @click="resetVariantFilters"
                        prepend-icon="mdi-refresh"
                      >
                        Réinitialiser
                      </v-btn>
                    </v-col>
                  </v-row>

                  <!-- Indicateur de résultats -->
                  <div class="d-flex justify-space-between align-center mb-3">
                    <div class="text-body-2 text-grey-darken-1">
                      <span v-if="variantSearchQuery">
                        {{ filteredVariants.length }} variante(s) trouvée(s) pour "{{ variantSearchQuery }}"
                      </span>
                      <span v-else>
                        {{ productStore.currentProduct.variants.length }} variante(s) au total
                      </span>
                    </div>
                    <div class="text-body-2 text-grey-darken-1">
                      {{ activeVariantsCount }} active(s) / {{ availableVariantsCount }} en stock
                    </div>
                  </div>

                  <!-- Tableau des variantes -->
                  <v-card elevation="3">
                    <v-card-title class="text-h6 pa-4 bg-primary text-white">
                      <v-icon start>mdi-package-variant</v-icon>
                      Liste des Variantes
                    </v-card-title>

                    <v-table>
                      <thead>
                        <tr>
                          <th class="text-left">
                            <v-btn 
                              variant="text" 
                              size="small" 
                              @click="setVariantSortBy('id')"
                              class="pa-0"
                            >
                              ID
                              <v-icon v-if="variantSortBy === 'id'" size="small" class="ml-1">
                                {{ variantSortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                              </v-icon>
                            </v-btn>
                          </th>
                          <th class="text-left">
                            <v-btn 
                              variant="text" 
                              size="small" 
                              @click="setVariantSortBy('name')"
                              class="pa-0"
                            >
                              Nom/SKU
                              <v-icon v-if="variantSortBy === 'name'" size="small" class="ml-1">
                                {{ variantSortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                              </v-icon>
                            </v-btn>
                          </th>
                          <th class="text-left">
                            <v-btn 
                              variant="text" 
                              size="small" 
                              @click="setVariantSortBy('price')"
                              class="pa-0"
                            >
                              Prix
                              <v-icon v-if="variantSortBy === 'price'" size="small" class="ml-1">
                                {{ variantSortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                              </v-icon>
                            </v-btn>
                          </th>
                          <th class="text-left">
                            <v-btn 
                              variant="text" 
                              size="small" 
                              @click="setVariantSortBy('stock')"
                              class="pa-0"
                            >
                              Stock
                              <v-icon v-if="variantSortBy === 'stock'" size="small" class="ml-1">
                                {{ variantSortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                              </v-icon>
                            </v-btn>
                          </th>
                          <th class="text-left">Attributs</th>
                          <th class="text-left">Statut</th>
                          <th class="text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="variant in sortedVariants" :key="variant.id" :class="{ 'variant-inactive-row': !variant.is_active }">
                          <td>{{ variant.id }}</td>
                          <td>
                            <div class="d-flex align-center">
                              <v-avatar v-if="variant.image" size="32" class="mr-2">
                                <v-img 
                                  :src="`${APP_CONFIG.STORAGE_BASE_URL}/variants/${variant.image}`"
                                  @error="handleImageError($event, variant.image)"
                                ></v-img>
                              </v-avatar>
                              <v-icon v-else color="grey-lighten-2" size="20" class="mr-2">mdi-image-off</v-icon>
                              <div>
                                <div class="font-weight-medium">{{ variant.name || variant.full_name }}</div>
                                <div class="text-caption text-medium-emphasis">SKU: {{ variant.sku }}</div>
                                </div>
                              </div>
                          </td>
                          <td>
                              <div class="text-h6 font-weight-bold text-success">
                                {{ variant.formatted_price }}
                              </div>
                              <div v-if="variant.compare_price" class="text-caption text-medium-emphasis text-decoration-line-through">
                                {{ formatPrice(variant.compare_price) }} Ar
                              </div>
                          </td>
                          <td>
                            <v-chip
                              :color="getStockColor(variant.stock_quantity)"
                              size="small"
                              variant="flat"
                            >
                              <v-icon start size="14">{{ getStockIcon(variant.stock_quantity) }}</v-icon>
                              {{ variant.stock_quantity }} unités
                            </v-chip>
                          </td>
                          <td>
                            <div v-if="variant.attributes && variant.attributes.length > 0" class="d-flex flex-wrap ga-1 align-center">
                              <v-chip
                                v-for="attr in variant.attributes.slice(0, 2)" 
                                :key="attr.value_id"
                                :color="getAttributeColor(attr.attribute_type)"
                                size="small" 
                                variant="tonal"
                                class="ma-1"
                              >
                                <span v-if="attr.attribute_type === 'color'" class="d-flex align-center">
                                  <div
                                    class="color-preview-tiny mr-1"
                                    :style="{ backgroundColor: attr.color_code }"
                                  ></div>
                                  {{ attr.label }}
                                </span>
                                <span v-else>{{ attr.label }}</span>
                              </v-chip>
                              <v-chip 
                                v-if="variant.attributes.length > 2"
                            color="primary"
                                size="small" 
                            variant="outlined"
                                class="ma-1"
                              >
                                +{{ variant.attributes.length - 2 }}
                              </v-chip>
                            </div>
                            <span v-else class="text-grey">Aucun</span>
                          </td>
                          <td>
                            <v-chip
                              :color="variant.is_active ? 'success' : 'error'"
                            size="small"
                              variant="flat"
                            >
                              <v-icon start size="14">{{ variant.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                              {{ variant.is_active ? 'Actif' : 'Inactif' }}
                            </v-chip>
                          </td>
                          <td>
                          <v-btn
                              icon="mdi-eye"
                            size="small"
                              color="info"
                              variant="text"
                              @click="viewVariant(variant)"
                          ></v-btn>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                      </v-card>
                </v-col>
              </v-row>

              <!-- Message si pas d'attributs et pas de variantes -->
              <v-row v-if="!productStore.currentProduct.has_variants && (!productStore.currentProduct.available_attributes || productStore.currentProduct.available_attributes.length === 0)">
                <v-col cols="12">
                  <v-alert type="info" variant="tonal">
                    <v-icon start>mdi-information</v-icon>
                    Ce produit n'a pas d'attributs configurés. Les attributs permettent de créer des variantes avec différentes caractéristiques (couleur, taille, etc.).
                  </v-alert>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Avis clients -->
        <v-row v-if="productStore.currentProduct.avis && productStore.currentProduct.avis.length > 0" class="mt-4">
          <v-col cols="12">
            <v-card class="pa-4" elevation="2">
              <v-card-title class="text-h6 pb-4">
                <v-icon class="mr-2">mdi-comment-multiple</v-icon>
                Avis clients
                <v-chip color="info" variant="tonal" size="small" class="ml-2">
                  {{ productStore.currentProduct.avis.length }} avis
                </v-chip>
              </v-card-title>
              <v-row>
                <v-col
                  v-for="avis in productStore.currentProduct.avis"
                  :key="avis.id"
                  cols="12"
                  md="6"
                >
                  <v-card variant="outlined" class="pa-3">
                    <div class="d-flex align-center mb-2">
                      <v-avatar size="32" class="mr-2">
                        <v-img
                          v-if="avis.user.avatar"
                          :src="`${APP_CONFIG.STORAGE_BASE_URL}/avatars/${avis.user.avatar}`"
                        ></v-img>
                        <v-icon v-else>mdi-account</v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium">{{ avis.user.name }}</div>
                        <v-rating
                          :model-value="avis.note"
                          readonly
                          size="small"
                          color="amber"
                          density="compact"
                        ></v-rating>
                      </div>
                    </div>
                    <p class="text-body-2">{{ avis.comment }}</p>
                    <div class="text-caption text-medium-emphasis mt-2">
                      {{ formatDate(avis.created_at) }}
                    </div>
                  </v-card>
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
            Cette action supprimera également toutes les variantes associées !
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

    <!-- Modal pour afficher les détails de la variante -->
    <v-dialog v-model="variantModal" max-width="800px">
      <v-card v-if="selectedVariant">
        <v-card-title class="text-h5 bg-primary text-white pa-4">
          <v-icon start>mdi-package-variant</v-icon>
          Détails de la variante
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="variantModal = false" class="text-white">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <!-- Image de la variante -->
            <v-col cols="12" md="4">
              <div class="text-center">
                <v-img
                  v-if="selectedVariant.image"
                  :src="`${APP_CONFIG.STORAGE_BASE_URL}/variants/${selectedVariant.image}`"
                  class="rounded-lg"
                  height="300"
                  cover
                ></v-img>
                <div v-else class="image-placeholder">
                  <v-icon size="80" color="grey-lighten-2">mdi-image-off</v-icon>
                  <p class="text-grey-lighten-2 mt-2">Aucune image</p>
  </div>
              </div>
            </v-col>

            <!-- Informations de la variante -->
            <v-col cols="12" md="8">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-tag</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Nom</v-list-item-title>
                  <v-list-item-subtitle>
                    <div class="text-h6 font-weight-bold">{{ selectedVariant.name || selectedVariant.full_name }}</div>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-barcode</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">SKU</v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="font-mono">{{ selectedVariant.sku }}</span>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-currency-usd</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Prix</v-list-item-title>
                  <v-list-item-subtitle>
                    <div class="text-h6 font-weight-bold text-success">
                      {{ selectedVariant.formatted_price }}
                    </div>
                    <div v-if="selectedVariant.compare_price" class="text-caption text-medium-emphasis text-decoration-line-through">
                      {{ formatPrice(selectedVariant.compare_price) }} Ar
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-package</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Stock</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="getStockColor(selectedVariant.stock_quantity)"
                      size="small"
                      variant="flat"
                    >
                      <v-icon start size="14">{{ getStockIcon(selectedVariant.stock_quantity) }}</v-icon>
                      {{ selectedVariant.stock_quantity }} unités
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-weight</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Poids</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedVariant.weight || 'Non défini' }} g
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="selectedVariant.barcode">
                  <template #prepend>
                    <v-icon color="primary">mdi-qrcode</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Code-barres</v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="font-mono">{{ selectedVariant.barcode }}</span>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-eye</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Statut</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="selectedVariant.is_active ? 'success' : 'error'"
                      size="small"
                      variant="flat"
                    >
                      <v-icon start size="14">{{ selectedVariant.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                      {{ selectedVariant.is_active ? 'Actif' : 'Inactif' }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <!-- Attributs de la variante -->
          <v-row v-if="selectedVariant.attributes && selectedVariant.attributes.length > 0" class="mt-4">
            <v-col cols="12">
              <v-card variant="outlined" class="pa-4">
                <v-card-title class="text-h6 pb-3">
                  <v-icon class="mr-2" color="primary">mdi-tune</v-icon>
                  Attributs de la variante
                </v-card-title>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="attr in selectedVariant.attributes"
                    :key="attr.value_id"
                    :color="getAttributeColor(attr.attribute_type)"
                    size="medium"
                    variant="tonal"
                    class="ma-1"
                  >
                    <span v-if="attr.attribute_type === 'color'" class="d-flex align-center">
                      <div
                        class="color-preview-small mr-2"
                        :style="{ backgroundColor: attr.color_code }"
                      ></div>
                      <strong>{{ attr.attribute_name }}:</strong> {{ attr.label }}
                    </span>
                    <span v-else>
                      <strong>{{ attr.attribute_name }}:</strong> {{ attr.label }}
                    </span>
                    <span v-if="attr.price_modifier && attr.price_modifier != 0" class="text-success ml-2">
                      ({{ attr.price_modifier > 0 ? '+' : '' }}{{ formatPrice(attr.price_modifier) }} Ar)
                    </span>
                  </v-chip>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="elevated" @click="variantModal = false">
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useProductStore } from '../../../store/AdminStore/ProductStore'
import { useRoute, useRouter } from 'vue-router'
import { APP_CONFIG } from '../../../config/constants'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const confirmDelete = ref(false)

// Variables pour la gestion des variantes
const variantSearchQuery = ref('')
const variantSortBy = ref('id')
const variantSortOrder = ref('asc')
const variantToDelete = ref(null)
const variantModal = ref(false)
const selectedVariant = ref(null)
let variantSearchTimeout: number | null = null

const variantSortOptions = [
  { title: 'ID', value: 'id' },
  { title: 'Nom/SKU', value: 'name' },
  { title: 'Prix', value: 'price' },
  { title: 'Stock', value: 'stock' },
  { title: 'Statut', value: 'status' }
]

// Utiliser des refs pour les champs du formulaire
const name = ref('')
const description = ref('')
const poid = ref(0)
const price = ref(0)
const image = ref<File | null>(null)
const sary = ref<File | null>(null)
const product_type_id = ref(0)
const is_active = ref(true)
const stock_quantity = ref(0)

// Load product data when component mounts or route changes
const loadProduct = () => {
  const productId = Number(route.params.id)
  // Toujours recharger les données pour s'assurer d'avoir les dernières informations
  productStore.loading = true
  productStore.currentProduct = null
  productStore.showProduct(productId)
}

// Fonction pour forcer le rechargement des données
const forceReload = () => {
  console.log('Force reload des données du produit')
  loadProduct()
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
      // Debug: afficher les données reçues
      console.log('Données du produit reçues:', {
        id: newProduct.id,
        name: newProduct.name,
        has_variants: newProduct.has_variants,
        variants_count: newProduct.variants_count,
        total_stock: newProduct.total_stock,
        variants: newProduct.variants?.length || 0,
        available_attributes: newProduct.available_attributes?.length || 0,
        statistics: newProduct.statistics
      })
      
      // Mettre à jour les valeurs du formulaire quand le produit est chargé
      name.value = newProduct.name
      description.value = newProduct.description
      price.value = newProduct.price
      poid.value = newProduct.poid
      product_type_id.value = newProduct.product_type_id || 0
      is_active.value = newProduct.is_active
      stock_quantity.value = newProduct.stock_quantity
    }
  }
)

// Watch pour mettre à jour les valeurs quand on ouvre le dialog
watch(variantModal, (newValue) => {
  if (newValue && selectedVariant.value) {
    // Réinitialiser les valeurs du formulaire à chaque ouverture du dialog
    // name.value = productStore.currentProduct.name // This line is removed
    // description.value = productStore.currentProduct.description // This line is removed
    // price.value = productStore.currentProduct.price // This line is removed
    // poid.value = productStore.currentProduct.poid // This line is removed
    // product_type_id.value = productStore.currentProduct.product_type_id // This line is removed
    // is_active.value = productStore.currentProduct.is_active // This line is removed
    // stock_quantity.value = productStore.currentProduct.stock_quantity // This line is removed
    image.value = null
    sary.value = null
  }
})

// Computed properties pour les variantes
const filteredVariants = computed(() => {
  if (!productStore.currentProduct?.variants) return []
  
  let variants = productStore.currentProduct.variants
  
  if (variantSearchQuery.value) {
    const query = variantSearchQuery.value.toLowerCase()
    variants = variants.filter(variant => 
      variant.id.toString().includes(query) ||
      (variant.name && variant.name.toLowerCase().includes(query)) ||
      (variant.full_name && variant.full_name.toLowerCase().includes(query)) ||
      (variant.sku && variant.sku.toLowerCase().includes(query)) ||
      (variant.attributes && variant.attributes.some(attr => 
        attr.label.toLowerCase().includes(query) ||
        attr.attribute_name.toLowerCase().includes(query)
      ))
    )
  }
  
  return variants
})

const sortedVariants = computed(() => {
  const variants = [...filteredVariants.value]
  
  variants.sort((a, b) => {
    let aValue, bValue
    
    switch (variantSortBy.value) {
      case 'id':
        aValue = a.id
        bValue = b.id
        break
      case 'name':
        aValue = (a.name || a.full_name || '').toLowerCase()
        bValue = (b.name || b.full_name || '').toLowerCase()
        break
      case 'price':
        aValue = a.price || 0
        bValue = b.price || 0
        break
      case 'stock':
        aValue = a.stock_quantity || 0
        bValue = b.stock_quantity || 0
        break
      case 'status':
        aValue = a.is_active ? 1 : 0
        bValue = b.is_active ? 1 : 0
        break
      default:
        aValue = a.id
        bValue = b.id
    }
    
    if (variantSortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return variants
})

const activeVariantsCount = computed(() => {
  return productStore.currentProduct?.variants?.filter(v => v.is_active).length || 0
})

const availableVariantsCount = computed(() => {
  return productStore.currentProduct?.variants?.filter(v => v.stock_quantity > 0).length || 0
})

const uploadImage = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    sary.value = target.files[0]
  }
}

const updateProduct = async (id: number | undefined) => {
  if (!id) return
  
  // dialog.value = false // This line is removed
  const formData = new FormData()
  
  if (sary.value) {
    formData.append('image', sary.value)
  }
  
  await productStore.updateProduct(id, {
    name: name.value,
    description: description.value,
    poid: Number(poid.value),
    price: Number(price.value),
    product_type_id: Number(product_type_id.value),
    is_active: is_active.value,
    stock_quantity: Number(stock_quantity.value)
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
  return colors[slug] || 'primary'
}

const getStockColor = (quantity: number) => {
  if (quantity === 0) return 'error'
  if (quantity < 10) return 'warning'
  return 'success'
}

const getStockIcon = (quantity: number) => {
  if (quantity === 0) return 'mdi-alert-circle'
  if (quantity < 10) return 'mdi-alert'
  return 'mdi-check-circle'
}

const getAttributeIcon = (type: string | undefined) => {
  switch (type) {
    case 'text':
      return 'mdi-text'
    case 'number':
      return 'mdi-numeric'
    case 'select':
      return 'mdi-format-list-bulleted'
    case 'color':
      return 'mdi-palette'
    default:
      return 'mdi-information'
  }
}

const getAttributeColor = (type: string | undefined) => {
  switch (type) {
    case 'text':
      return 'blue'
    case 'number':
      return 'green'
    case 'select':
      return 'orange'
    case 'color':
      return 'purple'
    default:
      return 'grey'
  }
}

const editVariant = (variant: any) => {
  // TODO: Implémenter l'édition des variantes
  console.log('Éditer la variante:', variant)
}

const deleteVariant = (variant: any) => {
  // TODO: Implémenter la suppression des variantes
  console.log('Supprimer la variante:', variant)
}

const handleImageError = (event: Event, src: string) => {
  const target = event.target as HTMLImageElement;
  console.error("Image failed to load:", src);
  target.src = "https://via.placeholder.com/150"; // Fallback to a placeholder image
};

const handleImageLoad = (event: Event, src: string) => {
  const target = event.target as HTMLImageElement;
  console.log("Image loaded successfully:", src);
};

// Méthodes pour la gestion des variantes
const onVariantSearchInput = () => {
  if (variantSearchTimeout) {
    clearTimeout(variantSearchTimeout)
  }
  variantSearchTimeout = setTimeout(() => {
    // La recherche se fait automatiquement via computed
  }, 300)
}

const clearVariantSearch = () => {
  variantSearchQuery.value = ''
}

const setVariantSortBy = (newSortBy: string) => {
  if (variantSortBy.value === newSortBy) {
    // Si on clique sur la même colonne, on inverse l'ordre
    variantSortOrder.value = variantSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Si on change de colonne, on remet en ordre croissant
    variantSortBy.value = newSortBy
    variantSortOrder.value = 'asc'
  }
}

const onVariantSortChange = () => {
  // Le tri se fait automatiquement via computed
}

const resetVariantFilters = () => {
  variantSearchQuery.value = ''
  variantSortBy.value = 'id'
  variantSortOrder.value = 'asc'
}

const viewVariant = (variant: any) => {
  selectedVariant.value = variant
  variantModal.value = true
}

const goToEditPage = () => {
  router.push(`/admin/product/${productStore.currentProduct.id}/edit`)
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

.color-preview-small {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: inline-block;
}

.color-preview-tiny {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: inline-block;
}

/* Styles pour les variantes */
.variant-card {
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.variant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.variant-inactive {
  opacity: 0.7;
  background-color: #f5f5f5;
}

.variant-details {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.font-mono {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Amélioration des puces d'attributs */
.v-chip.ma-1 {
  margin: 2px !important;
}

/* Responsive pour les variantes */
@media (max-width: 768px) {
  .variant-card {
    margin-bottom: 16px;
  }
  
  .variant-details {
    padding: 8px;
  }
}

/* Styles pour le tableau des variantes */
.variant-inactive-row {
  opacity: 0.7;
  background-color: rgba(0, 0, 0, 0.02);
}

.variant-inactive-row:hover {
  opacity: 0.9;
}

.v-table th {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  background-color: rgb(var(--v-theme-surface-variant));
}

.v-table td {
  vertical-align: middle;
}

.v-table tbody tr:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

/* Amélioration des puces d'attributs dans le tableau */
.v-chip.ma-1 {
  margin: 2px !important;
}

/* Styles pour le nouveau design du produit */
.product-image-card {
  border-radius: 12px;
  overflow: hidden;
  height: fit-content;
}

.product-image {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-details-card {
  border-radius: 12px;
  overflow: hidden;
  height: fit-content;
}

/* Product header styles */
.product-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.02) 0%, rgba(var(--v-theme-primary), 0.01) 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

/* Price section */
.price-section {
  padding: 16px 0;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

/* Quick stats */
.quick-stats {
  padding: 16px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(var(--v-theme-surface), 1);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.1);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 8px;
  margin-right: 12px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  margin-top: 2px;
}

/* Product details */
.product-details {
  margin-top: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.detail-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  flex-shrink: 0;
  margin-right: 16px;
}

.detail-value {
  font-weight: 400;
  color: rgb(var(--v-theme-on-surface));
  text-align: right;
  word-break: break-word;
}

/* Responsive design */
@media (max-width: 768px) {
  .product-header {
    padding: 16px;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .detail-value {
    text-align: left;
  }
  
  .stat-item {
    margin-bottom: 8px;
  }
}

.stat-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  flex-shrink: 0;
  margin-right: 16px;
}

.info-value {
  font-weight: 400;
  color: rgb(var(--v-theme-on-surface));
  text-align: right;
  word-break: break-word;
}

/* Responsive pour le tableau */
@media (max-width: 1024px) {
  .v-table {
    font-size: 0.875rem;
  }
  
  .v-table th,
  .v-table td {
    padding: 8px 4px;
  }
}

@media (max-width: 768px) {
  .v-table {
    font-size: 0.75rem;
  }
  
  .v-table th,
  .v-table td {
    padding: 4px 2px;
  }
  
  .v-btn.size-small {
    width: 28px;
    height: 28px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .info-value {
    text-align: left;
  }
  
  .stat-card {
    margin-bottom: 8px;
  }
}
</style>
