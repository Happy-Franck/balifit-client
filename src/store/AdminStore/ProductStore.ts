import { defineStore } from 'pinia';
import Product from '@/types/Product'
import ProductType from '@/types/ProductType'
import http from '@/axios'

export const useProductStore = defineStore('productAdmin', {
  state: () => ({
    message: '',
    products: [] as Product[],
    productTypes: [] as ProductType[],
    loading: true,
    currentProduct: null as Product | null,
    alert: false,
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1
    },
    attributes: [] as any[],
    typeAttributes: [] as any[],
    variants: [] as any[],
  }),
  getters: {
    activeProductTypes: (state) => state.productTypes.filter(type => type.is_active)
  },
  actions: {
    async getProducts(page: number = 1, search: string = '', sortBy: string = 'id', sortOrder: string = 'desc') {
      this.loading = true;
      try {
        const params: any = { page };
        if (search) params.search = search;
        if (sortBy) params.sort_by = sortBy;
        if (sortOrder) params.sort_order = sortOrder;

        const response = await http.get('/admin/produit', { params });
        this.products = response.data.produits || response.data.data || response.data;
        
        if (response.data.current_page) {
          this.pagination = {
            current_page: response.data.current_page,
            per_page: response.data.per_page,
            total: response.data.total,
            last_page: response.data.last_page
          };
        }
      } catch (error) {
        this.message = 'Erreur lors du chargement des produits';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    async getProductTypes() {
      try {
        const response = await http.get('/admin/product-type');
        this.productTypes = response.data.product_types || response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des types de produits:', error);
      }
    },

    async showProduct(id: number) {
      this.loading = true;
      try {
        const response = await http.get('/admin/produit/'+id);
        this.currentProduct = response.data
      } catch (error) {
        this.message = 'Erreur lors du chargement du produit';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    async storeProduct(productData: any, formData?: FormData) {
      this.loading = true
      try {
        let response
        if (formData) {
          // Si on a des fichiers, utiliser FormData
          response = await http.post('/admin/produit', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        } else {
          // Sinon, envoyer les données JSON
          response = await http.post('/admin/produit', productData)
        }
        
        this.alert = true
        this.message = response.data.message
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la création du produit:', error)
        this.alert = true
        this.message = error.response?.data?.message || 'Erreur lors de la création du produit'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id: number, data: any, formData: FormData) {
      try {
        this.loading = true
        const response = await http.post(`/admin/produit/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.message = response.data.message
        this.alert = true
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id: number) {
      try {
        const response = await http.delete('/admin/produit/'+id);
        this.message = response.data.message;
        this.alert = true
      } catch (error: any) {
        this.message = error.response?.data?.message || 'Erreur lors de la suppression du produit';
        this.alert = true;
      }
    },

    async toggleProductStatus(id: number) {
      try {
        const response = await http.patch(`/admin/produit/${id}/toggle-status`);
        this.message = response.data.message;
        this.alert = true;
        // Recharger le produit actuel
        if (this.currentProduct?.id === id) {
          await this.showProduct(id);
        }
      } catch (error: any) {
        this.message = error.response?.data?.message || 'Erreur lors du changement de statut';
        this.alert = true;
      }
    },

    // Product Type Actions
    async updateProductType(id: number, data: FormData) {
      try {
        this.loading = true
        const response = await http.put(`/admin/product-type/${id}`, data)
        this.message = response.data.message
        this.alert = true
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createProductType(data: FormData) {
      try {
        this.loading = true
        const response = await http.post('/admin/product-type', data)
        this.message = response.data.message
        this.alert = true
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la création:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProductType(id: number) {
      try {
        this.loading = true
        const response = await http.delete(`/admin/product-type/${id}`)
        this.message = response.data.message
        this.alert = true
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Méthodes pour la gestion des attributs et valeurs
    async getAllAttributesWithValues() {
        try {
            this.loading = true
            const response = await http.get('/product-attributes/all-with-values')
            return response.data
        } catch (error) {
            console.error('Erreur lors de la récupération des attributs avec valeurs:', error)
            throw error
        } finally {
            this.loading = false
        }
    },

    async createAttributeValue(attributeId: number, valueData: any) {
        try {
            this.loading = true
            const response = await http.post(`/product-attributes/${attributeId}/values`, valueData)
            this.message = response.data.message
            this.alert = true
            return response.data
        } catch (error) {
            console.error('Erreur lors de la création de la valeur d\'attribut:', error)
            throw error
        } finally {
            this.loading = false
        }
    },

    async updateAttributeValue(attributeId: number, valueId: number, valueData: any) {
        try {
            this.loading = true
            const response = await http.put(`/product-attributes/${attributeId}/values/${valueId}`, valueData)
            this.message = response.data.message
            this.alert = true
            return response.data
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la valeur d\'attribut:', error)
            throw error
        } finally {
            this.loading = false
        }
    },

    async deleteAttributeValue(attributeId: number, valueId: number) {
        try {
            this.loading = true
            const response = await http.delete(`/product-attributes/${attributeId}/values/${valueId}`)
            this.message = response.data.message
            this.alert = true
            return response.data
        } catch (error) {
            console.error('Erreur lors de la suppression de la valeur d\'attribut:', error)
            throw error
        } finally {
            this.loading = false
        }
    },

    // Méthodes pour la gestion des liaisons type-attribut
    async attachAttributeToProductType(productTypeId: number, attributeData: any) {
        try {
            this.loading = true
            const response = await http.post(`/product-types/${productTypeId}/attributes`, attributeData)
            this.message = response.data.message
            this.alert = true
            return response.data
        } catch (error) {
            console.error('Erreur lors de la liaison de l\'attribut:', error)
            throw error
        } finally {
            this.loading = false
        }
    },

    async detachAttributeFromProductType(productTypeId: number, attributeId: number) {
        try {
            this.loading = true
            const response = await http.delete(`/product-types/${productTypeId}/attributes/${attributeId}`)
            this.message = response.data.message
            this.alert = true
            return response.data
        } catch (error) {
            console.error('Erreur lors du détachement de l\'attribut:', error)
            throw error
        } finally {
            this.loading = false
        }
    },

    async updateProductTypeAttribute(productTypeId: number, attributeId: number, attributeData: any) {
        try {
            this.loading = true
            const response = await http.put(`/product-types/${productTypeId}/attributes/${attributeId}`, attributeData)
            this.message = response.data.message
            this.alert = true
            return response.data
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'attribut:', error)
            throw error
        } finally {
            this.loading = false
        }
    },

    // Méthodes pour les types de produits
    async toggleProductTypeStatus(id: number) {
      try {
        this.loading = true
        const response = await http.patch(`/admin/product-type/${id}/toggle-status`)
        this.message = response.data.message
        this.alert = true
        return response.data
      } catch (error: any) {
        console.error('Erreur lors du changement de statut:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Récupérer les attributs d'un type de produit
    async getProductTypeAttributes(productTypeId: number) {
      this.loading = true
      try {
        const response = await http.get(`/product-types/${productTypeId}/attributes`)
        this.typeAttributes = response.data.attributes || []
        return response
      } catch (error) {
        console.error('Erreur lors de la récupération des attributs du type:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Récupérer tous les attributs
    async getAttributes() {
      this.loading = true
      try {
        const response = await http.get('/product-attributes')
        this.attributes = response.data
        return response.data
      } catch (error) {
        console.error('Erreur lors de la récupération des attributs:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Créer un attribut
    async createAttribute(attributeData: any) {
      this.loading = true
      try {
        const response = await http.post('/product-attributes', attributeData)
        this.alert = true
        this.message = 'Attribut créé avec succès'
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la création de l\'attribut:', error)
        this.alert = true
        this.message = error.response?.data?.message || 'Erreur lors de la création de l\'attribut'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Générer automatiquement les variantes selon les attributs sélectionnés
    generateVariants(selectedAttributes: any[], attributeValues: any[]) {
      if (selectedAttributes.length === 0) return []

      const variants: any[] = []
      const attributeValuesByAttribute = selectedAttributes.reduce((acc, attrId) => {
        acc[attrId] = attributeValues.filter(val => val.product_attribute_id === attrId)
        return acc
      }, {} as any)

      // Générer toutes les combinaisons possibles
      const generateCombinations = (attrs: number[], currentCombination: any[] = [], index = 0): any[] => {
        if (index === attrs.length) {
          return [currentCombination]
        }

        const currentAttr = attrs[index]
        const values = attributeValuesByAttribute[currentAttr] || []
        const combinations: any[] = []

        for (const value of values) {
          combinations.push(...generateCombinations(attrs, [...currentCombination, value], index + 1))
        }

        return combinations
      }

      const combinations = generateCombinations(selectedAttributes)

      combinations.forEach((combination, index) => {
        const sku = `VAR-${Date.now()}-${index}`
        const name = combination.map((val: any) => val.label || val.value).join(' - ')
        
        // Calculer le prix avec les modificateurs
        const priceModifier = combination.reduce((sum: number, val: any) => {
          return sum + (parseFloat(val.price_modifier) || 0)
        }, 0)

        variants.push({
          id: null,
          sku,
          name,
          price: 0, // À définir par l'utilisateur
          stock_quantity: 0,
          weight: null,
          barcode: null,
          image: null,
          is_active: true,
          attributes: combination.reduce((acc: any, val: any) => {
            acc[val.product_attribute_id] = val.id
            return acc
          }, {}),
          price_modifier: priceModifier
        })
      })

      return variants
    },

    // Gestion des variantes
    async getProductVariants(productId: number) {
      this.loading = true
      try {
        const response = await http.get(`/admin/produit/${productId}/variants`)
        this.variants = response.data.variants || []
        return response.data
      } catch (error) {
        console.error('Erreur lors de la récupération des variantes:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createProductVariant(productId: number, variantData: any) {
      this.loading = true
      try {
        const response = await http.post(`/admin/produit/${productId}/variants`, variantData)
        this.alert = true
        this.message = 'Variante créée avec succès'
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la création de la variante:', error)
        this.alert = true
        this.message = error.response?.data?.message || 'Erreur lors de la création de la variante'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProductVariant(productId: number, variantId: number, variantData: any) {
      this.loading = true
      try {
        const response = await http.put(`/admin/produit/${productId}/variants/${variantId}`, variantData)
        this.alert = true
        this.message = 'Variante mise à jour avec succès'
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour de la variante:', error)
        this.alert = true
        this.message = error.response?.data?.message || 'Erreur lors de la mise à jour de la variante'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProductVariant(productId: number, variantId: number) {
      this.loading = true
      try {
        const response = await http.delete(`/admin/produit/${productId}/variants/${variantId}`)
        this.alert = true
        this.message = 'Variante supprimée avec succès'
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la suppression de la variante:', error)
        this.alert = true
        this.message = error.response?.data?.message || 'Erreur lors de la suppression de la variante'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateVariantStock(productId: number, variantId: number, stockQuantity: number) {
      this.loading = true
      try {
        const response = await http.patch(`/admin/produit/${productId}/variants/${variantId}/stock`, {
          stock_quantity: stockQuantity
        })
        this.alert = true
        this.message = 'Stock mis à jour avec succès'
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour du stock:', error)
        this.alert = true
        this.message = error.response?.data?.message || 'Erreur lors de la mise à jour du stock'
        throw error
      } finally {
        this.loading = false
      }
    },

    async toggleVariantStatus(productId: number, variantId: number) {
      this.loading = true
      try {
        const response = await http.patch(`/admin/produit/${productId}/variants/${variantId}/toggle-status`)
        this.alert = true
        this.message = 'Statut de la variante modifié avec succès'
        return response.data
      } catch (error: any) {
        console.error('Erreur lors de la modification du statut:', error)
        this.alert = true
        this.message = error.response?.data?.message || 'Erreur lors de la modification du statut'
        throw error
      } finally {
        this.loading = false
      }
    },

    removeCurrentProduct(){
      this.currentProduct = null
    },

    $reset() {
      this.message = ''
      this.products = []
      this.productTypes = []
      this.loading = true
      this.currentProduct = null
      this.alert = false
      this.pagination = {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
      }
      this.attributes = []
      this.typeAttributes = []
      this.variants = []
    }
  }
})
