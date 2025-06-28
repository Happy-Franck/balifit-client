<template>
  <div class="category">
    <h1>Category</h1>
    <v-card
      class="mx-auto mt-6"
      width="344"
    >
    <v-progress-linear
        :active="categoryStore.loading"
        :indeterminate="categoryStore.loading"
        bottom
        color="deep-purple-accent-4"
      ></v-progress-linear>
    </v-card>
    <v-alert
      border="start"
      variant="tonal"
      close-label="Close Alert"
      color="deep-purple-accent-4" v-if="categoryStore.alert" closable :text="categoryStore.message"></v-alert>
    <div class="create" v-if="formEditCategory === false">
      <v-btn color="red" @click="createclose = !createclose">
        <span v-if="createclose">X</span>
        <span v-else>Create</span>
      </v-btn>
      <div v-if="createclose === true">
        <form enctype="multipart/form-data" @submit.prevent="storeCategory()">
          <v-text-field v-model="name" label="Name" density="compact" variant="outlined"></v-text-field>
          <v-file-input @change="uploadImage" show-size prepend-icon="mdi-camera" v-model="image" clearable label="Image"></v-file-input>
          <v-btn type="submit" block color="green">Ajouter</v-btn>
        </form>
      </div>
    </div>
    <div class="edit" v-else>
      <div class="edit" v-if="editclose === true">
        <v-btn color="red" @click="editclose = !editclose">
          <span v-if="editclose">X</span> close
        </v-btn>
        <form enctype="multipart/form-data" @submit.prevent="updateCategory(Number(id))">
          <v-text-field v-model="name" label="Name" density="compact" variant="outlined"></v-text-field>
          <v-file-input @change="uploadImage" show-size prepend-icon="mdi-camera" v-model="image" clearable label="Image"></v-file-input>
          <v-btn type="submit" block color="green">Ajouter</v-btn>
        </form>
      </div>
    </div>
    <v-row>
      <v-col sm="12" md="6">
        <CategoryShow v-if="categoryStore.currentCategory" :category="categoryStore.currentCategory" />
      </v-col>
      <v-col sm="12" md="6">
        <v-row justify="start" align="start" class="category-list">
          <v-col v-for="category in categoryStore.categories" :key="category.id">
            <!-- <router-link :to="{name: 'CategoryItem', params: {id: category.id}}"> -->
            <v-card
              class="mx-auto"
              width="200"
            >
            <v-img :src="`http://127.0.0.1:8000/storage/categories/${category.image}`" width="50px">
            </v-img>

              <v-card-text>
                {{category.id}} - {{category.name}}
              </v-card-text>

              <v-card-actions>
                <v-btn variant="outlined" @click="currentCategory(category.id)">
                  Voir
                </v-btn>
                <v-btn variant="outlined"  @click="editCategory(category.id)">
                  Editer
                </v-btn>
                <v-btn variant="outlined"  @click="removeCategory(category.id)">
                  Supprimer
                </v-btn>
              </v-card-actions>
            </v-card>
            <!-- </router-link> -->
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts">
import { defineComponent , watch , reactive , toRefs } from 'vue'
import { useCategoryStore } from '../../../store/AdminStore/CategoryStore'
import CategoryShow from '../../../components/CategoryShow.vue'

export default defineComponent({
    components: { CategoryShow },
    setup() {
      const categoryStore = useCategoryStore()
      categoryStore.getCategories()

      const state = reactive({
          createclose: false,
          editclose: false,
          formEditCategory: false,
          name: '',
          image: null as File | null,
          sary: null as null | any,
          id: null as number | null
      })

      watch(() => categoryStore.loading, (val) => {
        if (!val) return;
        setTimeout(() => {
            categoryStore.loading = false;
        }, 3000);
      });

      watch(
        [() => categoryStore.message, () => categoryStore.alert],
        ([newMessage, newAlert]) => {
          if (newMessage !== '' && newAlert) {
            categoryStore.getCategories()
            if(categoryStore.currentCategory){
              currentCategory(categoryStore.currentCategory.id)
            }
            setTimeout(() => {
              categoryStore.message = '';
              categoryStore.alert = false;
            }, 5000);
          }
        }
      );

      const currentCategory = (id: number) => {
        categoryStore.showCategory(id);
      };

      const removeCategory = (id : number) => {
        categoryStore.deleteCategory(id)
        categoryStore.loading = true;
      };

      const editCategory = (id : number) => {
        state.formEditCategory = true
        state.editclose = true
        const category = categoryStore.categories.find((c) => c.id === id);
        if (category) {
          state.id = category.id;
          state.name = category.name;
          state.image = null;
          state.sary = null;
          // Autres champs à pré-remplir pour l'édition
        }
      };

      const uploadImage = (e: any) => {
        state.sary = e.target.files[0]
      }

      const storeCategory = () => {
        categoryStore.loading = true;
        const formData = new FormData();
        if (state.image) {
          formData.append('image', state.sary);
        }
        categoryStore.storeCategory(
          {
            name: state.name,
          },
          formData
        )
        state.createclose = false
        state.name = ''
        state.image = null
        state.sary = null
      };

      const updateCategory = (id : number) => {
        categoryStore.loading = true;
        const formData = new FormData();
        console.log(state.sary)
        if (state.sary) {
          formData.append('image', state.sary);
        }
        categoryStore.updateCategory(id,
          {
            name: state.name,
          },
          formData
        )
        state.formEditCategory = false
        state.name = ''
        state.image = null
        state.sary = null
      }

      return{ ...toRefs(state) , categoryStore, currentCategory , uploadImage , storeCategory , removeCategory , editCategory , updateCategory }
    },
})
</script>
