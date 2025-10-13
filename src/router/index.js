import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import { getCurrentUser } from '../services/auth'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView
    },
    // Placeholder routes for navigation links
    // These can be replaced with real views later
    {
        path: '/products',
        name: 'Products',
        component: () => import('../views/PlaceholderView.vue'),
    },
    {
        path: '/cart',
        name: 'Cart',
        component: () => import('../views/PlaceholderView.vue'),
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/PlaceholderView.vue'),
    },
    {
        path: '/orders',
        name: 'Orders',
        component: () => import('../views/PlaceholderView.vue'),
    },
    {
        path: '/contact',
        name: 'Contact',
        component: () => import('../views/PlaceholderView.vue')
    },
    {
        path: '/privacy',
        name: 'Privacy',
        component: () => import('../views/PlaceholderView.vue')
    },
    {
        path: '/terms',
        name: 'Terms',
        component: () => import('../views/PlaceholderView.vue')
    },
    {
        path: '/imprint',
        name: 'Imprint',
        component: () => import('../views/PlaceholderView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const currentUser = getCurrentUser()

    if (requiresAuth && !currentUser) {
        next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && currentUser) {
        next('/')
    } else {
        next()
    }
})

export default router