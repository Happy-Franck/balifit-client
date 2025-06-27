import { defineStore } from 'pinia';
import Equipment from '@/types/Equipment';
import Training from '@/types/Training';
import http from '@/axios';

export const useEquipmentStore = defineStore('equipmentChallenger', {
  state: () => ({
    message: '',
    equipments: [] as Equipment[],
    currentEquipment: null as Equipment | null,
    equipmentTrainings: [] as Training[],
    loading: true,
    alert: false
  }),
  getters: {
  },
  actions: {
    async getEquipments() {
      const response = await http.get('/challenger/equipment');
      this.equipments = response.data.equipments;
      this.loading = false;
    },
    async showEquipment(id: number) {
      const response = await http.get('/challenger/equipment/' + id);
      this.currentEquipment = response.data.equipment;
      this.loading = false;
    },
    async getTrainingsByEquipment(id: number) {
      const response = await http.get('/challenger/equipment/' + id + '/trainings');
      this.currentEquipment = response.data.equipment;
      this.equipmentTrainings = response.data.trainings;
      this.loading = false;
    }
  }
}); 