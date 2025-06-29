import { defineStore } from 'pinia';
import Seance from '@/types/Seance'
import Training from '@/types/Training'
import User from '@/types/User'
import http from '@/axios'
import { useUserStore } from '@/store/AdminStore/UserStore'

export const useSeanceStore = defineStore('seanceAdmin', {
  state: () => ({
    seances: [] as Seance[],
    userSeances: [] as Seance[],
    loading: true,
    alert: false,
    message: '',
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0
    },
    currentSeance: null as Seance | null,
    currentSeanceTrainings: [] as Training[],
    currentSeanceAdmin: null as User | null,
    currentSeanceCoach: null as User | null,
    currentSeanceChallenger: null as User | null,
  }),
  getters: {
  },
  actions: {
    async getSeances(page = 1, search = '', sortBy = 'id', sortOrder = 'desc') {
      try {
        this.loading = true
        const params = {
          page,
          search,
          sort_by: sortBy,
          sort_order: sortOrder,
          per_page: 15
        }
        const response = await http.get('/admin/seance', { params });
        this.seances = response.data.seances || []
        this.pagination = response.data.pagination || {
          current_page: 1,
          last_page: 1,
          total: 0
        }
        this.loading = false
      } catch (error) {
        console.error('Erreur lors du chargement des séances:', error)
        this.seances = []
        this.loading = false
      }
    },
    async storeSeance(data: any) {
      try {
        const response = await http.post('/admin/seance', data);
        this.message = response.data.message || 'Séance créée avec succès';
        this.alert = true;
      } catch (error) {
        console.error('Erreur lors de la création:', error)
        throw error
      }
    },
    async updateSeance(id: number, data: any) {
      try {
        const response = await http.put(`/admin/seance/${id}`, data);
        this.message = response.data.message || 'Séance mise à jour avec succès';
        this.alert = true;
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
        throw error
      }
    },
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
      const response = await http.delete('/admin/seance/'+seanceId);
      this.message = response.data.message || 'Séance supprimée avec succès';
      this.alert = true
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
