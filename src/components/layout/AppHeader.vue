<template>
  <!-- Modern header with top bar and navigation tabs -->
  <header class="app-header">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="top-bar-container">
        <!-- Brand/Logo -->
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <span class="brand-text">evaris</span>
          </router-link>
        </div>

        <!-- Search Bar -->
        <div class="search-container">
          <div class="search-bar">
            <Search class="search-icon" :size="20" />
            <input 
              type="text" 
              v-model="searchQuery"
              @input="handleSearch"
              placeholder="Produkte suchen..."
              class="search-input"
            />
          </div>
        </div>

        <!-- Mobile Menu Toggle -->
        <button 
          class="mobile-menu-toggle"
          @click="toggleMobileMenu"
          :class="{ active: isMobileMenuOpen }"
          aria-label="Toggle navigation menu"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <!-- Right Side Actions -->
        <div class="top-actions" :class="{ active: isMobileMenuOpen }">
          <!-- Cart Icon -->
          <router-link 
            to="/cart" 
            class="cart-link"
            @click="closeMobileMenu"
          >
            <ShoppingCart class="cart-icon" :size="28" />
            <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
          </router-link>

          <!-- User Profile -->
          <div class="user-menu">
            <div class="user-info">
              <User class="user-avatar" :size="28" />
              <div class="user-text">
                <span class="user-greeting">Hallo</span>
                <span class="user-name">{{ getUserDisplayName }}</span>
              </div>
            </div>
            <div class="user-dropdown">
              <template v-if="currentUser">
                <router-link to="/profile" class="dropdown-item" @click="closeMobileMenu">
                  <User class="dropdown-icon" :size="16" />
                  Profil
                </router-link>
                <router-link to="/orders" class="dropdown-item" @click="closeMobileMenu">
                  <Package class="dropdown-icon" :size="16" />
                  Bestellungen
                </router-link>
                <router-link v-if="isAdmin" to="/admin" class="dropdown-item admin-item" @click="closeMobileMenu">
                  <Shield class="dropdown-icon" :size="16" />
                  Admin Dashboard
                </router-link>
                <button @click="handleLogout" class="dropdown-item logout-item">
                  <LogOut class="dropdown-icon" :size="16" />
                  Abmelden
                </button>
              </template>
              <template v-else>
                <router-link to="/login" class="dropdown-item" @click="closeMobileMenu">
                  Anmelden
                </router-link>
                <router-link to="/register" class="dropdown-item" @click="closeMobileMenu">
                  Registrieren
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="nav-tabs" :class="{ active: isMobileMenuOpen }">
      <div class="nav-tabs-container">
        <router-link 
          to="/" 
          class="nav-tab"
          @click="closeMobileMenu"
        >
          <Home class="nav-icon" :size="18" />
          Home
        </router-link>
        
        <router-link 
          to="/categories" 
          class="nav-tab"
          @click="closeMobileMenu"
        >
          <LayoutGrid class="nav-icon" :size="18" />
          Alle Kategorien
        </router-link>

        <!-- Individual Categories -->
        <router-link 
          v-for="category in categories" 
          :key="category.id"
          :to="`/category/${category.slug}`" 
          class="nav-tab"
          @click="closeMobileMenu"
        >
          <component :is="getIcon(category.icon)" class="nav-icon" :size="18" />
          {{ category.name }}
        </router-link>
      </div>
    </nav>
  </header>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, ShoppingBag, ShoppingCart, User, Package, LogOut, Search, LayoutGrid, Laptop, Shirt, BookOpen, Dumbbell, Shield } from 'lucide-vue-next'
import { getAllDocuments } from '@/services/db'

export default {
  name: 'AppHeader',
  components: {
    Home,
    ShoppingBag,
    ShoppingCart,
    User,
    Package,
    LogOut,
    Search,
    LayoutGrid,
    Laptop,
    Shirt,
    BookOpen,
    Dumbbell,
    Shield
  },
  props: {
    currentUser: {
      type: Object,
      default: null
    },
    cartItemCount: {
      type: Number,
      default: 0
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  emits: ['logout', 'search'],
  setup(props, { emit }) {
    const router = useRouter()
    const isMobileMenuOpen = ref(false)
    const searchQuery = ref('')
    const categories = ref([])

    // Load categories from Firestore
    onMounted(async () => {
      const result = await getAllDocuments('categories')
      if (result.success) {
        categories.value = result.data
      }
    })

    const getUserDisplayName = computed(() => {
      if (!props.currentUser) return 'Konto'
      return props.currentUser.displayName || props.currentUser.email?.split('@')[0] || 'Konto'
    })

    const getIcon = (iconName) => {
      const icons = {
        'Laptop': Laptop,
        'Shirt': Shirt,
        'BookOpen': BookOpen,
        'Dumbbell': Dumbbell,
        'Home': Home
      }
      return icons[iconName] || Home
    }

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
    }

    const handleLogout = () => {
      closeMobileMenu()
      emit('logout')
    }

    const handleSearch = () => {
      emit('search', searchQuery.value)
    }

    return {
      categories,
      isMobileMenuOpen,
      searchQuery,
      getUserDisplayName,
      getIcon,
      toggleMobileMenu,
      closeMobileMenu,
      handleLogout,
      handleSearch
    }
  }
}
</script>

<style>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--white);
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Top Bar */
.top-bar {
  background-color: var(--white);
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--gray-200);
}

.top-bar-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

/* Brand */
.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.brand-link:hover {
  border-color: var(--primary-green);
}

.brand-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-green);
}

/* Search Container */
.search-container {
  flex: 1;
  max-width: 600px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--white);
  border: 2px solid var(--gray-300);
  border-radius: 6px;
  padding: 0 0.75rem;
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px var(--primary-green-lighter);
}

.search-icon {
  color: var(--gray-500);
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  color: var(--gray-700);
  background: transparent;
  box-shadow: none;
}

.search-input:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

.search-input::placeholder {
  color: var(--gray-400);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background-color: var(--gray-700);
  margin: 3px 0;
  transition: 0.3s;
  border-radius: 3px;
}

.mobile-menu-toggle.active .hamburger-line:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 6px);
}

.mobile-menu-toggle.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active .hamburger-line:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -6px);
}

/* Top Actions */
.top-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Cart Link */
.cart-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  border-radius: 8px;
  color: var(--gray-700);
  text-decoration: none;
  transition: all 0.3s ease;
}

.cart-link:hover {
  border-color: var(--primary-green);
  background-color: var(--primary-green-lighter);
  color: var(--primary-green);
}

.cart-icon {
  display: flex;
  align-items: center;
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--error);
  color: var(--white);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
}

/* User Menu */
.user-menu {
  position: relative;
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  border-color: var(--primary-green);
  background-color: var(--primary-green-lighter);
}

.user-avatar {
  display: flex;
  align-items: center;
  color: var(--gray-700);
}

.user-info:hover .user-avatar {
  color: var(--primary-green);
}

.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.user-greeting {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.user-name {
  font-size: 0.95rem;
  color: var(--gray-700);
  font-weight: 600;
}

.user-info:hover .user-name {
  color: var(--primary-green);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 1000;
  margin-top: 0.5rem;
}

.user-menu:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--gray-700);
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 0.95rem;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: var(--primary-green-lighter);
  color: var(--primary-green);
}

.dropdown-item:first-child {
  border-radius: 8px 8px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 8px 8px;
}

.logout-item {
  color: var(--error);
}

.logout-item:hover {
  background-color: var(--error-light);
}

.admin-item {
  color: var(--primary-green);
  font-weight: 600;
}

.admin-item:hover {
  background-color: var(--primary-green-lighter);
}

.dropdown-icon {
  display: flex;
  align-items: center;
}

/* Navigation Tabs */
.nav-tabs {
  background-color: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.nav-tabs-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 0;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-tab:hover {
  color: var(--primary-green);
  background-color: var(--primary-green-lighter);
}

.nav-tab.router-link-active {
  color: var(--primary-green);
  border-bottom-color: var(--primary-green);
}

.nav-icon {
  display: flex;
  align-items: center;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .top-bar-container {
    padding: 0.5rem 1rem;
  }

  .search-container {
    order: 4;
    width: 100%;
    max-width: 100%;
    margin-top: 1rem;
  }

  .top-actions {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background-color: var(--white);
    flex-direction: column;
    padding: 1rem;
    transform: translateX(100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    border-top: 1px solid var(--gray-200);
    gap: 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .top-actions.active {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
  }

  .cart-link,
  .user-info {
    width: 100%;
    justify-content: flex-start;
    border: none;
    border-bottom: 1px solid var(--gray-200);
  }

  .user-dropdown {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
    margin-top: 0;
  }

  .dropdown-item {
    border-bottom: 1px solid var(--gray-200);
  }

  .nav-tabs {
    transform: translateX(100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nav-tabs.active {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-tabs-container {
    flex-direction: column;
    padding: 0;
    gap: 0;
  }

  .nav-tab {
    width: 100%;
    justify-content: flex-start;
    border: none;
    border-bottom: 1px solid var(--gray-200);
  }

  .user-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .brand-text {
    font-size: 1.5rem;
  }
}
</style>