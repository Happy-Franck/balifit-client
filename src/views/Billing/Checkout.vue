<template>
  <div class="pa-8 text-center">
    <h1 class="text-h5 mb-2">Préparation du paiement…</h1>
    <p>Redirection vers Stripe Checkout.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '../../axios'
import { APP_CONFIG } from '../../config/constants'

export default defineComponent({
  name: 'BillingCheckout',
  setup() {
    const route = useRoute()
    const router = useRouter()

    onMounted(async () => {
      const priceId = route.params.priceId as string
      if (!priceId) {
        return router.replace('/register')
      }
      try {
        const { data } = await http.post('/billing/checkout-session', {
          price_id: priceId,
          success_url: `${APP_CONFIG.BASE_URL}/billing/success`,
          cancel_url: `${APP_CONFIG.BASE_URL}/register`,
        })
        if (data && data.url) {
          window.location.href = data.url
        }
      } catch (e) {
        console.error('Failed to create checkout session', e)
        router.replace('/register')
      }
    })

    return {}
  }
})
</script> 