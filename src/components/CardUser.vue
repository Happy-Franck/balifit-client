<template>
  <div class="card-user">
    <v-card>
      <v-avatar :image="`http://localhost:8000/storage/avatars/${user.avatar}`" color="surface-variant" size="50"></v-avatar>
      {{user.name}}
      <v-card-actions>
        <router-link :to="{name: 'userItem', params: {id: user.id}}">
          Voir
        </router-link>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script lang="ts">
import User from '../types/User';
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    user: {
      type: Object as ()=> User,
      required: true
    }
  }
})
</script>

<style>

</style>
