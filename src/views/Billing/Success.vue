<template>
  <div class="pa-8 text-center">
    <h1 class="text-h4 mb-4">Paiement réussi</h1>
    <p class="mb-6">Votre abonnement a été activé avec succès.</p>
    <router-link :to="dashboardRoute" class="text-primary">Aller au tableau de bord</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useAuthStore } from '../../store/AuthStore'

export default defineComponent({
  name: 'BillingSuccess',
  setup() {
    const auth = useAuthStore()
    const dashboardRoute = computed(() => auth.getDashboardRoute())
    return { dashboardRoute }
  }
})
</script> 