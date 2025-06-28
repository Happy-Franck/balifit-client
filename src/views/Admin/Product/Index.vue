<template>
  <div class="product"><v-card
      class="mx-auto mt-6"
      width="344"
    >
    <v-progress-linear
        :active="productStore.loading"
        :indeterminate="productStore.loading"
        bottom
        color="deep-purple-accent-4"
      ></v-progress-linear>
    </v-card>
    <v-alert
      border="start"
      variant="tonal"
      close-label="Close Alert"
      color="deep-purple-accent-4" v-if="productStore.alert" closable :text="productStore.message"></v-alert>
    <h1>Product</h1>
    <router-link to="/admin/product/create">Creer un produit</router-link>
    <v-row class="product-list">
      <v-col cols="12" sm="4" md="3" v-for="product in productStore.products" :key="product.id">
        <CardProduct :product="product"/>
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts">
import { defineComponent , watch } from 'vue'
import { useProductStore } from '../../../store/AdminStore/ProductStore'
import CardProduct from '../../../components/CardProduct.vue'

export default defineComponent({
    components: { CardProduct },
    setup() {
      const productStore = useProductStore()
      watch(
        [() => productStore.message, () => productStore.alert],
        ([newMessage, newAlert]) => {
          if (newMessage !== '' && newAlert) {
            productStore.getProducts()
            setTimeout(() => {
              productStore.message = '';
              productStore.alert = false;
            }, 5000);
          }
        }
      );
      productStore.getProducts()
      return{ productStore }
    },
})
</script>
