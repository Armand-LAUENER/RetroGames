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
    // On ajoute le paramètre dynamique :gameId
    path: '/games/:gameId',
    name: 'Game',
    component: GameView,
    props: true // Permet de passer gameId comme une prop
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router