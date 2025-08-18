<template>
  <div class="product-show">
    <v-container>
      <v-card v-if="productStore.loadingProduct" class="loading-card" elevation="0">
        <v-progress-linear :active="productStore.loadingProduct" :indeterminate="productStore.loadingProduct" color="primary" height="4"></v-progress-linear>
      </v-card>

      <div v-if="productStore.currentProduct && !productStore.loadingProduct">
        <v-breadcrumbs class="pa-0 mb-4">
          <v-breadcrumbs-item>
            <router-link :to="baseListPath" class="text-decoration-none">
              <v-icon class="mr-2">mdi-package-variant</v-icon>
              Produits
            </router-link>
          </v-breadcrumbs-item>
          <v-breadcrumbs-divider>/</v-breadcrumbs-divider>
          <v-breadcrumbs-item disabled>
            {{ productStore.currentProduct.name }}
          </v-breadcrumbs-item>
        </v-breadcrumbs>

        <v-row class="mb-6">
          <v-col cols="12">
            <div class="d-flex justify-space-between align-center">
              <v-btn color="primary" variant="outlined" @click="$router.go(-1)" prepend-icon="mdi-arrow-left">
                Retour
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="5">
            <v-card class="product-image-card" elevation="3">
              <div class="text-center pa-6">
                <v-img v-if="productStore.currentProduct.image" :src="`${appConfig.STORAGE_BASE_URL}/produits/${productStore.currentProduct.image}`" class="rounded-lg product-image" height="auto" cover></v-img>
                <div v-else class="image-placeholder">
                  <v-icon size="120" color="grey-lighten-2">mdi-image-off</v-icon>
                  <p class="text-grey-lighten-2 mt-4 text-h6">Aucune image</p>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="7">
            <v-card class="product-details-card" elevation="3">
              <v-card-text class="pa-6">
                <div class="product-header mb-6">
                  <h1 class="text-h3 font-weight-bold mb-4">{{ productStore.currentProduct.name }}</h1>

                  <div class="d-flex align-center mb-4" v-if="productStore.currentProduct.rating && productStore.currentProduct.avis && productStore.currentProduct.avis.length">
                    <v-rating :model-value="productStore.currentProduct.rating" readonly size="small" color="amber" density="compact" class="mr-2"></v-rating>
                    <span class="text-body-2 text-medium-emphasis">{{ productStore.currentProduct.rating }}/5</span>
                    <span class="text-body-2 text-medium-emphasis ml-2">({{ productStore.currentProduct.avis?.length || 0 }} avis)</span>
                  </div>

                  <div class="price-section mb-6">
                    <div class="text-h4 font-weight-bold text-success">{{ formatPrice(productStore.currentProduct.price) }} Ar</div>
                  </div>

                  <div class="quick-stats mb-6">
                    <v-row>
                      <v-col cols="6" md="4">
                        <div class="stat-item">
                          <div class="stat-icon"><v-icon color="info" size="24">mdi-weight</v-icon></div>
                          <div class="stat-content">
                            <div class="stat-value">{{ productStore.currentProduct.poid }}g</div>
                            <div class="stat-label">Poids</div>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="6" md="4">
                        <div class="stat-item">
                          <div class="stat-icon"><v-icon color="primary" size="24">mdi-shape</v-icon></div>
                          <div class="stat-content">
                            <div class="stat-value">{{ productStore.currentProduct.product_type?.name || productStore.currentProduct.productType?.name || 'N/A' }}</div>
                            <div class="stat-label">Type</div>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="6" md="4">
                        <div class="stat-item">
                          <div class="stat-icon"><v-icon color="success" size="24">mdi-star</v-icon></div>
                          <div class="stat-content">
                            <div class="stat-value">{{ productStore.currentProduct.rating || 0 }}/5</div>
                            <div class="stat-label">Note</div>
                          </div>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </div>

                <div class="description-section">
                  <div class="detail-label mb-2">
                    <v-icon color="primary" size="20" class="mr-2">mdi-text</v-icon>
                    Description
                  </div>
                  <p class="text-body-1 text-medium-emphasis">{{ productStore.currentProduct.description }}</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="productStore.currentProduct.has_variants || (productStore.currentProduct.available_attributes && productStore.currentProduct.available_attributes.length > 0)" class="mt-6">
          <v-col cols="12">
            <v-card class="pa-4" elevation="3">
              <v-card-title class="text-h6 pb-4">
                <v-icon class="mr-2">mdi-tune</v-icon>
                Variantes et Options
                <v-chip v-if="productStore.currentProduct.has_variants" color="info" variant="tonal" size="small" class="ml-2">{{ productStore.currentProduct.variants?.length || 0 }} variante(s)</v-chip>
              </v-card-title>

              <div v-if="productStore.currentProduct.available_attributes && productStore.currentProduct.available_attributes.length > 0" class="mb-6">
                <h3 class="text-h6 mb-3"><v-icon class="mr-2" color="primary">mdi-format-list-bulleted</v-icon>Attributs disponibles</h3>
                <v-row>
                  <v-col v-for="attribute in productStore.currentProduct.available_attributes" :key="attribute.id" cols="12" md="6">
                    <v-card variant="outlined" class="pa-3">
                      <div class="d-flex align-center mb-2">
                        <v-icon :color="getAttributeColor(attribute.type)" class="mr-2">{{ getAttributeIcon(attribute.type) }}</v-icon>
                        <span class="font-weight-medium">{{ attribute.name }}</span>
                        <v-chip v-if="attribute.is_required" color="error" variant="tonal" size="small" class="ml-2">Requis</v-chip>
                      </div>
                      <p v-if="attribute.description" class="text-body-2 text-grey-darken-1 mb-2">{{ attribute.description }}</p>
                      <div class="d-flex flex-wrap gap-1">
                        <v-chip v-for="value in attribute.values" :key="value.id" :color="getAttributeColor(attribute.type)" size="small" variant="tonal">
                          <span v-if="attribute.type === 'color'" class="d-flex align-center">
                            <div class="color-preview-tiny mr-1" :style="{ backgroundColor: value.color_code }"></div>
                            {{ value.label }}
                          </span>
                          <span v-else>{{ value.label }}</span>
                          <span v-if="value.price_modifier && value.price_modifier != 0" class="text-success ml-1">({{ value.price_modifier > 0 ? '+' : '' }}{{ formatPrice(value.price_modifier) }} Ar)</span>
                        </v-chip>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <div v-if="productStore.currentProduct.has_variants && productStore.currentProduct.variants && productStore.currentProduct.variants.length > 0">
                <h3 class="text-h6 mb-3"><v-icon class="mr-2" color="primary">mdi-package-variant</v-icon>Variantes disponibles<v-chip color="info" variant="tonal" size="small" class="ml-2">{{ productStore.currentProduct.variants.length }} variante(s)</v-chip></h3>
                <v-row>
                  <v-col v-for="variant in productStore.currentProduct.variants" :key="variant.id" cols="12" md="6" lg="4">
                    <v-card class="variant-card pa-4" :class="{ 'variant-inactive': !variant.is_active }" elevation="2">
                      <div class="text-center mb-3">
                        <v-img v-if="variant.image" :src="`${appConfig.STORAGE_BASE_URL}/variants/${variant.image}`" height="120" class="rounded variant-image" cover></v-img>
                        <div v-else class="variant-image-placeholder"><v-icon size="48" color="grey-lighten-2">mdi-image-off</v-icon></div>
                      </div>
                      <div class="variant-info">
                        <h4 class="text-h6 font-weight-bold mb-2">{{ variant.name || variant.full_name }}</h4>
                        <div class="variant-details mb-3">
                          <div class="d-flex justify-space-between align-center mb-1"><span class="text-body-2 text-grey-darken-1">SKU:</span><span class="font-mono text-body-2">{{ variant.sku }}</span></div>
                          <div class="d-flex justify-space-between align-center mb-1"><span class="text-body-2 text-grey-darken-1">Prix:</span><span class="text-h6 font-weight-bold text-success">{{ variant.formatted_price }}</span></div>
                          <div class="d-flex justify-space-between align-center mb-1"><span class="text-body-2 text-grey-darken-1">Stock:</span><v-chip :color="getStockColor(variant.stock_quantity)" size="small" variant="flat">{{ variant.stock_quantity }} unités</v-chip></div>
                          <div v-if="variant.weight" class="d-flex justify-space-between align-center mb-1"><span class="text-body-2 text-grey-darken-1">Poids:</span><span class="text-body-2">{{ variant.weight }}g</span></div>
                        </div>
                        <div v-if="variant.attributes && variant.attributes.length > 0" class="mb-3">
                          <div class="text-body-2 text-grey-darken-1 mb-1">Caractéristiques:</div>
                          <div class="d-flex flex-wrap gap-1">
                            <v-chip v-for="attr in variant.attributes" :key="attr.value_id" :color="getAttributeColor(attr.attribute_type)" size="small" variant="tonal">
                              <span v-if="attr.attribute_type === 'color'" class="d-flex align-center">
                                <div class="color-preview-tiny mr-1" :style="{ backgroundColor: attr.color_code }"></div>
                                {{ attr.label }}
                              </span>
                              <span v-else>{{ attr.label }}</span>
                            </v-chip>
                          </div>
                        </div>
                        <div class="d-flex justify-space-between align-center">
                          <v-chip :color="variant.is_active ? 'success' : 'error'" size="small" variant="flat">
                            <v-icon start size="14">{{ variant.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                            {{ variant.is_active ? 'Disponible' : 'Indisponible' }}
                          </v-chip>
                          <v-chip v-if="variant.can_be_ordered" color="primary" size="small" variant="tonal">
                            <v-icon start size="14">mdi-cart</v-icon>
                            Commandable
                          </v-chip>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <div v-if="!productStore.currentProduct.has_variants && (!productStore.currentProduct.available_attributes || productStore.currentProduct.available_attributes.length === 0)">
                <v-alert type="info" variant="tonal"><v-icon start>mdi-information</v-icon>Ce produit n'a pas de variantes ou d'attributs configurés.</v-alert>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-6">
          <v-col cols="12">
            <v-card class="pa-4" elevation="3">
              <v-card-title class="text-h6 pb-4">
                <v-icon class="mr-2">mdi-comment-multiple</v-icon>
                Avis clients
                <v-chip color="info" variant="tonal" size="small" class="ml-2">{{ productStore.currentProduct.avis?.length || 0 }} avis</v-chip>
              </v-card-title>

              <div v-if="canCreateReview" class="mb-6">
                <v-card variant="outlined" class="pa-4">
                  <v-card-title class="text-h6 pb-3"><v-icon class="mr-2" color="primary">mdi-plus</v-icon>Donnez votre avis</v-card-title>
                  <v-form @submit.prevent="submitReview">
                    <v-rating v-model="reviewForm.note" color="amber" class="mb-3" hover></v-rating>
                    <v-textarea v-model="reviewForm.comment" label="Votre commentaire" rows="3" variant="outlined" :rules="[v => !!v || 'Le commentaire est requis']" class="mb-3"></v-textarea>
                    <v-btn type="submit" color="primary" :loading="productStore.loading" :disabled="!reviewForm.comment || reviewForm.note === 0">Publier l'avis</v-btn>
                  </v-form>
                </v-card>
              </div>

              <div v-if="productStore.currentProduct.avis && productStore.currentProduct.avis.length > 0">
                <v-row>
                  <v-col v-for="avis in productStore.currentProduct.avis" :key="avis.id" cols="12">
                    <v-card variant="outlined" class="pa-4">
                      <div class="d-flex align-center justify-space-between mb-3">
                        <div class="d-flex align-center">
                          <v-avatar size="40" class="mr-3">
                            <v-img v-if="avis.user?.avatar" :src="`${appConfig.STORAGE_BASE_URL}/avatars/${avis.user.avatar}`"></v-img>
                            <v-icon v-else>mdi-account</v-icon>
                          </v-avatar>
                          <div>
                            <div class="font-weight-medium text-h6">{{ avis.user?.name || 'Utilisateur' }}</div>
                            <v-rating :model-value="avis.note" readonly size="small" color="amber" density="compact"></v-rating>
                          </div>
                        </div>

                        <div v-if="canEditReview(avis)" class="d-flex gap-2">
                          <v-btn v-if="!editingReview || editingReview.id !== avis.id" color="primary" variant="outlined" size="small" @click="startEditReview(avis)">
                            <v-icon start>mdi-pencil</v-icon>
                            Modifier
                          </v-btn>
                          <v-btn v-if="editingReview && editingReview.id === avis.id" color="grey" variant="outlined" size="small" @click="cancelEditReview">
                            <v-icon start>mdi-close</v-icon>
                            Annuler
                          </v-btn>
                          <v-btn color="error" variant="outlined" size="small" @click="deleteReview(avis.id)">
                            <v-icon start>mdi-delete</v-icon>
                            Supprimer
                          </v-btn>
                        </div>
                      </div>

                      <div v-if="editingReview && editingReview.id === avis.id" class="mt-3">
                        <v-form @submit.prevent="updateReview(avis.id)">
                          <v-rating v-model="editingReview.note" color="amber" class="mb-3" hover></v-rating>
                          <v-textarea v-model="editingReview.comment" label="Modifier votre commentaire" rows="3" variant="outlined" :rules="[v => !!v || 'Le commentaire est requis']" class="mb-3"></v-textarea>
                          <v-btn type="submit" color="success" :loading="productStore.loading" :disabled="!editingReview.comment || editingReview.note === 0" class="mr-2">Sauvegarder</v-btn>
                        </v-form>
                      </div>

                      <div v-else>
                        <p class="text-body-1 mt-3">{{ avis.comment }}</p>
                        <div class="text-caption text-medium-emphasis mt-3">{{ formatDate(avis.created_at) }}</div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <div v-else class="text-center py-8">
                <v-icon size="64" color="grey-lighten-2">mdi-comment-outline</v-icon>
                <h3 class="text-h6 text-grey-lighten-2 mt-4">Aucun avis pour le moment</h3>
                <p class="text-body-2 text-grey-lighten-2">Soyez le premier à donner votre avis sur ce produit !</p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <v-card v-else-if="!productStore.loadingProduct && !productStore.currentProduct" class="text-center pa-12" elevation="0">
        <v-icon size="80" color="grey-lighten-2">mdi-package-variant</v-icon>
        <h3 class="text-h5 text-grey-lighten-2 mt-4">Produit non trouvé</h3>
        <p class="text-body-1 text-grey-lighten-2 mb-4">Le produit demandé n'existe pas ou a été supprimé.</p>
        <v-btn color="primary" :to="baseListPath">Retour à la liste</v-btn>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../store/AuthStore'
import { usePublicProductStore } from '../../store/PublicProductStore'
import { useProductStore as useChallengerProductStore } from '../../store/ChallengerStore/ProductStore'
import { APP_CONFIG } from '../../config/constants'

const props = defineProps<{ source: 'public' | 'challenger' }>()

const route = useRoute()
const authStore = useAuthStore()
const appConfig = APP_CONFIG

const publicStore = usePublicProductStore()
const challengerStore = useChallengerProductStore()
const productStore: any = props.source === 'public' ? publicStore : challengerStore

const reviewForm = ref({ note: 0, comment: '' })
const editingReview = ref<any | null>(null)

const baseListPath = computed(() => (props.source === 'public' ? '/produits' : '/challenger/produit'))

const loadProduct = () => {
  const productId = Number(route.params.id)
  productStore.showProduct(productId)
}

const canCreateReview = computed(() => props.source === 'challenger' && authStore.isAuthenticated && !hasUserCommented(productStore.currentProduct))

const hasUserCommented = (product: any) => {
  if (!product || !product.avis || !product.avis.length) return false
  return product.avis.some((comment: any) => comment.user && comment.user.id === authStore.userAuth?.id)
}

const submitReview = async () => {
  if (props.source !== 'challenger') return
  if (!reviewForm.value.comment || reviewForm.value.note === 0) return
  await challengerStore.commenter(productStore.currentProduct.id, { comment: reviewForm.value.comment, note: reviewForm.value.note })
  reviewForm.value = { note: 0, comment: '' }
  loadProduct()
}

const startEditReview = (avis: any) => { editingReview.value = { id: avis.id, comment: avis.comment, note: avis.note } }
const cancelEditReview = () => { editingReview.value = null }

const updateReview = async (reviewId: number) => {
  if (props.source !== 'challenger') return
  if (!editingReview.value || !editingReview.value.comment || editingReview.value.note === 0) return
  await challengerStore.editAdvice(productStore.currentProduct.id, reviewId, { comment: editingReview.value.comment, note: editingReview.value.note })
  editingReview.value = null
  loadProduct()
}

const deleteReview = async (reviewId: number) => {
  if (props.source !== 'challenger') return
  if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
    await challengerStore.supprAdvice(productStore.currentProduct.id, reviewId)
    loadProduct()
  }
}

const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR').format(price)
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

const getAttributeIcon = (type: string | undefined) => {
  switch (type) {
    case 'text': return 'mdi-text'
    case 'number': return 'mdi-numeric'
    case 'select': return 'mdi-format-list-bulleted'
    case 'color': return 'mdi-palette'
    default: return 'mdi-information'
  }
}

const getAttributeColor = (type: string | undefined) => {
  switch (type) {
    case 'text': return 'blue'
    case 'number': return 'green'
    case 'select': return 'orange'
    case 'color': return 'purple'
    default: return 'grey'
  }
}

const getStockColor = (quantity: number) => {
  if (quantity === 0) return 'error'
  if (quantity < 10) return 'warning'
  return 'success'
}

onMounted(loadProduct)
</script>

<style scoped>
.product-show { min-height: 100vh; background-color: #f5f5f5; padding: 20px 0; }
.loading-card { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
.image-placeholder { height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #f5f5f5; border-radius: 8px; }
.v-breadcrumbs a { color: inherit; text-decoration: none; }
.v-breadcrumbs a:hover { color: rgb(var(--v-theme-primary)); }
.product-image-card { border-radius: 12px; overflow: hidden; height: fit-content; }
.product-image { border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.product-details-card { border-radius: 12px; overflow: hidden; height: fit-content; }
.product-header { background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.02) 0%, rgba(var(--v-theme-primary), 0.01) 100%); border-radius: 12px; padding: 24px; border: 1px solid rgba(var(--v-theme-primary), 0.1); }
.price-section { padding: 16px 0; border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1); }
.quick-stats { padding: 16px 0; }
.stat-item { display: flex; align-items: center; padding: 12px; background: rgba(var(--v-theme-surface), 1); border-radius: 8px; border: 1px solid rgba(var(--v-theme-outline), 0.1); transition: all 0.3s ease; }
.stat-item:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.1); }
.stat-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: rgba(var(--v-theme-primary), 0.1); border-radius: 8px; margin-right: 12px; }
.stat-content { flex: 1; }
.stat-value { font-size: 1.125rem; font-weight: 700; color: rgb(var(--v-theme-on-surface)); line-height: 1.2; }
.stat-label { font-size: 0.75rem; color: rgb(var(--v-theme-on-surface-variant)); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; margin-top: 2px; }
.detail-label { display: flex; align-items: center; font-weight: 500; color: rgb(var(--v-theme-on-surface)); flex-shrink: 0; margin-right: 16px; }
.description-section { margin-top: 24px; }

.color-preview-tiny { width: 12px; height: 12px; border-radius: 50%; border: 1px solid #ddd; display: inline-block; }
.variant-card { transition: all 0.3s ease; height: 100%; display: flex; flex-direction: column; }
.variant-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important; }
.variant-inactive { opacity: 0.7; background-color: #f5f5f5; }
.variant-image { border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
.variant-image-placeholder { height: 120px; display: flex; align-items: center; justify-content: center; background-color: #f5f5f5; border-radius: 8px; border: 2px dashed #ddd; }
.variant-info { flex: 1; display: flex; flex-direction: column; }
.variant-details { background-color: rgba(0, 0, 0, 0.02); border-radius: 8px; padding: 12px; }
.font-mono { font-family: 'Courier New', monospace; font-size: 0.875rem; background-color: rgba(0, 0, 0, 0.05); padding: 2px 6px; border-radius: 4px; }

@media (max-width: 768px) {
  .product-header { padding: 16px; }
  .variant-card { margin-bottom: 16px; }
  .variant-details { padding: 8px; }
  .variant-image-placeholder { height: 80px; }
}
</style> 