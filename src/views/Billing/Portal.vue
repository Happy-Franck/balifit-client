<template>
  <div class="pa-8 text-center">
    <h1 class="text-h5 mb-2">Redirection vers le portail de facturation…</h1>
    <p>Veuillez patienter.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import http from '../../axios'
import { APP_CONFIG } from '../../config/constants'

export default defineComponent({
  name: 'BillingPortal',
  setup() {
    onMounted(async () => {
      try {
        const { data } = await http.post('/billing/portal-session', {
          return_url: `${APP_CONFIG.BASE_URL}`,
        })
        if (data && data.url) {
          window.location.href = data.url
        }
      } catch (e) {
        console.error('Failed to create portal session', e)
      }
    })
    return {}
  }
})
</script> 