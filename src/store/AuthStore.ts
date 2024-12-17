import { defineStore } from 'pinia';
import http from '@/axios'
import User from '@/types/User'

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
      return 'http://localhost:8000/storage/'+this.useravatar
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
      localStorage.removeItem('token');
    },
    async getUserAuth(){
      const response = await http.get('/user')
      this.userAuth = response.data.user
    }
  }
});
