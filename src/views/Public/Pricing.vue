<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 400px;">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </div>
    
    <!-- Error State -->
    <v-alert v-if="error" type="error" class="ma-4">{{ error }}</v-alert>

    <!-- Pricing Section -->
    <section v-if="!loading" class="pricing2-hero">
      <div class="container">
        <h1 class="pricing2-title">Tarification simple et transparente</h1>
        <div class="pricing2-switch">
          <button 
            id="p2-monthly" 
            :class="{ active: planTab === 'monthly' }"
            @click="planTab = 'monthly'"
          >
            Facturation mensuelle
          </button>
          <button 
            id="p2-yearly" 
            :class="{ active: planTab === 'yearly' }"
            @click="planTab = 'yearly'"
          >
            Facturation annuelle
          </button>
        </div>
        <div class="pricing2-table mt-5">
          <table class="table mb-0">
            <thead>
              <tr>
                <th style="width: 30%;"></th>
                <th style="width: 23.33%;">
                  <div class="pricing2-plan">
                    <div class="plan-title">Plan Gratuit</div>
                    <div class="plan-price">0€/mois</div>
                    <div class="plan-desc"> <br>Parfait pour commencer.<br></div>
                    <button class="btn-custom secondary w-100" @click="goRegister('')">Commencer</button>
                  </div>
                </th>
                <th class="popular" style="width: 23.33%;" v-if="displayedPlans[0]">
                  <div class="pricing2-plan">
                    <div class="plan-title">{{ displayedPlans[0].product.name }}</div>
                    <div class="plan-price">{{ formatPrice(displayedPlans[0]) }}</div>
                    <div class="plan-desc">{{ displayedPlans[0].product.description }}</div>
                    <button class="btn-custom primary w-100" @click="goRegister(displayedPlans[0].price_id)">Commencer</button>
                  </div>
                </th>
                <th style="width: 23.33%;" v-if="displayedPlans[1]">
                  <div class="pricing2-plan">
                    <div class="plan-title">{{ displayedPlans[1].product.name }}</div>
                    <div class="plan-price">{{ formatPrice(displayedPlans[1]) }}</div>
                    <div class="plan-desc">{{ displayedPlans[1].product.description }}</div>
                    <button class="btn-custom secondary w-100" @click="goRegister(displayedPlans[1].price_id)">Commencer</button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><div class="pricing2-cell-content">Séances d'entraînement</div></td>
                <td class="plan-col plan-basic"><div class="pricing2-cell-content">5 par mois</div></td>
                <td class="plan-col plan-business" v-if="displayedPlans[0]" style="box-shadow: inset 2px 0 0 0 rgb(var(--v-theme-primary)), inset -2px 0 0 0 rgb(var(--v-theme-primary));"><div class="pricing2-cell-content">Illimitées</div></td>
                <td class="plan-col plan-enterprise" v-if="displayedPlans[1]"><div class="pricing2-cell-content">Illimitées</div></td>
              </tr>
              <tr>
                <td><div class="pricing2-cell-content">Suivi personnalisé</div></td>
                <td class="plan-col plan-basic"><div class="pricing2-cell-content">—</div></td>
                <td class="plan-col plan-business" v-if="displayedPlans[0]" style="box-shadow: inset 2px 0 0 0 rgb(var(--v-theme-primary)), inset -2px 0 0 0 rgb(var(--v-theme-primary));"><div class="pricing2-cell-content">✓</div></td>
                <td class="plan-col plan-enterprise" v-if="displayedPlans[1]"><div class="pricing2-cell-content">✓</div></td>
              </tr>
              <tr>
                <td><div class="pricing2-cell-content">Coach personnel</div></td>
                <td class="plan-col plan-basic"><div class="pricing2-cell-content">—</div></td>
                <td class="plan-col plan-business" v-if="displayedPlans[0]" style="box-shadow: inset 2px 0 0 0 rgb(var(--v-theme-primary)), inset -2px 0 0 0 rgb(var(--v-theme-primary));"><div class="pricing2-cell-content">✓</div></td>
                <td class="plan-col plan-enterprise" v-if="displayedPlans[1]"><div class="pricing2-cell-content">✓</div></td>
              </tr>
              <tr>
                <td><div class="pricing2-cell-content">Support email</div></td>
                <td class="plan-col plan-basic"><div class="pricing2-cell-content">✓</div></td>
                <td class="plan-col plan-business" v-if="displayedPlans[0]" style="box-shadow: inset 2px 0 0 0 rgb(var(--v-theme-primary)), inset -2px 0 0 0 rgb(var(--v-theme-primary));"><div class="pricing2-cell-content">✓</div></td>
                <td class="plan-col plan-enterprise" v-if="displayedPlans[1]"><div class="pricing2-cell-content">✓</div></td>
              </tr>
              <tr>
                <td><div class="pricing2-cell-content">Support prioritaire</div></td>
                <td class="plan-col plan-basic"><div class="pricing2-cell-content">—</div></td>
                <td class="plan-col plan-business" v-if="displayedPlans[0]" style="box-shadow: inset 2px 0 0 0 rgb(var(--v-theme-primary)), inset -2px 0 0 0 rgb(var(--v-theme-primary));"><div class="pricing2-cell-content">✓</div></td>
                <td class="plan-col plan-enterprise" v-if="displayedPlans[1]"><div class="pricing2-cell-content">✓</div></td>
              </tr>
              <tr>
                <td><div class="pricing2-cell-content">Analyses avancées</div></td>
                <td class="plan-col plan-basic"><div class="pricing2-cell-content">—</div></td>
                <td class="plan-col plan-business" v-if="displayedPlans[0]" style="box-shadow: inset 2px 0 0 0 rgb(var(--v-theme-primary)), inset -2px 0 0 0 rgb(var(--v-theme-primary));"><div class="pricing2-cell-content">✓</div></td>
                <td class="plan-col plan-enterprise" v-if="displayedPlans[1]"><div class="pricing2-cell-content">✓</div></td>
              </tr>
              <tr>
                <td><div class="pricing2-cell-content">Programmes personnalisés</div></td>
                <td class="plan-col plan-basic"><div class="pricing2-cell-content">—</div></td>
                <td class="plan-col plan-business" v-if="displayedPlans[0]" style="box-shadow: inset 2px 0 0 0 rgb(var(--v-theme-primary)), inset -2px 0 0 0 rgb(var(--v-theme-primary));"><div class="pricing2-cell-content">—</div></td>
                <td class="plan-col plan-enterprise" v-if="displayedPlans[1]"><div class="pricing2-cell-content">✓</div></td>
              </tr>
              <tr>
                <td><div class="pricing2-cell-content">Suivi nutritionnel</div></td>
                <td class="plan-col plan-basic"><div class="pricing2-cell-content">—</div></td>
                <td class="plan-col plan-business" v-if="displayedPlans[0]" style="box-shadow: inset 2px 0 0 0 rgb(var(--v-theme-primary)), inset -2px 0 0 0 rgb(var(--v-theme-primary)), inset 0 -2px 0 0 rgb(var(--v-theme-primary))"><div class="pricing2-cell-content">—</div></td>
                <td class="plan-col plan-enterprise" v-if="displayedPlans[1]"><div class="pricing2-cell-content">✓</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
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

    const formatPrice = (plan: any) => {
      const amount = (plan.unit_amount / 100).toFixed(2)
      const interval = plan.interval === 'month' ? 'mois' : 'an'
      return `${amount}€/${interval}`
    }

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
      if (priceId) {
        router.push({ path: '/register', query: { priceId } })
      } else {
        router.push({ path: '/register' })
      }
    }

    onMounted(loadPlans)

    return { loading, error, plans, planTab, displayedPlans, formatPrice, goRegister }
  }
})
</script>

<style scoped>
/* Pricing2 Styles */
.pricing2-hero {
    padding: 20px 0 40px 0;
    text-align: center;
}

.pricing2-title {
    font-size: 2.7rem;
    font-weight: bold;
    color: rgb(var(--v-theme-on-surface));
    margin-bottom: 0.5rem;
}

.pricing2-switch {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin: 2rem 0 1.5rem 0;
}

.pricing2-switch button {
    border-radius: 20px;
    border: 1.5px solid rgb(var(--v-theme-primary));
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-primary));
    font-weight: 600;
    padding: 6px 22px;
    transition: background 0.2s, color 0.2s;
    cursor: pointer;
}

.pricing2-switch button.active, .pricing2-switch button:focus {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
}


.pricing2-table thead {
    border-bottom: none;
    background: transparent !important;
}

.pricing2-table thead tr {
    border: none !important;
}

.pricing2-table thead th {
    border: none !important;
}

.pricing2-table tbody {
    border-top: none;
    background: rgb(var(--v-theme-surface)) !important;
}

.pricing2-table tbody tr {
    border: none !important;
}

.pricing2-table tbody td {
    border: none !important;
}

.pricing2-table tbody tr:nth-child(even) {
    background-color: rgba(var(--v-theme-primary), 0.05);
}

.pricing2-table th, .pricing2-table td {
    text-align: center;
    padding: 18px 12px;
    font-size: 1rem;
}

.pricing2-table th {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 700;
    font-size: 1.1rem;
    vertical-align: top;
    padding: 0;
}

.pricing2-table th.popular {
    padding: 0;
    border: none;
}

.pricing2-table th.popular .pricing2-plan {
    background: rgb(var(--v-theme-surface));
    border-radius: 40px 40px 0 0;
    border: 2px solid rgb(var(--v-theme-primary));
    border-bottom: none;
    overflow: hidden;
}

.pricing2-table th:first-child {
    background: transparent;
    text-align: left;
    padding: 18px 12px;
}

.pricing2-table tr:last-child td {
    border-bottom: none;
}

.pricing2-plan {
    padding: 24px 16px 20px 16px;
    margin: 0;
    transition: box-shadow 0.2s, border-color 0.2s;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.pricing2-plan .plan-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface));
    margin-bottom: 8px;
}

.pricing2-plan .plan-price {
    font-size: 1.8rem;
    font-weight: bold;
    color: rgb(var(--v-theme-primary));
    margin-bottom: 8px;
}

.pricing2-plan .plan-desc {
    color: rgb(var(--v-theme-on-surface-variant));
    font-size: 0.9rem;
    margin-bottom: 16px;
    flex-grow: 1;
}

.btn-custom {
    margin-top: 8px;
    font-size: 0.9rem;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}

.btn-custom.primary {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
}

.btn-custom.primary:hover {
    background: rgb(var(--v-theme-primary-darken-1));
}

.btn-custom.secondary {
    background: transparent;
    color: rgb(var(--v-theme-primary));
    border: 1px solid rgb(var(--v-theme-primary));
}

.btn-custom.secondary:hover {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
}

.w-100 {
    width: 100%;
}

.pricing2-cell-content {
    height: 100%;
    width: 100%;
    padding: 0 !important;
    margin: 0 !important;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

@media (max-width: 992px) {
    .pricing2-table th, .pricing2-table td {
        padding: 10px 6px;
        font-size: 0.95rem;
    }
    .pricing2-plan {
        padding: 16px 12px 14px 12px;
    }
    .pricing2-plan .plan-title {
        font-size: 1.1rem;
    }
    .pricing2-plan .plan-price {
        font-size: 1.6rem;
    }
    .pricing2-plan .plan-desc {
        font-size: 0.85rem;
        padding-top: 16px;
    }
    .btn-custom {
        font-size: 0.85rem;
        padding: 6px 12px;
    }
    .pricing2-title {
        font-size: 2.2rem;
    }
}

@media (max-width: 768px) {
    .pricing2-hero {
        padding: 80px 0 40px 0;
    }
    .pricing2-title {
        font-size: 1.8rem;
    }
    .pricing2-switch {
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    .pricing2-switch button {
        width: 200px;
    }
}
table {
    border-collapse: separate;
    text-indent: initial;
    border-spacing: 0px !important;
}
</style> 