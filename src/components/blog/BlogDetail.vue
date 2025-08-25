<template>
  <div class="blog-article">
    <!-- Navigation -->
    <div class="article-nav">
      <v-container>
        <v-btn 
          variant="text" 
          @click="goBack"
          prepend-icon="mdi-arrow-left"
          class="back-btn"
        >
          Retour aux articles
        </v-btn>
      </v-container>
    </div>

    <!-- Article Hero Section -->
    <div class="article-hero" v-if="blog">
      <div class="hero-background">
        <div class="hero-overlay"></div>
      </div>
      
      <v-container class="hero-content">
        <div class="article-meta">
          <v-chip 
            :color="blog.published ? 'success' : 'warning'" 
            size="small"
            class="status-chip"
          >
            {{ blog.published ? 'Publié' : 'Brouillon' }}
          </v-chip>
          <v-chip v-if="blog.type" :color="getTypeColor(blog.type)" size="small" variant="outlined" class="type-chip">
            {{ blog.type.toUpperCase() }}
          </v-chip>
          <span class="meta-separator">•</span>
          <span class="meta-text">{{ formatDate(blog.created_at) }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-text">Par {{ blog.user?.name || 'HPFit' }}</span>
        </div>
        
        <h1 class="article-title">{{ blog.title || blog.slug || 'Article' }}</h1>
      </v-container>
    </div>

    <!-- Article Content -->
    <div class="article-content">
      <v-container>
        <v-row>
          <!-- Main Content - 8 columns -->
          <v-col cols="12" md="8">
            <!-- Table of Contents -->
            <div class="table-of-contents" v-if="tableOfContents.length > 0">
              <h3 class="toc-title">Table des matières</h3>
              <ul class="toc-list">
                <li 
                  v-for="(item, index) in tableOfContents" 
                      :key="index"
                      :class="`toc-level-${item.level}`"
                    >
                      <a 
                        @click="scrollToHeading(item.id)"
                        class="toc-link"
                      >
                        {{ item.number }}. {{ item.text }}
                      </a>
                </li>
              </ul>
            </div>
            
            <!-- Article Image -->
            <div class="content-wrapper">
              <v-skeleton-loader v-if="loading" type="article" class="skeleton-article" />
              <div v-else class="article-body">

                <div class="article-image-section d-flex justify-center" v-if="blog && blog.image">
                  <v-img 
                    :src="getImageUrl(blog.image)" 
                    contain
                    alt="Image de l'article"
                    class="article-main-image"
                  />
                </div>
                <MdxContent 
                  v-if="blog" 
                  :markdown="blog.content || ''" 
                  @headings-extracted="onHeadingsExtracted"
                />
              </div>
            </div>
          </v-col>

          <!-- Related Articles Sidebar - 4 columns -->
          <v-col cols="12" md="4">
            <div class="sidebar">
              <div class="related-articles">
                <h3 class="sidebar-title">Articles associés</h3>
                <v-skeleton-loader v-if="loadingRelated" type="list-item-three-line@3" />
                <div v-else-if="relatedArticles.length > 0" class="related-list">
                  <div 
                    v-for="article in relatedArticles" 
                    :key="article.id"
                    class="related-item"
                    @click="goToArticle(article.slug)"
                  >
                    <div class="related-thumbnail">
                      <v-img 
                        v-if="article.image" 
                        :src="getImageUrl(article.image)" 
                        width="40"
                        height="40"
                        cover
                        class="thumbnail-image"
                      />
                      <div v-else class="thumbnail-placeholder">
                        <v-icon size="20">mdi-image</v-icon>
                      </div>
                    </div>
                    <div class="related-content">
                      <h4 class="related-title">{{ article.title }}</h4>
                      <div class="related-meta">
                        <small>{{ formatDate(article.created_at) }}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-related">
                  <p>Aucun article associé pour le moment.</p>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
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
const loadingRelated = ref(false)
const blog = ref<any | null>(null)
const relatedArticles = ref<any[]>([])
const tableOfContents = ref<any[]>([])

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
  const slug = route.params.slug as string
  if (!slug) return
  try {
    loading.value = true
    const prefix = props.endpointPrefix || ''
    const { data } = await http.get(`${prefix}/blogs/${slug}`)
    blog.value = data
    loadRelatedArticles()
  } finally {
    loading.value = false
  }
}

const loadRelatedArticles = async () => {
  try {
    loadingRelated.value = true
    const prefix = props.endpointPrefix || ''
    const { data } = await http.get(`${prefix}/blogs?limit=6`)
    // Filter articles by same type and exclude current article
    relatedArticles.value = data.data?.filter((article: any) => 
      article.slug !== blog.value?.slug && 
      article.type === blog.value?.type
    ) || []
  } catch (error) {
    console.error('Error loading related articles:', error)
  } finally {
    loadingRelated.value = false
  }
}

const onHeadingsExtracted = (headings: any[]) => {
  tableOfContents.value = headings
}

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start',
      inline: 'nearest'
    })
  }
}

const goToArticle = (slug: string) => {
  router.push({ 
    name: (props.endpointPrefix || '') === '/challenger' ? 'challengerBlogShow' : 'publicBlogShow',
    params: { slug }
  })
}

const goBack = () => {
  const name = (props.endpointPrefix || '') === '/challenger' ? 'challengerBlog' : 'publicBlogIndex'
  router.push({ name })
}

onMounted(load)
</script>

<style scoped>
.blog-article {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

.article-nav {
  padding: 1rem 0;
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.back-btn {
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
}

.article-hero {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background: rgb(var(--v-theme-primary));
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.9) 0%,
    rgba(var(--v-theme-primary), 0.7) 50%,
    rgba(var(--v-theme-primary), 0.8) 100%
  );
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  color: white;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

.status-chip {
  font-weight: 600;
}

.type-chip {
  font-weight: 600;
  color: white !important;
}

.meta-separator {
  opacity: 0.6;
}

.meta-text {
  font-weight: 500;
}

.article-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.article-excerpt {
  font-size: 1.25rem;
  line-height: 1.6;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.article-content {
  padding: 4rem 0;
  background: rgb(var(--v-theme-background));
}

.content-wrapper {
  margin: 0 auto;
}

.article-body {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.skeleton-article {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  padding: 3rem;
}


.toc-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  margin-bottom: 0.5rem;
}

.toc-link {
  text-decoration: none;
  cursor: pointer;
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.toc-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toc-level-1 .toc-link {
  font-size: 1rem;
  font-weight: 600;
}

.toc-level-2 .toc-link {
  font-size: 0.9rem;
  padding-left: 1.5rem;
}

.toc-level-3 .toc-link {
  font-size: 0.85rem;
  padding-left: 2.25rem;
  opacity: 0.8;
}

.table-of-contents {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.article-image-section {
  margin-bottom: 2rem;
}

.article-main-image {
  margin: 25px 0px;
  max-height: 400px;
  width: 100%;
}

/* Sidebar */
.sidebar {
  position: sticky;
  top: 7rem;
}

.related-articles {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.sidebar-title {
  color: rgb(var(--v-theme-primary));
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  position: relative;
}

.sidebar-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  height: 2px;
  background: rgb(var(--v-theme-primary));
  border-radius: 1px;
}

.related-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  margin-bottom: 0.5rem;
}

.related-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.related-thumbnail {
  flex-shrink: 0;
}

.thumbnail-image {
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.thumbnail-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: rgba(var(--v-theme-outline), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.4);
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.related-content {
  flex: 1;
  min-width: 0;
}

.related-title {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 0.25rem;
  color: rgb(var(--v-theme-on-surface));
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.75rem;
}

.no-related {
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-style: italic;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .article-hero {
    min-height: 50vh;
  }
  
  .article-body {
    padding: 2rem 1.5rem;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .meta-separator {
    display: none;
  }

  .table-of-contents {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .sidebar {
    position: static;
    margin-top: 2rem;
  }

  .related-articles {
    padding: 1rem;
  }
}
</style> 