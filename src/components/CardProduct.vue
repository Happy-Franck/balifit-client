<template>
  <div class="card-Product">
    <v-card class="mx-auto" max-width="400">
      <v-img class="align-end text-white" height="375" :src="`http://localhost:8000/storage/produits/${product.image}`" cover></v-img>
      <v-card-title>{{product.name}}</v-card-title>
      <v-card-subtitle class="pt-4">Ariary {{product.price}}</v-card-subtitle>
      <v-card-text>
        <div>{{product.description}}</div>
      </v-card-text>
      <v-card-actions>
        <router-link :to="{name: 'productItem', params: {id: product.id}}">
          <v-btn color="orange">Voir</v-btn>
        </router-link>
        <v-btn color="orange" @click="removeProduct(product.id)">Supprimer</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>


<script lang="ts">
import { useProductStore } from '@/store/AdminStore/ProductStore'
import Product from '@/types/Product';
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    product: {
      type: Object as ()=> Product,
      required: true
    }
  },
  setup(){
    const productStore = useProductStore()
    const removeProduct = (id : number) => {
      productStore.deleteProduct(id)
    }
    return { removeProduct }
  }
})
</script>
