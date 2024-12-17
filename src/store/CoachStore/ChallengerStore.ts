import { defineStore } from 'pinia';
import User from '@/types/User'
import http from '@/axios'

export const useChallengerStore = defineStore('challengerCoach', {
    state: () => ({
    message: '',
    allChallengers: [] as User[],
    myChallengers: [] as User[],
    currentChallenger: null as User | null,
    loading: true,
    alert: false
  }),
  getters: {
  },
  actions: {
    async getChallengers() {
      const response = await http.get('/coach/challenger');
      this.allChallengers = response.data.allChallengers;
      this.myChallengers = response.data.myChallengers;
      this.loading = false
    },
    async showChallenger(id : number) {
      const response = await http.get('/coach/challenger/'+id);
      this.currentChallenger = response.data.challenger;
      this.loading = false
    },
  }
});
