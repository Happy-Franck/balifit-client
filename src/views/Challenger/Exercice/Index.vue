<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-3" style="gap: 12px; flex-wrap: wrap;">
      <h2 class="text-h6">Explorer les exercices</h2>
      <div class="d-flex align-center" style="gap: 8px; flex-wrap: wrap;">
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
        <v-select
          v-model="selectedCategories"
          :items="categoryStore.categories"
          item-title="name"
          item-value="id"
          label="Filtrer par catégories"
          variant="outlined"
          density="compact"
          clearable
          multiple
          chips
          closable-chips
          hide-details
          style="min-width: 260px; max-width: 420px;"
        />
      </div>
    </div>

    <v-progress-linear
      :active="trainingStore.loading"
      :indeterminate="trainingStore.loading"
      bottom
      color="deep-purple-accent-4"
    ></v-progress-linear>

    <v-row class="mb-2">
      <v-col cols="12">
        <h3 class="count">Nombre d'éléments : {{ trainingStore.total }}</h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="training in trainingStore.trainings"
        :key="training.id"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card class="my-3" height="100%">
          <v-img
            class="align-end text-white"
            height="180"
            :src="training.image_url || training.image || ''"
            cover
          />
          <v-card-text>
            <v-card-title class="text-wrap">{{ training.name }}</v-card-title>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="viewTraining(training.id)">Explorer</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div ref="infiniteScrollTrigger" style="height: 1px;"></div>
    <div class="text-center my-4" v-if="trainingStore.loading">Chargement...</div>
    <div class="text-center my-4 text-medium-emphasis" v-if="!trainingStore.loading && !trainingStore.has_more && trainingStore.trainings.length">Fin de la liste</div>
  </v-container>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useTrainingStore } from '../../../store/ChallengerStore/TrainingStore'
  import { useCategoryStore } from '../../../store/ChallengerStore/CategoryStore'
  import { useRouter } from 'vue-router'

  export default defineComponent({
    setup() {
      const trainingStore = useTrainingStore()
      const categoryStore = useCategoryStore()
      const searchQuery = ref('')
      const selectedCategories = ref<number[]>([])
      const router = useRouter()
      const infiniteScrollTrigger = ref<HTMLElement | null>(null)
      let observer: IntersectionObserver | null = null

      // initial fetch 12 per page + setup observer
      onMounted(async () => {
        await Promise.all([
          categoryStore.getCategories(),
          trainingStore.getTrainings({ page: 1, per_page: 12 })
        ])
        setupObserver()
      })

      onUnmounted(() => {
        if (observer) observer.disconnect()
      })

      function setupObserver(): void {
        if (observer) observer.disconnect()
        observer = new IntersectionObserver(async (entries) => {
          const entry = entries[0]
          if (entry && entry.isIntersecting && trainingStore.has_more && !trainingStore.loading) {
            await trainingStore.loadMore()
          }
        }, { root: null, rootMargin: '200px', threshold: 0 })

        if (infiniteScrollTrigger.value) {
          observer.observe(infiniteScrollTrigger.value)
        }
      }

      function viewTraining(id: number): void {
        router.push({ path: `/challenger/exercice/${id}` })
      }

      const onSearchInput = async () => {
        await trainingStore.getTrainings({ page: 1, per_page: 12, search: searchQuery.value, categories: selectedCategories.value })
      }

      // React to category changes
      watch(selectedCategories, async (vals) => {
        trainingStore.setSelectedCategories(vals || [])
        await trainingStore.getTrainings({ page: 1, per_page: 12, search: searchQuery.value, categories: vals || [] })
      })

      const clearSearch = async () => {
        searchQuery.value = ''
        await trainingStore.getTrainings({ page: 1, per_page: 12, categories: selectedCategories.value })
      }

      return { trainingStore, categoryStore, selectedCategories, viewTraining, onSearchInput, clearSearch, searchQuery, infiniteScrollTrigger }
    }
  })
</script>

<style scoped>
.count{
  font-size: 14px;
}
</style>
