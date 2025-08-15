<template>
  <div class="edit-product">
    <v-container>
      <!-- Breadcrumb -->
      

      <!-- Header avec progression -->
      <div class="header-section mb-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Modifier le Produit</h1>
            <p class="text-body-1 text-medium-emphasis">
              Modifiez les informations de votre produit
            </p>
          </div>
          <v-btn
            color="grey"
            variant="outlined"
            @click="$router.push('/admin/product')"
            prepend-icon="mdi-arrow-left"
          >
            Retour
          </v-btn>
        </div>

        <!-- Indicateur de progression -->
        <div class="progress-indicator mb-4">
          <div class="progress-steps">
            <div class="step-item" :class="{ 'active': currentStep >= 1, 'completed': currentStep > 1 }">
              <div class="step-number">
                <v-icon v-if="currentStep > 1" size="small">mdi-check</v-icon>
                <span v-else>1</span>
              </div>
              <div class="step-label">Informations de base</div>
            </div>
            <div class="step-connector" :class="{ 'active': currentStep > 1 }"></div>
            <div class="step-item" :class="{ 'active': currentStep >= 2, 'completed': currentStep > 2 }">
              <div class="step-number">
                <v-icon v-if="currentStep > 2" size="small">mdi-check</v-icon>
                <span v-else>2</span>
              </div>
              <div class="step-label">Attributs & Variantes</div>
            </div>
            <div class="step-connector" :class="{ 'active': currentStep > 2 }"></div>
            <div class="step-item" :class="{ 'active': currentStep >= 3, 'completed': currentStep > 3 }">
              <div class="step-number">
                <v-icon v-if="currentStep > 3" size="small">mdi-check</v-icon>
                <span v-else>3</span>
              </div>
              <div class="step-label">Finalisation</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <v-card v-if="productStore.loading && !productStore.currentProduct" class="pa-12 text-center" elevation="0">
        <v-progress-circular indeterminate size="64" class="mb-4"></v-progress-circular>
        <h3 class="text-h6 text-grey-lighten-2">Chargement du produit...</h3>
      </v-card>

      <!-- Alert messages -->
      <v-alert
        v-if="productStore.alert"
        :text="productStore.message"
        :color="productStore.message.includes('trop volumineuse') || productStore.message.includes('non autorisé') ? 'error' : 'success'"
        variant="tonal"
        closable
        class="mb-4"
        @click:close="productStore.alert = false"
      ></v-alert>

      <!-- Formulaire en sections -->
      <div v-if="productStore.currentProduct && !productStore.loading" class="form-sections">
        <!-- Section 1: Informations de base -->
        <v-card 
          class="section-card mb-4" 
          :class="{ 'section-active': currentStep === 1 }"
          elevation="2"
        >
          <v-card-title class="section-header d-flex align-center">
            <div class="section-icon">
              <v-icon color="primary">mdi-information</v-icon>
            </div>
            <div class="flex-grow-1">
              <h3 class="section-title">Informations de base</h3>
              <p class="section-subtitle">Modifiez les informations principales du produit</p>
            </div>
            <div class="section-status">
              <v-chip 
                v-if="isBasicInfoComplete" 
                color="success" 
                size="small"
                prepend-icon="mdi-check"
              >
                Complété
              </v-chip>
              <v-chip 
                v-else-if="currentStep > 1" 
                color="warning" 
                size="small"
                prepend-icon="mdi-alert"
              >
                À compléter
              </v-chip>
            </div>
          </v-card-title>

          <v-expand-transition>
            <v-card-text v-show="currentStep === 1 || isBasicInfoComplete">
              <v-form ref="basicForm" v-model="basicFormValid">
                <v-row>
                  <!-- Nom du produit -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="name"
                      label="Nom du produit"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-tag"
                      :rules="[rules.required]"
                      required
                    ></v-text-field>
                  </v-col>

                  <!-- Type de produit -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="product_type_id"
                      :items="productStore.activeProductTypes"
                      item-title="name"
                      item-value="id"
                      label="Type de produit"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-shape"
                      :rules="[rules.required]"
                      required
                      @update:model-value="onProductTypeChange"
                    ></v-select>
                  </v-col>

                  <!-- Description -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="description"
                      label="Description"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-text"
                      rows="4"
                      :rules="[rules.required]"
                      required
                    ></v-textarea>
                  </v-col>

                  <!-- Poids - Affiché seulement si pas de variantes -->
                  <v-col cols="12" md="4" v-if="variants.length === 0">
                    <v-text-field
                      v-model="poid"
                      label="Poids"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-weight"
                      suffix="g"
                      :rules="variants.length === 0 ? [rules.required, rules.positive] : []"
                      :required="variants.length === 0"
                    ></v-text-field>
                  </v-col>

                  <!-- Prix -->
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="price"
                      :label="variants.length > 0 ? 'Prix de base' : 'Prix'"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-currency-usd"
                      suffix="Ar"
                      :rules="[rules.required, rules.positive]"
                      required
                    ></v-text-field>
                  </v-col>

                  <!-- Stock - Affiché seulement si pas de variantes -->
                  <v-col cols="12" md="4" v-if="variants.length === 0">
                    <v-text-field
                      v-model="stock_quantity"
                      label="Quantité en stock"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-package"
                      suffix="unités"
                      :rules="variants.length === 0 ? [rules.required, rules.positiveOrZero] : []"
                      :required="variants.length === 0"
                    ></v-text-field>
                  </v-col>

                  <!-- Alerte pour expliquer la gestion du stock avec variantes -->
                  <v-col cols="12" v-if="variants.length > 0">
                    <v-alert type="info" variant="tonal" class="mb-2">
                      <v-icon start>mdi-information</v-icon>
                      <strong>Gestion avec variantes :</strong> Le poids et le stock sont gérés individuellement pour chaque variante. 
                      Le stock total du produit sera la somme des stocks de toutes les variantes.
                    </v-alert>
                  </v-col>

                  <!-- Image -->
                  <v-col cols="12" md="8">
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

                  <!-- Statut -->
                  <v-col cols="12" md="4">
                    <v-switch
                      v-model="is_active"
                      label="Produit actif"
                      color="success"
                      inset
                      :true-value="true"
                      :false-value="false"
                    ></v-switch>
                    <p class="text-caption text-medium-emphasis mt-1">
                      {{ is_active ? 'Le produit sera visible dans la boutique' : 'Le produit sera masqué de la boutique' }}
                    </p>
                  </v-col>

                  <!-- Prévisualisation de l'image -->
                  <v-col cols="12" v-if="imagePreview || productStore.currentProduct?.image">
                    <v-card variant="outlined">
                      <v-card-title class="text-subtitle-1">
                        <v-icon class="mr-2">mdi-image</v-icon>
                        Prévisualisation
                      </v-card-title>
                      <v-card-text class="text-center">
                        <v-img
                          :src="imagePreview || `${APP_CONFIG.STORAGE_BASE_URL}/produits/${productStore.currentProduct.image}`"
                          max-height="300"
                          max-width="300"
                          class="mx-auto rounded-lg"
                        ></v-img>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-form>

              <!-- Actions de la section -->
              <div class="section-actions mt-4">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="nextStep"
                  :disabled="!basicFormValid"
                  prepend-icon="mdi-arrow-right"
                >
                  Continuer vers les attributs
                </v-btn>
              </div>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- Section 2: Attributs et Variantes -->
        <v-card 
          class="section-card mb-4" 
          :class="{ 'section-active': currentStep === 2, 'section-disabled': !isBasicInfoComplete }"
          elevation="2"
        >
          <v-card-title class="section-header d-flex align-center">
            <div class="section-icon">
              <v-icon :color="isBasicInfoComplete ? 'primary' : 'grey'">mdi-tune</v-icon>
            </div>
            <div class="flex-grow-1">
              <h3 class="section-title">Attributs & Variantes</h3>
              <p class="section-subtitle">Configurez les attributs et gérez les variantes</p>
            </div>
            <div class="section-status">
              <v-chip 
                v-if="!isBasicInfoComplete" 
                color="grey" 
                size="small"
                prepend-icon="mdi-lock"
              >
                Verrouillé
              </v-chip>
              <v-chip 
                v-else-if="selectedAttributes.length > 0" 
                color="success" 
                size="small"
                prepend-icon="mdi-check"
              >
                {{ selectedAttributes.length }} attribut(s)
              </v-chip>
              <v-chip 
                v-else 
                color="info" 
                size="small"
                prepend-icon="mdi-information"
              >
                Optionnel
              </v-chip>
            </div>
            <v-btn
              v-if="isBasicInfoComplete && currentStep !== 2"
              variant="text"
              size="small"
              @click="currentStep = 2"
              prepend-icon="mdi-pencil"
            >
              Modifier
            </v-btn>
          </v-card-title>

          <v-expand-transition>
            <v-card-text v-show="currentStep === 2 && isBasicInfoComplete">
              <!-- Sélection des attributs -->
              <div class="attributes-section mb-6">
                <h4 class="text-h6 mb-4">
                  Sélectionnez les attributs pour votre produit
                  <v-chip color="info" size="small" class="ml-2">
                    Flexibilité totale
                  </v-chip>
                </h4>
                
                <v-alert type="info" variant="tonal" class="mb-4">
                  <v-icon start>mdi-information</v-icon>
                  <strong>Liberté totale :</strong> Choisissez n'importe quels attributs pour votre produit. 
                  Vous pourrez ajouter de nouvelles valeurs lors de la modification des variantes.
                </v-alert>

                <div v-if="typeAttributes.length > 0">
                  <v-row>
                    <v-col 
                      v-for="attr in typeAttributes" 
                      :key="attr.id"
                      cols="12"
                      md="6"
                      lg="4"
                    >
                      <v-card 
                        variant="outlined" 
                        class="attribute-card h-100"
                        :class="{ 'attribute-selected': selectedAttributes.includes(attr.id) }"
                        @click="toggleAttribute(attr.id)"
                      >
                        <v-card-text class="pa-4">
                          <div class="d-flex align-center mb-3">
                            <v-checkbox
                              v-model="selectedAttributes"
                              :value="attr.id"
                              color="primary"
                              hide-details
                              @click.stop
                            ></v-checkbox>
                            <v-icon :color="getAttributeTypeColor(attr.type)" class="mr-2">
                              {{ getAttributeTypeIcon(attr.type) }}
                            </v-icon>
                            <div class="flex-grow-1">
                              <div class="font-weight-medium">{{ attr.name }}</div>
                              <div class="text-caption text-medium-emphasis">{{ attr.description }}</div>
                            </div>
                          </div>
                          
                          <!-- Valeurs disponibles -->
                          <div v-if="attr.values && attr.values.length > 0" class="mt-3">
                            <div class="text-caption text-medium-emphasis mb-2">
                              Valeurs disponibles :
                            </div>
                            <div class="d-flex flex-wrap gap-1">
                              <v-chip
                                v-for="value in attr.values.slice(0, 3)"
                                :key="value.id"
                                size="x-small"
                                variant="outlined"
                                :color="attr.type === 'color' ? 'primary' : 'default'"
                              >
                                <span v-if="attr.type === 'color'" class="d-flex align-center">
                                  <div
                                    class="color-preview-mini mr-1"
                                    :style="{ backgroundColor: value.color_code }"
                                  ></div>
                                  {{ value.label }}
                                </span>
                                <span v-else>{{ value.label }}</span>
                              </v-chip>
                              <v-chip
                                v-if="attr.values.length > 3"
                                size="x-small"
                                variant="text"
                                color="primary"
                              >
                                +{{ attr.values.length - 3 }} autres
                              </v-chip>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
                <v-alert
                  v-else-if="!productStore.loading"
                  type="info"
                  variant="tonal"
                  class="mt-4"
                >
                  <v-icon start>mdi-information</v-icon>
                  Aucun attribut disponible. 
                  <v-btn 
                    color="primary" 
                    variant="text" 
                    size="small"
                    @click="$router.push('/admin/attributes')"
                  >
                    Créer des attributs
                  </v-btn>
                </v-alert>
              </div>

              <!-- Section variantes -->
              <div v-if="selectedAttributes.length > 0 || variants.length > 0" class="variants-section">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h4 class="text-h6">Variantes du produit</h4>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="secondary"
                      variant="outlined"
                      prepend-icon="mdi-auto-fix"
                      @click="generateVariantsFromCombinations"
                      :disabled="!canGenerateVariants"
                    >
                      Générer toutes les combinaisons
                    </v-btn>
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-plus"
                      @click="addVariant"
                      :disabled="selectedAttributes.length === 0"
                    >
                      Ajouter manuellement
                    </v-btn>
                  </div>
                </div>

                <!-- Liste des variantes -->
                <div v-if="variants.length > 0" class="variants-list">
                  <!-- Message informatif pour les variantes existantes -->
                  <v-alert 
                    v-if="variants.length > 0 && selectedAttributes.length === 0"
                    type="info" 
                    variant="tonal" 
                    class="mb-4"
                  >
                    <v-icon start>mdi-information</v-icon>
                    <strong>Variantes existantes :</strong> Ce produit possède déjà des variantes. 
                    Sélectionnez les attributs correspondants pour pouvoir les modifier complètement.
                  </v-alert>
                  
                  <div
                    v-for="(variant, index) in variants"
                    :key="variant.tempId || variant.id"
                    class="variant-card mb-4"
                  >
                    <v-card variant="outlined" class="pa-4">
                      <div class="d-flex justify-space-between align-center mb-3">
                        <h5 class="text-subtitle-1">
                          Variante {{ index + 1 }}
                          <v-chip v-if="variant.name" color="info" size="small" class="ml-2">
                            {{ variant.name }}
                          </v-chip>
                          <v-chip v-if="variant.id" color="success" size="small" class="ml-2">
                            ID: {{ variant.id }}
                          </v-chip>
                        </h5>
                        <v-btn
                          v-if="variants.length > 1"
                          icon="mdi-delete"
                          size="small"
                          color="error"
                          variant="text"
                          @click="removeVariant(index)"
                        ></v-btn>
                      </div>

                      <v-row>
                        <!-- Informations de base de la variante -->
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model="variant.sku"
                            label="SKU"
                            variant="outlined"
                            density="comfortable"
                            :rules="[rules.required]"
                            required
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model="variant.name"
                            label="Nom de la variante"
                            variant="outlined"
                            density="comfortable"
                            placeholder="Optionnel"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number="variant.price"
                            label="Prix"
                            type="number"
                            variant="outlined"
                            density="comfortable"
                            suffix="Ar"
                            :rules="[rules.required, rules.positive]"
                            required
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number="variant.stock_quantity"
                            label="Stock"
                            type="number"
                            variant="outlined"
                            density="comfortable"
                            :rules="[rules.required, rules.positiveOrZero]"
                            required
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model="variant.barcode"
                            label="Code-barres"
                            variant="outlined"
                            density="comfortable"
                          ></v-text-field>
                        </v-col>

                        <!-- Attributs de la variante -->
                        <v-col cols="12">
                          <v-divider class="my-3"></v-divider>
                          <h6 class="text-subtitle-2 mb-3">Attributs de la variante</h6>
                          
                          <!-- Afficher les attributs sélectionnés OU les attributs existants de la variante -->
                          <v-row v-if="selectedAttributes.length > 0 || (variant.attributes && Object.keys(variant.attributes).length > 0)">
                            <v-col
                              v-for="attrId in (selectedAttributes.length > 0 ? selectedAttributes : Object.keys(variant.attributes || {}))"
                              :key="attrId"
                              cols="12"
                              md="6"
                            >
                              <!-- Alerte si pas de valeurs disponibles -->
                              <v-alert
                                v-if="!hasAvailableValues(attrId, index)"
                                type="warning"
                                variant="tonal"
                                class="mb-3"
                                density="compact"
                              >
                                <v-icon start size="16">mdi-alert</v-icon>
                                {{ getNoValuesMessage(attrId) }}
                              </v-alert>
                              
                              <v-select
                                :model-value="getAttributeLabel(variant, attrId)"
                                :items="getAttributeValues(attrId, index)"
                                :label="getAttributeName(attrId)"
                                item-title="label"
                                item-value="label"
                                variant="outlined"
                                density="comfortable"
                                :rules="[rules.required]"
                                required
                                clearable
                                :disabled="!hasAvailableValues(attrId, index)"
                                :hint="!hasAvailableValues(attrId, index) ? 'Aucune valeur disponible' : ''"
                                persistent-hint
                                @update:model-value="(label) => updateAttributeLabel(variant, attrId, label)"
                              >
                                <template v-slot:item="{ props, item }">
                                  <v-list-item v-bind="props">
                                    <template v-slot:prepend v-if="getAttributeType(attrId) === 'color'">
                                      <div
                                        class="color-preview mr-2"
                                        :style="{ backgroundColor: item.raw.color_code }"
                                      ></div>
                                    </template>
                                    <v-list-item-title>{{ item.raw.label }}</v-list-item-title>
                                    <v-list-item-subtitle v-if="item.raw.price_modifier != 0">
                                      Modificateur: {{ item.raw.price_modifier > 0 ? '+' : '' }}{{ formatPrice(item.raw.price_modifier) }} Ar
                                    </v-list-item-subtitle>
                                  </v-list-item>
                                </template>
                              </v-select>
                              
                              <v-btn
                                color="success"
                                variant="outlined"
                                size="small"
                                prepend-icon="mdi-plus"
                                @click="openAddValueDialog(attrId)"
                                class="mt-2"
                                :disabled="!hasAvailableValues(attrId, index)"
                              >
                                Ajouter {{ getAttributeName(attrId).toLowerCase() }}
                              </v-btn>
                            </v-col>
                          </v-row>
                          
                          <!-- Message si pas d'attributs -->
                          <v-row v-else>
                            <v-col cols="12">
                              <v-alert type="info" variant="tonal">
                                <v-icon start>mdi-information</v-icon>
                                Cette variante n'a pas d'attributs configurés.
                              </v-alert>
                            </v-col>
                          </v-row>
                        </v-col>

                        <!-- Image et statut -->
                        <v-col cols="12" md="8">
                          <v-file-input
                            label="Image de la variante"
                            variant="outlined"
                            density="comfortable"
                            accept="image/*"
                            prepend-icon="mdi-camera"
                            clearable
                            show-size
                            @change="uploadVariantImage($event, index)"
                          ></v-file-input>
                          
                          <!-- Prévisualisation de l'image de la variante -->
                          <div v-if="variantImagePreviews[index] || variant.image" class="mt-3">
                            <v-card variant="outlined" class="pa-2">
                              <div class="d-flex align-center">
                                <v-img
                                  :src="variantImagePreviews[index] || `${APP_CONFIG.STORAGE_BASE_URL}/variants/${variant.image}`"
                                  max-height="80"
                                  max-width="80"
                                  class="rounded me-3"
                                ></v-img>
                                <div class="flex-grow-1">
                                  <div class="text-subtitle-2">Prévisualisation</div>
                                  <div class="text-caption text-medium-emphasis">
                                    Image de la variante {{ index + 1 }}
                                  </div>
                                </div>
                                <v-btn
                                  icon="mdi-close"
                                  size="small"
                                  variant="text"
                                  @click="removeVariantImage(index)"
                                ></v-btn>
                              </div>
                            </v-card>
                          </div>
                        </v-col>

                        <v-col cols="12" md="4">
                          <v-switch
                            v-model="variant.is_active"
                            label="Variante active"
                            color="success"
                            inset
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-card>
                  </div>
                </div>

                <v-alert
                  v-else
                  type="info"
                  variant="tonal"
                  class="mt-4"
                >
                  <v-icon start>mdi-information</v-icon>
                  Aucune variante créée. Cliquez sur "Ajouter manuellement" pour créer votre première variante.
                </v-alert>
              </div>

              <!-- Actions de la section -->
              <div class="section-actions mt-6">
                <v-btn
                  color="grey"
                  variant="outlined"
                  @click="previousStep"
                  prepend-icon="mdi-arrow-left"
                  class="mr-2"
                >
                  Retour
                </v-btn>
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="nextStep"
                  prepend-icon="mdi-arrow-right"
                >
                  Finaliser les modifications
                </v-btn>
              </div>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- Section 3: Finalisation -->
        <v-card 
          class="section-card mb-4" 
          :class="{ 'section-active': currentStep === 3, 'section-disabled': !isBasicInfoComplete }"
          elevation="2"
        >
          <v-card-title class="section-header d-flex align-center">
            <div class="section-icon">
              <v-icon :color="isBasicInfoComplete ? 'primary' : 'grey'">mdi-check-circle</v-icon>
            </div>
            <div class="flex-grow-1">
              <h3 class="section-title">Finalisation</h3>
              <p class="section-subtitle">Vérifiez et enregistrez vos modifications</p>
            </div>
          </v-card-title>

          <v-expand-transition>
            <v-card-text v-show="currentStep === 3 && isBasicInfoComplete">
              <!-- Résumé du produit -->
              <div class="product-summary mb-6">
                <h4 class="text-h6 mb-4">Résumé des modifications</h4>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="pa-4">
                      <h5 class="text-subtitle-1 mb-3">Informations générales</h5>
                      <div class="summary-item">
                        <span class="summary-label">Nom :</span>
                        <span class="summary-value">{{ name }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Type :</span>
                        <span class="summary-value">{{ getProductTypeName() }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Prix :</span>
                        <span class="summary-value">{{ formatPrice(price) }} Ar</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Stock :</span>
                        <span class="summary-value">{{ totalStock }} unités</span>
                      </div>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="pa-4">
                      <h5 class="text-subtitle-1 mb-3">Attributs & Variantes</h5>
                      <div class="summary-item">
                        <span class="summary-label">Attributs sélectionnés :</span>
                        <span class="summary-value">{{ selectedAttributes.length }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Variantes :</span>
                        <span class="summary-value">{{ variants.length }}</span>
                      </div>
                      <div v-if="selectedAttributes.length > 0" class="mt-3">
                        <v-chip
                          v-for="attrId in selectedAttributes"
                          :key="attrId"
                          size="small"
                          color="primary"
                          variant="outlined"
                          class="mr-1 mb-1"
                        >
                          {{ getAttributeName(attrId) }}
                        </v-chip>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <!-- Actions finales -->
              <div class="section-actions">
                <v-btn
                  color="grey"
                  variant="outlined"
                  @click="previousStep"
                  prepend-icon="mdi-arrow-left"
                  class="mr-2"
                >
                  Retour
                </v-btn>
                <v-btn
                  color="primary"
                  variant="elevated"
                  size="large"
                  @click="updateProduct"
                  :disabled="!isFormValid"
                  :loading="productStore.loading"
                  prepend-icon="mdi-content-save"
                >
                  Enregistrer les modifications
                </v-btn>
              </div>
            </v-card-text>
          </v-expand-transition>
        </v-card>
      </div>
    </v-container>

    <!-- Dialog pour ajouter une nouvelle valeur d'attribut -->
    <v-dialog v-model="addValueDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2">mdi-plus</v-icon>
          Ajouter une valeur pour "{{ currentAttributeName }}"
        </v-card-title>
        
        <v-card-text>
          <v-form ref="valueForm" v-model="valueFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newValue.value"
                  label="Valeur"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                  placeholder="Ex: XL, Rouge, 2.5kg"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newValue.label"
                  label="Libellé"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                  placeholder="Ex: Extra Large, Rouge, 2.5 kilogrammes"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6" v-if="currentAttributeType === 'color'">
                <div class="color-field">
                  <v-text-field
                    v-model="newValue.color_code"
                    label="Code couleur"
                    variant="outlined"
                    density="comfortable"
                    :rules="[rules.required, rules.colorCode]"
                    required
                    placeholder="#FF0000"
                    readonly
                  >
                    <template v-slot:prepend-inner>
                      <div
                        class="color-preview mr-2"
                        :style="{ backgroundColor: newValue.color_code || '#CCCCCC' }"
                      ></div>
                    </template>
                    <template v-slot:append-inner>
                      <v-menu>
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-palette"
                            variant="text"
                            size="small"
                            color="primary"
                          ></v-btn>
                        </template>
                        <v-color-picker
                          v-model="newValue.color_code"
                          mode="hex"
                          show-swatches
                          hide-canvas
                          hide-sliders
                          hide-inputs
                          :swatches="colorSwatches"
                          @update:model-value="updateColorValue"
                        ></v-color-picker>
                      </v-menu>
                    </template>
                  </v-text-field>
                  
                  <!-- Color picker alternatif plus grand -->
                  <v-expansion-panels class="mt-2">
                    <v-expansion-panel>
                      <v-expansion-panel-title>
                        <v-icon class="mr-2">mdi-palette</v-icon>
                        Sélecteur de couleur avancé
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-color-picker
                          v-model="newValue.color_code"
                          mode="hex"
                          show-swatches
                          :swatches="colorSwatches"
                          @update:model-value="updateColorValue"
                        ></v-color-picker>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newValue.price_modifier"
                  label="Modificateur de prix"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  suffix="Ar"
                  placeholder="0"
                  hint="Montant à ajouter/retirer au prix de base"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newValue.sort_order"
                  label="Ordre de tri"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="0"
                  hint="Ordre d'affichage (0 = premier)"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="closeAddValueDialog"
          >
            Annuler
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            @click="addNewAttributeValue"
            :disabled="!valueFormValid"
            :loading="addingValue"
          >
            <v-icon start>mdi-plus</v-icon>
            Ajouter
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProductStore } from '../../../store/AdminStore/ProductStore'
import { useRouter, useRoute } from 'vue-router'
import { APP_CONFIG } from '../../../config/constants'

const productStore = useProductStore()
const router = useRouter()
const route = useRoute()

// Étapes du formulaire
const currentStep = ref(1)

// Forms refs
const basicForm = ref(null)
const valueForm = ref(null)

// Form validation
const basicFormValid = ref(false)
const valueFormValid = ref(false)

// Form data - Basic
const name = ref('')
const description = ref('')
const poid = ref(0)
const price = ref(0)
const product_type_id = ref<number | null>(null)
const stock_quantity = ref(0)
const is_active = ref(true)
const image = ref<File | null>(null)
const sary = ref<File | null>(null)

// Attributes
const typeAttributes = ref([])
const selectedAttributes = ref([])

// Variants
const variants = ref([])
const variantImagePreviews = ref({}) // Pour les prévisualisations
const variantImages = ref({}) // Pour stocker les fichiers des images des variantes

// Dialog pour ajouter des valeurs d'attributs
const addValueDialog = ref(false)
const addingValue = ref(false)
const currentAttributeId = ref(null)
const currentAttributeName = ref('')
const currentAttributeType = ref('')
const newValue = ref({
  value: '',
  label: '',
  color_code: '',
  price_modifier: 0,
  sort_order: 0
})

// Color picker swatches
const colorSwatches = ref([
  ['#FF0000', '#FF4444', '#FF8888', '#FFCCCC'],
  ['#00FF00', '#44FF44', '#88FF88', '#CCFFCC'],
  ['#0000FF', '#4444FF', '#8888FF', '#CCCCFF'],
  ['#FFFF00', '#FFFF44', '#FFFF88', '#FFFFCC'],
  ['#FF00FF', '#FF44FF', '#FF88FF', '#FFCCFF'],
  ['#00FFFF', '#44FFFF', '#88FFFF', '#CCFFFF'],
  ['#000000', '#444444', '#888888', '#CCCCCC'],
  ['#FFA500', '#FFB84D', '#FFCC99', '#FFE6CC'],
  ['#800080', '#9933CC', '#B366FF', '#D9B3FF'],
  ['#FFC0CB', '#FFD0DC', '#FFE0E6', '#FFF0F3']
])

// Computed properties
const isBasicInfoComplete = computed(() => {
  return name.value && description.value && poid.value > 0 && price.value > 0 && 
         product_type_id.value && stock_quantity.value >= 0 && basicFormValid.value
})

const isFormValid = computed(() => {
  const hasVariants = variants.value.length > 0
  
  if (hasVariants) {
    // Produit avec variantes : vérifier que les infos de base sont complètes et qu'il y a au moins une variante valide
    return isBasicInfoComplete.value && 
           variants.value.length > 0 && 
           variants.value.every(variant => 
             variant.sku && 
             variant.price > 0 && 
             variant.stock_quantity >= 0
           )
  } else {
    // Produit simple : vérifier que toutes les infos de base sont complètes (y compris poids et stock)
    return name.value && 
           description.value && 
           poid.value > 0 && 
           price.value > 0 && 
           product_type_id.value && 
           stock_quantity.value >= 0 && 
           basicFormValid.value
  }
})

const totalStock = computed(() => {
  if (variants.value.length > 0) {
    // Pour les produits avec variantes, calculer la somme des stocks
    return variants.value.reduce((total, variant) => {
      return total + (Number(variant.stock_quantity) || 0)
    }, 0)
  } else {
    // Pour les produits simples, utiliser le stock direct
    return Number(stock_quantity.value) || 0
  }
})

const canGenerateVariants = computed(() => {
  return selectedAttributes.value.length > 0 && typeAttributes.value.length > 0 && 
         selectedAttributes.value.every(attrId => {
           const attr = typeAttributes.value.find(a => a.id === attrId)
           return attr && attr.values && attr.values.length > 0
         })
})

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Ce champ est requis',
  positive: (value: number) => value > 0 || 'La valeur doit être positive',
  positiveOrZero: (value: number) => value >= 0 || 'La valeur doit être positive ou nulle',
  colorCode: (value: string) => {
    if (!value) return true
    return /^#[0-9A-Fa-f]{6}$/.test(value) || 'Format invalide (ex: #FF0000)'
  }
}

// Navigation methods
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Image handling
const imagePreview = ref<string | null>(null)

const uploadImage = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    sary.value = target.files[0]
    
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  } else {
    sary.value = null
    imagePreview.value = null
  }
}

// Fonction pour gérer l'upload des images des variantes
const uploadVariantImage = (event: Event, variantIndex: number) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // S'assurer que l'objet variant existe
    if (!variants.value[variantIndex]) {
      console.error(`Variante ${variantIndex} n'existe pas`);
      return;
    }
    
    // Stocker le fichier dans l'objet séparé (comme pour l'image principale)
    variantImages.value[variantIndex] = file
    
    // Créer la prévisualisation
    const reader = new FileReader()
    reader.onload = (e) => {
      variantImagePreviews.value[variantIndex] = e.target?.result as string
    }
    reader.readAsDataURL(file)
    
  } else {
    delete variantImages.value[variantIndex]
    delete variantImagePreviews.value[variantIndex]
  }
}

// Fonction pour supprimer l'image d'une variante
const removeVariantImage = (variantIndex: number) => {
  delete variantImages.value[variantIndex]
  delete variantImagePreviews.value[variantIndex]
}

// Product type handling
const onProductTypeChange = async (newValue: number | null) => {
  if (newValue) {
    await loadTypeAttributes()
  } else {
    typeAttributes.value = []
    selectedAttributes.value = []
    variants.value = []
  }
}

const loadTypeAttributes = async () => {
  if (product_type_id.value) {
    try {
      const response = await productStore.getProductTypeAttributes(product_type_id.value)
      typeAttributes.value = response.data.attributes || []
    } catch (error) {
      console.error('Erreur lors du chargement des attributs:', error)
      typeAttributes.value = []
    }
  } else {
    typeAttributes.value = []
  }
}

// Attribute handling
const toggleAttribute = (attributeId: number) => {
  const index = selectedAttributes.value.indexOf(attributeId)
  if (index > -1) {
    selectedAttributes.value.splice(index, 1)
  } else {
    selectedAttributes.value.push(attributeId)
  }
}

const getAttributeValues = (attributeId: number, currentVariantIndex?: number) => {
  const attribute = typeAttributes.value.find(attr => attr.id === attributeId)
  if (!attribute || !attribute.values) {
    // Si l'attribut n'est pas trouvé dans typeAttributes, essayer de le récupérer depuis le store
    console.warn(`Attribut ${attributeId} non trouvé dans typeAttributes`)
    return []
  }
  
  // Si on est en mode édition d'une variante spécifique, filtrer les valeurs déjà utilisées
  if (currentVariantIndex !== undefined && variants.value.length > 0) {
    const usedLabels = new Set()
    
    // Collecter toutes les valeurs utilisées par les autres variantes pour cet attribut
    variants.value.forEach((variant, index) => {
      if (index !== currentVariantIndex && variant.attributes && variant.attributes[attributeId]) {
        const attr = variant.attributes[attributeId]
        const label = typeof attr === 'object' ? attr.label : ''
        if (label) {
          usedLabels.add(label)
        }
      }
    })
    
    // Retourner seulement les valeurs non utilisées
    return attribute.values.filter(value => !usedLabels.has(value.label))
  }
  
  // Sinon, retourner toutes les valeurs
  return attribute.values
}

// Fonction pour normaliser les attributs (gérer l'ancien et le nouveau format)
const normalizeAttribute = (variant, attrId) => {
  const attr = variant.attributes[attrId]
  if (!attr) return null
  
  if (typeof attr === 'object' && attr.value_id !== undefined) {
    // Nouveau format
    return attr
  } else {
    // Ancien format - convertir
    return {
      value_id: attr,
      value: '',
      label: '',
      attribute_name: getAttributeName(attrId),
      attribute_type: getAttributeType(attrId)
    }
  }
}

// Fonction pour obtenir la valeur d'un attribut
const getAttributeValue = (variant, attrId) => {
  const normalized = normalizeAttribute(variant, attrId)
  return normalized ? normalized.value_id : null
}

// Fonction pour obtenir le label d'un attribut
const getAttributeLabel = (variant, attrId) => {
  const normalized = normalizeAttribute(variant, attrId)
  return normalized ? normalized.label : ''
}

// Fonction pour mettre à jour la valeur d'un attribut
const updateAttributeValue = (variant, attrId, value) => {
  if (!variant.attributes[attrId]) {
    // Créer la structure si elle n'existe pas
    variant.attributes[attrId] = {
      value_id: null,
      value: '',
      label: '',
      attribute_name: getAttributeName(attrId),
      attribute_type: getAttributeType(attrId)
    }
  }
  
  // Mettre à jour la valeur
  variant.attributes[attrId].value_id = value
  
  // Mettre à jour le label et la valeur si possible
  const attribute = typeAttributes.value.find(attr => attr.id === attrId)
  if (attribute && attribute.values) {
    const selectedValue = attribute.values.find(v => v.id === value)
    if (selectedValue) {
      variant.attributes[attrId].value = selectedValue.value
      variant.attributes[attrId].label = selectedValue.label
    }
  }
}

// Fonction pour mettre à jour le label d'un attribut
const updateAttributeLabel = (variant, attrId, label) => {
  if (!variant.attributes[attrId]) {
    // Créer la structure si elle n'existe pas
    variant.attributes[attrId] = {
      value_id: null,
      value: '',
      label: '',
      attribute_name: getAttributeName(attrId),
      attribute_type: getAttributeType(attrId)
    }
  }
  
  // Mettre à jour le label
  variant.attributes[attrId].label = label
  
  // Trouver l'ID correspondant au label
  const attribute = typeAttributes.value.find(attr => attr.id === attrId)
  if (attribute && attribute.values) {
    const selectedValue = attribute.values.find(v => v.label === label)
    if (selectedValue) {
      variant.attributes[attrId].value_id = selectedValue.id
      variant.attributes[attrId].value = selectedValue.value
    }
  }
}

const hasAvailableValues = (attributeId: number, currentVariantIndex?: number) => {
  const availableValues = getAttributeValues(attributeId, currentVariantIndex)
  return availableValues.length > 0
}

const getNoValuesMessage = (attributeId: number) => {
  const attribute = typeAttributes.value.find(attr => attr.id === attributeId)
  if (!attribute) return ''
  
  const usedLabels = new Set()
  variants.value.forEach(variant => {
    if (variant.attributes && variant.attributes[attributeId]) {
      const attr = variant.attributes[attributeId]
      const label = typeof attr === 'object' ? attr.label : ''
      if (label) {
        usedLabels.add(label)
      }
    }
  })
  
  const usedLabelsList = attribute.values
    .filter(value => usedLabels.has(value.label))
    .map(value => value.label)
    .join(', ')
  
  return `Toutes les valeurs de "${attribute.name}" sont déjà utilisées (${usedLabelsList}). Ajoutez de nouvelles valeurs ou supprimez une variante.`
}

const getAttributeName = (attributeId: number) => {
  const attribute = typeAttributes.value.find(attr => attr.id === attributeId)
  if (!attribute) {
    // Si l'attribut n'est pas trouvé, retourner un nom par défaut
    console.warn(`Attribut ${attributeId} non trouvé pour getAttributeName`)
    return `Attribut ${attributeId}`
  }
  return attribute.name
}

const getAttributeType = (attributeId: number) => {
  const attribute = typeAttributes.value.find(attr => attr.id === attributeId)
  return attribute ? attribute.type : 'text'
}

const getAttributeTypeColor = (type: string) => {
  switch (type) {
    case 'color': return 'primary'
    case 'text': return 'info'
    case 'number': return 'success'
    case 'boolean': return 'warning'
    default: return 'info'
  }
}

const getAttributeTypeIcon = (type: string) => {
  switch (type) {
    case 'color': return 'mdi-palette'
    case 'text': return 'mdi-text'
    case 'number': return 'mdi-numeric'
    case 'boolean': return 'mdi-check-circle'
    default: return 'mdi-help-circle'
  }
}

// Variant handling
const generateVariantsFromCombinations = () => {
  if (!canGenerateVariants.value) return

  const newVariants = []
  const attributeCombinations = generateAttributeCombinations()
  
  attributeCombinations.forEach((combination, index) => {
    const variant = {
      tempId: Date.now() + index,
      sku: `${name.value.toLowerCase().replace(/\s/g, '-')}-${index + 1}`,
      name: `${name.value} - ${combination.map(attr => attr.label).join(' - ')}`,
      price: price.value,
      stock_quantity: stock_quantity.value,
      barcode: null,
      is_active: true,
      attributes: {}
    }

    combination.forEach(attr => {
      // Utiliser la nouvelle structure des attributs
      variant.attributes[attr.attributeId] = {
        value_id: attr.valueId,
        value: attr.label,
        label: attr.label,
        attribute_name: getAttributeName(attr.attributeId),
        attribute_type: getAttributeType(attr.attributeId)
      }
    })

    newVariants.push(variant)
  })

  variants.value = newVariants
}

const generateAttributeCombinations = () => {
  const combinations = []
  const selectedAttrs = selectedAttributes.value.map(attrId => {
    const attr = typeAttributes.value.find(a => a.id === attrId)
    return {
      id: attrId,
      values: attr ? attr.values : []
    }
  })

  const generateCombos = (index, currentCombo) => {
    if (index === selectedAttrs.length) {
      combinations.push([...currentCombo])
      return
    }

    const attr = selectedAttrs[index]
    attr.values.forEach(value => {
      currentCombo.push({
        attributeId: attr.id,
        valueId: value.id,
        label: value.label
      })
      generateCombos(index + 1, currentCombo)
      currentCombo.pop()
    })
  }

  generateCombos(0, [])
  return combinations
}

const addVariant = () => {
  const newVariant = {
    tempId: Date.now(),
    sku: '',
    name: '',
    price: price.value || 0,
    stock_quantity: stock_quantity.value || 0,
    barcode: null,
    is_active: true,
    attributes: {}
  }
  
  // Initialiser les attributs sélectionnés avec la nouvelle structure
  selectedAttributes.value.forEach(attrId => {
    newVariant.attributes[attrId] = {
      value_id: null,
      value: '',
      label: '',
      attribute_name: getAttributeName(attrId),
      attribute_type: getAttributeType(attrId)
    }
  })
  
  variants.value.push(newVariant)
}

const removeVariant = (index) => {
  // Supprimer l'image et la prévisualisation de la variante supprimée
  delete variantImages.value[index]
  delete variantImagePreviews.value[index]
  
  // Supprimer la variante
  variants.value.splice(index, 1)
  
  // Réorganiser les indices des images et prévisualisations
  const newImages = {}
  const newPreviews = {}
  
  Object.keys(variantImages.value).forEach(key => {
    const keyIndex = parseInt(key)
    if (keyIndex > index) {
      newImages[keyIndex - 1] = variantImages.value[key]
    } else if (keyIndex < index) {
      newImages[keyIndex] = variantImages.value[key]
    }
  })
  
  Object.keys(variantImagePreviews.value).forEach(key => {
    const keyIndex = parseInt(key)
    if (keyIndex > index) {
      newPreviews[keyIndex - 1] = variantImagePreviews.value[key]
    } else if (keyIndex < index) {
      newPreviews[keyIndex] = variantImagePreviews.value[key]
    }
  })
  
  variantImages.value = newImages
  variantImagePreviews.value = newPreviews
  
  // Forcer la réactivité pour mettre à jour les listes de valeurs disponibles
  // Cela va déclencher les watchers et recalculer les valeurs disponibles
  variants.value = [...variants.value]
}

// Add attribute value dialog
const openAddValueDialog = (attributeId) => {
  currentAttributeId.value = attributeId
  currentAttributeName.value = getAttributeName(attributeId)
  currentAttributeType.value = getAttributeType(attributeId)
  
  newValue.value = {
    value: '',
    label: '',
    color_code: '',
    price_modifier: 0,
    sort_order: 0
  }
  
  addValueDialog.value = true
}

const closeAddValueDialog = () => {
  addValueDialog.value = false
  currentAttributeId.value = null
  currentAttributeName.value = ''
  currentAttributeType.value = ''
}

const updateColorValue = (color: string) => {
  newValue.value.color_code = color
}

const addNewAttributeValue = async () => {
  if (!valueFormValid.value || !currentAttributeId.value) return
  
  addingValue.value = true
  
  try {
    const valueData = {
      value: newValue.value.value,
      label: newValue.value.label,
      color_code: currentAttributeType.value === 'color' ? newValue.value.color_code : null,
      price_modifier: newValue.value.price_modifier || 0,
      sort_order: newValue.value.sort_order || 0
    }
    
    await productStore.createAttributeValue(currentAttributeId.value, valueData)
    await loadTypeAttributes()
    closeAddValueDialog()
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la valeur:', error)
  } finally {
    addingValue.value = false
  }
}

// Utility methods
const formatPrice = (value: number) => {
  return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getProductTypeName = () => {
  const type = productStore.activeProductTypes.find(t => t.id === product_type_id.value)
  return type ? type.name : ''
}

// Load product data
const loadProductData = async () => {
  if (productStore.currentProduct) {
    const product = productStore.currentProduct
    
    // Remplir les champs de base
    name.value = product.name
    description.value = product.description
    price.value = product.price
    poid.value = product.poid
    product_type_id.value = product.product_type_id
    is_active.value = product.is_active
    stock_quantity.value = product.stock_quantity
    
    // Charger les attributs du type de produit
    if (product.product_type_id) {
      await loadTypeAttributes()
    }
    
    // Charger les variantes existantes si elles existent
    if (product.variants && product.variants.length > 0) {
      variants.value = product.variants.map(variant => ({
        id: variant.id,
        tempId: Date.now() + Math.random(), // Pour les nouvelles variantes
        sku: variant.sku,
        name: variant.name,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
        barcode: variant.barcode,
        is_active: variant.is_active,
        attributes: variant.attributes.reduce((acc, attr) => {
          // Préserver les informations complètes de l'attribut
          acc[attr.attribute_id] = {
            value_id: attr.value_id,
            value: attr.value,
            label: attr.label,
            attribute_name: attr.attribute_name,
            attribute_type: attr.attribute_type
          }
          return acc
        }, {})
      }))
      
      // Détecter automatiquement les attributs utilisés par les variantes existantes
      const usedAttributes = new Set()
      variants.value.forEach(variant => {
        if (variant.attributes) {
          Object.keys(variant.attributes).forEach(attrId => {
            usedAttributes.add(parseInt(attrId))
          })
        }
      })
      
      // Ajouter les attributs détectés à selectedAttributes
      selectedAttributes.value = Array.from(usedAttributes)
    }
    
    // Charger les attributs sélectionnés si le produit en a (en plus de ceux détectés)
    if (product.available_attributes && product.available_attributes.length > 0) {
      const availableAttrIds = product.available_attributes.map(attr => attr.id)
      // Fusionner avec les attributs détectés, en évitant les doublons
      const allAttributes = new Set([...selectedAttributes.value, ...availableAttrIds])
      selectedAttributes.value = Array.from(allAttributes)
    }
  }
}

// Update product
const updateProduct = async () => {
  if (!isFormValid.value || !productStore.currentProduct?.id) return

  try {
    const formData = new FormData()
    
    // Ajouter l'image principale seulement si elle est valide
    if (sary.value && sary.value instanceof File) {
      // Vérifier la taille du fichier (max 2MB)
      if (sary.value.size > 2 * 1024 * 1024) {
        console.error('Image trop volumineuse:', sary.value.size);
        productStore.alert = true;
        productStore.message = 'L\'image principale est trop volumineuse. Taille maximale: 2MB';
        return;
      }
      
      // Vérifier le type MIME
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(sary.value.type)) {
        console.error('Type de fichier non autorisé:', sary.value.type);
        productStore.alert = true;
        productStore.message = 'Type de fichier non autorisé pour l\'image principale. Formats acceptés: JPEG, PNG, JPG, GIF';
        return;
      }
      
      console.log('Ajout de l\'image principale:', {
        name: sary.value.name,
        size: sary.value.size,
        type: sary.value.type
      });
      
      formData.append('image', sary.value);
    }

    // Déterminer si c'est un produit avec variantes
    const hasVariants = variants.value.length > 0

    // Ajouter les champs de base
    formData.append('name', name.value)
    formData.append('description', description.value)
    formData.append('price', Number(price.value).toString())
    formData.append('product_type_id', product_type_id.value.toString())
    formData.append('is_active', is_active.value.toString())

    // Ajouter les champs conditionnels selon le type de produit
    if (hasVariants) {
      // Produit avec variantes
      formData.append('poid', (poid.value ? Number(poid.value) : 0).toString())
      // Ne pas envoyer stock_quantity - il sera calculé côté serveur
      
      // Envoyer les attributs comme JSON
      formData.append('attributes', JSON.stringify(selectedAttributes.value))
      
      // Envoyer les variantes comme JSON
      const variantsData = variants.value.map(variant => ({
        sku: variant.sku,
        name: variant.name,
        price: Number(variant.price),
        stock_quantity: Number(variant.stock_quantity),
        barcode: variant.barcode,
        is_active: variant.is_active,
        attributes: Object.keys(variant.attributes).reduce((acc, attrId) => {
          // Transformer les attributs dans le format attendu par l'API
          const attr = variant.attributes[attrId]
          if (typeof attr === 'object' && attr.value_id) {
            // Nouveau format avec informations complètes
            acc[attrId] = attr.value_id
          } else {
            // Ancien format (fallback)
            acc[attrId] = attr
          }
          return acc
        }, {})
      }))
      formData.append('variants', JSON.stringify(variantsData))
      
      // Debug: vérifier l'état des variantes avant l'envoi
      console.log('État des variantes avant envoi:', variants.value.map((variant, index) => ({
        index,
        sku: variant.sku,
        name: variant.name,
        hasImage: variantImages.value[index] instanceof File,
        imageInfo: variantImages.value[index] instanceof File ? {
          name: variantImages.value[index].name,
          size: variantImages.value[index].size,
          type: variantImages.value[index].type
        } : null
      })));
      
      // Ajouter les images des variantes avec validation
      variants.value.forEach((variant, index) => {
        if (variantImages.value[index] && variantImages.value[index] instanceof File) {
          const variantImage = variantImages.value[index];
          
          // Vérifier la taille du fichier (max 2MB)
          if (variantImage.size > 2 * 1024 * 1024) {
            console.error(`Image de la variante ${index} trop volumineuse:`, variantImage.size);
            productStore.alert = true;
            productStore.message = `L'image de la variante ${index + 1} est trop volumineuse. Taille maximale: 2MB`;
            return;
          }
          
          // Vérifier le type MIME
          const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
          if (!allowedTypes.includes(variantImage.type)) {
            console.error(`Type de fichier non autorisé pour la variante ${index}:`, variantImage.type);
            productStore.alert = true;
            productStore.message = `Type de fichier non autorisé pour la variante ${index + 1}. Formats acceptés: JPEG, PNG, JPG, GIF`;
            return;
          }
          
          console.log(`Ajout de l'image de la variante ${index}:`, {
            name: variantImage.name,
            size: variantImage.size,
            type: variantImage.type
          });
          
          formData.append(`variant_images_${index}`, variantImage);
        } else {
          console.log(`Pas d'image pour la variante ${index}`);
        }
      })
    } else {
      // Produit simple
      formData.append('poid', Number(poid.value).toString())
      formData.append('stock_quantity', Number(stock_quantity.value).toString())
      // Pas d'attributs ni de variantes pour un produit simple
    }

    // Debug: afficher le contenu du FormData
    console.log('=== CONTENU DU FORMDATA ===');
    // @ts-ignore - FormData.entries() est supporté dans les navigateurs modernes
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Utiliser le store pour mettre à jour le produit
    await productStore.updateProduct(productStore.currentProduct.id, null, formData)

    if (productStore.alert && productStore.message) {
      setTimeout(() => {
        router.push(`/admin/product/${productStore.currentProduct.id}`)
      }, 2000)
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error)
  }
}

// Watchers
watch(selectedAttributes, (newValue) => {
  if (newValue.length === 0) {
    variants.value = []
    // Nettoyer aussi les images des variantes
    variantImages.value = {}
    variantImagePreviews.value = {}
  }
})

// Watcher pour les variantes - forcer la réactivité quand les attributs changent
watch(variants, () => {
  // Forcer la réactivité pour mettre à jour les listes de valeurs disponibles
  variants.value = [...variants.value]
}, { deep: true })

// Watch pour charger les données du produit quand il est disponible
watch(() => productStore.currentProduct, async (newProduct) => {
  if (newProduct) {
    await loadProductData()
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  // Charger les types de produits et attributs
  await productStore.getProductTypes()
  await productStore.getAttributes()
  
  // Charger le produit à modifier
  const productId = Number(route.params.id)
  if (productId) {
    await productStore.showProduct(productId)
  }
})
</script>

<style scoped>
/* Reprendre les mêmes styles que Create.vue */
/* Progress indicator */
.progress-indicator {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgb(var(--v-theme-outline-variant));
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  border: 2px solid rgb(var(--v-theme-outline-variant));
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-color: rgb(var(--v-theme-primary));
}

.step-item.completed .step-number {
  background: rgb(var(--v-theme-success));
  color: rgb(var(--v-theme-on-success));
  border-color: rgb(var(--v-theme-success));
}

.step-label {
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
  text-align: center;
}

.step-item.active .step-label {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.step-item.completed .step-label {
  color: rgb(var(--v-theme-success));
  font-weight: 600;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: rgb(var(--v-theme-outline-variant));
  margin: 0 16px;
  transition: all 0.3s ease;
}

.step-connector.active {
  background: rgb(var(--v-theme-primary));
}

/* Section cards */
.section-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.section-card.section-active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 4px 20px rgba(88, 101, 242, 0.15);
}

.section-card.section-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.section-header {
  padding: 20px 24px;
  background: rgb(var(--v-theme-surface-variant));
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.section-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-surface));
  margin-right: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 4px;
}

.section-subtitle {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

.section-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
}

/* Attribute cards */
.attribute-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgb(var(--v-theme-outline-variant));
}

.attribute-card:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 4px 12px rgba(88, 101, 242, 0.1);
}

.attribute-card.attribute-selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(88, 101, 242, 0.05);
}

/* Color preview */
.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: inline-block;
}

.color-preview-mini {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: inline-block;
}

/* Color field styling */
.color-field {
  position: relative;
}

.color-field .v-expansion-panels {
  box-shadow: none;
}

.color-field .v-expansion-panel {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
}

.color-field .v-expansion-panel-title {
  padding: 12px 16px;
  min-height: 48px;
}

.color-field .v-expansion-panel-text {
  padding: 16px;
}

/* Color picker menu styling */
.v-overlay .v-color-picker {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Variant cards */
.variant-card {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  overflow: hidden;
}

/* Summary */
.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
}

.summary-value {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

/* Responsive */
@media (max-width: 768px) {
  .progress-steps {
    flex-direction: column;
    gap: 16px;
  }
  
  .step-connector {
    width: 2px;
    height: 24px;
    margin: 0;
  }
  
  .section-header {
    padding: 16px;
  }
  
  .section-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
}
</style> 