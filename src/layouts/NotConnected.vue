<template>
  <v-app>
    <v-app-bar color="grey-darken-4" :elevation="0">
      <v-toolbar-title>Application</v-toolbar-title>
      <template v-slot:append>
        <router-link to="/login">
          <v-btn color="white" variant="text">Login</v-btn>
        </router-link>
        <router-link to="/register">
          <v-btn color="white" variant="text">Register</v-btn>
        </router-link>
      </template>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
