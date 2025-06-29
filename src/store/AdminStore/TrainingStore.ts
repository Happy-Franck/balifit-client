import { defineStore } from 'pinia';
import http from '@/axios';

interface Training {
  id: number;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  category_id: number;
  categories?: any[];
  equipments?: any[];
  image?: string;
  video?: string;
  created_at: string;
  updated_at: string;
}

export const useTrainingStore = defineStore('trainingAdmin', {
  state: () => ({
    trainings: [] as Training[],
    currentTraining: null as Training | null,
    suggestions: [] as Training[],
    loading: false,
    alert: false,
    message: '',
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1
    }
  }),
  
  getters: {},
  
  actions: {
    async getTrainings(page: number = 1, search: string = '', sortBy: string = 'id', sortOrder: string = 'asc') {
      this.loading = true;
      try {
        const params: any = { page };
        if (search) params.search = search;
        if (sortBy) params.sort_by = sortBy;
        if (sortOrder) params.sort_order = sortOrder;

        const response = await http.get('/admin/training', { params });
        this.trainings = response.data.data || response.data.trainings || response.data;
        if (response.data.current_page) {
          this.pagination = {
            current_page: response.data.current_page,
            per_page: response.data.per_page,
            total: response.data.total,
            last_page: response.data.last_page
          };
        }
      } catch (error) {
        this.message = 'Erreur lors du chargement des entraînements';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    async showTraining(id: number) {
      this.loading = true;
      try {
        const response = await http.get(`/admin/training/${id}`);
        this.currentTraining = response.data.training;
        this.suggestions = response.data.suggestions || [];
        return response.data;
      } catch (error) {
        this.message = 'Erreur lors du chargement de l\'entraînement';
        this.alert = true;
        return null;
      } finally {
        this.loading = false;
      }
    },

    async storeTraining(data: any, formData?: FormData) {
      this.loading = true;
      try {
        let response;
        if (formData) {
          response = await http.post('/admin/training', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });
        } else {
          response = await http.post('/admin/training', data);
        }
        this.message = response.data.message;
        this.alert = true;
      } catch (error) {
        this.message = 'Erreur lors de la création de l\'entraînement';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    async updateTraining(id: number, data: any, formData?: FormData) {
      this.loading = true;
      try {
        let response;
        if (formData) {
          response = await http.post(`/admin/training/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'X-HTTP-Method-Override': 'PUT'
            }
          });
        } else {
          response = await http.put(`/admin/training/${id}`, data);
        }
        this.message = response.data.message;
        this.alert = true;
      } catch (error) {
        this.message = 'Erreur lors de la mise à jour de l\'entraînement';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    async deleteTraining(id: number) {
      this.loading = true;
      try {
        const response = await http.delete(`/admin/training/${id}`);
        this.message = response.data.message;
        this.alert = true;
      } catch (error) {
        this.message = 'Erreur lors de la suppression de l\'entraînement';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    $reset() {
      this.trainings = [];
      this.currentTraining = null;
      this.suggestions = [];
      this.loading = false;
      this.alert = false;
      this.message = '';
      this.pagination = {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
      };
    }
  }
}); 