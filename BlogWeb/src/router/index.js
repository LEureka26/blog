import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/articles'
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('../views/ArticleList.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue')
  },
  {
    path: '/articles/create',
    name: 'CreateArticle',
    component: () => import('../views/CreateArticle.vue')
  },
  {
    path: '/categories',
    name: 'CategoryList',
    component: () => import('../views/CategoryList.vue')
  },
  {
    path: '/articles/:id',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetail.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router