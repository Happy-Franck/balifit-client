// Composables
import { createRouter, createWebHistory } from 'vue-router'
//Not connected
import NotConnected from '../layouts/NotConnected.vue'
import Login from '../views/Auth/Login.vue'
import Register from '../views/Auth/Register.vue'
//admin
import Admin from '../layouts/Admin.vue'
import DashboardAdmin from '../views/Admin/DashboardAdmin.vue'
import CategoryAdmin from '../views/Admin/Category/Index.vue'
import UserAdmin from '../views/Admin/User/Index.vue'
import UserItemAdmin from '../views/Admin/User/Show.vue'
import UserSeanceAdmin from '../views/Admin/Seance/Show.vue'
import ProductAdmin from '../views/Admin/Product/Index.vue'
import ProductItemAdmin from '../views/Admin/Product/Show.vue'
import ProductCreateAdmin from '../views/Admin/Product/Create.vue'
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
import ExoChallenger from '../views/Challenger/Exercice/Index.vue'
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
        component: Login
      },
      {
        path: 'register',
        name: 'register',
        component: Register
      },
    ]
  },
  {
    path: '/admin',
    component: Admin,
    children: [
      {
        path: 'dashboard',
        name: 'adminDashboard',
        component: DashboardAdmin
      },
      {
        path: 'category',
        name: 'adminCategory',
        component: CategoryAdmin
      },
      {
        path: 'user',
        name: 'adminUser',
        component: UserAdmin
      },
      {
        path: 'user/:id',
        name: 'userItem',
        component: UserItemAdmin,
        props: true,
      },
      {
        path: 'user/:id/seance/:idSeance',
        name: 'userSeance',
        component: UserSeanceAdmin,
        props: true,
      },
      {
        path: 'product',
        name: 'adminProduct',
        component: ProductAdmin
      },
      {
        path: 'product/:id',
        name: 'productItem',
        component: ProductItemAdmin,
        props: true,
      },
      {
        path: 'product/create',
        name: 'adminProductCreate',
        component: ProductCreateAdmin
      },
      {
        path: 'profile',
        name: 'adminProfile',
        component: ProfileView
      },
      {
        path: 'profile/edit',
        name: 'adminProfileEdit',
        component: EditProfile
      },
    ]
  },
  {
    path: '/coach',
    component: Coach,
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
    children: [
      {
        path: 'dashboard',
        name: 'challengerDashboard',
        component: DashboardChallenger
      },
      {
        path: 'seance',
        name: 'challengerSeance',
        component: SeanceChallenger,
      },
      {
        path: 'produit',
        name: 'challengerProduit',
        component: ProductChallenger,
      },
      {
        path: 'exercice',
        name: 'exoProduit',
        component: ExoChallenger,
      },
      {
        path: 'profile',
        name: 'challengerProfile',
        component: ProfileView
      },
      {
        path: 'profile/edit',
        name: 'challengerProfileEdit',
        component: EditProfile
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
