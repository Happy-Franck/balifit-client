import { defineStore } from 'pinia';
import Training from '@/types/Training'
import http from '@/axios'

export const useTrainingStore = defineStore('trainingChallenger', {
    state: () => ({
    message: '',
    trainings: [] as Training[],
    currentTraining: null as Training | null,
    loading: true,
    alert: false,
    total: 0,
    per_page: 12,
    current_page: 1,
    last_page: 1,
    has_more: true,
    selectedCategoryIds: [] as number[],
    allLoaded: false,
  }),
  getters: {
  },
  actions: {
    async getTrainings(params: { page?: number; per_page?: number; search?: string; categories?: number[] } = {}) {
      this.loading = true
      const page = params.page ?? this.current_page
      const perPage = params.per_page ?? this.per_page
      const search = params.search ?? ''
      const categories = params.categories ?? this.selectedCategoryIds
      const response = await http.get('/challenger/training', {
        params: { page, per_page: perPage, search, categories: categories && categories.length ? categories.join(',') : undefined }
      });
      const data = response.data
      // si page 1, on remplace; sinon on concatène
      if (page <= 1) {
        this.trainings = data.trainings
      } else {
        this.trainings = [...this.trainings, ...data.trainings]
      }
      this.total = data.total
      this.per_page = data.per_page
      this.current_page = data.current_page
      this.last_page = data.last_page
      this.has_more = data.has_more
      this.loading = false
    },
    async loadMore() {
      if (!this.has_more) return
      const nextPage = this.current_page + 1
      await this.getTrainings({ page: nextPage, per_page: this.per_page })
    },
    setSelectedCategories(categoryIds: number[]) {
      this.selectedCategoryIds = categoryIds
    },
    clearSelectedCategories() {
      this.selectedCategoryIds = []
    },
    async showTraining(id: number) {
      this.loading = true
      const response = await http.get('/challenger/training/'+id);
      this.currentTraining = response.data.training
      this.loading = false
    },
    async fetchAndAddTraining(id: number) {
      const exists = this.trainings.some(t => t.id === id)
      if (exists) return
      const resp = await http.get('/challenger/training/'+id)
      const t = resp.data.training as Training
      this.trainings = [...this.trainings, t]
    },
    async loadAllTrainings(params: { search?: string; categories?: number[] } = {}) {
      this.loading = true
      const search = params.search ?? ''
      const categories = params.categories ?? this.selectedCategoryIds
      const resp = await http.get('/challenger/training/all', { params: { search, categories: categories && categories.length ? categories.join(',') : undefined } })
      this.trainings = resp.data.trainings
      this.allLoaded = true
      this.loading = false
    }
  }
});
