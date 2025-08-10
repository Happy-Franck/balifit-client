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
            <v-text-field v-model="form.image" label="URL image" />
            <v-text-field v-model="form.slug" label="Slug (optionnel)" />
            <v-text-field v-model="form.type" label="Type (tag)" />
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
      type: '',
      published: false,
      content: ''
    })

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
      if (isCreate.value) {
        await http.post('/admin/blogs', {
          slug: form.slug || undefined,
          excerpt: form.excerpt || undefined,
          image: form.image || undefined,
          type: form.type || undefined,
          published: form.published,
          published_at: undefined,
          content: form.content
        })
      } else {
        const slug = route.params.slug as string
        await http.put(`/admin/blogs/${slug}`, {
          title: form.title,
          slug: form.slug || undefined,
          excerpt: form.excerpt || undefined,
          image: form.image || undefined,
          type: form.type || undefined,
          published: form.published,
          published_at: form.published ? (form.published_at || undefined) : null,
          content: form.content
        })
      }
      router.push({ name: 'adminBlog' })
    }

    const reset = () => {
      if (isCreate.value) {
        form.title = ''
        form.slug = ''
        form.excerpt = ''
        form.image = ''
        form.type = ''
        form.published = false
        form.content = ''
      } else {
        load()
      }
    }

    onMounted(load)

    return { form, valid, rules, onSubmit, reset, isCreate }
  }
})
</script>
