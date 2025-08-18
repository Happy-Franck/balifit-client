<template>
  <BlogDetail />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const BlogDetail = defineAsyncComponent(() => import('../../../components/blog/BlogDetail.vue'))
</script> 