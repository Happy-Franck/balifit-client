import { defineStore } from 'pinia';
import Product from '@/types/Product'
import ProductType from '@/types/ProductType'
import http from '@/axios'

export const useProductStore = defineStore('productChallenger', {
  state: () => ({
    message: '',
    products: [] as Product[],
    productTypes: [] as ProductType[],
    loading: false, // Changed from true to false for better UX
    loadingProduct: false, // Separate loading for individual product
    currentProduct: null as Product | null,
    alert: false,
    totalProductsCount: 0, // Total de tous les produits (sans filtre)
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1
    }
  }),
  getters: {
  },
  actions: {
    async getProducts(page: number = 1, search: string = '', productTypeId: number | null = null, minPrice: number | null = null, maxPrice: number | null = null) {
      try {
        this.loading = true;
        console.log('🔄 Chargement des produits...');
        
        const params: any = { page };
        if (search) params.search = search;
        if (productTypeId) params.product_type_id = productTypeId;
        if (minPrice !== null) params.min_price = minPrice;
        if (maxPrice !== null) params.max_price = maxPrice;
        
        const response = await http.get('/challenger/produit', { params });
        
        console.log('📦 Réponse API reçue:', response.data);
        
        // Fix: Access the correct data property from API response
        this.products = response.data.data || response.data.produits || response.data;
        
        // Store product types
        if (response.data.product_types) {
          this.productTypes = response.data.product_types;
        }
        
        // Store total products count
        if (response.data.total_products_count !== undefined) {
          this.totalProductsCount = response.data.total_products_count;
        }
        
        console.log('✅ Produits chargés:', this.products);
        console.log('📊 Nombre de produits:', this.products.length);
        console.log('🏷️ Types de produits:', this.productTypes);
        console.log('📈 Total produits (tous):', this.totalProductsCount);
        
        // Also handle pagination data if available
        if (response.data.current_page) {
          this.pagination = {
            current_page: response.data.current_page,
            per_page: response.data.per_page,
            total: response.data.total,
            last_page: response.data.last_page
          };
          console.log('📄 Pagination:', this.pagination);
        }
        
        this.loading = false;
      } catch (error) {
        console.error('❌ Erreur lors du chargement des produits:', error);
        this.message = 'Erreur lors du chargement des produits';
        this.alert = true;
        this.loading = false;
      }
    },
    
    async showProduct(id: number) {
      try {
        this.loadingProduct = true;
        this.currentProduct = null; // Reset current product
        console.log('🔍 Chargement du produit:', id);
        const response = await http.get('/challenger/produit/' + id);
        console.log('📦 Détails produit reçus:', response.data);
        this.currentProduct = response.data.produit || response.data;
        console.log('✅ Produit actuel:', this.currentProduct);
        this.loadingProduct = false;
      } catch (error) {
        console.error('❌ Erreur lors du chargement du produit:', error);
        this.currentProduct = null;
        this.loadingProduct = false;
        // Optionally set an error message
        this.message = 'Erreur lors du chargement du produit';
        this.alert = true;
      }
    },
    
    async commenter(productId: number, data: any) {
      try {
        const response = await http.post(`/challenger/produit/${productId}/commenter`, data);
        this.message = response.data.message || 'Commentaire ajouté avec succès';
        this.alert = true;
        // Reload current product to get updated data
        if (this.currentProduct) {
          await this.showProduct(this.currentProduct.id);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        this.message = 'Erreur lors de l\'ajout du commentaire';
        this.alert = true;
      }
    },
    
    async supprAdvice(productId: number, adviceId: number) {
      try {
        const response = await http.delete(`/challenger/produit/${productId}/commenter/${adviceId}`);
        this.message = response.data.message || 'Commentaire supprimé avec succès';
        this.alert = true;
        // Reload current product to get updated data
        if (this.currentProduct) {
          await this.showProduct(this.currentProduct.id);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        this.message = 'Erreur lors de la suppression du commentaire';
        this.alert = true;
      }
    },
    
    async editAdvice(productId: number, adviceId: number, data: any) {
      try {
        const response = await http.put(`/challenger/produit/${productId}/commenter/${adviceId}`, data);
        this.message = response.data.message || 'Commentaire modifié avec succès';
        this.alert = true;
        // Reload current product to get updated data
        if (this.currentProduct) {
          await this.showProduct(this.currentProduct.id);
        }
      } catch (error) {
        console.error('Erreur lors de la modification du commentaire:', error);
        this.message = 'Erreur lors de la modification du commentaire';
        this.alert = true;
      }
    },
    async storeProduct(data: any, formData: FormData) {
      const response = await http.post('/admin/produit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: data,
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async updateProduct(id: number, data: any, formData: FormData) {
      const response = await http.post('/admin/produit/'+id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
        params: data,
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async deleteProduct(id: number) {
      const response = await http.delete('/admin/produit/'+id);
      this.message = response.data.message;
      this.alert = true
    },
    removeCurrentProduct(){
      this.currentProduct = null
    }
  }
});
