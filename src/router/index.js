import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/token'
import { addBreadcrumb } from '@/utils/breadcrumbState'
import MainLayout from '@/layout/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '商家登录' }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '商家主页' }
      },
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/Product.vue'),
        meta: { title: '商品管理' }
      }
    ]
  },
  {
    path: '/merchant-apply',
    name: 'MerchantApply',
    component: () => import('@/views/MerchantApply.vue'),
    meta: { title: '商家入驻申请' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = '智慧商品管理系统';
  const token = getToken()
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    if (to.path === '/login' && token) {
      next({ path: '/' })
    } else {
      next()
    }
  }
})

// 后置路由守卫更新面包屑
router.afterEach((to) => {
  addBreadcrumb(to)
})

export default router
