import { createRouter , createWebHashHistory } from 'vue-router';
const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'ProjectInfo',
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'readAlignment',
        name:'ReadAlignment',
        component: () => import('@/views/ReadPage.vue')
      },
      {
        path: 'visualization',
        name:'Visualization',
        component: () => import('@/views/VisualizationPage.vue')
      },
      {
        path: 'differenceExpression',
        name:'DifferenceExpression',
        component: () => import('@/views/DifferenceExpression.vue')
      },{
        path:'workflowInfo',
        name:'workflowInfo',
        component: () => import('@/views/WorkflowInfo.vue')
      },{
        path:'/:catchAll(.*)',
        name:'notfound',
        component:()=>import('@/views/Notfound.vue')
      },
    ],
  },
]
const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history:createWebHashHistory(),
  // createWebHashHistory
  // base: process.env.BASE_URL,
  routes
})

export default router
