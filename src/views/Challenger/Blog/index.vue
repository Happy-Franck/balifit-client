<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5">Blog</h1>
      <v-text-field
        v-model="search"
        label="Rechercher un article..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
        @input="onSearchInput"
        @click:clear="clearSearch"
        style="max-width: 340px;"
      />
    </div>

    <div class="d-flex justify-space-between align-center mb-2 text-body-2 text-grey-darken-1">
      <div>
        <span v-if="search">{{ total }} résultat(s) pour "{{ search }}"</span>
        <span v-else>{{ total }} article(s)</span>
      </div>
      <div>Page {{ page }} / {{ lastPage }}</div>
    </div>

    <v-skeleton-loader v-if="loading && blogs.length === 0" type="image, article@3" />

    <v-row v-else>
      <v-col v-for="item in blogs" :key="item.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="h-100 d-flex flex-column" @click="goShow(item.slug)" style="cursor:pointer;">
          <v-img v-if="item.image" :src="item.image" height="160" cover />
          <v-card-text class="flex-grow-1">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-chip :color="item.published ? 'success' : 'warning'" size="x-small" variant="flat">
                {{ item.published ? 'Publié' : 'Brouillon' }}
              </v-chip>
              <span class="text-caption">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="text-subtitle-1 font-weight-medium mb-1">{{ item.title }}</div>
            <div class="text-caption text-grey-darken-1">par {{ item.user?.name || '—' }}</div>
            <div class="text-body-2 mt-2" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">
              {{ item.excerpt || '—' }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" color="primary" @click.stop="goShow(item.slug)">Lire</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div class="d-flex align-center justify-space-between mt-4">
      <v-pagination v-model="page" :length="lastPage" @update:modelValue="load" />
      <v-select :items="[8,12,16,24]" v-model="perPage" label="Par page" density="compact" hide-details style="max-width: 120px;" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import http from '../../../axios'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'ChallengerBlogIndex',
  setup() {
    const router = useRouter()
    const blogs = ref<any[]>([])
    const loading = ref(false)
    const page = ref(1)
    const perPage = ref(12)
    const total = ref(0)
    const lastPage = ref(1)
    const search = ref('')

    let searchTimeout: any = null

    const formatDate = (value?: string) => {
      if (!value) return '-'
      return new Date(value).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    const load = async () => {
      try {
        loading.value = true
        const { data } = await http.get('/challenger/blogs', {
          params: { page: page.value, per_page: perPage.value, q: search.value }
        })
        blogs.value = data.data || data
        total.value = data.total ?? blogs.value.length
        lastPage.value = data.last_page ?? 1
      } finally {
        loading.value = false
      }
    }

    const onSearchInput = () => {
      if (searchTimeout) clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        page.value = 1
        load()
      }, 400)
    }

    const clearSearch = () => {
      search.value = ''
      page.value = 1
      load()
    }

    watch([page, perPage], load)

    const goShow = (slug: string) => {
      router.push(`/challenger/blog/${slug}`)
    }

    load()

    return { blogs, loading, page, perPage, total, lastPage, search, formatDate, load, onSearchInput, clearSearch, goShow }
  }
})
</script>

