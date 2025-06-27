<template>
  <v-container>
    <h1>Liste des équipements</h1>
    <v-card
      class="mx-auto mt-6"
      width="344"
    >
      <v-progress-linear
        :active="equipmentStore.loading"
        :indeterminate="equipmentStore.loading"
        bottom
        color="deep-purple-accent-4"
      ></v-progress-linear>
    </v-card>

    <v-row>
      <v-col
        v-for="equipment in equipmentStore.equipments"
        :key="equipment.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="mx-auto" max-width="400">
          <v-img
            v-if="equipment.image"
            :src="`http://localhost:8000/storage/equipments/${equipment.image}`"
            height="200px"
            cover
          ></v-img>
          <v-card-title>{{ equipment.name }}</v-card-title>
          <v-card-text>
            <p>{{ equipment.description }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              @click="viewEquipmentTrainings(equipment.id)"
            >
              Voir les exercices
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog pour afficher les exercices utilisant un équipement -->
    <v-dialog
      v-model="trainingDialog"
      max-width="800px"
      scrollable
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">
            Exercices utilisant : {{ equipmentStore.currentEquipment?.name }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-list v-if="equipmentStore.equipmentTrainings.length > 0">
            <v-list-item
              v-for="training in equipmentStore.equipmentTrainings"
              :key="training.id"
            >
              <v-list-item-content>
                <v-list-item-title>{{ training.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ training.description }}</v-list-item-subtitle>
                <div class="mt-2">
                  <v-chip
                    v-for="category in training.categories"
                    :key="category.id"
                    class="ma-1"
                    color="red"
                    text-color="white"
                    small
                  >
                    {{ category.name }}
                  </v-chip>
                </div>
              </v-list-item-content>
              <v-list-item-action>
                <router-link :to="{name: 'coachTrainingItem', params: {id: training.id}}">
                  <v-btn color="primary" small>Voir</v-btn>
                </router-link>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <div v-else class="text-center pa-4">
            <p>Aucun exercice n'utilise cet équipement pour le moment.</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="trainingDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useEquipmentStore } from '@/store/CoachStore/EquipmentStore'

export default defineComponent({
  setup() {
    const equipmentStore = useEquipmentStore()
    const trainingDialog = ref(false)

    equipmentStore.getEquipments()

    const viewEquipmentTrainings = async (equipmentId: number) => {
      equipmentStore.loading = true
      await equipmentStore.getTrainingsByEquipment(equipmentId)
      trainingDialog.value = true
    }

    return {
      equipmentStore,
      trainingDialog,
      viewEquipmentTrainings
    }
  }
})
</script> 