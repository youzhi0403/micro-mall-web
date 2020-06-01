import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [{
      path: 'home',
      name: 'Home',
      component: () => import('@/views/home/index'),
      meta: { title: '首页', icon: 'el-icon-menu', affix: true }
    }]
  },
  {
    path: '/gms',
    component: Layout,
    redirect: '/gms/good',
    name: 'Gms',
    meta: {
      title: '商品',
      icon: 'el-icon-tickets'
    },
    children: [
      {
        path: 'good',
        name: 'Good',
        component: () => import('@/views/gms/good/index'),
        meta: { title: '商品管理', icon: 'el-icon-tickets' }
      },
      {
        path: 'classification',
        name: 'Classification',
        component: () => import('@/views/gms/classification/index'),
        meta: { title: '分类管理', icon: 'el-icon-printer' }
      }
    ]

  },
  {
    path: '/ums',
    component: Layout,
    redirect: '/ums/accountRecord',
    name: 'Ums',
    meta: {
      title: '用户',
      icon: 'el-icon-location'
    },
    children: [
      {
        path: 'accountRecord',
        name: 'AccountRecord',
        component: () => import('@/views/ums/account-record/index'),
        meta: { title: '支入支出明细管理', icon: 'el-icon-tickets' }
      },
      {
        path: 'address',
        name: 'Address',
        component: () => import('@/views/ums/address/index'),
        meta: { title: '用户地址管理', icon: 'el-icon-document' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/ums/user/index'),
        meta: { title: '商城用户管理', icon: 'el-icon-goods' }
      }
    ]
  },
  {
    path: '/ams',
    component: Layout,
    redirect: '/ams/admin',
    name: 'Ams',
    meta: {
      title: '系统',
      icon: 'el-icon-setting'
    },
    children: [
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/ams/admin/index'),
        meta: { title: '用户管理', icon: 'el-icon-news' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/ams/role/index'),
        meta: { title: '角色管理', icon: 'el-icon-goods' }
      },
      {
        path: 'permission',
        name: 'Permission',
        component: () => import('@/views/ams/permission/index'),
        meta: { title: '权限管理', icon: 'el-icon-service' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

export const asyncRoutes = []

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
