<template>
  <div class="category-image">
    <p @click="adminStore.removeCurrentCategory()">X</p>
    <p>{{category.name}}</p>
    <img :src="`http://127.0.0.1:8000/storage/categories/${category.image}`">
    <div v-for="training in category.trainings" :key="training.id">
      <li>
        <p>Name :{{training.name}}</p>
        <p>Description :{{training.description}}</p>
        <p>image :{{training.image}}</p>
        <p>video :{{training.video}}</p>
      </li>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent , ref } from 'vue'
import http from '@/axios'
import Category from '@/types/Category';
import { useCategoryStore } from '@/store/AdminStore/CategoryStore'

export default defineComponent({
  setup() {
    const api = ref<String | any>('')
    api.value =  http.defaults.baseURL
    const adminStore = useCategoryStore()
    return{ adminStore, api }
  },
  props: {
    category: {
      type: Object as ()=> Category,
      default: () => ({
        id: 0,
        name: 'body',
        image: 'tsy misy sary',
        user_id: 0,
        created_at: 'today',
        updated_at: 'today',
      })
    }
  }
})
</script>
