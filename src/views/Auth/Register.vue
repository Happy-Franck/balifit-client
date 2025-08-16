<template>
  <div class="register-page">
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
    
    <v-container fluid class="register-container">
      <v-row no-gutters class="register-row">
        <!-- Section Image Dynamique -->
        <v-col cols="12" lg="5" class="image-section">
          <div class="image-container">
            <v-img 
              class="register-image" 
              :aspect-ratio="1" 
              :src="currentStepImage" 
              cover
            >
              <div class="image-overlay">
                <div class="overlay-content">
                  <div class="step-indicator">
                    <div class="step-number">{{ currentStep }}</div>
                    <div class="step-total">/ {{ totalSteps }}</div>
                  </div>
                  <h1 class="step-title">{{ currentStepTitle }}</h1>
                  <p class="step-description">{{ currentStepDescription }}</p>
                  
                  <!-- Indicateur de progression moderne -->
                  <div class="progress-container">
                    <div class="progress-dots">
                      <div 
                        v-for="step in totalSteps" 
                        :key="step"
                        class="progress-dot"
                        :class="{ 'active': step <= currentStep, 'completed': step < currentStep }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </v-img>
          </div>
        </v-col>
        
        <!-- Section Formulaire -->
        <v-col cols="12" lg="7" class="form-section">
          <div class="form-container">
            <v-window v-model="currentStep" class="stepper-content">
              <!-- Étape 1: Informations de base -->
              <v-window-item :value="1">
                <div class="step-card">
                  <div class="step-header">
                    <v-icon class="step-icon" size="48">mdi-account-circle</v-icon>
                    <h2 class="step-title-form">Créons votre compte</h2>
                    <p class="step-subtitle">Vos informations personnelles</p>
                  </div>
                  
                  <v-form ref="step1Form" v-model="step1Valid" class="step-form">
                    <div class="input-group">
                      <v-text-field
                        v-model="formData.name"
                        label="Nom complet"
                        variant="outlined"
                        class="form-input"
                        prepend-inner-icon="mdi-account"
                        :rules="[rules.required]"
                        hide-details="auto"
                      ></v-text-field>
                    </div>
                    
                    <div class="input-group">
                      <v-text-field
                        v-model="formData.email"
                        label="Adresse email"
                        type="email"
                        variant="outlined"
                        class="form-input"
                        prepend-inner-icon="mdi-email"
                        :rules="[rules.required, rules.email]"
                        hide-details="auto"
                      ></v-text-field>
                    </div>
                    
                    <div class="input-group">
                      <v-text-field
                        v-model="formData.password"
                        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                        :type="visible ? 'text' : 'password'"
                        label="Mot de passe"
                        variant="outlined"
                        class="form-input"
                        prepend-inner-icon="mdi-lock"
                        :rules="[rules.required, rules.minLength]"
                        @click:append-inner="visible = !visible"
                        hide-details="auto"
                      ></v-text-field>
                    </div>
                    
                    <div class="input-group">
                      <v-text-field
                        v-model="confirmPassword"
                        :append-inner-icon="visibleConfirm ? 'mdi-eye-off' : 'mdi-eye'"
                        :type="visibleConfirm ? 'text' : 'password'"
                        label="Confirmer le mot de passe"
                        variant="outlined"
                        class="form-input"
                        prepend-inner-icon="mdi-lock-check"
                        :rules="[rules.required, rules.passwordMatch]"
                        @click:append-inner="visibleConfirm = !visibleConfirm"
                        hide-details="auto"
                      ></v-text-field>
                    </div>
                  </v-form>
                </div>
              </v-window-item>

              <!-- Étape 2: Informations de contact -->
              <v-window-item :value="2">
                <div class="step-card">
                  <div class="step-header">
                    <v-icon class="step-icon" size="48">mdi-phone-classic</v-icon>
                    <h2 class="step-title-form">Vos coordonnées</h2>
                    <p class="step-subtitle">Informations de contact (optionnel)</p>
                  </div>
                  
                  <v-form ref="step2Form" v-model="step2Valid" class="step-form">
                    <div class="input-group">
                      <v-text-field
                        v-model="formData.telephone"
                        label="Numéro de téléphone"
                        variant="outlined"
                        class="form-input"
                        prepend-inner-icon="mdi-phone"
                        :rules="[rules.phone]"
                        hide-details="auto"
                      ></v-text-field>
                    </div>
                    
                    <div class="input-group">
                      <v-text-field
                        v-model="formData.cin"
                        label="Numéro CIN"
                        variant="outlined"
                        class="form-input"
                        prepend-inner-icon="mdi-card-account-details"
                        :rules="[rules.cin]"
                        hide-details="auto"
                      ></v-text-field>
                    </div>
                    
                    <div class="input-group">
                      <v-file-input
                        v-model="formData.avatar"
                        label="Photo de profil"
                        variant="outlined"
                        class="form-input"
                        prepend-inner-icon="mdi-camera"
                        accept="image/*"
                        :rules="[rules.image]"
                        show-size
                        hide-details="auto"
                      ></v-file-input>
                    </div>
                  </v-form>
                </div>
              </v-window-item>

              <!-- Étape 3: Informations physiques -->
              <v-window-item :value="3">
                <div class="step-card">
                  <div class="step-header">
                    <v-icon class="step-icon" size="48">mdi-human</v-icon>
                    <h2 class="step-title-form">Votre profil</h2>
                    <p class="step-subtitle">Informations physiques (optionnel)</p>
                  </div>
                  
                  <v-form ref="step3Form" v-model="step3Valid" class="step-form">
                    <v-row class="input-row">
                      <v-col cols="12" sm="6">
                        <div class="input-group">
                          <v-select
                            v-model="formData.sexe"
                            label="Sexe"
                            :items="sexeOptions"
                            variant="outlined"
                            class="form-input"
                            prepend-inner-icon="mdi-human-male-female"
                            hide-details="auto"
                          ></v-select>
                        </div>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <div class="input-group">
                          <v-text-field
                            v-model="formData.date_naissance"
                            label="Date de naissance"
                            type="date"
                            variant="outlined"
                            class="form-input"
                            prepend-inner-icon="mdi-calendar"
                            :rules="[rules.birthDate]"
                            hide-details="auto"
                          ></v-text-field>
                        </div>
                      </v-col>
                    </v-row>
                    
                    <div class="input-group">
                      <v-text-field
                        v-model="formData.poids"
                        label="Poids actuel (kg)"
                        type="number"
                        step="0.1"
                        min="10"
                        max="500"
                        variant="outlined"
                        class="form-input"
                        prepend-inner-icon="mdi-weight-kilogram"
                        :rules="[rules.weight]"
                        hint="Ex: 72.5"
                        persistent-hint
                      ></v-text-field>
                    </div>

                    <div class="input-group">
                      <v-text-field
                        v-model="formData.taille"
                        label="Taille (en mètres)"
                        type="number"
                        step="0.01"
                        min="0.5"
                        max="3.0"
                        variant="outlined"
                        class="form-input"
                        prepend-inner-icon="mdi-human-male-height"
                        :rules="[rules.height]"
                        hint="Ex: 1.75"
                        persistent-hint
                      ></v-text-field>
                    </div>
                  </v-form>
                </div>
              </v-window-item>

              <!-- Étape 4: Objectifs fitness -->
              <v-window-item :value="4">
                <div class="step-card">
                  <div class="step-header">
                    <v-icon class="step-icon" size="48">mdi-target</v-icon>
                    <h2 class="step-title-form">Vos objectifs</h2>
                    <p class="step-subtitle">Définissez votre objectif fitness</p>
                  </div>
                  
                  <v-form ref="step4Form" v-model="step4Valid" class="step-form">
                    <div class="input-group">
                      <v-select
                        v-model="formData.objectif"
                        label="Objectif principal"
                        :items="objectifOptions"
                        variant="outlined"
                        class="form-input"
                        prepend-inner-icon="mdi-target"
                        hint="Choisissez votre objectif principal"
                        persistent-hint
                      ></v-select>
                    </div>
                    
                    <div class="motivation-section">
                      <div class="motivation-card">
                        <v-icon class="motivation-icon">mdi-lightbulb-on</v-icon>
                        <h4 class="motivation-title">Pourquoi définir un objectif ?</h4>
                        <p class="motivation-text">
                          Un objectif clair vous permet de rester motivé, de mesurer vos progrès 
                          et d'adapter votre programme d'entraînement pour des résultats optimaux.
                        </p>
                      </div>
                    </div>
                  </v-form>
                </div>
              </v-window-item>
            </v-window>
            
            <!-- Actions du formulaire -->
            <div class="form-actions">
              <v-btn
                v-if="currentStep > 1"
                variant="text"
                color="primary"
                @click="previousStep"
                class="action-btn prev-btn"
                size="large"
              >
                <v-icon left>mdi-arrow-left</v-icon>
                Précédent
              </v-btn>
              
              <v-spacer></v-spacer>
              
              <v-btn
                v-if="currentStep < totalSteps"
                color="primary"
                @click="nextStep"
                :disabled="!isCurrentStepValid"
                size="large"
                elevation="0"
              >
                Suivant
                <v-icon right>mdi-arrow-right</v-icon>
              </v-btn>
              
              <v-btn
                v-if="currentStep === totalSteps"
                color="primary"
                @click="submitForm"
                :loading="loading"
                :disabled="!isFormValid"
                size="large"
                elevation="0"
              >
                <v-icon left>mdi-check</v-icon>
                Créer mon compte
              </v-btn>
            </div>
            
            <div class="form-footer">
              <router-link to="/login" class="login-link">
                Déjà un compte ? Se connecter
              </router-link>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import http from '../../axios'
import { useRouter } from "vue-router";

export default defineComponent({
  name: "RegisterView",
  setup() {
    const visible = ref(false);
    const visibleConfirm = ref(false);
    const message = ref('');
    const alert = ref(false);
    const loading = ref(false);
    const currentStep = ref(1);
    const totalSteps = ref(4);
    
    // Validité des étapes
    const step1Valid = ref(false);
    const step2Valid = ref(true); // Optionnel
    const step3Valid = ref(true); // Optionnel
    const step4Valid = ref(true); // Optionnel

    const router = useRouter();

    // Données du formulaire
    const formData = ref({
      name: '',
      email: '',
      password: '',
      telephone: '',
      cin: '',
      taille: '',
      poids: '',
      objectif: '',
      sexe: '',
      date_naissance: '',
      avatar: [] as File[]
    });

    const confirmPassword = ref('');

    // Images pour chaque étape
    const stepImageNames = {
      1: '/images/pexels-ketut-subiyanto-4853334.jpg', // Étape compte
      2: '/images/pexels-alesiakozik-7289233.jpg', // Étape contact
      3: '/images/pexels-mikhail-nilov-8455609.jpg', // Étape profil
      4: '/images/pexels-ketut-subiyanto-4853660.jpg'  // Étape objectifs
    };

    // Titres et descriptions pour chaque étape
    const stepContent = {
      1: {
        title: 'Créons votre compte',
        description: 'Commencez votre parcours fitness avec HPFit'
      },
      2: {
        title: 'Vos coordonnées',
        description: 'Ajoutez vos informations de contact'
      },
      3: {
        title: 'Votre profil',
        description: 'Personnalisez votre expérience'
      },
      4: {
        title: 'Vos objectifs',
        description: 'Définissez votre transformation'
      }
    };

    // Options pour les selects
    const sexeOptions = [
      { title: 'Homme', value: 'homme' },
      { title: 'Femme', value: 'femme' }
    ];

    const objectifOptions = [
      { title: 'Prise de masse', value: 'prise de masse' },
      { title: 'Perte de poids', value: 'perte de poids' },
      { title: 'Maintien', value: 'maintien' },
      { title: 'Prise de force', value: 'prise de force' },
      { title: 'Endurance', value: 'endurance' },
      { title: 'Remise en forme', value: 'remise en forme' },
      { title: 'Sèche', value: 'sèche' },
      { title: 'Souplesse', value: 'souplesse' },
      { title: 'Rééducation', value: 'rééducation' },
      { title: 'Tonification', value: 'tonification' },
      { title: 'Préparation physique', value: 'préparation physique' },
      { title: 'Performance', value: 'performance' }
    ];

    // Règles de validation
    const rules = {
      required: (value: string) => !!value || 'Ce champ est requis',
      email: (value: string) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value) || 'Adresse email invalide';
      },
      minLength: (value: string) => value.length >= 8 || 'Le mot de passe doit contenir au moins 8 caractères',
      passwordMatch: (value: string) => value === formData.value.password || 'Les mots de passe ne correspondent pas',
      phone: (value: string) => !value || /^[0-9+\-\s()]+$/.test(value) || 'Numéro de téléphone invalide',
      cin: (value: string) => !value || value.length >= 6 || 'Le CIN doit contenir au moins 6 caractères',
      height: (value: string) => !value || (parseFloat(value) >= 0.5 && parseFloat(value) <= 3.0) || 'La taille doit être entre 0.5 et 3.0 mètres',
      birthDate: (value: string) => !value || new Date(value) < new Date() || 'La date de naissance doit être antérieure à aujourd\'hui',
      image: (value: File[]) => !value || value.length === 0 || value[0].type.startsWith('image/') || 'Le fichier doit être une image',
      weight: (value: string) => !value || (parseFloat(value) >= 10 && parseFloat(value) <= 500) || 'Le poids doit être entre 10 et 500 kg'
    };

    // Computed properties
    const currentStepImage = computed(() => {
      return stepImageNames[currentStep.value as keyof typeof stepImageNames];
    });

    const currentStepTitle = computed(() => {
      return stepContent[currentStep.value as keyof typeof stepContent].title;
    });

    const currentStepDescription = computed(() => {
      return stepContent[currentStep.value as keyof typeof stepContent].description;
    });

    const isCurrentStepValid = computed(() => {
      switch (currentStep.value) {
        case 1: return step1Valid.value;
        case 2: return step2Valid.value;
        case 3: return step3Valid.value;
        case 4: return step4Valid.value;
        default: return false;
      }
    });

    const isFormValid = computed(() => {
      return step1Valid.value && step2Valid.value && step3Valid.value && step4Valid.value;
    });

    // Méthodes de navigation
    const nextStep = () => {
      if (currentStep.value < totalSteps.value && isCurrentStepValid.value) {
        currentStep.value++;
      }
    };

    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };

    // Soumission du formulaire
    const submitForm = () => {
      if (!isFormValid.value) return;

      loading.value = true;
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.value.name);
      formDataToSend.append('email', formData.value.email);
      formDataToSend.append('password', formData.value.password);
      
      if (formData.value.telephone) formDataToSend.append('telephone', formData.value.telephone);
      if (formData.value.cin) formDataToSend.append('cin', formData.value.cin);
      if (formData.value.taille) formDataToSend.append('taille', formData.value.taille);
      if (formData.value.poids) formDataToSend.append('poids', formData.value.poids);
      if (formData.value.objectif) formDataToSend.append('objectif', formData.value.objectif);
      if (formData.value.sexe) formDataToSend.append('sexe', formData.value.sexe);
      if (formData.value.date_naissance) formDataToSend.append('date_naissance', formData.value.date_naissance);
      
      // Correction pour l'avatar : v-file-input retourne un tableau
      if (formData.value.avatar && Array.isArray(formData.value.avatar) && formData.value.avatar.length > 0) {
        formDataToSend.append('avatar', formData.value.avatar[0]);
      }

      http.post("/register", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((response) => {
        if(response.data){
          localStorage.setItem('username', response.data.user.name)
          localStorage.setItem('useremail', response.data.user.email)
          localStorage.setItem('useravatar', response.data.user.avatar)
          localStorage.setItem('role', response.data.role)
          localStorage.setItem('token', response.data.token)
          
          if(localStorage.getItem('role') == 'administrateur'){
            router.push('/admin/dashboard')
          }
          if(localStorage.getItem('role') == 'coach'){
            router.push('/coach/dashboard')
          }
          if(localStorage.getItem('role') == 'challenger'){
            router.push('/challenger/dashboard')
          }
        }
        loading.value = false;
      }).catch((err) => {
        console.log(err.response.data)
        message.value = err.response.data.message || 'Une erreur est survenue'
        alert.value = true
        loading.value = false;
      })
    };

    const closeAlert = () => {
      alert.value = false
      message.value = ''
    };

    return {
      visible,
      visibleConfirm,
      message,
      alert,
      loading,
      currentStep,
      totalSteps,
      step1Valid,
      step2Valid,
      step3Valid,
      step4Valid,
      formData,
      confirmPassword,
      sexeOptions,
      objectifOptions,
      rules,
      currentStepImage,
      currentStepTitle,
      currentStepDescription,
      isCurrentStepValid,
      isFormValid,
      nextStep,
      previousStep,
      submitForm,
      closeAlert
    };
  }
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.register-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.register-row {
  background: white;
  overflow: hidden;
  min-height: 100vh;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.image-section {
  position: relative;
  background: #000;
}

.image-container {
  height: 100%;
  position: relative;
}

.register-image {
  height: 100%;
  filter: brightness(0.6);
  transition: all 0.6s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.85), rgba(118, 75, 162, 0.85));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.overlay-content {
  padding: 3rem;
  max-width: 400px;
}

.step-indicator {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 2rem;
  font-weight: 300;
}

.step-number {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
}

.step-total {
  font-size: 1.5rem;
  margin-left: 0.5rem;
  opacity: 0.7;
}

.step-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.step-description {
  font-size: 1.2rem;
  font-weight: 300;
  opacity: 0.9;
  line-height: 1.5;
  margin-bottom: 3rem;
}

.progress-container {
  margin-top: 3rem;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.progress-dot {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.progress-dot.active {
  background: white;
  transform: scale(1.2);
}

.progress-dot.completed {
  background: rgba(255, 255, 255, 0.8);
}

.form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 3rem;
  background: white;
  min-height: 100vh;
}

.form-container {
  width: 100%;
  max-width: 500px;
}

.stepper-content {
  background: transparent;
  min-height: 600px;
}

.step-card {
  padding: 2rem 0;
}

.step-header {
  text-align: center;
  margin-bottom: 3rem;
}

.step-icon {
  color: #667eea;
  margin-bottom: 1rem;
}

.step-title-form {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.step-subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  font-weight: 400;
}

.step-form {
  width: 100%;
}

.input-group {
  margin-bottom: 2rem;
}

.input-row {
  margin: 0 -0.5rem;
}

.input-row .v-col {
  padding: 0 0.5rem;
}
.motivation-section {
  margin-top: 2rem;
}

.motivation-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
  border-left: 4px solid #667eea;
  text-align: left;
}

.motivation-icon {
  color: #667eea;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.motivation-title {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.motivation-text {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 0;
  margin-top: 2rem;
  border-top: 1px solid #f0f0f0;
}
.prev-btn {
  color: #6c757d;
}

.form-footer {
  text-align: center;
  margin-top: 2rem;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  font-size: 1rem;
}

.login-link:hover {
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
.step-card {
  animation: slideInUp 0.6s ease-out;
}

.overlay-content {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
@media (max-width: 1024px) {
  .register-container {
    padding: 0;
  }
  
  .register-row {
    min-height: auto;
  }
  
  .form-section {
    padding: 3rem 2rem;
    min-height: auto;
  }
  
  .step-title {
    font-size: 2rem;
  }
  
  .step-number {
    font-size: 3rem;
  }
  
  .image-container {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .register-page {
    padding: 0;
  }
  
  .form-section {
    padding: 2rem 1rem;
  }
  
  .form-container {
    max-width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .step-title-form {
    font-size: 1.8rem;
  }
  
  .overlay-content {
    padding: 2rem;
  }
}
</style>
