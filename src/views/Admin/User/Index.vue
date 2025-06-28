<template>
  <div class="user">
    <h1>Users</h1>
    <v-card
      class="mx-auto mt-6"
      width="344"
    >
    <v-progress-linear
        :active="userStore.loading"
        :indeterminate="userStore.loading"
        bottom
        color="deep-purple-accent-4"
      ></v-progress-linear>
    </v-card>
    <v-card>
    <v-tabs
      v-model="tab"
      bg-color="primary"
    >
      <div v-for="elem in rolePermissionStore.allRoles" :key="elem">
        <v-tab :value="elem">{{elem}}</v-tab>
      </div>
    </v-tabs>
    <v-card-text>
      <v-window v-model="tab">
        <div v-for="elem in rolePermissionStore.roles" :key="elem.id">
          <v-window-item :value="elem.name">
            <v-container>
              <v-row>
                <v-col sm="6" md ="4" lg="3" v-for="user in userStore.usersWithRole(elem.name)" :key="user.id">
                  <CardUser :user="user" />
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>
        </div>
      </v-window>
    </v-card-text>
  </v-card>
  </div>
</template>
<script lang="ts">
import { useUserStore } from '../../../store/AdminStore/UserStore'
import { defineComponent , ref , watch } from 'vue'
import CardUser from '../../../components/CardUser.vue'
import { useRolePermissionStore } from '../../../store/AdminStore/RolePermissionStore'

export default defineComponent({
    components: { CardUser },
    setup() {
      const rolePermissionStore = useRolePermissionStore()
      const tab = ref<String | null>(null)
      watch(
      () => rolePermissionStore.roles,
      (newRoles) => {
        if (newRoles.length > 0 && !tab.value) {
          tab.value = newRoles[0].name;
        }
      }
    );
      const userStore = useUserStore()
      rolePermissionStore.getRoles()
      userStore.getUsers()
      return{ userStore , rolePermissionStore , tab }
    },
})
</script>
