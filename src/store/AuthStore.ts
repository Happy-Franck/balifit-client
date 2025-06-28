import { defineStore } from 'pinia';
import http from '@/axios'
import User from '@/types/User'
import { getAvatarUrl } from '@/config/constants'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    username: '',
    useremail: '',
    useravatar: '',
    role: '',
    token: '',
    userAuth: null as User | null
  }),
  getters: {
    getUserName() : String{
      return this.username
    },
    getUserEmail() : String{
      return this.useremail
    },
    getUserAvatar() : String{
      return getAvatarUrl(this.useravatar)
    },
    getFullUserProfile(): User | null {
      return this.userAuth
    },
    isAuthenticated(): boolean {
      return !!this.token && !!this.role
    },
    isAdmin(): boolean {
      return this.role === 'administrateur'
    },
    isCoach(): boolean {
      return this.role === 'coach'  
    },
    isChallenger(): boolean {
      return this.role === 'challenger'
    }
  },
  actions: {
    setUserData(userData : any) {
      this.username = userData.user.name;
      this.useremail = userData.user.email;
      this.useravatar = userData.user.avatar;
      this.role = userData.role;
      this.token = userData.token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('role', this.role);
      localStorage.setItem('username', this.username);
      localStorage.setItem('useremail', this.useremail);
      localStorage.setItem('useravatar', this.useravatar);
    },
    initFromStorage() {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const username = localStorage.getItem('username');
      const useremail = localStorage.getItem('useremail');
      const useravatar = localStorage.getItem('useravatar');
      
      if (token && role) {
        this.token = token;
        this.role = role;
        this.username = username || '';
        this.useremail = useremail || '';
        this.useravatar = useravatar || '';
      }
    },
    deconnexion() {
      this.username = '';
      this.useremail = '';
      this.useravatar = '';
      this.role = '';
      this.token = '';
      this.userAuth = null;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      localStorage.removeItem('useremail');
      localStorage.removeItem('useravatar');
    },
    canAccessRoute(routePath: string): boolean {
      if (!this.isAuthenticated) return false;
      
      if (routePath.startsWith('/admin')) {
        return this.isAdmin;
      }
      if (routePath.startsWith('/coach')) {
        return this.isCoach;
      }
      if (routePath.startsWith('/challenger')) {
        return this.isChallenger;
      }
      
      return true;
    },
    getDashboardRoute(): string {
      switch (this.role) {
        case 'administrateur':
          return '/admin/dashboard';
        case 'coach':
          return '/coach/dashboard';
        case 'challenger':
          return '/challenger/dashboard';
        default:
          return '/login';
      }
    },
    async getUserAuth(){
      try {
        const response = await http.get('/user')
        this.userAuth = response.data.user
        return response.data.user
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error)
        throw error
      }
    },
    async getProfile(){
      try {
        const response = await http.get('/profile')
        this.userAuth = response.data.user
        return response.data.user
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error)
        throw error
      }
    },
    async updateProfile(profileData: FormData) {
      try {
        profileData.append('_method', 'PUT')
        
        const response = await http.post('/profile', profileData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.userAuth = response.data.user
        this.username = response.data.user.name
        this.useremail = response.data.user.email
        this.useravatar = response.data.user.avatar
        return response.data
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error)
        throw error
      }
    },
    async getWeightHistory() {
      try {
        const response = await http.get('/profile/weight-history')
        return response.data.poids_history
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique de poids:', error)
        throw error
      }
    }
  }
});
