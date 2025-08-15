// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/AuthStore'
//Not connected
import NotConnected from '../layouts/NotConnected.vue'
import Login from '../views/Auth/Login.vue'
import Register from '../views/Auth/Register.vue'
//admin
import Admin from '../layouts/Admin.vue'
import DashboardAdmin from '../views/Admin/DashboardAdmin.vue'
import CategoryAdmin from '../views/Admin/Category/Index.vue'
import TrainingAdmin from '../views/Admin/Training/Index.vue'
import TrainingShowAdmin from '../views/Admin/Training/Show.vue'
import TrainingEditAdmin from '../views/Admin/Training/Edit.vue'
import EquipmentAdmin from '../views/Admin/Equipment/Index.vue'
import EquipmentShowAdmin from '../views/Admin/Equipment/Show.vue'
import EquipmentEditAdmin from '../views/Admin/Equipment/Edit.vue'
import UserAdmin from '../views/Admin/User/Index.vue'
import UserItemAdmin from '../views/Admin/User/Show.vue'
import SeanceAdmin from '../views/Admin/Seance/index.vue'
import SeanceShowAdmin from '../views/Admin/Seance/Show.vue'
import UserSeanceAdmin from '../views/Admin/Seance/Show.vue'
import ProductAdmin from '../views/Admin/Product/Index.vue'
import ProductItemAdmin from '../views/Admin/Product/Show.vue'
import ProductCreateAdmin from '../views/Admin/Product/Create.vue'
import ProductEditAdmin from '../views/Admin/Product/Edit.vue'
import AdminBlogIndex from '../views/Admin/Blog/index.vue'
import AdminBlogShow from '../views/Admin/Blog/show.vue'
import AdminBlogEdit from '../views/Admin/Blog/edit.vue'
//coach
import Coach from '../layouts/Coach.vue'
import DashboardCoach from '../views/Coach/DashboardCoach.vue'
import TrainingCoach from '../views/Coach/Training/Index.vue'
import TrainingItemCoach from '../views/Coach/Training/Show.vue'
import ChallengerCoach from '../views/Coach/Challenger/Index.vue'
import ChallengerItemCoach from '../views/Coach/Challenger/Show.vue'
import SeanceCoach from '../views/Coach/Seance/Index.vue'
import SeanceItemCoach from '../views/Coach/Seance/Show.vue'
import SeanceItemAddCoach from '../views/Coach/Seance/Add.vue'
import SeanceItemEditCoach from '../views/Coach/Seance/Edit.vue'
//challenger
import Challenger from '../layouts/Challenger.vue'
import DashboardChallenger from '../views/Challenger/DashboardChallenger.vue'
import SeanceChallenger from '../views/Challenger/Seance/Index.vue'
import ProductChallenger from '../views/Challenger/Product/Index.vue'
import ProductShowChallenger from '../views/Challenger/Product/Show.vue'
import ExoChallenger from '../views/Challenger/Exercice/Index.vue'
import ChallengerBlogIndex from '../views/Challenger/Blog/index.vue'
import ChallengerBlogShow from '../views/Challenger/Blog/show.vue'
import ExoShowChallenger from '../views/Challenger/Exercice/Show.vue'
//profile
import EditProfile from '../views/Profile/EditProfile.vue'
import ProfileView from '../views/Profile/ProfileView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/',
    component: NotConnected,
    children: [
      {
        path: 'login',
        name: 'login',
        component: Login,
        meta: { requiresGuest: true }
      },
      {
        path: 'register',
        name: 'register',
        component: Register,
        meta: { requiresGuest: true }
      },
    ]
  },
  {
    path: '/admin',
    component: Admin,
    meta: { requiresAuth: true, requiresRole: 'administrateur', breadcrumb: 'Admin' },
    children: [
      {
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'adminDashboard',
        component: DashboardAdmin,
        meta: { breadcrumb: 'Tableau de bord' }
      },
      {
        path: 'category',
        name: 'adminCategory',
        component: CategoryAdmin,
        meta: { breadcrumb: 'Catégories' }
      },
      {
        path: 'training',
        name: 'adminTraining',
        component: TrainingAdmin,
        meta: { breadcrumb: 'Entraînements' }
      },
      {
        path: 'training/:id',
        name: 'adminTrainingShow',
        component: TrainingShowAdmin,
        props: true,
        meta: { breadcrumb: 'Détail' }
      },
      {
        path: 'training/:id/edit',
        name: 'adminTrainingEdit',
        component: TrainingEditAdmin,
        props: true,
        meta: { breadcrumb: 'Modifier' }
      },
      {
        path: 'equipment',
        name: 'adminEquipment',
        component: EquipmentAdmin,
        meta: { breadcrumb: 'Équipements' }
      },
      {
        path: 'equipment/:id',
        name: 'adminEquipmentShow',
        component: EquipmentShowAdmin,
        props: true,
        meta: { breadcrumb: 'Détail' }
      },
      {
        path: 'equipment/:id/edit',
        name: 'adminEquipmentEdit',
        component: EquipmentEditAdmin,
        props: true,
        meta: { breadcrumb: 'Modifier' }
      },
      {
        path: 'user',
        name: 'adminUser',
        component: UserAdmin,
        meta: { keepAlive: true, breadcrumb: 'Utilisateurs' }
      },
      {
        path: 'user/:id',
        name: 'userItem',
        component: UserItemAdmin,
        props: true,
        meta: { breadcrumb: 'Profil' },
      },
      {
        path: 'user/:id/seance/:idSeance',
        name: 'userSeance',
        component: UserSeanceAdmin,
        props: true,
        meta: { breadcrumb: 'Séance' },
      },
      {
        path: 'seance',
        name: 'adminSeance',
        component: SeanceAdmin,
        meta: { breadcrumb: 'Séances' }
      },
      {
        path: 'seance/:id',
        name: 'adminSeanceShow',
        component: SeanceShowAdmin,
        props: true,
        meta: { breadcrumb: 'Détail' }
      },
      {
        path: 'product',
        name: 'adminProduct',
        component: ProductAdmin,
        meta: { breadcrumb: 'Produits' }
      },
      {
        path: 'product/:id',
        name: 'productItem',
        component: ProductItemAdmin,
        props: true,
        meta: { breadcrumb: 'Détail' },
      },
      {
        path: 'product/create',
        name: 'adminProductCreate',
        component: ProductCreateAdmin,
        meta: { breadcrumb: 'Créer' }
      },
      {
        path: 'product/:id/edit',
        name: 'adminProductEdit',
        component: ProductEditAdmin,
        props: true,
        meta: { breadcrumb: 'Modifier' }
      },
      {
        path: 'blog',
        name: 'adminBlog',
        component: AdminBlogIndex,
        meta: { breadcrumb: 'Blogs' }
      },
      {
        path: 'blog/create',
        name: 'adminBlogCreate',
        component: AdminBlogEdit,
        meta: { breadcrumb: 'Créer' }
      },
      {
        path: 'blog/:slug',
        name: 'adminBlogShow',
        component: AdminBlogShow,
        props: true,
        meta: { breadcrumb: 'Détail' }
      },
      {
        path: 'blog/:slug/edit',
        name: 'adminBlogEdit',
        component: AdminBlogEdit,
        props: true,
        meta: { breadcrumb: 'Modifier' }
      },
      {
        path: 'profile',
        name: 'adminProfile',
        component: ProfileView,
        meta: { breadcrumb: 'Mon profil' }
      },
      {
        path: 'profile/edit',
        name: 'adminProfileEdit',
        component: EditProfile,
        meta: { breadcrumb: 'Modifier' }
      },
    ]
  },
  {
    path: '/coach',
    component: Coach,
    meta: { requiresAuth: true, requiresRole: 'coach' },
    children: [
      {
        path: 'dashboard',
        name: 'coachDashboard',
        component: DashboardCoach
      },
      {
        path: 'training',
        name: 'coachTraining',
        component: TrainingCoach
      },
      {
        path: 'training/:id',
        name: 'coachTrainingItem',
        component: TrainingItemCoach,
        props: true
      },
      {
        path: 'challenger',
        name: 'coachChallenger',
        component: ChallengerCoach,
      },
      {
        path: 'challenger/:id',
        name: 'coachChallengerItem',
        component: ChallengerItemCoach,
        props: true
      },
      {
        path: 'seance',
        name: 'coachSeance',
        component: SeanceCoach,
      },
      {
        path: 'seance/:id',
        name: 'coachSeanceItem',
        component: SeanceItemCoach,
        props: true
      },
      {
        path: 'seance/:id/add',
        name: 'coachSeanceItemAdd',
        component: SeanceItemAddCoach,
        props: true
      },
      {
        path: 'seance/:id/edit',
        name: 'coachSeanceItemEdit',
        component: SeanceItemEditCoach,
        props: true
      },
      {
        path: 'profile',
        name: 'coachProfile',
        component: ProfileView
      },
      {
        path: 'profile/edit',
        name: 'coachProfileEdit',
        component: EditProfile
      },
    ]
  },
  {
    path: '/challenger',
    component: Challenger,
    meta: { requiresAuth: true, requiresRole: 'challenger', breadcrumb: 'Challenger' },
    children: [
      {
        path: 'dashboard',
        name: 'challengerDashboard',
        component: DashboardChallenger,
        meta: { breadcrumb: 'Tableau de bord' }
      },
      {
        path: 'seance',
        name: 'challengerSeance',
        component: SeanceChallenger,
        meta: { breadcrumb: 'Séances' },
      },
      {
        path: 'produit',
        name: 'challengerProduit',
        component: ProductChallenger,
        meta: { breadcrumb: 'Produits' },
      },
      {
        path: 'produit/:id',
        name: 'challengerProduitShow',
        component: ProductShowChallenger,
        props: true,
        meta: { breadcrumb: 'Détail' }
      },
      {
        path: 'exercice',
        name: 'exoProduit',
        component: ExoChallenger,
        meta: { breadcrumb: 'Exercices' },
      },
      {
        path: 'exercice/:id',
        name: 'challengerExerciceShow',
        component: ExoShowChallenger,
        props: true,
        meta: { breadcrumb: 'Détail' }
      },
      {
        path: 'blog',
        name: 'challengerBlog',
        component: ChallengerBlogIndex,
        meta: { breadcrumb: 'Blogs' }
      },
      {
        path: 'blog/:slug',
        name: 'challengerBlogShow',
        component: ChallengerBlogShow,
        props: true,
        meta: { breadcrumb: 'Détail' }
      },
      {
        path: 'profile',
        name: 'challengerProfile',
        component: ProfileView,
        meta: { breadcrumb: 'Mon profil' }
      },
      {
        path: 'profile/edit',
        name: 'challengerProfileEdit',
        component: EditProfile,
        meta: { breadcrumb: 'Modifier' }
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

// Guards de navigation
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialiser les données depuis localStorage au démarrage
  authStore.initFromStorage()
  
  // Vérifier si la route nécessite d'être déconnecté (login/register)
  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      // Si déjà connecté, rediriger vers le dashboard approprié
      return next(authStore.getDashboardRoute())
    }
    return next()
  }
  
  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Si pas connecté, rediriger vers login
      return next('/login')
    }
    
    // Vérifier le rôle requis
    if (to.meta.requiresRole) {
      const requiredRole = to.meta.requiresRole as string
      if (authStore.role !== requiredRole) {
        // Si le rôle ne correspond pas, rediriger vers le dashboard approprié
        return next(authStore.getDashboardRoute())
      }
    }
  }
  
  // Redirection de la route racine
  if (to.path === '/') {
    if (authStore.isAuthenticated) {
      return next(authStore.getDashboardRoute())
    } else {
      return next('/login')
    }
  }
  
  next()
})

export default router
