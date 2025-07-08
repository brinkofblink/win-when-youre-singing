import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Jukebox from '../views/Jukebox.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/jukebox',
      name: 'Jukebox',
      component: Jukebox
    }
  ],
})

export default router
