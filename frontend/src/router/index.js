import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Background from "@/components/arcade/Background.vue";

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  // Vous pouvez ajouter d'autres routes plus tard
  // {
  //   path: '/game',
  //   name: 'Game',
  //   component: () => import('@/views/GameView.vue')
  // }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
