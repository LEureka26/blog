import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/articleslist'
  },
  {
    path: '/articleslist',
    name: 'ArticleList',
    component: () => import('../views/ArticleList.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/articles/create',
    name: 'CreateArticle',
    component: () => import('../views/CreateArticle.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'CategoryList',
    component: () => import('../views/CategoryList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/articles/:id',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    return '/login'
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    return '/articleslist'
  } else {
    return true
  }
})

export default router