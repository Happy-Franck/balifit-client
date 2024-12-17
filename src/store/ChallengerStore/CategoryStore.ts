import { defineStore } from 'pinia';
import Category from '@/types/Category'
import http from '@/axios'

export const useCategoryStore = defineStore('CategoryChallenger', {
    state: () => ({
    categories: [] as Category[],
    loading: true,
  }),
  getters: {
  },
  actions: {
    async getCategories() {
      const response = await http.get('/challenger/category');
      this.categories = response.data.categories;
      this.loading = false
    },
  }
});
