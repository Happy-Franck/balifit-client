<template>
  <div class="pa-4">
    <v-btn variant="text" @click="goBack">Retour</v-btn>

    <v-card class="mt-2">
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center" style="gap: 12px;">
          <div class="text-h6">{{ blog?.title || blog?.slug || 'Article' }}</div>
          <v-chip v-if="blog" :color="blog.published ? 'success' : 'warning'" size="small">
            {{ blog.published ? 'Publié' : 'Brouillon' }}
          </v-chip>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-skeleton-loader v-if="loading" type="article" />
        <template v-else>
          <div class="text-caption mb-4" v-if="blog">
            Créé le {{ formatDate(blog.created_at) }} • Par {{ blog.user?.name || '—' }} • Type: {{ blog.type || '—' }}
          </div>

          <v-img v-if="blog?.image" :src="blog.image" alt="Image de couverture" class="mb-4" max-height="320" cover />

          <MdxContent v-if="blog" :markdown="blog.content || ''" />
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '../../axios'
import MdxContent from '../../components/Blog/MdxContent.vue'

const props = defineProps<{ endpointPrefix?: string }>()

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const blog = ref<any | null>(null)

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
}

const load = async () => {
  const slug = route.params.slug as string
  if (!slug) return
  try {
    loading.value = true
    const prefix = props.endpointPrefix || ''
    const { data } = await http.get(`${prefix}/blogs/${slug}`)
    blog.value = data
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  const name = (props.endpointPrefix || '') === '/challenger' ? 'challengerBlog' : 'publicBlogIndex'
  router.push({ name })
}

onMounted(load)
</script> 