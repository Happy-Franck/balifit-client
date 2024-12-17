import { defineStore } from 'pinia';
import Category from '@/types/Category'
import http from '@/axios'

export const useCategoryStore = defineStore('categoryAdmin', {
  state: () => ({
    message: '',
    categories: [] as Category[],
    loading: true,
    currentCategory: null as Category | null,
    alert: false
  }),
  getters: {
  },
  actions: {
    async getCategories() {
      const response = await http.get('/admin/category');
      this.categories = response.data.categories;
      this.loading = false
    },
    async storeCategory(data: any, formData: FormData) {
      const response = await http.post('/admin/category', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: data,
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async showCategory(id: number) {
      const response = await http.get('/admin/category/'+id);
      this.currentCategory = response.data.category
    },
    /*showCategory(id: number) {
      const categoryFound = this.categories.find((category) => category.id === id);
      this.currentCategory = categoryFound || null;
    },*/
    async updateCategory(id: number, data: any, formData: FormData) {
      const response = await http.post('/admin/category/'+id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
        params: data,
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async deleteCategory(id: number) {
      const response = await http.delete('/admin/category/'+id);
      this.message = response.data.message;
      this.alert = true
    },
    removeCurrentCategory(){
      this.currentCategory = null
    }
  }
});
