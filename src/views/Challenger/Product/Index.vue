<template>
  <div class="product">
    <v-card class="mx-auto mt-6" width="344">
      <v-progress-linear
        :active="productStore.loading"
        :indeterminate="productStore.loading"
        bottom
        color="deep-purple-accent-4"
      ></v-progress-linear>
    </v-card>
    <v-alert
      border="start"
      variant="tonal"
      close-label="Close Alert"
      color="deep-purple-accent-4"
      v-if="productStore.alert"
      closable
      :text="productStore.message"
    ></v-alert>
    <v-container>
      <h1>Product</h1>
      <v-row class="product-list">
        <v-col cols="12" sm="3" v-for="(product, index) in productStore.products" :key="index">
          <div v-if="product">
            <v-card :loading="loading" class="mx-auto my-12" max-width="374">
              <template v-slot:loader="{ isActive }">
                <v-progress-linear
                  :active="isActive"
                  color="deep-purple"
                  height="4"
                  indeterminate
                ></v-progress-linear>
              </template>
              <v-img cover height="375" :src="`http://localhost:8000/storage/produits/${product.image}`"></v-img>
              <v-card-item>
                <v-card-title>{{product.name}}</v-card-title>
                <v-card-subtitle>
                  <span class="me-1">{{product.poid}} g</span>
                  <v-icon color="error" icon="mdi-fire-circle" size="small"></v-icon>
                </v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <v-row align="center" class="mx-0">
                  <v-rating v-if="product.rating && product.advices.length" :model-value="product.rating" color="amber" density="compact" half-increments readonly size="small"></v-rating>
                  <div v-if="product.rating && product.advices.length" class="text-grey ms-4">{{product.rating}} ({{product.advices.length}}<v-icon color="error" icon="mdi-search-circle" size="small"></v-icon>)</div>
                </v-row>
                <div class="my-4 text-subtitle-1">MGA • {{product.price}}</div>
                <div>{{product.description}}</div>
              </v-card-text>
              <v-card-actions>
                <v-dialog scrollable v-model="dialogStates[product.id]" persistent transition="dialog-top-transition" width="1024">
                  <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props">Explorer</v-btn>
                  </template>
                  <v-card>
                    <v-card-title class="text-h5">{{ product.name }}</v-card-title>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-img :src="`http://localhost:8000/storage/produits/${product.image}`"></v-img>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <p>{{ product.description }}</p>
                        <p>{{ product.poid }}</p>
                        <p>{{ product.price }}</p>
                        <div v-if="product.rating">
                          <v-rating v-model="product.rating" color="yellow-accent-4"></v-rating>
                        </div>
                      </v-col>
                      <v-col cols="12" sm="12">
                        <ul style="display: flex; flex-wrap: wrap;">
                          <li v-for="(commentaire, index) in product.advices" :key="index">
                              <div v-if="commentaire.user_id == authStore.userAuth.id" style="order:-1;">
                                <v-btn v-if="edition == false" color="green" @click="ouvrir(commentaire.comment, commentaire.note)">Editer</v-btn>
                                <v-btn v-if="edition == true" color="blue" @click="fermer">Ne pas editer</v-btn>
                                <v-btn color="red" @click="supprimerCommentaire(product.id, commentaire.id)">Supprimer</v-btn>
                                <v-form v-if="edition" enctype="multipart/form-data" @submit.prevent="editerCommentaire(product.id, commentaire.id)">
                                  <v-rating v-model="note" color="yellow-accent-4"></v-rating>
                                  <v-text-field v-model="comment" name="comment" label="Commentaire" type="text" dense outlined></v-text-field>
                                  <v-btn color="green-darken-1" variant="text" type="submit">valider</v-btn>
                                </v-form>
                                <div v-if="!edition">
                                  <v-rating v-model="commentaire.note">
                                  </v-rating>
                                  <br>
                                  {{ commentaire }}
                                </div>
                              </div>
                              <div v-if="commentaire.user_id != authStore.userAuth.id">
                                  <v-rating v-model="commentaire.note">
                                  </v-rating>
                                  <br>
                                  {{ commentaire }}
                              </div>
                          </li>
                        </ul>
                        <div v-if="!hasUserCommented(product)">
                          <v-form enctype="multipart/form-data" @submit.prevent="validateDialog(product.id)">
                            <v-rating v-model="note" color="yellow-accent-4"></v-rating>
                            <v-text-field v-model="comment" name="comment" label="Commentaire" type="text" dense outlined></v-text-field>
                            <v-btn color="green-darken-1" variant="text" type="submit">valider</v-btn>
                          </v-form>
                        </div>
                      </v-col>
                    </v-row>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="closeDialog(product.id)">close</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-actions>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useProductStore } from '@/store/ChallengerStore/ProductStore';
import { useAuthStore } from '@/store/AuthStore';

export default defineComponent({
  setup() {
    const dialogStates = ref({});
    const comment = ref('');
    const edition = ref(false);
    const note = ref(0);
    const productStore = useProductStore();
    const authStore = useAuthStore();

    function closeDialog(productId) {
      dialogStates.value[productId] = false;
      edition.value = false
      comment.value = '';
      note.value = 0;
    }

    const validateDialog = (productId) => {
      const data = {
        comment: comment.value,
        note: note.value,
      };
      productStore.commenter(Number(productId), data);
      dialogStates.value[productId] = false;
      comment.value = '';
      note.value = 0;
    };

    const hasUserCommented = (product) => {
      // Logique pour vérifier si l'utilisateur a déjà commenté le produit
      return product.advices.some(comment => comment.user_id === authStore.userAuth.id);
    };

    const supprimerCommentaire = (productId : number, commentaireId : number) => {
      productStore.supprAdvice(productId, commentaireId)
    }

    const ouvrir = (commentaire, notation) => {
      edition.value = true
      if(edition.value){
        comment.value = commentaire
        note.value = notation
      }
    }

    const fermer = () => {
      edition.value = false
    }

    const editerCommentaire = (productId : number, commentaireId : number) => {
      edition.value = false
      const data = {
        comment: comment.value,
        note: note.value,
      };
      productStore.editAdvice(productId, commentaireId, data)
    }

    watch(
      [() => productStore.message, () => productStore.alert],
      ([newMessage, newAlert]) => {
        if (newMessage !== '' && newAlert) {
          productStore.getProducts();
          setTimeout(() => {
            productStore.message = '';
            productStore.alert = false;
          }, 5000);
        }
      }
    );

    productStore.getProducts();

    return { fermer, ouvrir, edition, editerCommentaire, supprimerCommentaire , authStore, comment, note, dialogStates, closeDialog, validateDialog, productStore, hasUserCommented };
  },
});
</script>
