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
                <div class="d-flex align-center flex-wrap gap-2">
                  <v-chip
                    :color="productStore.currentProduct.is_active ? 'success' : 'error'"
                    variant="elevated"
                    class="mr-2"
                  >
                    <v-icon start>{{ productStore.currentProduct.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                    {{ productStore.currentProduct.is_active ? 'Actif' : 'Inactif' }}
                  </v-chip>
                  <v-chip v-if="productStore.currentProduct.has_variants" color="info" variant="tonal">
                    <v-icon start>mdi-tune</v-icon>
                    {{ productStore.currentProduct.variants_count }} variante(s)
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
                  <template #prepend>
                    <v-icon color="primary">mdi-tag</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Prix</v-list-item-title>
                  <v-list-item-subtitle>
                    <div v-if="productStore.currentProduct.has_variants" class="text-h6 font-weight-bold text-success">
                      {{ formatPrice(productStore.currentProduct.price_range.min) }} - {{ formatPrice(productStore.currentProduct.price_range.max) }} Ar
                      <div class="text-caption text-medium-emphasis">
                        Prix de base: {{ formatPrice(productStore.currentProduct.price) }} Ar
                      </div>
                    </div>
                    <div v-else class="text-h6 font-weight-bold text-success">
                      {{ formatPrice(productStore.currentProduct.price) }} Ar
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="productStore.currentProduct.product_type">
                  <template #prepend>
                    <v-icon color="primary">mdi-shape</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Type de produit</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="getTypeColor(productStore.currentProduct.product_type.slug)"
                      size="small"
                      variant="tonal"
                    >
                      {{ productStore.currentProduct.product_type.name }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-weight</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Poids</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ productStore.currentProduct.poid }} g
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-package</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Stock</v-list-item-title>
                  <v-list-item-subtitle>
                    <div class="d-flex align-center gap-2 flex-wrap">
                      <v-chip
                        :color="getStockColor(productStore.currentProduct.stock_quantity)"
                        size="small"
                        variant="flat"
                      >
                        <v-icon start size="14">{{ getStockIcon(productStore.currentProduct.stock_quantity) }}</v-icon>
                        {{ productStore.currentProduct.stock_quantity }} unités
                      </v-chip>
                      <v-chip
                        v-if="productStore.currentProduct.has_variants"
                        :color="getStockColor(productStore.currentProduct.total_stock)"
                        size="small"
                        variant="outlined"
                      >
                        <v-icon start size="14">mdi-sum</v-icon>
                        {{ productStore.currentProduct.total_stock }} total variantes
                      </v-chip>
                      <v-chip
                        v-if="productStore.currentProduct.has_variants"
                        color="info"
                        size="small"
                        variant="tonal"
                      >
                        <v-icon start size="14">mdi-check-circle</v-icon>
                        {{ productStore.currentProduct.active_variants_count }} variantes actives
                      </v-chip>
                      <v-chip
                        v-if="productStore.currentProduct.has_variants"
                        color="success"
                        size="small"
                        variant="tonal"
                      >
                        <v-icon start size="14">mdi-package-variant</v-icon>
                        {{ productStore.currentProduct.available_variants_count }} en stock
                      </v-chip>
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-eye</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Statut</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="productStore.currentProduct.is_active ? 'success' : 'error'"
                      size="small"
                      variant="flat"
                    >
                      <v-icon start size="14">{{ productStore.currentProduct.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                      {{ productStore.currentProduct.is_active ? 'Actif' : 'Inactif' }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="productStore.currentProduct.note">
                  <template #prepend>
                    <v-icon color="primary">mdi-star</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Note moyenne</v-list-item-title>
                  <v-list-item-subtitle>
                    <div class="d-flex align-center">
                      <v-rating
                        :model-value="productStore.currentProduct.note"
                        readonly
                        size="small"
                        color="amber"
                        half-increments
                      ></v-rating>
                      <span class="ml-2 text-body-2">
                        ({{ productStore.currentProduct.note }}/5)
                      </span>
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="productStore.currentProduct.user">
                  <template #prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Créé par</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ productStore.currentProduct.user.name }} (ID: {{ productStore.currentProduct.user.id }})
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

        <!-- Attributs et variantes -->
        <v-row v-if="productStore.currentProduct.has_variants || (productStore.currentProduct.available_attributes && productStore.currentProduct.available_attributes.length > 0)" class="mt-4">
          <v-col cols="12">
            <v-card class="pa-4" elevation="2">
              <v-card-title class="text-h6 pb-4">
                <v-icon class="mr-2">mdi-tune</v-icon>
                <span v-if="productStore.currentProduct.has_variants">Attributs et Variantes</span>
                <span v-else>Attributs du produit</span>
                <v-chip 
                  v-if="productStore.currentProduct.has_variants"
                  color="info" 
                  variant="tonal" 
                  size="small" 
                  class="ml-2"
                >
                  {{ productStore.currentProduct.variants_count }} variante(s)
                </v-chip>
                <v-chip 
                  v-else-if="productStore.currentProduct.available_attributes && productStore.currentProduct.available_attributes.length > 0"
                  color="primary" 
                  variant="tonal" 
                  size="small" 
                  class="ml-2"
                >
                  {{ productStore.currentProduct.available_attributes.length }} attribut(s)
                </v-chip>
              </v-card-title>

              <!-- Attributs configurés au niveau du produit -->
              <v-row v-if="productStore.currentProduct.available_attributes && productStore.currentProduct.available_attributes.length > 0" class="mb-4">
                <v-col cols="12">
                  <h3 class="text-h6 mb-3">
                    <v-icon class="mr-2" color="primary">mdi-cog</v-icon>
                    Attributs configurés
                  </h3>
                  <v-row>
                    <v-col
                      v-for="attribute in productStore.currentProduct.available_attributes"
                      :key="attribute.id"
                      cols="12"
                      md="6"
                    >
                      <v-card variant="outlined" class="pa-3">
                        <div class="d-flex align-center mb-2">
                          <v-icon :color="getAttributeColor(attribute.type)" class="mr-2">
                            {{ getAttributeIcon(attribute.type) }}
                          </v-icon>
                          <span class="font-weight-medium">{{ attribute.name }}</span>
                          <v-chip
                            v-if="attribute.is_required"
                            color="error"
                            variant="tonal"
                            size="x-small"
                            class="ml-2"
                          >
                            Obligatoire
                          </v-chip>
                        </div>
                        <p v-if="attribute.description" class="text-body-2 text-medium-emphasis mb-2">
                          {{ attribute.description }}
                        </p>
                        <div class="d-flex flex-wrap gap-1">
                          <v-chip
                            v-for="value in attribute.values"
                            :key="value.id"
                            size="small"
                            variant="outlined"
                            class="ma-1"
                          >
                            <span v-if="attribute.type === 'color'" class="d-flex align-center">
                              <div
                                class="color-preview-tiny mr-1"
                                :style="{ backgroundColor: value.color_code }"
                              ></div>
                              {{ value.label }}
                            </span>
                            <span v-else>
                              {{ value.label }}
                              <span v-if="value.price_modifier != 0" class="text-success ml-1">
                                ({{ value.price_modifier > 0 ? '+' : '' }}{{ formatPrice(value.price_modifier) }} Ar)
                              </span>
                            </span>
                          </v-chip>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

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
                  
                  <!-- Grille des variantes - Affichage moderne -->
                  <v-row>
                    <v-col
                      v-for="variant in productStore.currentProduct.variants"
                      :key="variant.id"
                      cols="12"
                      md="6"
                      lg="4"
                    >
                      <v-card class="variant-card" elevation="2" :class="{ 'variant-inactive': !variant.is_active }">
                        <!-- Header de la variante -->
                        <v-card-title class="pa-3 pb-2">
                          <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                              <v-avatar v-if="variant.image" size="32" class="mr-2">
                                <v-img 
                                  :src="`http://localhost:8000/storage/variants/${variant.image}`"
                                  @error="handleImageError($event, variant.image)"
                                  @load="handleImageLoad($event, variant.image)"
                                >
                                  <template v-slot:placeholder>
                                    <v-skeleton-loader type="avatar"></v-skeleton-loader>
                                  </template>
                                </v-img>
                              </v-avatar>
                              <v-icon v-else color="grey-lighten-2" class="mr-2">mdi-image-off</v-icon>
                              <div>
                                <div class="text-subtitle-1 font-weight-bold">{{ variant.name || variant.full_name }}</div>
                                <div class="text-caption text-medium-emphasis">
                                  SKU: {{ variant.sku }}
                                  <span v-if="variant.image" class="text-success ml-2">
                                    <v-icon size="12">mdi-check</v-icon>
                                    Image: {{ variant.image }}
                                  </span>
                                  <span v-else class="text-warning ml-2">
                                    <v-icon size="12">mdi-alert</v-icon>
                                    Pas d'image
                                  </span>
                                </div>
                              </div>
                            </div>
                            <v-chip
                              :color="variant.is_active ? 'success' : 'error'"
                              size="small"
                              variant="flat"
                            >
                              <v-icon start size="14">{{ variant.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                              {{ variant.is_active ? 'Actif' : 'Inactif' }}
                            </v-chip>
                          </div>
                        </v-card-title>

                        <!-- Contenu de la variante -->
                        <v-card-text class="pa-3 pt-0">
                          <!-- Prix et stock -->
                          <div class="d-flex justify-space-between align-center mb-3">
                            <div>
                              <div class="text-h6 font-weight-bold text-success">
                                {{ variant.formatted_price }}
                              </div>
                              <div v-if="variant.compare_price" class="text-caption text-medium-emphasis text-decoration-line-through">
                                {{ formatPrice(variant.compare_price) }} Ar
                              </div>
                            </div>
                            <v-chip
                              :color="getStockColor(variant.stock_quantity)"
                              size="small"
                              variant="flat"
                            >
                              <v-icon start size="14">{{ getStockIcon(variant.stock_quantity) }}</v-icon>
                              {{ variant.stock_quantity }} en stock
                            </v-chip>
                          </div>

                          <!-- Attributs de la variante -->
                          <div v-if="variant.attributes && variant.attributes.length > 0" class="mb-3">
                            <div class="text-subtitle-2 font-weight-medium mb-2">Attributs :</div>
                            <div class="d-flex flex-wrap gap-1">
                              <v-chip
                                v-for="attr in variant.attributes"
                                :key="attr.value_id"
                                size="small"
                                variant="outlined"
                                :color="getAttributeColor(attr.attribute_type)"
                                class="ma-1"
                              >
                                <span v-if="attr.attribute_type === 'color'" class="d-flex align-center">
                                  <div
                                    class="color-preview-tiny mr-1"
                                    :style="{ backgroundColor: attr.color_code }"
                                  ></div>
                                  <strong>{{ attr.attribute_name }}:</strong> {{ attr.label }}
                                </span>
                                <span v-else>
                                  <strong>{{ attr.attribute_name }}:</strong> {{ attr.label }}
                                </span>
                                <span v-if="attr.price_modifier && attr.price_modifier != 0" class="text-success ml-1">
                                  ({{ attr.price_modifier > 0 ? '+' : '' }}{{ formatPrice(attr.price_modifier) }} Ar)
                                </span>
                              </v-chip>
                            </div>
                          </div>

                          <!-- Informations supplémentaires -->
                          <div class="variant-details">
                            <div class="d-flex justify-space-between text-body-2 mb-1">
                              <span class="text-medium-emphasis">Poids:</span>
                              <span>{{ variant.weight || 'Non défini' }} g</span>
                            </div>
                            <div v-if="variant.barcode" class="d-flex justify-space-between text-body-2 mb-1">
                              <span class="text-medium-emphasis">Code-barres:</span>
                              <span class="font-mono">{{ variant.barcode }}</span>
                            </div>
                          </div>
                        </v-card-text>

                        <!-- Actions -->
                        <v-card-actions class="pa-3 pt-0">
                          <v-btn
                            color="primary"
                            variant="outlined"
                            size="small"
                            @click="editVariant(variant)"
                            prepend-icon="mdi-pencil"
                          >
                            Modifier
                          </v-btn>
                          <v-spacer></v-spacer>
                          <v-btn
                            color="error"
                            variant="text"
                            size="small"
                            @click="deleteVariant(variant)"
                            icon="mdi-delete"
                          ></v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>
                  </v-row>
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
                          :src="`http://localhost:8000/storage/avatars/${avis.user.avatar}`"
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

        <!-- Metadata -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card class="pa-4" elevation="2">
              <v-card-title class="text-h6 pb-4">
                <v-icon class="mr-2">mdi-clock</v-icon>
                Informations système
              </v-card-title>
              <v-row>
                <v-col cols="12" md="4">
                  <v-list-item>
                    <template #prepend>
                      <v-icon color="success">mdi-calendar-plus</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Date de création</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatDate(productStore.currentProduct.created_at) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
                <v-col cols="12" md="4">
                  <v-list-item>
                    <template #prepend>
                      <v-icon color="warning">mdi-calendar-edit</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Dernière modification</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatDate(productStore.currentProduct.updated_at) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
                <v-col cols="12" md="4">
                  <v-list-item>
                    <template #prepend>
                      <v-icon color="info">mdi-database</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Identifiant</v-list-item-title>
                    <v-list-item-subtitle>
                      #{{ productStore.currentProduct.id }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Statistiques détaillées -->
        <v-row v-if="productStore.currentProduct.statistics" class="mt-4">
          <v-col cols="12">
            <v-card class="pa-4" elevation="2">
              <v-card-title class="text-h6 pb-4">
                <v-icon class="mr-2">mdi-chart-line</v-icon>
                Statistiques détaillées
              </v-card-title>
              <v-row>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" class="pa-3 text-center">
                    <v-icon color="primary" size="32" class="mb-2">mdi-star</v-icon>
                    <div class="text-h6 font-weight-bold">{{ productStore.currentProduct.statistics.total_reviews }}</div>
                    <div class="text-body-2 text-medium-emphasis">Avis clients</div>
                    <div v-if="productStore.currentProduct.statistics.average_rating" class="mt-2">
                      <v-rating
                        :model-value="productStore.currentProduct.statistics.average_rating"
                        readonly
                        size="small"
                        color="amber"
                        density="compact"
                      ></v-rating>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" class="pa-3 text-center">
                    <v-icon color="info" size="32" class="mb-2">mdi-cog</v-icon>
                    <div class="text-h6 font-weight-bold">{{ productStore.currentProduct.statistics.total_attributes }}</div>
                    <div class="text-body-2 text-medium-emphasis">Attributs configurés</div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" class="pa-3 text-center">
                    <v-icon color="success" size="32" class="mb-2">mdi-tune</v-icon>
                    <div class="text-h6 font-weight-bold">{{ productStore.currentProduct.statistics.total_variants }}</div>
                    <div class="text-body-2 text-medium-emphasis">Variantes totales</div>
                    <div class="text-caption text-success mt-1">
                      {{ productStore.currentProduct.statistics.active_variants }} actives
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" class="pa-3 text-center">
                    <v-icon color="warning" size="32" class="mb-2">mdi-package</v-icon>
                    <div class="text-h6 font-weight-bold">{{ productStore.currentProduct.statistics.total_stock }}</div>
                    <div class="text-body-2 text-medium-emphasis">Stock total</div>
                    <div class="text-caption text-info mt-1">
                      {{ productStore.currentProduct.statistics.effective_stock }} effectif
                    </div>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- Fourchette de prix si applicable -->
              <v-row v-if="productStore.currentProduct.statistics.price_range && productStore.currentProduct.has_variants" class="mt-3">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-3">
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon color="success" class="mr-2">mdi-currency-usd</v-icon>
                        <div>
                          <div class="font-weight-medium">Fourchette de prix</div>
                          <div class="text-body-2 text-medium-emphasis">Prix minimum et maximum des variantes</div>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-h6 font-weight-bold text-success">
                          {{ formatPrice(productStore.currentProduct.statistics.price_range.min) }} - 
                          {{ formatPrice(productStore.currentProduct.statistics.price_range.max) }} Ar
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Prix de base: {{ formatPrice(productStore.currentProduct.price) }} Ar
                        </div>
                      </div>
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
watch(dialog, (newValue) => {
  if (newValue && productStore.currentProduct) {
    // Réinitialiser les valeurs du formulaire à chaque ouverture du dialog
    name.value = productStore.currentProduct.name
    description.value = productStore.currentProduct.description
    price.value = productStore.currentProduct.price
    poid.value = productStore.currentProduct.poid
    product_type_id.value = productStore.currentProduct.product_type_id
    is_active.value = productStore.currentProduct.is_active
    stock_quantity.value = productStore.currentProduct.stock_quantity
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
</style>
