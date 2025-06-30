<template>
  <div class="profile-view">
    <!-- Breadcrumbs (seulement si ce n'est pas mon profil) -->
    <v-breadcrumbs 
      v-if="!isMyProfile"
      :items="breadcrumbItems" 
      class="pa-0 mb-4"
      divider="/"
    >
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item
          :to="item.href"
          :disabled="item.disabled"
          class="breadcrumb-item"
        >
          <v-icon v-if="item.icon" :icon="item.icon" size="16" class="mr-1"></v-icon>
          {{ item.title }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p class="loading-text mt-4">Chargement...</p>
    </div>

    <!-- Profile Content -->
    <div v-if="user && !loading">
      <!-- Photo de couverture avec avatar flottant -->
      <div class="cover-section">
        <div class="cover-image">
          <v-img
            :src="user?.cover_photo ? `http://localhost:8000/storage/covers/${user.cover_photo}` : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'"
            height="300"
            cover
            class="cover-bg"
          >
            <div class="cover-overlay"></div>
          </v-img>
        </div>
        
        <!-- Avatar flottant -->
        <div class="avatar-container">
          <v-avatar
            size="150"
            class="avatar-floating elevation-8"
            @click="showAvatarModal = true"
            style="border: 3px solid white;"
          >
            <v-img 
              v-if="user?.avatar" 
              :src="`http://localhost:8000/storage/avatars/${user.avatar}`"
              cover
            ></v-img>
            <v-icon v-else size="75" color="white">mdi-account</v-icon>
          </v-avatar>
        </div>
      </div>

      <!-- Informations principales -->
      <v-container class="profile-content">
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <!-- Section nom, email, bio et boutons d'action -->
            <div class="profile-header">
              <h1 class="text-h3 font-weight-bold mb-2">{{ user?.name || 'Utilisateur' }}</h1>
              <p class="text-h6 text-medium-emphasis mb-3">{{ user?.email || 'email@example.com' }}</p>
              
              <!-- Rôles -->
              <div class="roles-section mb-4">
                <v-chip 
                  v-for="role in user?.roles" 
                  :key="role.id"
                  :color="getRoleColor(role.name)"
                  variant="elevated"
                  class="mr-2 role-chip-no-radius"
                >
                  <v-icon start size="14">{{ getRoleIcon(role.name) }}</v-icon>
                  {{ formatRoleName(role.name) }}
                </v-chip>
              </div>
              
              <!-- Bio -->
              <p v-if="user?.bio" class="text-body-1 mb-4">{{ user.bio }}</p>
              <p v-else class="text-body-1 text-medium-emphasis mb-4 font-italic">Aucune biographie renseignée</p>
              
              <!-- Boutons d'action selon le contexte -->
              <div class="action-buttons mb-6">
                <!-- Si c'est mon profil -->
                <v-btn 
                  v-if="isMyProfile"
                  color="primary" 
                  variant="elevated"
                  size="large"
                  class="mr-3 no-radius-btn"
                  @click="goToEdit"
                >
                  <v-icon class="mr-2">mdi-account-edit</v-icon>
                  Éditer mon profil
                </v-btn>
                
                <!-- Si je suis admin et ce n'est pas mon profil -->
                <template v-if="!isMyProfile && isCurrentUserAdmin">
                  <v-btn 
                    color="primary" 
                    variant="elevated"
                    size="large"
                    class="mr-3 no-radius-btn"
                    @click="editUser"
                  >
                    <v-icon class="mr-2">mdi-account-edit</v-icon>
                    Éditer l'utilisateur
                  </v-btn>
                  <v-btn 
                    v-if="canDeleteUser"
                    color="error" 
                    variant="outlined"
                    size="large"
                    class="mr-3 no-radius-btn"
                    @click="confirmDelete"
                  >
                    <v-icon class="mr-2">mdi-delete</v-icon>
                    Supprimer
                  </v-btn>
                </template>
                
                <!-- Bouton retour (sauf si c'est mon profil) -->
                <v-btn 
                  v-if="!isMyProfile"
                  color="info" 
                  variant="outlined"
                  size="large"
                  class="no-radius-btn"
                  @click="goBack"
                >
                  <v-icon class="mr-2">mdi-arrow-left</v-icon>
                  Retour
                </v-btn>
              </div>
            </div>

            <!-- Layout en 2 colonnes -->
            <div class="user-details">
              <v-row>
                <!-- Colonne gauche -->
                <v-col cols="12" md="6">
                  <!-- Informations personnelles -->
                  <v-card class="mb-4 custom-card">
                    <v-card-title class="custom-card-title">
                      <v-icon class="mr-2">mdi-account-details</v-icon>
                      Informations personnelles
                    </v-card-title>
                    <v-card-text>
                      <div class="info-grid">
                        <div class="info-item">
                          <div class="info-label">Téléphone</div>
                          <div class="info-value">{{ user?.telephone || 'Non renseigné' }}</div>
                        </div>
                        <div class="info-item">
                          <div class="info-label">CIN</div>
                          <div class="info-value">{{ user?.cin || 'Non renseigné' }}</div>
                        </div>
                        <div class="info-item">
                          <div class="info-label">Sexe</div>
                          <div class="info-value">{{ formatSexe(user?.sexe) }}</div>
                        </div>
                        <div class="info-item">
                          <div class="info-label">Date de naissance</div>
                          <div class="info-value">{{ formatDate(user?.date_naissance) }}</div>
                        </div>
                        <div class="info-item">
                          <div class="info-label">Membre depuis</div>
                          <div class="info-value">{{ formatDate(user?.created_at) }}</div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>

                  <!-- Informations physiques -->
                  <v-card class="mb-4 custom-card">
                    <v-card-title class="custom-card-title">
                      <v-icon class="mr-2">mdi-human-male-height</v-icon>
                      Informations physiques
                    </v-card-title>
                    <v-card-text>
                      <div class="info-grid">
                        <div class="info-item">
                          <div class="info-label">Taille</div>
                          <div class="info-value">{{ user?.taille ? `${user.taille} m` : 'Non renseigné' }}</div>
                        </div>
                        <div class="info-item">
                          <div class="info-label">Poids actuel</div>
                          <div class="info-value">{{ currentWeight ? `${currentWeight} kg` : 'Non renseigné' }}</div>
                        </div>
                        <div class="info-item">
                          <div class="info-label">IMC</div>
                          <div class="info-value">{{ calculateIMC() }}</div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Colonne droite -->
                <v-col cols="12" md="6">
                  <!-- Objectif -->
                  <v-card class="mb-4 custom-card">
                    <v-card-title class="custom-card-title">
                      <v-icon class="mr-2">mdi-target</v-icon>
                      Objectif
                    </v-card-title>
                    <v-card-text>
                      <v-chip 
                        v-if="user?.objectif" 
                        color="primary" 
                        variant="elevated"
                        size="large"
                        class="no-radius-chip"
                      >
                        {{ formatObjectif(user.objectif) }}
                      </v-chip>
                      <span v-else class="text-medium-emphasis">Non renseigné</span>
                    </v-card-text>
                  </v-card>

                  <!-- Statistiques selon le rôle -->
                  <v-card class="mb-4 custom-card">
                    <v-card-title class="custom-card-title">
                      <v-icon class="mr-2">mdi-chart-box</v-icon>
                      Statistiques
                    </v-card-title>
                    <v-card-text>
                      <div class="stats-container">
                        <!-- Stats pour coach -->
                        <div v-if="isCoach" class="stat-item">
                          <div class="stat-value">{{ user.seances_as_coach_count || 0 }}</div>
                          <div class="stat-label">Séance{{ (user.seances_as_coach_count || 0) > 1 ? 's' : '' }} donnée{{ (user.seances_as_coach_count || 0) > 1 ? 's' : '' }}</div>
                        </div>
                        
                        <!-- Stats pour challenger -->
                        <div v-if="isChallenger" class="stat-item">
                          <div class="stat-value">{{ user.seances_as_challenger_count || 0 }}</div>
                          <div class="stat-label">Séance{{ (user.seances_as_challenger_count || 0) > 1 ? 's' : '' }} réalisée{{ (user.seances_as_challenger_count || 0) > 1 ? 's' : '' }}</div>
                        </div>

                        <!-- Stats générales -->
                        <div class="stat-item">
                          <div class="stat-value">{{ formatDate(user?.last_login_at) || 'Jamais' }}</div>
                          <div class="stat-label">Dernière connexion</div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>

                  <!-- Permissions (si applicable) -->
                  <v-card v-if="user?.permissions && user.permissions.length > 0" class="custom-card">
                    <v-card-title class="custom-card-title">
                      <v-icon class="mr-2">mdi-key</v-icon>
                      Permissions spéciales
                    </v-card-title>
                    <v-card-text>
                      <v-chip 
                        v-for="permission in user.permissions" 
                        :key="permission.id"
                        class="mr-2 mb-1 no-radius-chip"
                        color="info"
                        variant="outlined"
                        size="small"
                      >
                        {{ permission.name }}
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- État vide -->
    <div v-if="!user && !loading" class="empty-state">
      <v-icon size="80" color="grey-lighten-1">mdi-account-remove</v-icon>
      <h3 class="empty-title">Utilisateur introuvable</h3>
      <p class="empty-subtitle">Cet utilisateur n'existe pas ou a été supprimé.</p>
      <v-btn color="primary" @click="goBack" class="mt-4 no-radius-btn">
        <v-icon start>mdi-arrow-left</v-icon>
        Retour
      </v-btn>
    </div>

    <!-- Modal pour afficher l'avatar en grand -->
    <v-dialog v-model="showAvatarModal" max-width="500">
      <v-card class="custom-card">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Photo de profil</span>
          <v-btn icon variant="text" @click="showAvatarModal = false" class="no-radius-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-center pa-6">
          <v-avatar size="300" class="mb-4">
            <v-img 
              v-if="user?.avatar" 
              :src="`http://localhost:8000/storage/avatars/${user.avatar}`"
              cover
            ></v-img>
            <v-icon v-else size="150">mdi-account</v-icon>
          </v-avatar>
          <div class="text-h6">{{ user?.name }}</div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card class="custom-card">
        <v-card-title class="text-h6 pa-4">
          <v-icon class="mr-2" color="error">mdi-delete</v-icon>
          Confirmer la suppression
        </v-card-title>
        <v-card-text class="pa-4">
          <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ user?.name }}</strong> ?</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Cette action est irréversible.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false" class="no-radius-btn">Annuler</v-btn>
          <v-btn color="error" variant="flat" @click="deleteUser" class="no-radius-btn">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../../store/AdminStore/UserStore'
import { useAuthStore } from '../../../store/AuthStore'

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const authStore = useAuthStore()

    // Reactive data
    const user = ref(null)
    const weightHistory = ref([])
    const showAvatarModal = ref(false)
    const deleteDialog = ref(false)
    const loading = ref(true)

    // Computed
    const currentWeight = computed(() => {
      if (weightHistory.value.length > 0) {
        return weightHistory.value[weightHistory.value.length - 1].valeur
      }
      return null
    })

    const isCoach = computed(() => {
      return user.value?.roles?.some(role => role.name === 'coach') || false
    })

    const isChallenger = computed(() => {
      return user.value?.roles?.some(role => role.name === 'challenger') || false
    })

    const isMyProfile = computed(() => {
      return route.params.id === 'me' || (authStore.userAuth && user.value && authStore.userAuth.id === user.value.id)
    })

    const isCurrentUserAdmin = computed(() => {
      return authStore.userAuth?.roles?.some(role => role.name === 'administrateur') || false
    })

    const canDeleteUser = computed(() => {
      return isCurrentUserAdmin.value && !isMyProfile.value && !user.value?.roles?.some(role => role.name === 'administrateur')
    })

    const breadcrumbItems = computed(() => [
      {
        title: 'Accueil',
        href: '/admin/dashboard',
        icon: 'mdi-home'
      },
      {
        title: 'Utilisateurs',
        href: '/admin/user',
        icon: 'mdi-account-group'
      },
      {
        title: user.value ? user.value.name : 'Profil',
        disabled: true,
        icon: 'mdi-account'
      }
    ])

    // Methods
    const loadUser = async () => {
      loading.value = true
      try {
        const id = route.params.id
        if (id === 'me') {
          // Charger mon profil
          user.value = await authStore.getProfile()
          await loadWeightHistory()
        } else {
          // Charger le profil d'un autre utilisateur
          const response = await fetch(`http://localhost:8000/api/user/${id}`, {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            user.value = data.user
          } else {
            throw new Error('Utilisateur non trouvé')
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
        user.value = null
      } finally {
        loading.value = false
      }
    }

    const loadWeightHistory = async () => {
      try {
        if (isMyProfile.value) {
          const history = await authStore.getWeightHistory()
          weightHistory.value = history || []
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error)
      }
    }

    const goBack = () => {
      router.go(-1)
    }

    const goToEdit = () => {
      // Déterminer la route d'édition selon le rôle
      const userRole = user.value?.roles?.[0]?.name
      switch (userRole) {
        case 'administrateur':
          router.push('/admin/profile/edit')
          break
        case 'coach':
          router.push('/coach/profile/edit')
          break
        case 'challenger':
          router.push('/challenger/profile/edit')
          break
        default:
          router.push('/profile/edit')
      }
    }

    const editUser = () => {
      router.push(`/admin/user/${user.value?.id}/edit`)
    }

    const getRoleIcon = (roleName) => {
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

    const getRoleColor = (roleName) => {
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

    const formatRoleName = (roleName) => {
      switch (roleName) {
        case 'administrateur':
          return 'Administrateur'
        case 'coach':
          return 'Coach'
        case 'challenger':
          return 'Challenger'
        default:
          return roleName.charAt(0).toUpperCase() + roleName.slice(1)
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Non renseigné'
      return new Date(dateString).toLocaleDateString('fr-FR')
    }

    const formatSexe = (sexe) => {
      if (!sexe) return 'Non renseigné'
      return sexe.charAt(0).toUpperCase() + sexe.slice(1)
    }

    const formatObjectif = (objectif) => {
      if (!objectif) return 'Non renseigné'
      return objectif.charAt(0).toUpperCase() + objectif.slice(1)
    }

    const calculateIMC = () => {
      if (!user.value?.taille || !currentWeight.value) {
        return 'Non calculable'
      }
      const imc = currentWeight.value / (user.value.taille * user.value.taille)
      return `${imc.toFixed(1)} kg/m²`
    }

    const confirmDelete = () => {
      deleteDialog.value = true
    }

    const deleteUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/admin/user/${user.value.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          deleteDialog.value = false
          router.push('/admin/user')
        } else {
          throw new Error('Erreur lors de la suppression')
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      }
    }

    // Lifecycle
    onMounted(() => {
      loadUser()
    })

    return { 
      user, 
      currentWeight, 
      isCoach, 
      isChallenger, 
      isMyProfile, 
      isCurrentUserAdmin, 
      canDeleteUser, 
      breadcrumbItems, 
      showAvatarModal, 
      deleteDialog, 
      loading,
      goBack, 
      goToEdit,
      editUser, 
      getRoleIcon, 
      getRoleColor, 
      formatRoleName, 
      formatDate, 
      formatSexe, 
      formatObjectif, 
      calculateIMC, 
      confirmDelete, 
      deleteUser 
    }
  }
})
</script>

<style scoped>
.profile-view {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px;
}

.breadcrumb-item {
  font-size: 0.875rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-text {
  font-size: 1rem;
  color: #606060;
}

.cover-section {
  position: relative;
  height: 300px;
  margin-bottom: 32px;
  border-radius: 12px;
  overflow: hidden;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.avatar-container {
  position: absolute;
  bottom: -25%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

.avatar-floating {
  border-radius: 50%;
}

.profile-content {
  padding-top: 125px;
}

.profile-header {
  text-align: center;
  margin-bottom: 32px;
}

.roles-section {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.custom-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  display: flex;
  align-items: center;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
  flex-shrink: 0;
  margin-right: 16px;
}

.info-value {
  font-weight: 400;
  color: rgb(var(--v-theme-on-surface));
  text-align: right;
  word-break: break-word;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
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
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 16px 0 8px 0;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-view {
    padding: 8px;
  }
  
  .profile-header h1 {
    font-size: 1.75rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .v-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-value {
    text-align: left;
  }
}
</style>
