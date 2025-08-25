<template>
  <div class="pa-4">
    <v-btn variant="text" @click="$router.back()">Retour</v-btn>
    <v-card class="pa-4">
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="text-h6">{{ isCreate ? 'Créer un article' : 'Éditer l\'article' }}</div>
        <v-chip :color="form.published ? 'success' : 'warning'" size="small">
          {{ form.published ? 'Publié' : 'Brouillon' }}
        </v-chip>
      </div>
      <v-form @submit.prevent="onSubmit" v-model="valid">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field v-model="form.title" label="Titre" :rules="[rules.requiredIfUpdating]" />
            <v-textarea v-model="form.excerpt" label="Extrait" rows="3" />
            <v-file-input
              v-model="form.imageFile"
              label="Image du blog"
              accept="image/*"
              prepend-icon="mdi-camera"
              variant="outlined"
              clearable
              show-size
              @change="handleImageUpload"
            />
            <div v-if="form.image" class="mt-2">
              <v-img
                :src="getImageUrl(form.image)"
                max-height="200"
                max-width="300"
                class="rounded"
              />
            </div>
            <v-text-field v-model="form.slug" label="Slug (optionnel)" />
            <v-select
              v-model="form.type"
              :items="typeOptions"
              label="Type de contenu"
              variant="outlined"
              clearable
            />
            <v-switch v-model="form.published" label="Publié" />
            <v-textarea v-model="form.content" label="Contenu (Markdown)" rows="14" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="4">
            <div class="text-subtitle-1 mb-2">Aperçu</div>
            <v-sheet class="pa-2" elevation="1" style="max-height: 70vh; overflow:auto">
              <MdxContent :markdown="form.content || ''" />
            </v-sheet>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="reset">Réinitialiser</v-btn>
          <v-btn color="primary" type="submit">{{ isCreate ? 'Créer' : 'Enregistrer' }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '../../../axios'
import MdxContent from '../../../components/Blog/MdxContent.vue'

export default defineComponent({
  name: 'AdminBlogEdit',
  components: { MdxContent },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const valid = ref(false)

    const form = reactive<any>({
      title: '',
      slug: '',
      excerpt: '',
      image: '',
      imageFile: null,
      type: '',
      published: false,
      content: ''
    })

    const typeOptions = [
      { title: 'TOFU - Top of Funnel', value: 'tofu' },
      { title: 'MOFU - Middle of Funnel', value: 'mofu' },
      { title: 'BOFU - Bottom of Funnel', value: 'bofu' }
    ]

    const isCreate = computed(() => route.name === 'adminBlogCreate')

    const rules = {
      required: (v: string) => !!v || 'Requis',
      requiredIfUpdating: (v: string) => isCreate.value || !!v || 'Requis'
    }

    const load = async () => {
      if (isCreate.value) return
      const slug = route.params.slug as string
      const { data } = await http.get(`/admin/blogs/${slug}`)
      Object.assign(form, data)
    }

    const onSubmit = async () => {
      if (!form.content) return
      
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('content', form.content)
      formData.append('published', form.published ? '1' : '0')
      
      if (form.slug) formData.append('slug', form.slug)
      if (form.excerpt) formData.append('excerpt', form.excerpt)
      if (form.type) formData.append('type', form.type)
      if (form.imageFile) formData.append('image', form.imageFile)
      
      try {
        if (isCreate.value) {
          await http.post('/admin/blogs', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } else {
          const slug = route.params.slug as string
          formData.append('_method', 'PUT')
          await http.post(`/admin/blogs/${slug}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
        router.push({ name: 'adminBlog' })
      } catch (error) {
        console.error('Erreur lors de la soumission:', error)
      }
    }

    const reset = () => {
      if (isCreate.value) {
        form.title = ''
        form.slug = ''
        form.excerpt = ''
        form.image = ''
        form.imageFile = null
        form.type = ''
        form.published = false
        form.content = ''
      } else {
        load()
      }
    }

    const handleImageUpload = (e: any) => {
      form.imageFile = e.target.files[0]
    }

    const getImageUrl = (imageName: string) => {
      return `http://localhost:8000/storage/blogs/${imageName}`
    }

    onMounted(load)

    return { 
      form, 
      valid, 
      rules, 
      onSubmit, 
      reset, 
      isCreate, 
      typeOptions,
      handleImageUpload,
      getImageUrl
    }
  }
})
</script>
