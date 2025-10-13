<template>
  <!-- Modular header component with full width and responsive design -->
  <header class="app-header">
    <nav class="navbar">
      <div class="nav-container">
        <!-- Brand/Logo -->
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <span class="brand-text">evaris</span>
          </router-link>
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

        <!-- Navigation Links -->
        <div class="nav-links" :class="{ active: isMobileMenuOpen }">
          <router-link 
            to="/" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            <Home class="nav-icon" :size="18" />
            Home
          </router-link>
          
          <router-link 
            to="/products" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            <ShoppingBag class="nav-icon" :size="18" />
            Produkte
          </router-link>
          
          <router-link 
            to="/cart" 
            class="nav-link cart-link"
            @click="closeMobileMenu"
          >
            <ShoppingCart class="nav-icon" :size="18" />
            Warenkorb
            <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
          </router-link>
        </div>

        <!-- User Actions -->
        <div class="user-actions" :class="{ active: isMobileMenuOpen }">
          <div v-if="currentUser" class="user-menu">
            <div class="user-info">
              <User class="user-avatar" :size="20" />
              <span class="user-name">{{ getUserDisplayName }}</span>
            </div>
            <div class="user-dropdown">
              <router-link to="/profile" class="dropdown-item" @click="closeMobileMenu">
                <User class="dropdown-icon" :size="16" />
                Profil
              </router-link>
              <router-link to="/orders" class="dropdown-item" @click="closeMobileMenu">
                <Package class="dropdown-icon" :size="16" />
                Bestellungen
              </router-link>
              <button @click="handleLogout" class="dropdown-item logout-item">
                <LogOut class="dropdown-icon" :size="16" />
                Abmelden
              </button>
            </div>
          </div>
          
          <div v-else class="auth-buttons">
            <router-link to="/login" class="auth-button login-btn" @click="closeMobileMenu">
              Anmelden
            </router-link>
            <router-link to="/register" class="auth-button register-btn" @click="closeMobileMenu">
              Registrieren
            </router-link>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Home, ShoppingBag, ShoppingCart, User, Package, LogOut } from 'lucide-vue-next'

export default {
  name: 'AppHeader',
  components: {
    Home,
    ShoppingBag,
    ShoppingCart,
    User,
    Package,
    LogOut
  },
  props: {
    currentUser: {
      type: Object,
      default: null
    },
    cartItemCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['logout'],
  setup(props, { emit }) {
    const router = useRouter()
    const isMobileMenuOpen = ref(false)

    const getUserDisplayName = computed(() => {
      if (!props.currentUser) return ''
      return props.currentUser.displayName || props.currentUser.email?.split('@')[0] || 'Benutzer'
    })

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

    return {
      isMobileMenuOpen,
      getUserDisplayName,
      toggleMobileMenu,
      closeMobileMenu,
      handleLogout
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
  border-bottom: 1px solid var(--gray-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

.navbar {
  background-color: var(--white);
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

/* Brand */
.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-green);
  transition: color 0.3s ease;
}

.brand-link:hover .brand-text {
  color: var(--primary-green-dark);
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

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--primary-green);
  background-color: var(--primary-green-lighter);
}

.nav-link.router-link-active {
  color: var(--primary-green);
  background-color: var(--primary-green-lighter);
}

.nav-icon {
  display: flex;
  align-items: center;
}

.cart-link {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--error);
  color: var(--white);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
}

/* User Actions */
.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

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
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: var(--gray-100);
}

.user-avatar {
  display: flex;
  align-items: center;
}

.user-name {
  color: var(--gray-700);
  font-weight: 500;
  font-size: 0.95rem;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
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
  transition: background-color 0.3s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 0.95rem;
}

.dropdown-item:hover {
  background-color: var(--gray-100);
}

.dropdown-item:first-child {
  border-radius: 8px 8px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 8px 8px;
}

.logout-item {
  color: var(--error);
  cursor: pointer;
}

.logout-item:hover {
  background-color: var(--error-light);
}

.dropdown-icon {
  display: flex;
  align-items: center;
}

/* Auth Buttons */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.login-btn {
  color: var(--primary-green);
  border-color: var(--primary-green);
}

.login-btn:hover {
  background-color: var(--primary-green);
  color: var(--white);
}

.register-btn {
  background-color: var(--primary-green);
  color: var(--white);
  border-color: var(--primary-green);
}

.register-btn:hover {
  background-color: var(--primary-green-dark);
  border-color: var(--primary-green-dark);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .nav-links,
  .user-actions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--white);
    border-top: 1px solid var(--gray-200);
    flex-direction: column;
    padding: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nav-links.active,
  .user-actions.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-links {
    gap: 0.5rem;
    border-bottom: 1px solid var(--gray-200);
    margin-bottom: 1rem;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 1rem;
  }

  .user-actions {
    gap: 0.5rem;
  }

  .user-menu {
    width: 100%;
  }

  .user-info {
    width: 100%;
    justify-content: center;
    padding: 1rem;
  }

  .user-dropdown {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    margin-top: 0.5rem;
  }

  .auth-buttons {
    width: 100%;
    flex-direction: column;
  }

  .auth-button {
    width: 100%;
    text-align: center;
    padding: 1rem;
  }

  .user-name {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 1rem;
  }
  
  .brand-text {
    font-size: 1.5rem;
  }
}
</style>