import { defineStore } from 'pinia';
import Training from '@/types/Training'
import http from '@/axios'

export const useTrainingStore = defineStore('trainingChallenger', {
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
      const response = await http.get('/challenger/training');
      this.trainings = response.data.trainings;
      console.clear()
      console.log('trainings')
      console.log(this.trainings)
      this.loading = false
    },
    async showTraining(id: number) {
      const response = await http.get('/challenger/training/'+id);
      this.currentTraining = response.data.training
      this.loading = false
    },
  }
});
