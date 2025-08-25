<template>
  <div class="pa-4">
    <v-sheet color="surface" class="mb-4 rounded-lg">
      <div class="d-flex flex-wrap align-center justify-space-between px-4 py-3">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="mdi-newspaper-variant-outline" color="primary" class="mr-2" />
          <h1 class="text-h6 mb-0">Blog</h1>
        </div>
        <v-text-field
          v-model="search"
          label="Rechercher un article..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          @input="onSearchInput"
          @click:clear="clearSearch"
          style="max-width: 360px;"
        />
      </div>
      <v-divider />
      <div class="d-flex justify-space-between align-center px-4 py-2 text-body-2 text-grey-darken-1">
        <div>
          <span v-if="search">{{ total }} résultat(s) pour "{{ search }}"</span>
          <span v-else>{{ total }} article(s)</span>
        </div>
        <div>Page {{ page }} / {{ lastPage }}</div>
      </div>
    </v-sheet>

    <v-skeleton-loader v-if="loading && blogs.length === 0" type="image, article@3" />

    <v-row v-else>
      <v-col v-for="item in blogs" :key="item.id" cols="12" sm="6" md="4" lg="3">
        <v-card elevation="0" rounded="lg" class="h-100 d-flex flex-column" @click="goShow(item.slug)" style="cursor:pointer;">
          <v-img v-if="item.image" :src="getImageUrl(item.image)" height="160" cover class="rounded-t-lg" />
          <v-sheet v-else height="160" class="rounded-t-lg" />
          <v-card-text class="flex-grow-1">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center gap-1">
                <v-chip :color="item.published ? 'success' : 'warning'" size="x-small" variant="tonal">
                  {{ item.published ? 'Publié' : 'Brouillon' }}
                </v-chip>
                <v-chip v-if="item.type" :color="getTypeColor(item.type)" size="x-small" variant="outlined">
                  {{ item.type.toUpperCase() }}
                </v-chip>
              </div>
              <span class="text-caption">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="text-subtitle-1 font-weight-medium mb-1">{{ item.title }}</div>
            <div class="text-caption text-grey-darken-1">par {{ item.user?.name || '—' }}</div>
            <div class="text-body-2 mt-2" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">
              {{ item.excerpt || '—' }}
            </div>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn variant="text" color="primary" class="text-none" @click.stop="goShow(item.slug)">Lire</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div class="d-flex align-center justify-space-between mt-4">
      <v-pagination v-model="page" :length="lastPage" color="primary" @update:modelValue="load" />
      <v-select :items="[8,12,16,24]" v-model="perPage" label="Par page" density="compact" variant="outlined" hide-details style="max-width: 120px;" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import http from '../../axios'
import { useRouter } from 'vue-router'

const props = defineProps<{ endpointPrefix?: string }>()

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

const getTypeColor = (type: string) => {
  switch (type) {
    case 'tofu': return 'blue'
    case 'mofu': return 'orange'
    case 'bofu': return 'green'
    default: return 'grey'
  }
}

const getImageUrl = (imageName: string) => {
  return `http://localhost:8000/storage/blogs/${imageName}`
}

const load = async () => {
  try {
    loading.value = true
    const prefix = props.endpointPrefix || ''
    const { data } = await http.get(`${prefix}/blogs`, {
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
  const name = (props.endpointPrefix || '') === '/challenger' ? 'challengerBlogShow' : 'publicBlogShow'
  router.push({ name, params: { slug } })
}

load()
</script>

<script lang="ts">
export default { name: 'BlogList' }
</script> 