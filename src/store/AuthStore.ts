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
    },
    deconnexion() {
      this.username = '';
      this.useremail = '';
      this.useravatar = '';
      this.role = '';
      this.token = '';
      this.userAuth = null;
      localStorage.removeItem('token');
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
        // Ajouter _method=PUT pour Laravel
        profileData.append('_method', 'PUT')
        
        const response = await http.post('/profile', profileData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.userAuth = response.data.user
        // Mettre à jour les données de base aussi
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
