import { defineStore } from 'pinia';
import Seance from '@/types/Seance'
import User from '@/types/User'
import Training from '@/types/Training'
import http from '@/axios'
import { getCoachAvatarUrl } from '@/config/constants'

export const useSeanceStore = defineStore('seanceChallenger', {
  state: () => ({
    message: '',
    seances: [] as Seance[] | null,
    currentSeance: null as Seance | null,
    currentSeanceTrainings: [] as Training[] | null,
    currentSeanceAdmin: null as User | null,
    currentSeanceCoach: null as User | null,
    currentSeanceChallenger: null as User | null,
    users: [] as User[],
    editTrainings: [] as Training[],
    loading: true,
    alert: false,
    counts: {} as any,
  }),
  getters: {
  },
  actions: {
    async getSeances() {
      const response = await http.get('/challenger/seance');
      this.seances = response.data.seances;
      this.users = response.data.users;
      this.loading = false
    },
    getCoachAvatar(coachId : any) {
      const coach = this.users.find(user => user.id === coachId);
      return coach && coach.avatar ? getCoachAvatarUrl(coach.avatar) : '';
    },
    dateTime(dateString: string){
        const dateObject = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
        const formattedDate = new Intl.DateTimeFormat('fr-FR', options).format(dateObject);
        return formattedDate;
    },
    hourTime(dateString: string){
        const dateObject = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: false};
        const formattedHour = new Intl.DateTimeFormat('fr-FR', options).format(dateObject);
        return formattedHour;
    },
    async showSeance(id : number) {
      const response = await http.get('/challenger/seance/'+id);
      this.currentSeance = response.data.seance;
      this.currentSeanceAdmin = response.data.admin
      this.currentSeanceCoach = response.data.coach
      this.currentSeanceChallenger = response.data.challenger
      this.currentSeanceTrainings = response.data.trainings
      this.editTrainings = response.data.trainings
      const counts: { [key: string]: number } = {};
      const data: string[] = [];

      this.currentSeanceTrainings?.forEach((item: any) => {
        if (item.categories) {
          item.categories.forEach((x: any) => {
            if (x.name) {
              data.push(x.name);
            }
          });
        }
      });
      const uniqueCategories = Array.from(new Set(data));

      uniqueCategories.forEach((category) => {
        const categoryCount = data.filter((item: string) => item === category).length;
        counts[category] = categoryCount * (100 / (data.length));
      });

      this.counts = counts;
    },
    async addTraining(id : number, data : any){
      const response = await http.post('/challenger/seance/'+id+'/add-trainings', data);
      this.message = response.data.message;
      this.alert = true;
    },
    async editTraining(id: number, data: any) {
      const response = await http.put('/challenger/seance/'+id+'/update-trainings', data);
      this.message = response.data.message;
      this.alert = true;
    },
    async supprTraining(seanceId: number, trainingId: number, pivotId: number) {
      const response = await http.delete('/challenger/seance/'+seanceId+'/delete/'+trainingId+'/'+pivotId);
      this.message = response.data.message;
      this.alert = true;
    },
    async create(data: any, debut: any, fin:any){
      const formData = new FormData();
      formData.append('img_debut', debut);
      formData.append('img_fin', fin);
      const response = await http.post('/challenger/seance', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            //'X-HTTP-Method-Override': 'PUT'
          },
          params: data,
        }
      );
      this.message = response.data.message;
      console.log(this.message)
      this.alert = true;
    },
    async deleteSeance(id : number){
      const response = await http.delete('/challenger/seance/'+id);
      this.message = response.data.message;
      this.alert = true;
    },
    async editMyTraining(id : number, data : any){
      const response = await http.put('/challenger/seance/'+id, data);
      this.message = response.data.message;
      this.alert = true;
    },
    async confirmer(id: number){
      const response = await http.put('/challenger/seance/'+id+'/confirmer')
      this.message = response.data.message;
      this.alert = true;
    },
    async decliner(id: number){
      const response = await http.put('/challenger/seance/'+id+'/decliner')
      this.message = response.data.message;
      this.alert = true;
    },
    async updateChallengerDebut(id: number, sary: any) {
      const formData = new FormData();
      formData.append('img_debut', sary);
      const response = await http.post('/challenger/seance/'+id+'/update-debut', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async supprChallengerDebut(seance: number , data : any){
      const response = await http.post('/challenger/seance/'+seance+'/suppr-debut',data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async updateChallengerFin(id: number, sary: any) {
      const formData = new FormData();
      formData.append('img_fin', sary);
      const response = await http.post('/challenger/seance/'+id+'/update-fin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
      });
      this.message = response.data.message;
      this.alert = true;
    },
    async supprChallengerFin(seance: number , data : any){
      const response = await http.post('/challenger/seance/'+seance+'/suppr-fin',data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT'
        },
      });
      this.message = response.data.message;
      this.alert = true;
    },
  },
});
