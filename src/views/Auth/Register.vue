<template>
  <div class="login">
    <div v-if="message != '' && alert == true" class="alert">
      {{message}}
      <span @click="closeAlert()">x</span>
    </div>
    <v-row no-gutters>
      <v-col cols="12" sm="6">
        <v-sheet>
          <v-img
            class="bg-white"
            :aspect-ratio="1"
            src="@/assets/work.jpeg"
            cover
          ></v-img>
        </v-sheet>
      </v-col>
      <v-col cols="12" sm="6">
        <v-container>
          <v-sheet class="pa-2 ma-2">
            <v-form @submit.prevent="connexion()">
              <v-text-field v-model="name" label="name" density="compact" variant="outlined"></v-text-field>
              <v-text-field v-model="email" label="Email" density="compact" variant="outlined"></v-text-field>
              <v-text-field
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visible ? 'text' : 'password'"
                density="compact"
                label="Password"
                variant="outlined"
                v-model="password"
                @click:append-inner="visible = !visible"
              ></v-text-field>
              <v-btn type="submit" block color="#5865f2" variant="flat">Se connecter</v-btn>
            </v-form>
          </v-sheet>
        </v-container>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import http from '../../axios'

export default defineComponent({
  name: "LoginView",
  data(){
    return{
      visible: false,
      message: '',
      alert: false,
      name: '',
      email: '',
      password: '',
    }
  },
  methods: {
    connexion(){
      http.post("/register", {
        name: this.name,
        email: this.email,
        password: this.password
      }).then((response) => {
        if(response.data){
          localStorage.setItem('username', response.data.user.name)
          localStorage.setItem('useremail', response.data.user.email)
          localStorage.setItem('useravatar', response.data.user.avatar)
          localStorage.setItem('role', response.data.role)
          localStorage.setItem('token', response.data.token)
          if(localStorage.getItem('role')  == 'administrateur'){
            this.$router.push('/admin/dashboard')
          }
          if(localStorage.getItem('role') == 'coach'){
            this.$router.push('/coach/dashboard')
          }
          if(localStorage.getItem('role') == 'challenger'){
            this.$router.push('/admin/dashboard')
          }
        }
      }).catch((err) => {
        console.log(err.response.data)
        this.message = err.response.data.message
        this.alert = true
      })
    },
    closeAlert(){
      this.alert = false
      this.message = ''
    }
  }
})
</script>
