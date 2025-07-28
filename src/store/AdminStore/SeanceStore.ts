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
    // Nouvelles propriétés pour les statistiques
    seancesStats: [] as any[],
    statsLoading: false,
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
    async getSeancesStats(month?: string, year?: string) {
      try {
        this.statsLoading = true
        
        // Récupérer toutes les séances pour le mois spécifié
        const params: any = {
          page: 1,
          per_page: 1000, // Récupérer beaucoup de séances pour avoir toutes les données
          sort_by: 'created_at',
          sort_order: 'asc'
        }
        
        const response = await http.get('/admin/seance', { params });
        const allSeances = response.data.seances || []
        
        // Filtrer les séances pour le mois spécifié
        const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1
        const targetYear = year ? parseInt(year) : new Date().getFullYear()
        
        const filteredSeances = allSeances.filter((seance: any) => {
          const seanceDate = new Date(seance.created_at)
          return seanceDate.getMonth() + 1 === targetMonth && 
                 seanceDate.getFullYear() === targetYear
        })
        
        // Grouper les séances par jour
        const statsByDay = new Map()
        
        // Initialiser tous les jours du mois avec 0
        const daysInMonth = new Date(targetYear, targetMonth, 0).getDate()
        for (let day = 1; day <= daysInMonth; day++) {
          const dateKey = `${day.toString().padStart(2, '0')}/${targetMonth.toString().padStart(2, '0')}`
          statsByDay.set(dateKey, {
            count: 0,
            validated: 0,    // validated = 1 (terminées)
            pending: 0,      // validated = 0 (en attente)
            inProgress: 0    // validated = null (en cours)
          })
        }
        
        // Compter les séances par jour et par statut
        filteredSeances.forEach((seance: any) => {
          const seanceDate = new Date(seance.created_at)
          const day = seanceDate.getDate()
          const dateKey = `${day.toString().padStart(2, '0')}/${targetMonth.toString().padStart(2, '0')}`
          
          const currentStats = statsByDay.get(dateKey) || {
            count: 0,
            validated: 0,
            pending: 0,
            inProgress: 0
          }
          
          // Incrémenter le total
          currentStats.count++
          
          // Classifier selon le statut validated
          if (seance.validated === 1) {
            currentStats.validated++
          } else if (seance.validated === 0) {
            currentStats.pending++
          } else if (seance.validated === null) {
            currentStats.inProgress++
          }
          
          statsByDay.set(dateKey, currentStats)
        })
        
        // Convertir en format attendu par le graphique
        this.seancesStats = Array.from(statsByDay.entries()).map(([date, stats]) => ({
          date,
          count: stats.count,
          validated: stats.validated,
          pending: stats.pending,
          inProgress: stats.inProgress
        }))
        
        this.statsLoading = false
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
        this.seancesStats = []
        this.statsLoading = false
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
