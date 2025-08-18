<template>
  <ProductList source="public" />
</template>

<script setup lang="ts">
import ProductList from '../../../components/product/ProductList.vue'
</script>

<style scoped>
.sticky-sidebar {
  position: sticky;
  top: 88px;
}
.product-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.product-card:hover {
  transform: translateY(-2px);
}
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 