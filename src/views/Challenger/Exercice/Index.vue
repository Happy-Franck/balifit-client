<template>
  <v-container>
    <v-progress-linear
      :active="categoryStore.loading && trainingStore.loading"
      :indeterminate="categoryStore.loading && trainingStore.loading"
      bottom
      color="deep-purple-accent-4"
    ></v-progress-linear>
    <v-row>
      <v-col cols="12" sm="12">
        <div class="button-group filter-button-group d-flex flex-wrap justify-center">
          <div class="d-flex flex-wrap justify-center btn-container">
            <v-btn icon size="x-large" class="tout active" @click="afficheAll($event)">
              <v-img :aspect-ratio="1" width="50%" height="50%" src=""></v-img>
            </v-btn>
            <h4 class="btn-name">Tout</h4>
          </div>
          <div class="d-flex flex-wrap justify-center btn-container" v-for="(category, index) in categoryStore.categories" :key="index">
            <v-btn icon size="x-large" :data-type-filter="`.${category.name}`" @click="filterItems($event,`.${category.name}`)">
              <img class="sary-categ" :src="`${APP_CONFIG.STORAGE_BASE_URL}/categories/${category.image}`"/>
            </v-btn>
            <h4 class="btn-name">{{ category.name }}</h4>
          </div>
        </div>
      </v-col>
      <v-col cols="12" sm="12">
        <h3 class="count" ref="countElement"></h3>
      </v-col>
      <v-col cols="12" sm="12">
        <div class="grid d-flex justify-space-between flex-wrap py-3" ref="grid" style="width: 100%; height: auto;">
          <div v-for="(training , index) in trainingStore.trainings" :key="index" :class="['element-item grid-sizer', getTrainingClasses(training)]">
            <v-card class="my-3" width="90%" height="auto">
              <v-img
                class="align-end text-white"
                height="auto"
                :src="`${APP_CONFIG.STORAGE_BASE_URL}/trainings/${training.image}`"
                cover
              >
                <v-card-title>{{ training.name }}</v-card-title>
              </v-img>

              <v-card-text>
                <div>{{ training.description }}</div>
              </v-card-text>

              <v-card-actions>
                <v-dialog scrollable v-model="dialog[training.id]" persistent transition="dialog-top-transition" width="1024">
                  <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props">Explorer</v-btn>
                  </template>
                  <v-card>
                    <v-card-title class="text-h5">{{ training.name }}</v-card-title>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <p>{{training}}</p>
                      </v-col>
                    </v-row>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="closeDialog(training.id)">close</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import { defineComponent, ref, watch, onMounted } from 'vue'
  import { useCategoryStore } from '../../../store/ChallengerStore/CategoryStore'
  import { useTrainingStore } from '../../../store/ChallengerStore/TrainingStore'
  import Isotope from 'isotope-layout';
  //import Masonry from 'masonry-layout';
  import imagesLoaded from 'imagesloaded';
  import { APP_CONFIG } from '../../../config/constants'

  export default defineComponent({
    setup() {
      const countElement = ref<HTMLHeadingElement | null>(null);
      const dialog = ref<{ [key: number]: boolean }>({});
      const categoryStore = useCategoryStore()
      const trainingStore = useTrainingStore()
      categoryStore.getCategories()
      trainingStore.getTrainings()
      let iso: Isotope;
      let grid: HTMLElement | null = null;

      function closeDialog(id: number): void {
        dialog.value[id] = false;
      }

      function getTrainingClasses(training: any): string {
        return training.categories.map((category : any) => category.name).join(' ');
      }

      watch(
        [() => categoryStore.categories, () => trainingStore.trainings],
        ([categs, traings]) => {
          if (categs && traings) {
            grid = document.querySelector('.grid') as HTMLElement;
            if (grid) {
              iso = new Isotope(grid, {
                itemSelector: '.element-item',
                masonry: {
                  columnWidth: '.grid-sizer'
                }
              });
              iso.layout()
              imagesLoaded(grid).on('progress',function(instance, image) {
                iso.reloadItems()
                iso.arrange({ filter: '*' });
                iso.layout()
              })
            }
          }
        }
      );

      onMounted(()=> {
        grid = document.querySelector('.grid') as HTMLElement;
        if (grid) {
          iso = new Isotope(grid, {
            itemSelector: '.element-item',
            masonry: {
              columnWidth: '.grid-sizer'
            }
          });
          iso.layout()
          imagesLoaded(grid).on('progress',function(instance, image) {
            iso.reloadItems()
            iso.arrange({ filter: '*' });
            iso.layout()
          })
          iso.arrange({ filter: '*' });
          iso.layout()
          const filteredElements = document.querySelectorAll('.element-item');
          const count = filteredElements.length;
          if (countElement.value) {
            countElement.value.innerText = `Nombre d'éléments : ${count}`;
          }
        }
      });

      function filterItems(event: MouseEvent, categ : string): void {
        const btn = (event.target as HTMLElement)?.closest('button') as HTMLButtonElement | null;
        if (btn) {
          btn.classList.toggle('active');
        }
        let combinedFilter = '';
        document.querySelectorAll('.filter-button-group button.active').forEach((activeBtn) => {
          const typeFilter = activeBtn.getAttribute('data-type-filter');
          if (typeFilter !== null) {
            combinedFilter += typeFilter;
          }
        });
        if(combinedFilter != ''){
          document.querySelectorAll('.filter-button-group button.tout').forEach((btn) => {
            btn.classList.remove('active');
          });
        }
        if (combinedFilter === '') {
          document.querySelectorAll('.filter-button-group button.tout').forEach((btn) => {
            btn.classList.add('active');
          });
        }
        const filteredElements = document.querySelectorAll('.element-item' + combinedFilter);
        const count = filteredElements.length;

        if (countElement.value) {
          countElement.value.innerText = `Nombre d'éléments : ${count}`;
        }

        iso.arrange({ filter: combinedFilter });
        iso.layout();
      }

      function afficheAll(event: MouseEvent) {
        document.querySelectorAll('.filter-button-group button:not(.tout).active').forEach((btn) => {
          btn.classList.remove('active');
        });
        const btn = event.target as HTMLElement;
        btn.classList.add('active');
        iso.arrange({ filter: '*' });
        iso.layout();
        const filteredElements = document.querySelectorAll('.element-item');
        const count = filteredElements.length;
        countElement.value.innerText = `Nombre d'éléments : ${count}`;
      }

      return { filterItems, afficheAll, dialog, categoryStore, trainingStore, closeDialog, getTrainingClasses, countElement }
    }
  })
</script>

<style scoped>
.btn-container{
  width: 90px !important;
  height: 100px !important;
}
.btn-name{
  font-size: 12px;
  width: 100%;
  text-align: center;
}
.sary-categ{
  width: 45px !important;
  height: 45px !important;
  object-fit: cover;
}
.grid-sizer{
  width: 33.33%;
}
.active{
  background: blue;
  color: white;
}
</style>
