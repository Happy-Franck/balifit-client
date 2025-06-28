<template>
  <div class="login-page">
    <div v-if="message !== '' && alert" class="alert-message">
      <v-alert
        type="error"
        closable
        @click:close="closeAlert()"
        class="mb-4"
      >
        {{ message }}
      </v-alert>
    </div>
    
    <v-container fluid class="login-container">
      <v-row no-gutters class="login-row">
        <!-- Section Image -->
        <v-col cols="12" md="6" class="image-section">
          <div class="image-container">
            <v-img 
              class="login-image" 
              :aspect-ratio="1" 
              src="@/assets/work.jpeg" 
              cover
            >
              <div class="image-overlay">
                <div class="overlay-content">
                  <h2 class="welcome-title">Bienvenue sur</h2>
                  <h1 class="brand-name">HPFit</h1>
                  <p class="welcome-subtitle">
                    Votre parcours fitness commence ici
                  </p>
                </div>
              </div>
            </v-img>
          </div>
        </v-col>
        
        <!-- Section Formulaire -->
        <v-col cols="12" md="6" class="form-section">
          <div class="form-container">
            <div class="form-header">
              <h2 class="form-title">Connexion</h2>
              <p class="form-subtitle">Connectez-vous à votre compte</p>
            </div>
            
            <v-form @submit.prevent="connexion" class="login-form">
              <v-text-field
                v-model="email"
                label="Adresse email"
                type="email"
                density="comfortable"
                variant="outlined"
                class="form-input"
                prepend-inner-icon="mdi-email"
                :rules="[rules.required, rules.email]"
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visible ? 'text' : 'password'"
                density="comfortable"
                label="Mot de passe"
                variant="outlined"
                class="form-input"
                prepend-inner-icon="mdi-lock"
                color="primary"
                :rules="[rules.required]"
                @click:append-inner="visible = !visible"
              ></v-text-field>
              
              <div class="form-actions">
                <v-btn
                  type="submit"
                  block
                  size="large"
                  color="primary"
                  :loading="loading"
                >
                  <v-icon left>mdi-login</v-icon>
                  Se connecter
                </v-btn>
              </div>
              
              <div class="form-footer">
                <router-link to="/register" class="register-link">
                  Pas de compte ? Créer un compte
                </router-link>
              </div>
            </v-form>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useAuthStore } from "../../store/AuthStore";
import http from '../../axios'
import { useRouter } from "vue-router";

export default defineComponent({
  name: "LoginView",
  setup() {
    const visible = ref(false);
    const message = ref("");
    const alert = ref(false);
    const email = ref("");
    const password = ref("");
    const loading = ref(false);

    const authStore = useAuthStore();
    const router = useRouter();

    const rules = {
      required: (value: string) => !!value || 'Ce champ est requis',
      email: (value: string) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value) || 'Adresse email invalide';
      },
    };

    const connexion = () => {
      loading.value = true;
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

            router.push(authStore.getDashboardRoute());
          }
          loading.value = false;
        })
        .catch((err) => {
          console.log(err.response.data);
          message.value = err.response.data.message;
          alert.value = true;
          loading.value = false;
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
      loading,
      rules,
      connexion,
      closeAlert
    };
  }
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.login-row {
  background: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 600px;
}

.image-section {
  position: relative;
}

.image-container {
  height: 100%;
  position: relative;
}

.login-image {
  height: 100%;
  filter: brightness(0.7);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.overlay-content {
  padding: 2rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.brand-name {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1.1rem;
  font-weight: 300;
  opacity: 0.9;
  line-height: 1.6;
}

.form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: white;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  color: #7f8c8d;
  font-size: 1rem;
  font-weight: 400;
}

.login-form {
  width: 100%;
}

.form-actions {
  margin: 2rem 0;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.alert-message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
}

/* Animations */
.form-container {
  animation: slideInRight 0.6s ease-out;
}

.overlay-content {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-row {
    min-height: auto;
  }
  
  .form-section {
    padding: 2rem 1rem;
  }
  
  .brand-name {
    font-size: 3rem;
  }
  
  .form-title {
    font-size: 2rem;
  }
  
  .image-container {
    height: 300px;
  }
}
</style>
