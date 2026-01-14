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

    <!-- Cookie Banner & Settings -->
    <CookieBanner 
      ref="cookieBannerRef"
      @customize="showCookieSettings = true"
      @accepted="handleCookieAccepted"
    />
    
    <CookieSettingsModal 
      v-model="showCookieSettings"
      @saved="handleCookieSaved"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { observeAuthState, logoutUser } from '@/services/auth'
import { getUserDocument, updateUserDocument, createUserDocument } from '@/services/db'
import { mergeGuestCart, registerCartUpdateCallback } from '@/services/cart'
import { mergeGuestWishlist, registerWishlistUpdateCallback } from '@/services/wishlist'
import { initCartStore, updateCartItems, useCartItemCount } from '@/stores/cartStore'
import { initWishlistStore, updateWishlistItems } from '@/stores/wishlistStore'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CookieBanner from '@/components/utility/CookieBanner.vue'
import CookieSettingsModal from '@/components/modal/CookieSettingsModal.vue'
import { cookieEventBus, COOKIE_EVENTS } from '@/services/cookieEvents'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    CookieBanner,
    CookieSettingsModal
  },
  setup() {
    const currentUser = ref(null)
    const cartItemCount = useCartItemCount()
    const userProfile = ref(null)
    const newsletterLoading = ref(false)
    const isAdmin = ref(false)
    const router = useRouter()
    const showCookieSettings = ref(false)
    const cookieBannerRef = ref(null)

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
      
      // Initialize wishlist store
      await initWishlistStore()
      
      // Register callback for cart updates
      registerCartUpdateCallback(updateCartItems)
      
      // Register callback for wishlist updates
      registerWishlistUpdateCallback(updateWishlistItems)

      // Listen for cookie settings open event
      cookieEventBus.on(COOKIE_EVENTS.OPEN_SETTINGS, () => {
        showCookieSettings.value = true
      })

      observeAuthState(async (user) => {
        currentUser.value = user
        if (user) {
          await checkAdminStatus(user)
          await loadUserProfile(user.uid)
          // Merge guest cart into user cart after login
          await mergeGuestCart()
          // Merge guest wishlist into user wishlist after login
          await mergeGuestWishlist()
          // Update cart count
          await updateCartItems()
          // Update wishlist
          await updateWishlistItems()
        } else {
          isAdmin.value = false
          userProfile.value = null
          newsletterLoading.value = false
          // Update cart count for guest
          await updateCartItems()
          // Update wishlist for guest
          await updateWishlistItems()
        }
      })
    })

    onUnmounted(() => {
      // Clean up event listeners
      cookieEventBus.off(COOKIE_EVENTS.OPEN_SETTINGS)
    })

    const handleLogout = async () => {
      const result = await logoutUser()
      if (result.success) {
        currentUser.value = null
        await updateCartItems() // Update cart count for guest after logout
        await updateWishlistItems() // Update wishlist for guest after logout
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

    const handleCookieAccepted = (preferences) => {
      console.log('Cookie preferences accepted:', preferences)
      // Here you could initialize analytics or marketing scripts based on preferences
    }

    const handleCookieSaved = (preferences) => {
      console.log('Cookie preferences saved:', preferences)
      if (cookieBannerRef.value) {
        cookieBannerRef.value.hide()
      }
      // Here you could initialize/disable analytics or marketing scripts based on preferences
    }

    return {
      currentUser,
      cartItemCount,
      userProfile,
      newsletterLoading,
      isAdmin,
      showCookieSettings,
      cookieBannerRef,
      handleLogout,
      handleNewsletterToggle,
      handleCookieAccepted,
      handleCookieSaved
    }
  }
}
</script>

