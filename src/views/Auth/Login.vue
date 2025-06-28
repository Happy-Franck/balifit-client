<template>
  <div class="login">
    <div v-if="message !== '' && alert" class="alert">
      {{ message }}
      <span @click="closeAlert()">x</span>
    </div>
    <v-row no-gutters>
      <v-col cols="12" sm="6">
        <v-sheet>
          <v-img class="bg-white" :aspect-ratio="1" src="@/assets/work.jpeg" cover></v-img>
        </v-sheet>
      </v-col>
      <v-col cols="12" sm="6">
        <v-container>
          <v-sheet class="pa-2 ma-2">
            <v-form @submit.prevent="connexion">
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
import { defineComponent, ref } from "vue";
import { useAuthStore } from "../../store/AuthStore";
import http from '../../axios'
import { useRouter } from "vue-router"; // Importer useRouter depuis vue-router

export default defineComponent({
  name: "LoginView",
  setup() {
    const visible = ref(false);
    const message = ref("");
    const alert = ref(false);
    const email = ref("");
    const password = ref("");

    const authStore = useAuthStore();
    const router = useRouter();

    const connexion = () => {
      http.post("/login", {
        email: email.value,
        password: password.value
      })
        .then((response) => {
        console.log(response.data)
          if (response.data) {
            const userData = {
              user: {
                name: response.data.user.name,
                email: response.data.user.email,
                avatar: response.data.user.avatar
              },
              role: response.data.role,
              token: response.data.token
            };
            authStore.setUserData(userData);

            if (authStore.role === 'administrateur') {
              router.push('/admin/dashboard')
            }
            if (authStore.role === 'coach') {
              router.push('/coach/dashboard')
            }
            if (authStore.role === 'challenger') {
              router.push('/challenger/dashboard')
            }
          }
        })
        .catch((err) => {
          console.log(err.response.data);
          message.value = err.response.data.message;
          alert.value = true;
        });
    };

    const closeAlert = () => {
      alert.value = false;
      message.value = "";
    };

    return {
      visible,
      message,
      alert,
      email,
      password,
      connexion,
      closeAlert
    };
  }
});
</script>
