<template>
  <div class="not-found-container">
    <!-- Contenu principal -->
    <div class="not-found-content hpfit-fade-in">
      <!-- Illustration 404 -->
      <div class="error-illustration">
        <div class="error-number">404</div>
        <div class="error-icon-container">
          <v-icon size="80" class="error-icon">mdi-dumbbell</v-icon>
        </div>
      </div>

      <!-- Texte d'erreur -->
      <div class="error-text">
        <h1 class="error-title">Hors-jeu !</h1>
        <p class="error-description">
          Cette page a quitté le terrain ! Comme un sprinter qui a pris la mauvaise piste,
          vous vous êtes égaré. Reprenons l'entraînement sur la bonne voie !
        </p>
      </div>

      <!-- Actions -->
      <div class="error-actions">
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          @click="goHome"
          class="action-btn"
          prepend-icon="mdi-home-variant"
        >
          Retour au camp de base
        </v-btn>
        
        <v-btn
          variant="outlined"
          size="large"
          @click="goBack"
          class="action-btn"
          prepend-icon="mdi-replay"
        >
          Reprendre l'entraînement
        </v-btn>
      </div>

    </div>

    <!-- Particules flottantes décoratives -->
    <div class="floating-particles">
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="particle particle-3"></div>
      <div class="particle particle-4"></div>
      <div class="particle particle-5"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--hpfit-gradient-light);
  position: relative;
  overflow: hidden;
}

.not-found-content {
  max-width: 600px;
  text-align: center;
  z-index: 2;
  position: relative;
}

.error-illustration {
  position: relative;
  margin-bottom: 32px;
}

.error-number {
  font-size: 8rem;
  font-weight: 900;
  background: var(--hpfit-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 16px;
  text-shadow: 0 4px 20px rgba(88, 101, 242, 0.3);
}

.error-icon-container {
  position: relative;
}

.error-icon {
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 20px rgba(88, 101, 242, 0.3));
}

.error-text {
  margin-bottom: 40px;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.error-description {
  font-size: 1.1rem;
  color: rgba(var(--v-theme-on-surface-rgb), 0.8);
  line-height: 1.6;
  margin-bottom: 0;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.action-btn {
  min-width: 180px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: var(--hpfit-shadow-secondary);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--hpfit-shadow-primary);
}


/* Particules flottantes */
.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--hpfit-gradient-primary);
  border-radius: 50%;
  opacity: 0.6;
  animation: float-particle 6s ease-in-out infinite;
}

.particle-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
  animation-duration: 8s;
}

.particle-2 {
  top: 60%;
  left: 80%;
  animation-delay: 2s;
  animation-duration: 6s;
}

.particle-3 {
  top: 30%;
  left: 70%;
  animation-delay: 4s;
  animation-duration: 7s;
}

.particle-4 {
  top: 80%;
  left: 20%;
  animation-delay: 1s;
  animation-duration: 9s;
}

.particle-5 {
  top: 10%;
  left: 50%;
  animation-delay: 3s;
  animation-duration: 5s;
}

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes float-particle {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-30px) translateX(10px);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-60px) translateX(-5px);
    opacity: 0.4;
  }
  75% {
    transform: translateY(-30px) translateX(-10px);
    opacity: 0.7;
  }
}

/* Mode sombre */
.v-theme--customDark .not-found-container {
  background: linear-gradient(135deg, rgba(42, 45, 58, 0.8) 0%, rgba(18, 18, 18, 0.9) 100%);
}

/* Responsive */
@media (max-width: 768px) {
  .error-number {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .error-description {
    font-size: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .not-found-container {
    padding: 16px;
  }
  
  .error-number {
    font-size: 4rem;
  }
  
  .error-title {
    font-size: 1.75rem;
  }
}
</style>
