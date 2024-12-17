import { defineStore } from 'pinia';
import Seance from '@/types/Seance'
import Training from '@/types/Training'
import User from '@/types/User'
import http from '@/axios'
import { useUserStore } from '@/store/AdminStore/UserStore'

export const useSeanceStore = defineStore('seanceAdmin', {
  state: () => ({
    userSeances: [] as Seance[],
    loading: true,
    currentSeance: null as Seance | null,
    currentSeanceTrainings: [] as Training[],
    currentSeanceAdmin: null as User | null,
    currentSeanceCoach: null as User | null,
    currentSeanceChallenger: null as User | null,
  }),
  getters: {
  },
  actions: {
    async assignCoach(challengerId : number, data : Object) {
      const userStore = useUserStore()
      const response = await http.post('/admin/users/'+challengerId+'/assign-coach', data);
      userStore.message = response.data.message;
      userStore.alert = true
    },
    async assignChallenger(coachId : number, data : Object) {
      const userStore = useUserStore()
      const response = await http.post('/admin/users/'+coachId+'/assign-challenger', data);
      userStore.message = response.data.message;
      userStore.alert = true
    },
    async destroySeance(seanceId : number){
      const userStore = useUserStore()
      const response = await http.delete('/admin/seance/'+seanceId);
      userStore.message = response.data.message;
      userStore.alert = true
    },
    async showSeance(seanceId: number) {
      this.loading = true
      const response = await http.get('/admin/seance/' + seanceId);
      this.currentSeance = response.data.seance
      this.currentSeanceAdmin = response.data.admin
      this.currentSeanceCoach = response.data.coach
      this.currentSeanceChallenger = response.data.challenger
      this.currentSeanceTrainings = response.data.trainings
      this.loading = false
    },
  /*
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
    /*async updateCategory(id: number, data: any, formData: FormData) {
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
    }*/
  }
});
