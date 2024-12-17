import { defineStore } from 'pinia';
import Seance from '@/types/Seance'
import User from '@/types/User'
import Training from '@/types/Training'
import http from '@/axios'

export const useSeanceStore = defineStore('seanceCoach', {
    state: () => ({
    message: '',
    seances: [] as Seance[],
    currentSeance: null as Seance | null,
    currentSeanceTrainings: [] as Training[],
    currentSeanceAdmin: null as User | null,
    currentSeanceCoach: null as User | null,
    currentSeanceChallenger: null as User | null,
    loading: true,
    alert: false
  }),
  getters: {
  },
  actions: {
    async getSeances() {
      const response = await http.get('/coach/seance');
      this.seances = response.data.seances;
      this.loading = false
    },
    async showSeance(id : number) {
      const response = await http.get('/coach/seance/'+id);
      this.currentSeance = response.data.seance;
      this.currentSeanceAdmin = response.data.admin
      this.currentSeanceCoach = response.data.coach
      this.currentSeanceChallenger = response.data.challenger
      this.currentSeanceTrainings = response.data.trainings
      this.loading = false
    },
    async addTraining(id : number, data : any){
      const response = await http.post('/coach/seance/'+id+'/add-trainings', data);
      this.message = response.data.message;
      this.alert = true;
    },
    async editTraining(id: number, data: any) {
      const response = await http.put('/coach/seance/'+id+'/update-trainings', data);
      this.message = response.data.message;
      this.alert = true;
    },
    async supprTraining(seanceId: number, trainingId: number, pivotId: number) {
      console.log("traitement en cours")
      const response = await http.delete('/coach/seance/'+seanceId+'/delete/'+trainingId+'/'+pivotId);
      this.message = response.data.message;
      this.alert = true;
    },
    async updateDebut(id: number, sary: any) {
      const formData = new FormData();
      formData.append('img_debut', sary);
      const response = await http.post('/coach/seance/'+id+'/update-debut', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async supprDebut(seance: number , data : any){
      const response = await http.post('/coach/seance/'+seance+'/suppr-debut',data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async updateFin(id: number, sary: any) {
      const formData = new FormData();
      formData.append('img_fin', sary);
      const response = await http.post('/coach/seance/'+id+'/update-fin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async supprFin(seance: number , data : any){
      const response = await http.post('/coach/seance/'+seance+'/suppr-fin',data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async valider(id : number){
      const response = await http.put('/coach/seance/'+id+'/valider')
      this.message = response.data.message;
      this.alert = true;
    }
  }
});
