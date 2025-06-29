import { defineStore } from 'pinia';
import http from '@/axios';

interface Equipment {
  id: number;
  name: string;
  description: string;
  image?: string;
  category: string;
  created_at: string;
  updated_at: string;
  trainings?: Training[];
}

interface Training {
  id: number;
  name: string;
  description: string;
  categories?: Category[];
  equipments?: Equipment[];
}

interface Category {
  id: number;
  name: string;
}

export const useEquipmentStore = defineStore('equipmentAdmin', {
  state: () => ({
    equipments: [] as Equipment[],
    currentEquipment: null as Equipment | null,
    loading: false,
    alert: false,
    message: '',
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1
    }
  }),
  
  getters: {},
  
  actions: {
    async getEquipments(page: number = 1, search: string = '', sortBy: string = 'id', sortOrder: string = 'asc') {
      this.loading = true;
      try {
        const params: any = { page };
        if (search) params.search = search;
        if (sortBy) params.sort_by = sortBy;
        if (sortOrder) params.sort_order = sortOrder;

        const response = await http.get('/admin/equipment', { params });
        this.equipments = response.data.data || response.data.equipments || response.data;
        if (response.data.current_page) {
          this.pagination = {
            current_page: response.data.current_page,
            per_page: response.data.per_page,
            total: response.data.total,
            last_page: response.data.last_page
          };
        }
      } catch (error) {
        this.message = 'Erreur lors du chargement des équipements';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    async showEquipment(id: number) {
      this.loading = true;
      try {
        const response = await http.get(`/admin/equipment/${id}`);
        this.currentEquipment = response.data.equipment;
      } catch (error) {
        this.message = 'Erreur lors du chargement de l\'équipement';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    async storeEquipment(data: any, formData?: FormData) {
      this.loading = true;
      try {
        let response;
        if (formData) {
          response = await http.post('/admin/equipment', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            params: data,
          });
        } else {
          response = await http.post('/admin/equipment', data);
        }
        this.message = response.data.message;
        this.alert = true;
      } catch (error) {
        this.message = 'Erreur lors de la création de l\'équipement';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    async updateEquipment(id: number, data: any, formData?: FormData) {
      this.loading = true;
      try {
        let response;
        if (formData) {
          response = await http.post(`/admin/equipment/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'X-HTTP-Method-Override': 'PUT'
            },
            params: data,
          });
        } else {
          response = await http.put(`/admin/equipment/${id}`, data);
        }
        this.message = response.data.message;
        this.alert = true;
      } catch (error) {
        this.message = 'Erreur lors de la mise à jour de l\'équipement';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    async deleteEquipment(id: number) {
      this.loading = true;
      try {
        const response = await http.delete(`/admin/equipment/${id}`);
        this.message = response.data.message;
        this.alert = true;
      } catch (error) {
        this.message = 'Erreur lors de la suppression de l\'équipement';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },

    $reset() {
      this.equipments = [];
      this.currentEquipment = null;
      this.loading = false;
      this.alert = false;
      this.message = '';
      this.pagination = {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
      };
    }
  }
}); 