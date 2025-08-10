<template>
  <div class="pa-4">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="text-h6">Blogs</div>
        <div class="d-flex align-center" style="gap: 12px;">
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            label="Rechercher un article..."
            hide-details
            clearable
            @input="debouncedSearch"
            style="max-width: 280px;"
          />
          <v-btn color="primary" @click="goCreate">
            <v-icon start>mdi-plus</v-icon>
            Nouveau
          </v-btn>
        </div>
      </v-card-title>
      <v-divider />

      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-3">
          <div class="text-body-2 text-grey-darken-1">
            <span v-if="search">
              {{ total }} résultat(s) trouvé(s) pour "{{ search }}"
            </span>
            <span v-else>
              {{ total }} article(s) au total
            </span>
          </div>
          <div class="text-body-2 text-grey-darken-1">
            Page {{ page }} sur {{ lastPage }}
          </div>
        </div>

        <div class="blogs-table-container">
          <div class="blogs-table">
            <div class="table-header">
              <div class="col-title">Titre</div>
              <div class="col-author">Auteur</div>
              <div class="col-published">Publié</div>
              <div class="col-date">Créé le</div>
              <div class="col-actions">Actions</div>
            </div>

            <div
              v-for="item in blogs"
              :key="item.id"
              class="table-row"
            >
              <div class="col-title">
                <div class="title-main">{{ item.title }}</div>
                <div class="title-sub">/{{ item.slug }}</div>
              </div>
              <div class="col-author">
                <div class="author-name">{{ item.user?.name || '—' }}</div>
              </div>
              <div class="col-published">
                <v-chip :color="item.published ? 'success' : 'warning'" size="small" variant="flat">
                  {{ item.published ? 'Publié' : 'Brouillon' }}
                </v-chip>
              </div>
              <div class="col-date">
                {{ formatDate(item.created_at) }}
              </div>
              <div class="col-actions">
                <v-btn size="small" icon="mdi-eye" color="info" variant="text" @click.stop="goShow(item)" />
                <v-btn size="small" icon="mdi-pencil" color="warning" variant="text" @click.stop="goEdit(item)" />
                <v-btn size="small" icon="mdi-delete" color="error" variant="text" @click.stop="confirmDelete(item)" />
              </div>
            </div>
          </div>

          <v-overlay v-if="loading" contained class="d-flex align-center justify-center">
            <v-progress-circular indeterminate size="48" />
          </v-overlay>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-pagination v-model="page" :length="lastPage" @update:modelValue="load" />
        <v-spacer />
        <v-select :items="[10,15,25,50]" v-model="perPage" label="Par page" density="compact" hide-details style="max-width: 120px;" />
      </v-card-actions>
    </v-card>

    <!-- Create dialog -->
    <v-dialog v-model="createDialog" max-width="720">
      <v-card>
        <v-card-title>Nouvel article</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitCreate">
            <div class="d-flex flex-column" style="gap: 12px;">
              <v-text-field
                v-model="createForm.title"
                label="Titre"
                :error-messages="createErrors.title"
                required
              />
              <v-text-field
                v-model="createForm.slug"
                label="Slug (optionnel)"
                :error-messages="createErrors.slug"
                @focus="onSlugTouch"
                @input="onSlugTouch"
                hint="Laissez vide pour générer automatiquement"
                persistent-hint
              />
              <v-textarea
                v-model="createForm.excerpt"
                label="Extrait"
                :counter="500"
                :error-messages="createErrors.excerpt"
                auto-grow
              />
              <v-text-field
                v-model="createForm.image"
                label="Image (URL)"
                :error-messages="createErrors.image"
              />
              <v-text-field
                v-model="createForm.type"
                label="Type"
                :error-messages="createErrors.type"
              />
              <v-switch
                v-model="createForm.published"
                inset
                color="success"
                label="Publié"
              />
              <v-textarea
                v-model="createForm.content"
                label="Contenu"
                rows="8"
                :error-messages="createErrors.content"
                required
                auto-grow
              />
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createDialog=false" :disabled="creating">Annuler</v-btn>
          <v-btn color="primary" @click="submitCreate" :loading="creating">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>
          Supprimer l'article « {{ toDelete?.title }} » ? Cette action est définitive.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog=false">Annuler</v-btn>
          <v-btn color="error" @click="doDelete">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import http from '../../../axios'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'AdminBlogIndex',
  setup() {
    const router = useRouter()

    const blogs = ref<any[]>([])
    const loading = ref(false)
    const page = ref(1)
    const perPage = ref(15)
    const total = ref(0)
    const lastPage = ref(1)
    const search = ref('')

    // Create dialog state
    const createDialog = ref(false)
    const creating = ref(false)
    const createForm = ref<{ title: string; slug: string; excerpt: string; image: string; type: string; content: string; published: boolean }>({
      title: '',
      slug: '',
      excerpt: '',
      image: '',
      type: '',
      content: '',
      published: false,
    })
    const createErrors = ref<Record<string, string[]>>({})
    const slugTouched = ref(false)

    const deleteDialog = ref(false)
    const toDelete = ref<any | null>(null)
    let debounceTimer: any = null

    const formatDate = (value?: string) => {
      if (!value) return '-'
      return new Date(value).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    const load = async () => {
      try {
        loading.value = true
        const { data } = await http.get('/admin/blogs', {
          params: { page: page.value, per_page: perPage.value, q: search.value }
        })
        blogs.value = data.data || data
        total.value = data.total ?? blogs.value.length
        lastPage.value = data.last_page ?? 1
      } finally {
        loading.value = false
      }
    }

    const debouncedSearch = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        page.value = 1
        load()
      }, 400)
    }

    watch([page, perPage], load)

    // Slugify helper
    const slugify = (input: string) => {
      return (input || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 255)
    }

    const resetCreateForm = () => {
      createForm.value = { title: '', slug: '', excerpt: '', image: '', type: '', content: '', published: false }
      createErrors.value = {}
      slugTouched.value = false
    }

    const goCreate = () => {
      resetCreateForm()
      createDialog.value = true
    }

    const onSlugTouch = () => { slugTouched.value = true }

    watch(() => createForm.value.title, (newTitle) => {
      if (!slugTouched.value) {
        createForm.value.slug = slugify(newTitle || '')
      }
    })

    const submitCreate = async () => {
      creating.value = true
      createErrors.value = {}
      try {
        const payload: any = {
          title: createForm.value.title,
          excerpt: createForm.value.excerpt || undefined,
          image: createForm.value.image || undefined,
          type: createForm.value.type || undefined,
          content: createForm.value.content,
          published: createForm.value.published,
        }
        const trimmedSlug = (createForm.value.slug || '').trim()
        if (trimmedSlug) payload.slug = trimmedSlug

        await http.post('/admin/blogs', payload)
        createDialog.value = false
        await load()
      } catch (e: any) {
        if (e?.response?.status === 422 && e.response.data?.errors) {
          createErrors.value = e.response.data.errors
        }
      } finally {
        creating.value = false
      }
    }

    const goEdit = (item: any) => router.push({ name: 'adminBlogEdit', params: { slug: item.slug } })
    const goShow = (item: any) => router.push({ name: 'adminBlogShow', params: { slug: item.slug } })

    const confirmDelete = (item: any) => {
      toDelete.value = item
      deleteDialog.value = true
    }

    const doDelete = async () => {
      if (!toDelete.value) return
      await http.delete(`/admin/blogs/${toDelete.value.slug}`)
      deleteDialog.value = false
      toDelete.value = null
      await load()
    }

    load()

    return {
      blogs, loading, page, perPage, total, lastPage, search, debouncedSearch, formatDate,
      // create
      createDialog, creating, createForm, createErrors, onSlugTouch, submitCreate,
      // navigation + actions
      goCreate, goEdit, goShow, deleteDialog, toDelete, confirmDelete, doDelete, load
    }
  }
})
</script>

<style scoped>
.blogs-table-container {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  position: relative;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 120px 160px 160px;
  gap: 16px;
  padding: 12px 16px;
  background: rgb(var(--v-theme-surface-variant));
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 120px 160px 160px;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.table-row:last-child {
  border-bottom: none;
}

.col-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.title-main {
  font-weight: 600;
}

.title-sub {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.author-name {
  font-size: 0.875rem;
}
</style>
