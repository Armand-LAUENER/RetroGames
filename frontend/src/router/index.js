import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GameView from '@/views/GameView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    // Le :gameId est indispensable ici
    path: '/game/:gameId',
    name: 'Game',
    component: GameView,
    props: true // Permet de passer gameId comme une "prop" au composant
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router