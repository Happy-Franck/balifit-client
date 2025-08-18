<template>
  <v-container class="py-10">
    <h1 class="text-h4 mb-6">Tarifs</h1>
    <v-progress-circular v-if="loading" indeterminate color="primary" class="mb-6" />
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <div v-if="!loading" class="mb-4 d-flex align-center" style="gap: 8px;">
      <v-btn-toggle v-model="planTab" mandatory>
        <v-btn value="monthly">Mensuel</v-btn>
        <v-btn value="yearly">Annuel</v-btn>
      </v-btn-toggle>
    </div>

    <v-row v-if="!loading">
      <v-col cols="12" md="4">
        <v-card class="pa-4" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-subtitle-1 font-weight-medium">Gratuit</div>
              <div class="text-body-2 text-medium-emphasis">Créer un compte sans abonnement</div>
            </div>
            <div class="text-h6">0 €</div>
          </div>
          <v-btn class="mt-4" color="primary" :to="{ path: '/register' }">Commencer</v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" v-for="plan in displayedPlans" :key="plan.price_id">
        <v-card class="pa-4" elevation="2">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-subtitle-1 font-weight-medium">{{ plan.product.name }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ plan.product.description }}</div>
            </div>
            <div class="text-h6">
              {{ (plan.unit_amount/100).toFixed(2) }} {{ plan.currency }} / {{ plan.interval }}
            </div>
          </div>
          <v-btn class="mt-4" color="primary" @click="goRegister(plan.price_id)">Choisir</v-btn>
        </v-card>
      </v-col>

      <v-col v-if="!displayedPlans.length" cols="12">
        <v-alert type="info" variant="tonal">Aucun plan {{ planTab === 'monthly' ? 'mensuel' : 'annuel' }} disponible pour le moment.</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import http from '../../axios'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const error = ref('')
    const plans = ref<any[]>([])

    const planTab = ref<'monthly' | 'yearly'>('monthly')
    const monthlyPlans = computed(() => plans.value.filter(p => p.interval === 'month').sort((a,b)=>a.unit_amount-b.unit_amount))
    const yearlyPlans = computed(() => plans.value.filter(p => p.interval === 'year').sort((a,b)=>a.unit_amount-b.unit_amount))
    const displayedPlans = computed(() => planTab.value === 'monthly' ? monthlyPlans.value : yearlyPlans.value)

    const loadPlans = async () => {
      loading.value = true
      error.value = ''
      try {
        const { data } = await http.get('/billing/plans')
        plans.value = data.plans || []
      } catch (e) {
        error.value = 'Impossible de charger les plans.'
      } finally {
        loading.value = false
      }
    }

    const goRegister = (priceId: string) => {
      router.push({ path: '/register', query: { priceId } })
    }

    onMounted(loadPlans)

    return { loading, error, plans, planTab, displayedPlans, goRegister }
  }
})
</script> 