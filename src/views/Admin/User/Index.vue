<template>
  <div class="user-admin">
    <!-- En-tête -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Gestion des Utilisateurs</h1>
    </div>

    <!-- Loading indicator -->
    <v-progress-linear
      v-if="userStore.loading"
      indeterminate
      color="primary"
      class="mb-4"
    ></v-progress-linear>

    <!-- Boutons de navigation (tabs séparés) -->
    <div class="tab-buttons mb-6">
      <v-btn
        v-for="role in rolePermissionStore.roles"
        :key="role.id"
        :variant="activeTab === role.name ? 'elevated' : 'outlined'"
        :color="activeTab === role.name ? 'primary' : 'default'"
        size="large"
        class="tab-button"
        @click="setActiveTab(role.name)"
      >
        <v-icon start>{{ getRoleIcon(role.name) }}</v-icon>
        {{ formatRoleName(role.name) }}
        <v-chip
          v-if="getUsersCountByRole(role.name) > 0"
          :color="activeTab === role.name ? 'white' : 'primary'"
          size="small"
          class="ml-2 count-chip"
        >
          {{ getUsersCountByRole(role.name) }}
        </v-chip>
      </v-btn>
    </div>

    <!-- Contenu des tabs -->
    <div class="tab-content">
      <div v-if="activeTab" class="users-grid">
        <v-row>
          <v-col
            v-for="user in userStore.usersWithRole(activeTab)"
            :key="user.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              class="user-card"
              elevation="2"
              @click="viewUser(user)"
            >
              <v-card-text class="text-center pa-4">
                <!-- Avatar -->
                <v-avatar
                  size="80"
                  class="mb-3 user-avatar"
                  :color="!user.avatar ? getRoleColor(activeTab) : undefined"
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
                    {{ getRoleIcon(activeTab) }}
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
                  :color="getRoleColor(activeTab)"
                  size="small"
                  variant="flat"
                  class="mb-3 role-chip"
                >
                  <v-icon start size="14">{{ getRoleIcon(activeTab) }}</v-icon>
                  {{ formatRoleName(activeTab) }}
                </v-chip>

                <!-- Statistiques selon le rôle -->
                <div class="stats-section">
                  <v-divider class="mb-3"></v-divider>
                  
                  <!-- Pour les coachs : nombre de séances données -->
                  <div v-if="activeTab === 'coach'" class="stat-item">
                    <div class="stat-value">{{ user.seances_as_coach_count || 0 }}</div>
                    <div class="stat-label">Séance{{ (user.seances_as_coach_count || 0) > 1 ? 's' : '' }} donnée{{ (user.seances_as_coach_count || 0) > 1 ? 's' : '' }}</div>
                  </div>

                  <!-- Pour les challengers : nombre de séances réalisées -->
                  <div v-if="activeTab === 'challenger'" class="stat-item">
                    <div class="stat-value">{{ user.seances_as_challenger_count || 0 }}</div>
                    <div class="stat-label">Séance{{ (user.seances_as_challenger_count || 0) > 1 ? 's' : '' }} réalisée{{ (user.seances_as_challenger_count || 0) > 1 ? 's' : '' }}</div>
                  </div>

                  <!-- Pour les administrateurs : date de création -->
                  <div v-if="activeTab === 'administrateur'" class="stat-item">
                    <div class="stat-value">{{ formatDate(user.created_at) }}</div>
                    <div class="stat-label">Membre depuis</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Message si aucun utilisateur -->
        <div v-if="userStore.usersWithRole(activeTab).length === 0" class="no-users">
          <v-icon size="64" color="grey-lighten-1">{{ getRoleIcon(activeTab) }}</v-icon>
          <h3 class="text-h6 mt-4 mb-2">Aucun {{ formatRoleName(activeTab).toLowerCase() }}</h3>
          <p class="text-body-2 text-grey">Il n'y a actuellement aucun utilisateur avec ce rôle.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineOptions } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../../store/AdminStore/UserStore'
import { useRolePermissionStore } from '../../../store/AdminStore/RolePermissionStore'
import { APP_CONFIG } from '../../../config/constants'

// Définir le nom du composant pour keep-alive
defineOptions({
  name: 'UserAdmin'
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const rolePermissionStore = useRolePermissionStore()

const activeTab = ref<string>('')

// Méthodes
const setActiveTab = (roleName: string) => {
  activeTab.value = roleName
  // Mettre à jour l'URL avec le tab actif
  router.replace({
    path: route.path,
    query: { ...route.query, tab: roleName }
  })
}

const viewUser = (user: any) => {
  // Conserver le tab actif dans l'URL lors de la navigation vers Show
  const currentTab = activeTab.value
  router.push({
    path: `/admin/user/${user.id}`,
    query: { from_tab: currentTab }
  })
}

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

const formatDate = (dateString: string) => {
  if (!dateString) return 'Non défini'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short'
  })
}

const formatRoleName = (roleName: string) => {
  switch (roleName) {
    case 'administrateur':
      return 'Administrateurs'
    case 'coach':
      return 'Coachs'
    case 'challenger':
      return 'Challengers'
    default:
      return roleName.charAt(0).toUpperCase() + roleName.slice(1)
  }
}

const getUsersCountByRole = (roleName: string) => {
  return userStore.usersWithRole(roleName).length
}

// Watcher pour définir le premier tab actif
watch(
  () => rolePermissionStore.roles,
  (newRoles) => {
    if (newRoles.length > 0 && !activeTab.value) {
      // Vérifier s'il y a un tab dans l'URL
      const tabFromUrl = route.query.tab as string
      if (tabFromUrl && newRoles.some(role => role.name === tabFromUrl)) {
        activeTab.value = tabFromUrl
      } else {
        // Sinon, utiliser le premier tab disponible
        activeTab.value = newRoles[0].name
      }
    }
  }
)

// Watcher pour restaurer le tab à partir de l'URL
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && typeof newTab === 'string' && rolePermissionStore.roles.some(role => role.name === newTab)) {
      activeTab.value = newTab
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(() => {
  rolePermissionStore.getRoles()
  userStore.getUsers()
  
  // Restaurer le tab actif à partir de l'URL au montage
  const tabFromUrl = route.query.tab as string
  if (tabFromUrl && rolePermissionStore.roles.some(role => role.name === tabFromUrl)) {
    activeTab.value = tabFromUrl
  }
})
</script>

<style scoped>
.user-admin {
  padding: 20px;
}

.tab-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tab-button {
  text-transform: none;
  font-weight: 500;
  min-width: 120px;
  border-radius: 0 !important;
}

.count-chip {
  border-radius: 0 !important;
}

.tab-content {
  min-height: 400px;
}

.users-grid {
  width: 100%;
}

.no-users {
  text-align: center;
  padding: 80px 20px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.user-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0 !important;
  position: relative;
  overflow: hidden;
}

.user-card:hover {
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
  border-radius: 0 !important;
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

/* Responsive */
@media (max-width: 768px) {
  .user-admin {
    padding: 16px;
  }
  
  .tab-buttons {
    justify-content: center;
  }
  
  .tab-button {
    min-width: 100px;
  }
  
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
