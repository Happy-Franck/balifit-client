<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-3">
      <h2 class="text-h6">Explorer les exercices</h2>
      <v-text-field
        v-model="searchQuery"
        label="Rechercher un exercice..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
        @input="onSearchInput"
        @click:clear="clearSearch"
        style="max-width: 340px;"
      />
    </div>
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
            <v-btn icon size="x-large" :data-type-filter="`.` + slugify(category.name)" @click="filterItems($event,`.` + slugify(category.name))">
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
        <div class="grid py-3" ref="grid" style="width: 100%; height: auto;">
          <div class="grid-sizer"></div>
          <div v-for="(training , index) in trainingStore.trainings" :key="index" :class="['element-item', getTrainingClasses(training)]" :data-search="(training.name + ' ' + training.description).toLowerCase()">
            <v-card class="my-3" width="90%" height="auto">
              <v-img
                class="align-end text-white"
                height="auto"
                :src="`${APP_CONFIG.STORAGE_BASE_URL}/trainings/${training.image}`"
                eager
                cover
              >
                <v-card-title>{{ training.name }}</v-card-title>
              </v-img>

              <v-card-text>
                <div>{{ training.description }}</div>
              </v-card-text>

              <v-card-actions>
                <v-btn color="primary" @click="viewTraining(training.id)">Explorer</v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import { defineComponent, ref, watch, nextTick } from 'vue'
  import { useCategoryStore } from '../../../store/ChallengerStore/CategoryStore'
  import { useTrainingStore } from '../../../store/ChallengerStore/TrainingStore'
  import Isotope from 'isotope-layout';
  //import Masonry from 'masonry-layout';
  import imagesLoaded from 'imagesloaded';
  import { APP_CONFIG } from '../../../config/constants'
  import { useRouter } from 'vue-router'

  export default defineComponent({
    setup() {
      const countElement = ref<HTMLHeadingElement | null>(null);
      const categoryStore = useCategoryStore()
      const trainingStore = useTrainingStore()
      const searchQuery = ref('')
      const activeCategoryFilter = ref<string>('')
      const router = useRouter()
      categoryStore.getCategories()
      trainingStore.getTrainings()
      let iso: Isotope | null = null;
      let grid: HTMLElement | null = null;
      let handleResize: (() => void) | null = null;

      const slugify = (value: string): string => {
        return 'cat-' + (value || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, '-')
          .replace(/^-+|-+$/g, '')
      }

      function viewTraining(id: number): void {
        router.push({ path: `/challenger/exercice/${id}` })
      }

      function getTrainingClasses(training: any): string {
        return training.categories.map((category : any) => slugify(category.name)).join(' ');
      }

      const updateCount = (value?: number) => {
        const n = typeof value === 'number' ? value : (iso ? (iso as any).filteredItems?.length ?? 0 : 0)
        if (countElement.value) countElement.value.innerText = `Nombre d'éléments : ${n}`
      }

      const applyFilters = () => {
        if (!iso) return
        const q = searchQuery.value.trim().toLowerCase()
        const catSel = activeCategoryFilter.value // '' means all
        iso.arrange({
          filter: (itemElem: Element) => {
            const text = (itemElem as HTMLElement).getAttribute('data-search') || ''
            const textMatch = q ? text.includes(q) : true
            const categoryMatch = catSel ? (itemElem as HTMLElement).matches(catSel) : true
            return textMatch && categoryMatch
          }
        })
      }

      const onSearchInput = () => {
        applyFilters()
        updateCount()
      }

      const clearSearch = () => {
        searchQuery.value = ''
        applyFilters()
        updateCount()
      }

      watch(
        [() => categoryStore.categories, () => trainingStore.trainings],
        async ([categs, trainings]) => {
          if (!categs || !Array.isArray(categs) || categs.length === 0) return
          if (!trainings || !Array.isArray(trainings) || trainings.length === 0) return

          await nextTick()

          grid = document.querySelector('.grid') as HTMLElement
          if (!grid) return

          const imgLoader = imagesLoaded(grid as HTMLElement, { background: true } as any)

          imgLoader.on('always', () => {
            if (iso) {
              try { (iso as any).destroy?.() } catch {}
            }
            iso = new Isotope(grid as HTMLElement, {
              layoutMode: 'masonry',
              itemSelector: '.element-item',
              percentPosition: true,
              transitionDuration: 0,
              masonry: {
                columnWidth: '.grid-sizer'
              }
            })
            ;(iso as any).on('arrangeComplete', () => updateCount())
            applyFilters()
            updateCount()
            try { (iso as any).layout?.() } catch {}

            // setup resize re-layout
            if (!handleResize) {
              handleResize = () => { try { (iso as any)?.layout?.() } catch {} }
              window.addEventListener('resize', handleResize)
            }
          })

          imgLoader.on('progress', () => {
            if (iso) {
              try { (iso as any).reloadItems() } catch {}
              applyFilters()
              try { (iso as any).layout?.() } catch {}
            }
          })
        },
        { immediate: true }
      );

      function filterItems(event: MouseEvent, _categ : string): void {
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
        activeCategoryFilter.value = combinedFilter
        applyFilters()
        updateCount()
      }

      function afficheAll(event: MouseEvent) {
        document.querySelectorAll('.filter-button-group button:not(.tout).active').forEach((btn) => {
          btn.classList.remove('active');
        });
        const btn = event.target as HTMLElement;
        btn.classList.add('active');
        activeCategoryFilter.value = ''
        applyFilters()
        updateCount()
      }

      if (typeof window !== 'undefined') {
        // safety: cleanup on page unload
        window.addEventListener('beforeunload', () => {
          try { (iso as any)?.destroy?.() } catch {}
          if (handleResize) window.removeEventListener('resize', handleResize)
        })
      }

      return { filterItems, afficheAll, categoryStore, trainingStore, viewTraining, getTrainingClasses, countElement, APP_CONFIG, onSearchInput, clearSearch, searchQuery, slugify }
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
.grid{
  position: relative;
}
.grid-sizer,
.element-item{
  width: 33.33%;
}
.active{
  background: blue;
  color: white;
}
</style>
