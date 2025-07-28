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
      try {
        this.loading = true;
        const response = await http.get('/coach/category');
        this.categories = response.data.categories;
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        this.message = 'Erreur lors de la récupération des catégories';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },
    async showCategory(id: number) {
      try {
        this.loading = true;
        const response = await http.get('/coach/category/'+id);
        this.currentCategory = response.data.category;
      } catch (error) {
        console.error('Erreur lors de la récupération de la catégorie:', error);
        this.message = 'Erreur lors de la récupération de la catégorie';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },
  }
});
