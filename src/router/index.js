import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import CategoryView from '../views/CategoryView.vue'
import ProductView from '../views/ProductView.vue'
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
    {
        path: '/categories',
        name: 'Categories',
        component: CategoriesView
    },
    {
        path: '/category/:slug',
        name: 'Category',
        component: CategoryView
    },
    {
        path: '/product/:id',
        name: 'Product',
        component: ProductView
    },
    // Placeholder routes for navigation links
    // These can be replaced with real views later
    {
        path: '/products',
        name: 'Products',
        component: () => import('../views/PlaceholderView.vue'),
    },
    {
        path: '/deals',
        name: 'Deals',
        component: () => import('../views/PlaceholderView.vue'),
    },
    {
        path: '/new-arrivals',
        name: 'NewArrivals',
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
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {
        path: '/orders',
        name: 'Orders',
        component: () => import('../views/PlaceholderView.vue'),
    },
    {
        path: '/wishlist',
        name: 'Wishlist',
        component: () => import('../views/PlaceholderView.vue'),
    },
    {
        path: '/contact',
        name: 'Contact',
        component: () => import('../views/PlaceholderView.vue')
    },
    {
        path: '/faq',
        name: 'FAQ',
        component: () => import('../views/PlaceholderView.vue')
    },
    {
        path: '/shipping',
        name: 'Shipping',
        component: () => import('../views/PlaceholderView.vue')
    },
    {
        path: '/returns',
        name: 'Returns',
        component: () => import('../views/PlaceholderView.vue')
    },
    {
        path: '/size-guide',
        name: 'SizeGuide',
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
    },
    {
        path: '/sitemap',
        name: 'Sitemap',
        component: () => import('../views/PlaceholderView.vue')
    },
    {
        path: '/cookies',
        name: 'Cookies',
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