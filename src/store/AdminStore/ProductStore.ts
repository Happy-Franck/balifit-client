import { defineStore } from 'pinia';
import Product from '@/types/Product'
import http from '@/axios'

export const useProductStore = defineStore('productAdmin', {
  state: () => ({
    message: '',
    products: [] as Product[],
    loading: true,
    currentProduct: null as Product | null,
    alert: false
  }),
  getters: {
  },
  actions: {
    async getProducts() {
      const response = await http.get('/admin/produit');
      this.products = response.data.produits;
      this.loading = false
    },
    async showProduct(id: number) {
      const response = await http.get('/admin/produit/'+id);
      this.currentProduct = response.data.produit
      this.loading = false
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
