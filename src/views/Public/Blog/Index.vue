<template>
  <div class="blog-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-gradient"></div>
        <div class="hero-pattern"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge hpfit-fade-in">
          <span class="badge-icon">📚</span>
          <span>Centre de Ressources</span>
        </div>
        <h1 class="hero-title hpfit-fade-in">Insights et Actualités</h1>
        <p class="hero-description hpfit-fade-in">
          Une collection d'articles soigneusement sélectionnés pour les passionnés de fitness.
          Conseils approfondis, insights et conseils honnêtes pour naviguer dans votre parcours fitness.
        </p>
        <div class="hero-stats hpfit-fade-in">
          <div class="stat-item">
            <span class="stat-number">{{ total }}+</span>
            <span class="stat-label">Articles</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">5</span>
            <span class="stat-label">Catégories</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Articles Section -->
    <section class="articles-section">
      <div class="articles-container">
        <div class="articles-header">
          <h2 class="articles-title">Tous les Articles</h2>
          <p class="articles-subtitle">
            Découvrez des outils et conseils qui vous aideront à construire des habitudes durables.
            Simplifiez votre parcours fitness avec notre bibliothèque complète et soigneusement vérifiée.
          </p>
        </div>

        <!-- Search and Filter -->
        <div class="search-filter-section">
          <div class="search-container">
            <v-text-field
              v-model="search"
              placeholder="Rechercher des articles..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              class="search-input modern-search"
              @input="onSearchInput"
              @click:clear="clearSearch"
            />
            <div class="search-suggestions" v-if="search && search.length > 2">
              <div class="suggestion-item">💡 Conseils nutrition</div>
              <div class="suggestion-item">🏋️ Exercices</div>
              <div class="suggestion-item">🧘 Bien-être</div>
            </div>
          </div>
          <div class="filter-section">
            <div class="filter-label">Filtrer par :</div>
            <div class="filter-buttons">
              <v-chip
                v-for="filter in filters"
                :key="filter.key"
                :class="{ 'active-filter': activeFilter === filter.key }"
                class="filter-chip modern-chip"
                @click="setFilter(filter.key)"
              >
                <span class="chip-icon">{{ getFilterIcon(filter.key) }}</span>
                {{ filter.label }}
              </v-chip>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && blogs.length === 0" class="loading-section">
          <v-skeleton-loader type="image, article@2" class="featured-skeleton" />
          <v-skeleton-loader type="image, article@3" class="grid-skeleton" />
        </div>

        <!-- Articles Content -->
        <div v-else-if="blogs.length > 0">
          <!-- Featured Articles (First 2) -->
          <div v-if="featuredBlogs.length > 0" class="featured-section">
            <div class="featured-grid">
              <article
                v-for="blog in featuredBlogs"
                :key="blog.id"
                class="blog-card featured-card modern-card"
                @click="goShow(blog.slug)"
              >
                <div class="card-image">
                  <div class="image-overlay"></div>
                  <v-img
                    v-if="blog.image"
                    :src="getImageUrl(blog.image)"
                    height="250"
                    cover
                    class="rounded-t-lg"
                  />
                  <div v-else class="placeholder-image modern-placeholder">
                    <div class="placeholder-icon">
                      <v-icon icon="mdi-image" size="48" color="grey-lighten-1" />
                    </div>
                    <div class="placeholder-pattern"></div>
                  </div>
                  <div class="featured-badge">⭐ À la Une</div>
                </div>
                <div class="card-content">
                  <div class="card-meta">
                    <span class="meta-category modern-category">
                      <span class="category-icon">{{ getCategoryIcon(blog) }}</span>
                      {{ getCategory(blog) }}
                    </span>
                    <span class="meta-date">{{ formatDate(blog.created_at) }}</span>
                  </div>
                  <h3 class="card-title">{{ blog.title }}</h3>
                  <p class="card-excerpt">{{ blog.excerpt || 'Découvrez cet article passionnant...' }}</p>
                  <div class="card-footer">
                    <span class="read-more modern-cta">
                      <span>En savoir plus</span>
                      <v-icon icon="mdi-arrow-right" size="16" class="ml-1" />
                    </span>
                    <div class="reading-time">📖 5 min</div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- Regular Articles Grid -->
          <div v-if="regularBlogs.length > 0" class="grid-section">
            <div class="articles-grid">
              <article
                v-for="blog in regularBlogs"
                :key="blog.id"
                class="blog-card regular-card modern-card"
                @click="goShow(blog.slug)"
              >
                <div class="card-image">
                  <div class="image-overlay"></div>
                  <v-img
                    v-if="blog.image"
                    :src="getImageUrl(blog.image)"
                    height="180"
                    cover
                    class="rounded-t-lg"
                  />
                  <div v-else class="placeholder-image small modern-placeholder">
                    <div class="placeholder-icon">
                      <v-icon icon="mdi-image" size="32" color="grey-lighten-1" />
                    </div>
                    <div class="placeholder-pattern"></div>
                  </div>
                </div>
                <div class="card-content">
                  <div class="card-meta">
                    <span class="meta-category modern-category">
                      <span class="category-icon">{{ getCategoryIcon(blog) }}</span>
                      {{ getCategory(blog) }}
                    </span>
                    <span class="meta-date">{{ formatDate(blog.created_at) }}</span>
                  </div>
                  <h3 class="card-title">{{ blog.title }}</h3>
                  <p class="card-excerpt">{{ blog.excerpt || 'Découvrez cet article...' }}</p>
                  <div class="card-footer">
                    <span class="read-more modern-cta">
                      <span>Lire</span>
                      <v-icon icon="mdi-arrow-right" size="14" class="ml-1" />
                    </span>
                    <div class="reading-time">📖 3 min</div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="empty-state">
          <v-icon icon="mdi-file-document-outline" size="64" color="grey-lighten-1" />
          <h3>Aucun article trouvé</h3>
          <p>{{ search ? `Aucun résultat pour "${search}"` : 'Aucun article disponible pour le moment.' }}</p>
        </div>

        <!-- Pagination -->
        <div v-if="blogs.length > 0" class="pagination-section">
          <v-pagination
            v-model="page"
            :length="lastPage"
            color="primary"
            @update:modelValue="load"
          />
          <div class="pagination-info">
            <span>{{ total }} article(s) • Page {{ page }} / {{ lastPage }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import http from '../../../axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const blogs = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const perPage = ref(12)
const total = ref(0)
const lastPage = ref(1)
const search = ref('')
const activeFilter = ref('all')

let searchTimeout: any = null

const filters = [
  { key: 'all', label: 'Tous les Articles' },
  { key: 'spotlight', label: 'À la Une' },
  { key: 'updates', label: 'Actualités' },
  { key: 'productivity', label: 'Productivité' }
]

const featuredBlogs = computed(() => blogs.value.slice(0, 2))
const regularBlogs = computed(() => blogs.value.slice(2))

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const getCategory = (blog: any) => {
  if (blog.published) return 'Publié'
  return 'Brouillon'
}

const getCategoryIcon = (blog: any) => {
  if (blog.published) return '📢'
  return '✏️'
}

const getFilterIcon = (filterKey: string) => {
  const icons: { [key: string]: string } = {
    'all': '📋',
    'spotlight': '⭐',
    'updates': '📰',
    'productivity': '⚡'
  }
  return icons[filterKey] || '📋'
}

const load = async () => {
  try {
    loading.value = true
    const { data } = await http.get('/blogs', {
      params: { 
        page: page.value, 
        per_page: perPage.value, 
        q: search.value,
        filter: activeFilter.value !== 'all' ? activeFilter.value : undefined
      }
    })
    blogs.value = data.data || data
    total.value = data.total ?? blogs.value.length
    lastPage.value = data.last_page ?? 1
  } catch (error) {
    console.error('Erreur lors du chargement des articles:', error)
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

const setFilter = (filterKey: string) => {
  activeFilter.value = filterKey
  page.value = 1
  load()
}

watch([page, perPage], load)

const getImageUrl = (imageName: string) => {
  return `http://localhost:8000/storage/blogs/${imageName}`
}

const goShow = (slug: string) => {
  router.push({ name: 'publicBlogShow', params: { slug } })
}

load()
</script>

<style scoped>
.blog-container {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  position: relative;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  position: relative;
  text-align: center;
  padding: 80px 20px 60px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.12);
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--hpfit-gradient-light);
  opacity: 0.8;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 25% 25%, rgba(88, 101, 242, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(115, 123, 215, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(88, 101, 242, 0.1);
  color: rgb(var(--v-theme-primary));
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 24px;
  border: 1px solid rgba(88, 101, 242, 0.2);
  backdrop-filter: blur(10px);
}

.badge-icon {
  font-size: 1.1rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  background: var(--hpfit-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.hero-description {
  font-size: 1.2rem;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.6;
  margin: 0 0 32px 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(var(--v-theme-outline), 0.3);
}

/* Articles Section */
.articles-section {
  padding: 40px 0;
}

.articles-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.articles-header {
  margin-bottom: 32px;
}

.articles-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-background));
  margin-bottom: 8px;
}

.articles-subtitle {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

/* Search and Filter */
.search-filter-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 48px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.search-container {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.modern-search {
  background: rgb(var(--v-theme-surface));
  box-shadow: var(--hpfit-shadow-soft);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgb(var(--v-theme-surface));
  box-shadow: var(--hpfit-shadow-secondary);
  z-index: 10;
  margin-top: 4px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.suggestion-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
}

.filter-section {
  text-align: center;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 12px;
}

.filter-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.modern-chip {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  padding: 8px 16px;
  font-weight: 500;
  box-shadow: var(--hpfit-shadow-soft);
}

.modern-chip:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.3);
  transform: translateY(-1px);
  box-shadow: var(--hpfit-shadow-secondary);
}

.modern-chip.active-filter {
  background: var(--hpfit-gradient-primary);
  color: rgb(var(--v-theme-on-primary));
  border-color: rgb(var(--v-theme-primary));
  box-shadow: var(--hpfit-shadow-primary);
}

.chip-icon {
  margin-right: 6px;
  font-size: 0.9rem;
}

/* Loading States */
.loading-section {
  margin-bottom: 40px;
}

.featured-skeleton {
  margin-bottom: 32px;
}

/* Featured Section */
.featured-section {
  margin-bottom: 48px;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

/* Regular Grid */
.grid-section {
  margin-bottom: 40px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Blog Cards */
.modern-card {
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
  box-shadow: var(--hpfit-shadow-soft);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(var(--v-theme-outline), 0.08);
  position: relative;
}

.modern-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--hpfit-shadow-primary);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.modern-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--hpfit-gradient-primary);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.modern-card:hover::before {
  opacity: 0.03;
}

.card-image {
  position: relative;
  overflow: hidden;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(88, 101, 242, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.modern-card:hover .image-overlay {
  opacity: 1;
}

.featured-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--hpfit-gradient-primary);
  color: white;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 2;
  box-shadow: var(--hpfit-shadow-secondary);
}

.modern-placeholder {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hpfit-gradient-light);
  position: relative;
  overflow: hidden;
}

.modern-placeholder.small {
  height: 180px;
}

.placeholder-icon {
  position: relative;
  z-index: 2;
}

.placeholder-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 30% 30%, rgba(88, 101, 242, 0.1) 0%, transparent 50%);
  animation: float 15s ease-in-out infinite;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.modern-category {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  padding: 4px 10px;
  font-weight: 600;
  font-size: 0.8rem;
}

.category-icon {
  font-size: 0.9rem;
}

.meta-date {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.8rem;
  font-weight: 500;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 12px;
  line-height: 1.3;
  flex: 1;
}

.featured-card .card-title {
  font-size: 1.4rem;
}

.card-excerpt {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modern-cta {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  transition: all 0.3s ease;
  padding: 8px 12px;
  background: rgba(var(--v-theme-primary), 0.05);
}

.modern-card:hover .modern-cta {
  background: rgba(var(--v-theme-primary), 0.1);
  transform: translateX(4px);
}

.reading-time {
  font-size: 0.8rem;
  color: rgb(var(--v-theme-on-surface-variant));
  background: rgba(var(--v-theme-surface-variant), 0.5);
  padding: 4px 8px;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.empty-state h3 {
  margin: 16px 0 8px;
  color: rgb(var(--v-theme-on-surface));
}

/* Pagination */
.pagination-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.pagination-info {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 992px) {
  .featured-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    gap: 16px;
  }
  
  .search-filter-section {
    padding: 20px;
  }
  
  .search-container {
    max-width: none;
  }
  
  .filter-buttons {
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .articles-container {
    padding: 0 16px;
  }
  
  .hero-section {
    padding: 60px 16px 40px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-divider {
    width: 40px;
    height: 1px;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .featured-grid {
    gap: 16px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .articles-title {
    font-size: 1.5rem;
  }
  
  .search-filter-section {
    padding: 16px;
  }
  
  .filter-buttons {
    gap: 6px;
  }
  
  .pagination-section {
    margin-top: 32px;
    padding-top: 24px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-description {
    font-size: 0.95rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .featured-card .card-title {
    font-size: 1.2rem;
  }
  
  .modern-placeholder {
    height: 200px;
  }
  
  .modern-placeholder.small {
    height: 160px;
  }
  
  .modern-card:hover {
    transform: translateY(-4px) scale(1.01);
  }
  
  .filter-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .modern-chip {
    justify-content: center;
  }
}
</style> 