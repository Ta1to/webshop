import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ProfileView from '../views/auth/ProfileView.vue'
import OrdersView from '../views/auth/OrdersView.vue'
import CategoriesView from '../views/shop/CategoriesView.vue'
import CategoryView from '../views/shop/CategoryView.vue'
import ProductView from '../views/shop/ProductView.vue'
import CartView from '../views/shop/CartView.vue'
import CheckoutView from '../views/shop/CheckoutView.vue'
import CheckoutSuccessView from '../views/shop/CheckoutSuccessView.vue'
import AdminView from '../views/admin/AdminView.vue'
import AdminProductsView from '../views/admin/AdminProductsView.vue'
import AdminCategoriesView from '../views/admin/AdminCategoriesView.vue'
import AdminUsersView from '../views/admin/AdminUsersView.vue'
import AdminOrdersView from '../views/admin/AdminOrdersView.vue'
import AdminOffersView from '../views/admin/AdminOffersView.vue'
import { getCurrentUser } from '../services/auth'
import ContactView from '../views/info/ContactView.vue'
import FAQView from '../views/info/FAQView.vue'
import ShippingView from '../views/legal/ShippingView.vue'
import ReturnsView from '../views/legal/ReturnsView.vue'
import SizeGuideView from '../views/legal/SizeGuideView.vue'
import PrivacyView from '../views/legal/PrivacyView.vue'
import TermsView from '../views/legal/TermsView.vue'
import ImprintView from '../views/legal/ImprintView.vue'
import { getUserDocument } from '../services/db'
import WishlistView from '../views/auth/WishlistView.vue'
import NotFoundView from '../views/NotFoundView.vue'

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
    {
        path: '/cart',
        name: 'Cart',
        component: CartView
    },
    {
        path: '/checkout',
        name: 'Checkout',
        component: CheckoutView
    },
    {
        path: '/checkout/success',
        name: 'CheckoutSuccess',
        component: CheckoutSuccessView
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
        path: '/profile',
        name: 'Profile',
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: AdminView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/products',
        name: 'AdminProducts',
        component: AdminProductsView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/categories',
        name: 'AdminCategories',
        component: AdminCategoriesView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/users',
        name: 'AdminUsers',
        component: AdminUsersView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/orders',
        name: 'AdminOrders',
        component: AdminOrdersView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/offers',
        name: 'AdminOffers',
        component: AdminOffersView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/orders',
        name: 'Orders',
        component: OrdersView,
        meta: { requiresAuth: true }
    },
    {
        path: '/wishlist',
        name: 'Wishlist',
        component: WishlistView,
        meta: { requiresAuth: true }
    },
    {
        path: '/contact',
        name: 'Contact',
        component: ContactView
    },
    {
        path: '/faq',
        name: 'FAQ',
        component: FAQView
    },
    {
        path: '/shipping',
        name: 'Shipping',
        component: ShippingView
    },
    {
        path: '/returns',
        name: 'Returns',
        component: ReturnsView
    },
    {
        path: '/size-guide',
        name: 'SizeGuide',
        component: SizeGuideView
    },
    {
        path: '/privacy',
        name: 'Privacy',
        component: PrivacyView
    },
    {
        path: '/terms',
        name: 'Terms',
        component: TermsView
    },
    {
        path: '/imprint',
        name: 'Imprint',
        component: ImprintView
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
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundView
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard for protected routes
router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
    const currentUser = getCurrentUser()

    if (requiresAuth && !currentUser) {
        next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && currentUser) {
        next('/')
    } else if (requiresAdmin) {
        // Check if user has admin role
        try {
            const userDoc = await getUserDocument(currentUser.uid)
            if (userDoc.success && userDoc.data.isAdmin()) {
                next()
            } else {
                // Not an admin, redirect to home
                next('/')
            }
        } catch (error) {
            console.error('Error checking admin status:', error)
            next('/')
        }
    } else {
        next()
    }
})

export default router