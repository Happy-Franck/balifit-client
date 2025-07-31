import { defineStore } from 'pinia';
import Training from '@/types/Training'
import http from '@/axios'

export const useTrainingStore = defineStore('trainingCoach', {
    state: () => ({
    message: '',
    trainings: [] as Training[],
    currentTraining: null as Training | null,
    loading: true,
    alert: false
  }),
  getters: {
  },
  actions: {
    async getTrainings() {
      try {
        this.loading = true;
      const response = await http.get('/coach/training');
      this.trainings = response.data.trainings;
      } catch (error) {
        console.error('Erreur lors de la récupération des trainings:', error);
        this.message = 'Erreur lors de la récupération des trainings';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },
    async storeTraining(data: any, formData: FormData) {
      console.log(data)
      const response = await http.post('/coach/training', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: data,
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async showTraining(id: number) {
      try {
        this.loading = true;
      const response = await http.get('/coach/training/'+id);
        this.currentTraining = response.data.training;
      } catch (error) {
        console.error('Erreur lors de la récupération du training:', error);
        this.message = 'Erreur lors de la récupération du training';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },
    async updateTraining(id: number, data: any, formData: FormData) {
      const response = await http.post('/coach/training/'+id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
        params: data,
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async deleteTraining(id : number){
      const response = await http.delete('/coach/training/'+id);
      this.message = response.data.message;
      this.alert = true
    }
  }
});
