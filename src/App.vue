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
import { observeAuthState, logoutUser } from '@/services/auth'
import { getUserDocument, updateUserDocument, createUserDocument } from '@/services/db'
import { mergeGuestCart, registerCartUpdateCallback } from '@/services/cart'
import { initCartStore, updateCartItems, useCartItemCount } from '@/stores/cartStore'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  },
  setup() {
    const currentUser = ref(null)
    const cartItemCount = useCartItemCount() // Reactive ref from store
    const userProfile = ref(null)
    const newsletterLoading = ref(false)
    const isAdmin = ref(false)
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

      // ← DAS stand vorher versehentlich in checkAdminStatus
      userProfile.value = {
        id: uid,
        email: currentUser.value?.email || '',
        displayName: currentUser.value?.displayName || '',
        newsletter: false
      }
    }

    const updateCartCount = async () => {
      cartItemCount.value = await getCartItemCount()
    }

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

    onMounted(async () => {
      // Initialize cart store
      await initCartStore()
      
      // Register callback for cart updates
      registerCartUpdateCallback(updateCartItems)

      observeAuthState(async (user) => {
        currentUser.value = user
        if (user) {
          await checkAdminStatus(user)
          await loadUserProfile(user.uid)
          // Merge guest cart into user cart after login
          await mergeGuestCart()
          // Update cart count
          await updateCartItems()
        } else {
          isAdmin.value = false
          userProfile.value = null
          newsletterLoading.value = false
          // Update cart count for guest
          await updateCartItems()
        }
      })
    })

    const handleLogout = async () => {
      const result = await logoutUser()
      if (result.success) {
        currentUser.value = null
        await updateCartItems() // Update cart count for guest after logout
        isAdmin.value = false
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
      isAdmin,
      handleLogout,
      handleNewsletterToggle
    }
  }
}
</script>

