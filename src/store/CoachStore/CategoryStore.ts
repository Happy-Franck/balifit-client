import { defineStore } from 'pinia';
import Category from '@/types/Category'
import http from '@/axios'

export const useCategoryStore = defineStore('categoryCoach', {
    state: () => ({
    message: '',
    categories: [] as Category[],
    currentCategory: null as Category | null,
    loading: true,
    alert: false
  }),
  getters: {
  },
  actions: {
    async getCategories() {
      const response = await http.get('/coach/category');
      this.categories = response.data.categories;
      this.loading = false
    },
    async showCategory(id: number) {
      const response = await http.get('/coach/category/'+id);
      this.currentCategory = response.data.category
    },
  }
});
