<template>
  <v-app>
    <v-navigation-drawer v-model="drawer">
      <v-card class="mx-auto" width="256">
        <v-layout>
          <v-navigation-drawer permanent absolute>
            <v-list>
              <v-list-item :prepend-avatar="`http://localhost:8000/storage/avatars/${AuthStore.userAuth?.avatar}`" :title="AuthStore.userAuth?.email" :subtitle="AuthStore.userAuth?.email">
                <template v-slot:append>
                  <v-btn size="small" variant="text" icon="mdi-menu-down" ></v-btn>
                </template>
              </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <v-list :lines="false" density="compact" nav>
              <router-link to="/admin/category">
                <v-list-item prepend-icon="mdi-view-dashboard" title="Categories" value="category"></v-list-item>
              </router-link>
              <router-link to="/admin/user">
                <v-list-item prepend-icon="mdi-account-box" title="Utilisateurs" value="user"></v-list-item>
              </router-link>
              <router-link to="/admin/product">
                <v-list-item prepend-icon="mdi-gavel" title="Produits" value="product"></v-list-item>
              </router-link>
            </v-list>
          </v-navigation-drawer>
          <v-main style="height: 354px;"></v-main>
        </v-layout>
      </v-card>
    </v-navigation-drawer>
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="deconnexion">
        <v-icon>mdi-export</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main class="bg-grey-lighten-3" style="min-height: 300px;">
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '@/store/AuthStore'
  const AuthStore = useAuthStore()
  const drawer = ref(null)
  AuthStore.getUserAuth()
</script>

<script>
import http from '@/axios'
import { useCategoryStore } from '@/store/AdminStore/CategoryStore'
import { useProductStore } from '@/store/AdminStore/ProductStore'
import { useRolePermissionStore } from '@/store/AdminStore/RolePermissionStore'
import { useSeanceStore } from '@/store/AdminStore/SeanceStore'
import { useUserStore } from '@/store/AdminStore/UserStore'

  export default {
    data: () => ({ drawer: null}),
    methods: {
      deconnexion(){
        const CategoryStore = useCategoryStore()
        const ProductStore = useProductStore()
        const RolePermissionStore = useRolePermissionStore()
        const SeanceStore = useSeanceStore()
        const UserStore = useUserStore()
        CategoryStore.$reset()
        ProductStore.$reset()
        RolePermissionStore.$reset()
        SeanceStore.$reset()
        UserStore.$reset()
        http.post("/logout").then((response) => {
          this.$router.push('/login');
          localStorage.clear();
        }).catch((err) => {
          console.log(err)
          this.alert = true
        })
      },
    },
  }
</script>
