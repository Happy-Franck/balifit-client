<template>
  <v-card
    class="user-card"
    :class="{ 'user-card-hover': true }"
    elevation="2"
    @click="$emit('click', user)"
  >
    <v-card-text class="text-center pa-4">
      <!-- Avatar -->
      <v-avatar
        size="80"
        class="mb-3 user-avatar"
        :color="!user.avatar ? getRoleColor(role) : undefined"
      >
        <v-img
          v-if="user.avatar"
          :src="`${APP_CONFIG.STORAGE_BASE_URL}/avatars/${user.avatar}`"
          cover
        ></v-img>
        <v-icon
          v-else
          size="40"
          color="white"
        >
          {{ getRoleIcon(role) }}
        </v-icon>
      </v-avatar>

      <!-- Nom -->
      <h3 class="text-h6 font-weight-bold mb-1 user-name">
        {{ user.name }}
      </h3>

      <!-- Email -->
      <p class="text-body-2 text-grey-darken-1 mb-3 user-email">
        {{ user.email }}
      </p>

      <!-- Badge du rôle -->
      <v-chip
        :color="getRoleColor(role)"
        size="small"
        variant="flat"
        class="mb-3 role-chip"
      >
        <v-icon start size="14">{{ getRoleIcon(role) }}</v-icon>
        {{ formatRoleName(role) }}
      </v-chip>

      <!-- Statistiques selon le rôle -->
      <div class="stats-section">
        <v-divider class="mb-3"></v-divider>
        
        <!-- Pour les coachs : nombre de séances données -->
        <div v-if="role === 'coach'" class="stat-item">
          <div class="stat-value">{{ getCoachStats(user) }}</div>
          <div class="stat-label">Séance{{ getCoachStats(user) > 1 ? 's' : '' }} donnée{{ getCoachStats(user) > 1 ? 's' : '' }}</div>
        </div>

        <!-- Pour les challengers : nombre de séances réalisées -->
        <div v-if="role === 'challenger'" class="stat-item">
          <div class="stat-value">{{ getChallengerStats(user) }}</div>
          <div class="stat-label">Séance{{ getChallengerStats(user) > 1 ? 's' : '' }} réalisée{{ getChallengerStats(user) > 1 ? 's' : '' }}</div>
        </div>

        <!-- Pour les administrateurs : date de création -->
        <div v-if="role === 'administrateur'" class="stat-item">
          <div class="stat-value">{{ formatDate(user.created_at) }}</div>
          <div class="stat-label">Membre depuis</div>
        </div>
      </div>
    </v-card-text>

    <!-- Overlay au hover -->
    <v-overlay
      :model-value="false"
      contained
      class="card-overlay"
    >
      <v-btn
        color="primary"
        variant="elevated"
        size="large"
      >
        <v-icon start>mdi-eye</v-icon>
        Voir le profil
      </v-btn>
    </v-overlay>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { APP_CONFIG } from '../config/constants'

interface User {
  id: number
  name: string
  email: string
  avatar?: string
  created_at: string
  seances_as_coach_count?: number
  seances_as_challenger_count?: number
}

interface Props {
  user: User
  role: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [user: User]
}>()

// Méthodes
const getRoleIcon = (roleName: string) => {
  switch (roleName) {
    case 'administrateur':
      return 'mdi-shield-account'
    case 'coach':
      return 'mdi-account-tie'
    case 'challenger':
      return 'mdi-account'
    default:
      return 'mdi-account-group'
  }
}

const getRoleColor = (roleName: string) => {
  switch (roleName) {
    case 'administrateur':
      return 'primary'
    case 'coach':
      return 'success'
    case 'challenger':
      return 'info'
    default:
      return 'grey'
  }
}

const formatRoleName = (roleName: string) => {
  switch (roleName) {
    case 'administrateur':
      return 'Admin'
    case 'coach':
      return 'Coach'
    case 'challenger':
      return 'Challenger'
    default:
      return roleName.charAt(0).toUpperCase() + roleName.slice(1)
  }
}

const getCoachStats = (user: User) => {
  return user.seances_as_coach_count || 0
}

const getChallengerStats = (user: User) => {
  return user.seances_as_challenger_count || 0
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Non défini'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short'
  })
}
</script>

<style scoped>
.user-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.user-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.user-avatar {
  border: 3px solid rgba(var(--v-theme-surface-variant), 0.5);
  transition: all 0.3s ease;
}

.user-card:hover .user-avatar {
  border-color: rgb(var(--v-theme-primary));
}

.user-name {
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
}

.role-chip {
  font-size: 0.75rem;
  height: 24px;
}

.stats-section {
  margin-top: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.card-overlay {
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-card:hover .card-overlay {
  opacity: 1;
}

/* Animation pour les stats */
.stat-value {
  animation: countUp 0.6s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .user-name {
    font-size: 1rem;
  }
  
  .user-email {
    font-size: 0.8rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
}
</style> 