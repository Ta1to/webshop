<template>
  <div id="app">
    <nav v-if="currentUser">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/">evaris</router-link>
        </div>
        <div class="nav-links">
          <router-link to="/">Home</router-link>
        </div>
        <div class="user-info">
          <span class="user-name">{{ currentUser.displayName || currentUser.email }}</span>
          <button @click="handleLogout" class="logout-btn">Abmelden</button>
        </div>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { observeAuthState, logoutUser } from './services/auth'

export default {
  name: 'App',
  setup() {
    const currentUser = ref(null)
    const router = useRouter()

    onMounted(() => {
      observeAuthState((user) => {
        currentUser.value = user
      })
    })

    const handleLogout = async () => {
      const result = await logoutUser()
      if (result.success) {
        router.push('/login')
      }
    }

    return {
      currentUser,
      handleLogout
    }
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  background-color: var(--gray-50);
}

nav {
  background-color: var(--white);
  border-bottom: 1px solid var(--gray-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-green);
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-brand a:hover {
  color: var(--primary-green-dark);
}

.nav-links {
  display: flex;
  gap: 2rem;
  flex: 1;
}

.nav-links a {
  color: var(--gray-700);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
}

.nav-links a:hover {
  color: var(--primary-green);
}

.nav-links a.router-link-active {
  color: var(--primary-green);
}

.nav-links a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -1.25rem;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-green);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: var(--gray-700);
  font-weight: 500;
  font-size: 0.95rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: var(--white);
  color: var(--error);
  border: 1px solid var(--error);
  font-size: 0.9rem;
}

.logout-btn:hover {
  background-color: var(--error);
  color: var(--white);
  transform: none;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: center;
  }
  
  .user-info {
    width: 100%;
    justify-content: center;
  }
  
  .user-name {
    display: none;
  }
}
</style>
