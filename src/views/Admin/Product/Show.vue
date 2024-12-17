<template>
  <v-container>
    <v-card
      width="auto"
      absolute
      style="z-index: 50;"
    >
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
      closable
      close-label="Close Alert"
      color="deep-purple-accent-4"
      v-if="productStore.alert" :text="productStore.message"
      ></v-alert>
    <div>
      {{productStore.currentProduct}}
    </div>

          <v-dialog scrollable v-model="dialog" persistent transition="dialog-top-transition" width="1024">
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          v-bind="props"
        >
          Editer le produit
        </v-btn>
      </template>
      <form @submit.prevent="updateProduct(productStore.currentProduct.id)">
        <v-card>
          <v-card-title>
            <span class="text-h5">Edition du produit</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col
                  cols="12"
                >
                  <v-text-field required v-model="name" label="Name" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                >
                  <v-text-field required v-model="description" label="Description" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field required v-model="poid" label="Poid" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field required v-model="price" label="Price" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-file-input @change="uploadImage" show-size prepend-icon="mdi-camera" v-model="image" clearable label="Image"></v-file-input>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue-darken-1"
              variant="text"
              @click="dialog = false"
            >
              Close
            </v-btn>
            <v-btn
              color="blue-darken-1"
              variant="text"
              type="submit"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </form>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent , reactive , toRefs , ref , watch } from 'vue'
import { useProductStore } from '@/store/AdminStore/ProductStore'
import { useRoute } from 'vue-router'

export default defineComponent({
  setup() {
      const dialog = ref(false)
      const router = useRoute()
      const productStore = useProductStore()

      const state = reactive({
        name: '',
        description:'',
        poid: 0,
        price: 0,
        image: null as File | null,
        sary: null as null | any,
      })


      if(productStore.currentProduct){
        if(productStore.currentProduct.id != Number(router.params.id)){
          productStore.loading = true
          productStore.currentProduct = null
          productStore.showProduct(Number(router.params.id))
        }
      }
      if(!productStore.currentProduct){
        productStore.loading = true
        productStore.currentProduct = null
        productStore.showProduct(Number(router.params.id))
      }

      watch(
        [() => productStore.message, () => productStore.alert, () => productStore.currentProduct],
        ([newMessage, newAlert, newProduct]) => {
          if (newMessage !== '' && newAlert) {
            productStore.showProduct(Number(router.params.id))
            setTimeout(() => {
              productStore.message = '';
              productStore.alert = false;
            }, 5000);
          }
          if(newProduct){
            state.name = productStore.currentProduct.name
            state.description = productStore.currentProduct.description
            state.price = productStore.currentProduct.price
            state.poid = productStore.currentProduct.poid
          }
        }
      );


      const uploadImage = (e: any) => {
        state.sary = e.target.files[0]
      }

      const updateProduct = (id : number) => {
        dialog.value = false
        const formData = new FormData();
        if (state.image) {
          formData.append('image', state.sary);
        }
        productStore.updateProduct(id,
        {
          name: state.name,
          description: state.description,
          poid: Number(state.poid),
          price: Number(state.price)
        }, formData)
        state.image = null
      }

      return{ ...toRefs(state) , dialog , productStore , updateProduct , uploadImage }
    }
})
</script>
