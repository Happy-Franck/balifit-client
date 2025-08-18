<template>
  <v-container class="py-10">
    <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="text-h3 mb-4">Bienvenue sur HPFit</h1>
        <p class="text-body-1 mb-6">Programmes, produits et coaching pour atteindre vos objectifs.</p>
        <div class="d-flex justify-center" style="gap: 12px;">
          <router-link to="/register"><v-btn color="primary">Créer un compte</v-btn></router-link>
          <router-link to="/produits"><v-btn variant="tonal">Voir les produits</v-btn></router-link>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template> 