<template>
  <div id="app">
    <AppHeader 
      :current-user="currentUser"
      :cart-item-count="cartItemCount"
      @logout="handleLogout"
    />
    
    <main class="main-content">
      <router-view />
    </main>

    <AppFooter
      :user="userProfile"
      :newsletter-loading="newsletterLoading"
      @newsletter-toggle="handleNewsletterToggle"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { observeAuthState, logoutUser } from './services/auth'
import { getUserDocument, updateUserDocument, createUserDocument } from './services/db'
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
    const userProfile = ref(null)
    const newsletterLoading = ref(false)
    const router = useRouter()

    const loadUserProfile = async (uid) => {
      const result = await getUserDocument(uid)
      if (result.success) {
        userProfile.value = result.data
        return
      }

      if (currentUser.value) {
        await createUserDocument(uid, {
          email: currentUser.value.email || '',
          displayName: currentUser.value.displayName || '',
          photoURL: currentUser.value.photoURL || '',
          role: 'user',
          newsletter: false
        })
        const retry = await getUserDocument(uid)
        if (retry.success) {
          userProfile.value = retry.data
          return
        }
      }

      userProfile.value = {
        id: uid,
        email: currentUser.value?.email || '',
        displayName: currentUser.value?.displayName || '',
        newsletter: false
      }
    }

    onMounted(() => {
      observeAuthState(async (user) => {
        currentUser.value = user
        if (user) {
          await loadUserProfile(user.uid)
        } else {
          userProfile.value = null
          newsletterLoading.value = false
        }
      })
    })

    const handleLogout = async () => {
      const result = await logoutUser()
      if (result.success) {
        currentUser.value = null
        cartItemCount.value = 0
        userProfile.value = null
        newsletterLoading.value = false
        router.push('/login')
      }
    }

    const handleNewsletterToggle = async (nextValue) => {
      if (!currentUser.value) {
        router.push('/login')
        return
      }

      if (newsletterLoading.value) {
        return
      }

      newsletterLoading.value = true
      const result = await updateUserDocument(currentUser.value.uid, { newsletter: nextValue })

      if (result.success) {
        await loadUserProfile(currentUser.value.uid)
      } else {
        window.alert('Newsletter konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.')
      }

      newsletterLoading.value = false
    }

    return {
      currentUser,
      cartItemCount,
      userProfile,
      newsletterLoading,
      handleLogout,
      handleNewsletterToggle
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
