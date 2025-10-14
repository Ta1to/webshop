<template>
  <div id="app">
    <AppHeader 
      :current-user="currentUser"
      :cart-item-count="cartItemCount"
      :is-admin="isAdmin"
      @logout="handleLogout"
    />
    
    <main class="main-content">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { observeAuthState, logoutUser } from './services/auth'
import { getUserDocument } from './services/db'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  },
  setup() {
  const currentUser = ref(null)
  const cartItemCount = ref(0)
  const isAdmin = ref(false)
    const router = useRouter()

    const checkAdminStatus = async (user) => {
      if (!user) {
        isAdmin.value = false
        return
      }
      
      try {
        const userDoc = await getUserDocument(user.uid)
        if (userDoc.success && userDoc.data) {
          isAdmin.value = userDoc.data.isAdmin()
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        isAdmin.value = false
      }
    }

    onMounted(() => {
      observeAuthState(async (user) => {
        currentUser.value = user
        await checkAdminStatus(user)
      })
      
    })

    const handleLogout = async () => {
      const result = await logoutUser()
      if (result.success) {
        currentUser.value = null
        cartItemCount.value = 0
        isAdmin.value = false
        router.push('/login')
      }
    }

    return {
      currentUser,
      cartItemCount,
      isAdmin,
      handleLogout
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background-color: var(--gray-50);
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style>
