import { defineStore } from 'pinia';
import Role from '@/types/Role'
import Permission from '@/types/Permission'
import http from '@/axios'

export const useRolePermissionStore = defineStore('rolpermissionAdmin', {
  state: () => ({
    roles: [] as Role[],
    permissions: [] as Permission[],
  }),
  getters: {
    allRoles() : String[]{
      return this.roles.map(function(item) {
        return item.name;
      });
    }
  },
  actions: {
    async getRoles() {
      const response = await http.get('/admin/role');
      this.roles = response.data.roles;
    },
    async getPermission() {
      const response = await http.get('/admin/permission');
      this.permissions = response.data.permissions;
    },
  }
});
