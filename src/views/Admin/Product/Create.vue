<template>
  <div class="create-product">
    <p>create</p>
    <form enctype="multipart/form-data" @submit.prevent="createProduct">
      <v-text-field v-model="name" label="Name" density="compact" variant="outlined"></v-text-field>
      <v-text-field v-model="description" label="Description" density="compact" variant="outlined"></v-text-field>
      <v-text-field v-model="poid" label="Poid" density="compact" variant="outlined"></v-text-field>
      <v-text-field v-model="price" label="Price" density="compact" variant="outlined"></v-text-field>
      <v-file-input @change="uploadImage" show-size prepend-icon="mdi-camera" v-model="image" clearable label="Image"></v-file-input>
      <v-btn type="submit">ok</v-btn>
    </form>
  </div>
</template>
<script lang="ts">
import { defineComponent , reactive , toRefs } from 'vue'
import { useProductStore } from '../../../store/AdminStore/ProductStore'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup(){
    const router = useRouter()
    const productStore = useProductStore()
    const state = reactive({
      name: '',
      description:'',
      poid: 0,
      price: 0,
      image: null as File | null,
      sary: null as null | any,
    })
    const uploadImage = (e: any) => {
      state.sary = e.target.files[0]
    }
    const createProduct = () => {
      const formData = new FormData();
      if (state.image) {
        formData.append('image', state.sary);
      }
      productStore.storeProduct(
        {
          name: state.name,
          description: state.description,
          poid: Number(state.poid),
          price: Number(state.price)
        },
        formData
      )
      router.push('/admin/product')
    }
    return { ...toRefs(state) , uploadImage , createProduct }
  }
})
</script>
