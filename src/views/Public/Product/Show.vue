<template>
  <ProductShow source="public" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const ProductShow = defineAsyncComponent(() => import('../../../components/product/ProductShow.vue'))
</script> 