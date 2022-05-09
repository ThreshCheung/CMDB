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
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
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
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },
  {
    path:'/databases',
    component:Layout,
    name:'Databases',
    meta:{title:'数据库管理',icon:'el-icon-coin'},
    children:[
      {
        path:'databasesList',
        name:'DatabasesList',
        component:()=>import('@/views/databases/databasesList'),
        meta:{title:'数据库列表'}
      },
      {
        path:'rollbackLog',
        name:'rollbackLog',
        component:()=>import('@/views/databases/rollbackLog'),
        meta:{title:'查询回档记录'}
      }
    ]
  },

  {
    path: '/cdn',
    component: Layout,
    meta:{title:'CDN',icon:'el-icon-refresh'},
    children: [
      {
        path: 'cdnTask',
        name: 'cdnTask',
        component: () => import('@/views/cdn/cdnTask'),
        meta: { title: '刷新', icon: 'form' }
      },
      {
        path: 'cdnDiagnose',
        name: 'cdnDiagnose',
        component: () => import('@/views/cdn/cdnDiagnose'),
        meta: { title: '诊断', icon: 'form' }
      },
    ]
  },

  {
    path: '/cmdb',
    component: Layout,
    meta:{title:'资产管理',icon:'el-icon-s-platform'},
    children: [
      {
        path: 'domain',
        name: 'domain',
        component: () => import('@/views/cmdb/domain'),
        meta: { title: '域名', icon: 'table' }
      },
      {
        path: 'serverList',
        name: 'serverList',
        component: () => import('@/views/cmdb/serverList'),
        meta: { title: '服务器列表', icon: 'table' }
      },
    ]
  },
  {
    path: '/operation',
    component: Layout,
    meta:{title:'操作台',icon:'el-icon-s-platform'},
    children: [
      {
        path: 'webShell',
        name: 'webShell',
        component: () => import('@/views/operation/webShell'),
        meta: { title: 'webShell', icon: 'table' }
      },
      {
        path: 'sqlQuery',
        name: 'sqlQuery',
        component: () => import('@/views/operation/sqlQuery'),
        meta: { title: 'SQL查询', icon: 'table' }
      },
      {
        path: 'webShellTest',
        name: 'webShellTest',
        component: () => import('@/views/operation/webShellTest'),
        meta: { title: 'webShellTest', icon: 'table' }
      },
    ]
  },




  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

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
