import { defineStore } from 'pinia';
import Equipment from '@/types/Equipment';
import Training from '@/types/Training';
import http from '@/axios';

export const useEquipmentStore = defineStore('equipmentCoach', {
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
      try {
        this.loading = true;
        const response = await http.get('/coach/equipment');
        this.equipments = response.data.equipments;
      } catch (error) {
        console.error('Erreur lors de la récupération des équipements:', error);
        this.message = 'Erreur lors de la récupération des équipements';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },
    async showEquipment(id: number) {
      try {
        this.loading = true;
        const response = await http.get('/coach/equipment/' + id);
        this.currentEquipment = response.data.equipment;
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'équipement:', error);
        this.message = 'Erreur lors de la récupération de l\'équipement';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    },
    async getTrainingsByEquipment(id: number) {
      try {
        this.loading = true;
        const response = await http.get('/coach/equipment/' + id + '/trainings');
        this.currentEquipment = response.data.equipment;
        this.equipmentTrainings = response.data.trainings;
      } catch (error) {
        console.error('Erreur lors de la récupération des trainings par équipement:', error);
        this.message = 'Erreur lors de la récupération des trainings par équipement';
        this.alert = true;
      } finally {
        this.loading = false;
      }
    }
  }
}); 