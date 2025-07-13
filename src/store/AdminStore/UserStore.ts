import { defineStore } from 'pinia';
import User from '@/types/User'
import http from '@/axios'
import { useSeanceStore } from '@/store/AdminStore/SeanceStore'

export const useUserStore = defineStore('userAdmin', {
  state: () => ({
    message: '',
    users: [] as User[],
    coachs: [] as User[],
    challengers: [] as User[],
    loading: true,
    currentUser: null as User | null,
    alert: false
  }),
  getters: {
    allCoachs() : String[]{
      return this.coachs.map(function(item) {
        return item.name;
      });
    },
    usersWithRole: (state) => (roleName: string) => {
      return state.users.filter((user) => {
        return user.roles?.some((role: any) => role.name === roleName);
      });
    },
  },
  actions: {
    async getUsers() {
      try {
        this.loading = true;
        const response = await http.get('/admin/user');
        this.users = response.data.users;
        this.loading = false;
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.users = [];
        this.loading = false;
      }
    },
    async showUser(id: number) {
      try {
        this.loading = true;
        const seanceStore = useSeanceStore();
        const response = await http.get('/admin/user/'+id);
        this.currentUser = response.data.user;
        
        // Gestion des séances selon la structure de la réponse
        if(response.data.seances){
          seanceStore.userSeances = response.data.seances;
        }
        
        this.loading = false;
        return response.data;
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.currentUser = null;
        this.loading = false;
        throw error;
      }
    },
    async assignRole(userId : number , role : Object) {
      const response = await http.post('admin/user/'+userId+'/assign-role', role)
      this.message = response.data.message;
      this.alert = true;
    },
    async getAllCoachs() {
      const response = await http.get('/admin/coach');
      this.coachs = response.data.coachs;
    },
    async getAllChallengers() {
      const response = await http.get('/admin/challenger');
      this.challengers = response.data.challengers;
    },
    async updateChallengers(userId : number , data : Object){
      const response = await http.post('admin/user/'+userId+'/challengers-update', data)
      this.message = response.data.message;
      this.alert = true;
    },
    async updateCoachs(userId : number , data : Object){
      const response = await http.post('admin/user/'+userId+'/coachs-update', data)
      this.message = response.data.message;
      this.alert = true;
    },
    async removeChallenger(coachId: number, challengerId : number){
      const response = await http.delete('admin/user/'+coachId+'/remove-challenger/'+challengerId)
      this.message = response.data.message;
      this.alert = true;
    },
    async removeCoach(challengerId: number, coachId : number){
      const response = await http.delete('admin/user/'+challengerId+'/remove-coach/'+coachId)
      this.message = response.data.message;
      this.alert = true;
    },
    async deleteUser(id: number) {
      const response = await http.delete('/admin/user/'+id);
      this.message = response.data.message;
      this.alert = true
    },
  }
});
