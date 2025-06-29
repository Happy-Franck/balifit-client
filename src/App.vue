<template>
  <router-view/>
</template>

<style>
/* Styles globaux pour les cartes personnalisées */
.custom-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: rgb(var(--v-theme-surface));
}

.custom-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  padding: 20px 20px 8px 20px;
}
</style>
