<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Profil wird geladen...</p>
    </div>

    <div v-else-if="!user" class="guest-card">
      <div class="guest-icon">
        <User :size="64" />
      </div>
      <h2>Bitte melde dich an</h2>
      <p>Um dein Profil zu bearbeiten, melde dich mit deinem Konto an.</p>
      <router-link to="/login" class="btn-primary">Zur Anmeldung</router-link>
    </div>

    <div v-else class="profile-content">
      <!-- Messages -->
      <transition name="slide-down">
        <div v-if="errorMessage" class="alert alert-error">
          <AlertCircle :size="22" class="alert-icon" />
          {{ errorMessage }}
        </div>
      </transition>
      <transition name="slide-down">
        <div v-if="successMessage" class="alert alert-success">
          <CheckCircle2 :size="22" class="alert-icon" />
          {{ successMessage }}
        </div>
      </transition>

      <!-- Profile Header -->
      <section class="profile-header">
        <div class="profile-avatar">{{ initials }}</div>
        <div class="profile-info">
          <h1>{{ form.displayName || fallbackName }}</h1>
          <p class="profile-email">{{ form.email }}</p>
          <div class="profile-badges">
            <span class="badge" :class="roleLabel === 'admin' ? 'badge-admin' : 'badge-role'">{{ roleLabel }}</span>
            <span class="badge" :class="{ 'badge-verified': isEmailVerified, 'badge-unverified': !isEmailVerified }">
              <CheckCircle2 v-if="isEmailVerified" :size="16" class="badge-icon" />
              <XCircle v-else :size="16" class="badge-icon" />
              {{ emailVerifiedLabel }}
            </span>
          </div>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Personal Data Section -->
        <section class="card">
          <div class="card-title">
            <User :size="24" class="title-icon" />
            <h2>Persönliche Daten</h2>
          </div>

          <div class="field-group">
            <div class="field-item" @click="editingField !== 'displayName' && startEditing('displayName')">
              <div class="field-header">
                <label>Name</label>
                <button 
                  v-if="editingField !== 'displayName'" 
                  class="edit-icon-btn"
                  @click.stop="startEditing('displayName')"
                >
                  <Pencil :size="16" />
                </button>
              </div>
              <div class="field-content">
                <input
                  v-if="editingField === 'displayName'"
                  type="text"
                  v-model="editBuffer.displayName"
                  maxlength="64"
                  placeholder="Dein Name"
                  class="field-input"
                  @keyup.enter="handleSaveField('displayName')"
                  @keyup.esc="cancelEditing"
                  autofocus
                />
                <span v-else class="field-value">{{ form.displayName || 'Nicht angegeben' }}</span>
              </div>
              <div v-if="editingField === 'displayName'" class="field-actions">
                <button class="btn-cancel" @click.stop="cancelEditing" :disabled="savingField === 'displayName'">
                  Abbrechen
                </button>
                <button class="btn-save" @click.stop="handleSaveField('displayName')" :disabled="savingField === 'displayName'">
                  <span v-if="savingField === 'displayName'">Speichert...</span>
                  <span v-else>Speichern</span>
                </button>
              </div>
            </div>

            <div class="field-item" @click="editingField !== 'email' && startEditing('email')">
              <div class="field-header">
                <label>E-Mail</label>
                <button 
                  v-if="editingField !== 'email'" 
                  class="edit-icon-btn"
                  @click.stop="startEditing('email')"
                >
                  <Pencil :size="16" />
                </button>
              </div>
              <div class="field-content">
                <input
                  v-if="editingField === 'email'"
                  type="email"
                  v-model="editBuffer.email"
                  placeholder="deine@email.com"
                  class="field-input"
                  @keyup.enter="handleSaveField('email')"
                  @keyup.esc="cancelEditing"
                  autofocus
                />
                <span v-else class="field-value">{{ form.email }}</span>
              </div>
              <div v-if="editingField === 'email'" class="field-actions">
                <button class="btn-cancel" @click.stop="cancelEditing" :disabled="savingField === 'email'">
                  Abbrechen
                </button>
                <button class="btn-save" @click.stop="handleSaveField('email')" :disabled="savingField === 'email'">
                  <span v-if="savingField === 'email'">Speichert...</span>
                  <span v-else>Speichern</span>
                </button>
              </div>
            </div>

            <div class="field-item" @click="editingField !== 'phone' && startEditing('phone')">
              <div class="field-header">
                <label>Telefon</label>
                <button 
                  v-if="editingField !== 'phone'" 
                  class="edit-icon-btn"
                  @click.stop="startEditing('phone')"
                >
                  <Pencil :size="16" />
                </button>
              </div>
              <div class="field-content">
                <input
                  v-if="editingField === 'phone'"
                  type="tel"
                  v-model="editBuffer.phone"
                  maxlength="20"
                  placeholder="z.B. +49 123 456789"
                  class="field-input"
                  @keyup.enter="handleSaveField('phone')"
                  @keyup.esc="cancelEditing"
                  autofocus
                />
                <span v-else class="field-value">{{ form.phone || 'Nicht angegeben' }}</span>
              </div>
              <div v-if="editingField === 'phone'" class="field-actions">
                <button class="btn-cancel" @click.stop="cancelEditing" :disabled="savingField === 'phone'">
                  Abbrechen
                </button>
                <button class="btn-save" @click.stop="handleSaveField('phone')" :disabled="savingField === 'phone'">
                  <span v-if="savingField === 'phone'">Speichert...</span>
                  <span v-else>Speichern</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Address Section -->
        <section class="card">
          <div class="card-title">
            <MapPin :size="24" class="title-icon" />
            <h2>Adresse</h2>
          </div>

          <div class="field-group">
            <div class="field-item" @click="editingField !== 'street' && startEditing('street')">
              <div class="field-header">
                <label>Straße & Hausnummer</label>
                <button 
                  v-if="editingField !== 'street'" 
                  class="edit-icon-btn"
                  @click.stop="startEditing('street')"
                >
                  <Pencil :size="16" />
                </button>
              </div>
              <div class="field-content">
                <input
                  v-if="editingField === 'street'"
                  type="text"
                  v-model="editBuffer.street"
                  maxlength="100"
                  placeholder="z.B. Musterstraße 123"
                  class="field-input"
                  @keyup.enter="handleSaveField('street')"
                  @keyup.esc="cancelEditing"
                  autofocus
                />
                <span v-else class="field-value">{{ form.street || 'Nicht angegeben' }}</span>
              </div>
              <div v-if="editingField === 'street'" class="field-actions">
                <button class="btn-cancel" @click.stop="cancelEditing" :disabled="savingField === 'street'">
                  Abbrechen
                </button>
                <button class="btn-save" @click.stop="handleSaveField('street')" :disabled="savingField === 'street'">
                  <span v-if="savingField === 'street'">Speichert...</span>
                  <span v-else>Speichern</span>
                </button>
              </div>
            </div>

            <div class="field-item" @click="editingField !== 'city' && startEditing('city')">
              <div class="field-header">
                <label>PLZ & Ort</label>
                <button 
                  v-if="editingField !== 'city'" 
                  class="edit-icon-btn"
                  @click.stop="startEditing('city')"
                >
                  <Pencil :size="16" />
                </button>
              </div>
              <div class="field-content">
                <div v-if="editingField === 'city'" class="city-input-group">
                  <input
                    type="text"
                    v-model="editBuffer.postalCode"
                    maxlength="10"
                    placeholder="PLZ"
                    class="field-input postal-code-input"
                    @keyup.enter="handleSaveField('city')"
                    @keyup.esc="cancelEditing"
                  />
                  <input
                    type="text"
                    v-model="editBuffer.city"
                    maxlength="100"
                    placeholder="Stadt"
                    class="field-input city-input"
                    @keyup.enter="handleSaveField('city')"
                    @keyup.esc="cancelEditing"
                  />
                </div>
                <span v-else class="field-value">{{ cityLabel }}</span>
              </div>
              <div v-if="editingField === 'city'" class="field-actions">
                <button class="btn-cancel" @click.stop="cancelEditing" :disabled="savingField === 'city'">
                  Abbrechen
                </button>
                <button class="btn-save" @click.stop="handleSaveField('city')" :disabled="savingField === 'city'">
                  <span v-if="savingField === 'city'">Speichert...</span>
                  <span v-else>Speichern</span>
                </button>
              </div>
            </div>

            <div class="field-item" @click="editingField !== 'country' && startEditing('country')">
              <div class="field-header">
                <label>Land</label>
                <button 
                  v-if="editingField !== 'country'" 
                  class="edit-icon-btn"
                  @click.stop="startEditing('country')"
                >
                  <Pencil :size="16" />
                </button>
              </div>
              <div class="field-content">
                <input
                  v-if="editingField === 'country'"
                  type="text"
                  v-model="editBuffer.country"
                  maxlength="100"
                  placeholder="z.B. Deutschland"
                  class="field-input"
                  @keyup.enter="handleSaveField('country')"
                  @keyup.esc="cancelEditing"
                  autofocus
                />
                <span v-else class="field-value">{{ form.country || 'Nicht angegeben' }}</span>
              </div>
              <div v-if="editingField === 'country'" class="field-actions">
                <button class="btn-cancel" @click.stop="cancelEditing" :disabled="savingField === 'country'">
                  Abbrechen
                </button>
                <button class="btn-save" @click.stop="handleSaveField('country')" :disabled="savingField === 'country'">
                  <span v-if="savingField === 'country'">Speichert...</span>
                  <span v-else>Speichern</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Settings & Account Section -->
        <section class="card">
          <div class="card-title">
            <Settings :size="24" class="title-icon" />
            <h2>Einstellungen & Konto</h2>
          </div>

          <div class="field-group">
            <div class="field-item toggle-field">
              <div class="field-header">
                <label>Newsletter</label>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="form.newsletter"
                    @change="handleNewsletterToggle"
                    :disabled="savingNewsletter"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <p class="field-description">
                {{ form.newsletter ? 'Du erhältst unsere wöchentlichen Angebote' : 'Aktiviere den Newsletter für exklusive Angebote' }}
              </p>
            </div>
          </div>

          <div class="info-list">
            <div class="info-item">
              <span class="info-label">Mitglied seit</span>
              <span class="info-value">{{ createdAtLabel }}</span>
            </div>
          </div>

          <div v-if="!isEmailVerified" class="verification-box">
            <div class="verification-header">
              <AlertTriangle :size="28" class="verification-icon" />
              <div>
                <h3>E-Mail-Verifizierung ausstehend</h3>
                <p>Bitte verifiziere deine E-Mail-Adresse für volle Funktionalität.</p>
              </div>
            </div>
            <div class="verification-actions">
              <button
                @click="handleSendVerificationEmail"
                class="btn-verification"
                :disabled="sendingVerification"
              >
                <Mail :size="18" />
                <span v-if="sendingVerification">Wird gesendet...</span>
                <span v-else>E-Mail senden</span>
              </button>
              <button
                @click="handleRefreshVerificationStatus"
                class="btn-verification btn-secondary"
                :disabled="refreshingVerification"
              >
                <RefreshCw :size="18" />
                <span v-if="refreshingVerification">Aktualisiert...</span>
                <span v-else>Status prüfen</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { observeAuthState, updateUserProfile, sendVerificationEmail, refreshEmailVerificationStatus } from '../../services/firebase/auth'
import { getUserDocument } from '../../services/firebase/db'
import { 
  User, 
  MapPin, 
  Settings, 
  Pencil, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  AlertTriangle, 
  Mail, 
  RefreshCw 
} from 'lucide-vue-next'

export default {
  name: 'ProfileView',
  components: {
    User,
    MapPin,
    Settings,
    Pencil,
    CheckCircle2,
    XCircle,
    AlertCircle,
    AlertTriangle,
    Mail,
    RefreshCw
  },
  setup() {
    const user = ref(null)
    const userData = ref(null)
    const loading = ref(true)
    const successMessage = ref('')
    const errorMessage = ref('')
    const editingField = ref('')
    const savingField = ref('')
    const sendingVerification = ref(false)
    const refreshingVerification = ref(false)
    const savingNewsletter = ref(false)

    const form = reactive({
      displayName: '',
      email: '',
      street: '',
      postalCode: '',
      city: '',
      country: '',
      phone: '',
      newsletter: false
    })

    const editBuffer = reactive({
      displayName: '',
      email: '',
      street: '',
      postalCode: '',
      city: '',
      country: '',
      phone: ''
    })

    let unsubscribeAuth = null

    const fallbackName = computed(() => {
      return user.value?.email?.split('@')[0] || 'Benutzer'
    })

    const initials = computed(() => {
      const source = form.displayName || form.email
      if (!source) {
        return '?'
      }
      return source
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    const roleLabel = computed(() => userData.value?.role || 'user')

    const createdAtLabel = computed(() => {
      if (!userData.value?.createdAt) {
        return 'Nicht verfügbar'
      }
      const date = userData.value.createdAt.toDate
        ? userData.value.createdAt.toDate()
        : new Date(userData.value.createdAt)
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    const emailVerifiedLabel = computed(() => {
      // Check Firebase Auth first, then fallback to Firestore
      const authVerified = user.value?.emailVerified
      const firestoreVerified = userData.value?.emailVerified
      const isVerified = authVerified || firestoreVerified
      return isVerified ? 'Verifiziert' : 'Nicht verifiziert'
    })

    const isEmailVerified = computed(() => {
      // Check Firebase Auth first, then fallback to Firestore
      const authVerified = user.value?.emailVerified
      const firestoreVerified = userData.value?.emailVerified
      return authVerified || firestoreVerified
    })

    const cityLabel = computed(() => {
      const postal = form.postalCode?.trim() || ''
      const city = form.city?.trim() || ''
      
      if (!postal && !city) {
        return 'Nicht angegeben'
      }
      if (postal && city) {
        return `${postal} ${city}`
      }
      return postal || city
    })

    const applyFormValues = (authUser, data) => {
      const resolvedDisplayName = data?.displayName || authUser?.displayName || ''
      const resolvedEmail = data?.email || authUser?.email || ''
      const resolvedStreet = data?.street || ''
      const resolvedPostalCode = data?.postalCode || ''
      const resolvedCity = data?.city || ''
      const resolvedCountry = data?.country || ''
      const resolvedPhone = data?.phone || ''
      const resolvedNewsletter = data?.newsletter ?? false

      form.displayName = resolvedDisplayName
      form.email = resolvedEmail
      form.street = resolvedStreet
      form.postalCode = resolvedPostalCode
      form.city = resolvedCity
      form.country = resolvedCountry
      form.phone = resolvedPhone
      form.newsletter = resolvedNewsletter

      if (editingField.value !== 'displayName') {
        editBuffer.displayName = resolvedDisplayName
      }
      if (editingField.value !== 'email') {
        editBuffer.email = resolvedEmail
      }
      if (editingField.value !== 'street') {
        editBuffer.street = resolvedStreet
      }
      if (editingField.value !== 'city') {
        editBuffer.postalCode = resolvedPostalCode
        editBuffer.city = resolvedCity
      }
      if (editingField.value !== 'country') {
        editBuffer.country = resolvedCountry
      }
      if (editingField.value !== 'phone') {
        editBuffer.phone = resolvedPhone
      }
    }

    const loadUserData = async (authUser, showLoader = true, clearMessages = true) => {
      if (!authUser) {
        loading.value = false
        return
      }

      if (showLoader) {
        loading.value = true
      }

      applyFormValues(authUser, null)

      const result = await getUserDocument(authUser.uid)

      if (result.success) {
        userData.value = result.data
        
        // Sync emailVerified status from Firebase Auth to Firestore if different
        const authVerified = authUser.emailVerified
        const firestoreVerified = result.data?.emailVerified
        
        if (authVerified !== firestoreVerified) {
          // Update Firestore to match Firebase Auth
          const { updateUserDocument } = await import('../../services/db')
          await updateUserDocument(authUser.uid, { emailVerified: authVerified })
          // Update local userData
          userData.value.emailVerified = authVerified
        }
        
        applyFormValues(authUser, result.data)
        if (clearMessages) {
          errorMessage.value = ''
        }
      } else {
        if (clearMessages) {
          errorMessage.value = 'Benutzerdaten konnten nicht geladen werden.'
        }
      }

      if (showLoader) {
        loading.value = false
      }
    }

    const getErrorMessage = (code) => {
      const map = {
        'auth/email-already-in-use': 'Diese E-Mail-Adresse wird bereits verwendet.',
        'auth/invalid-email': 'Bitte gib eine gültige E-Mail-Adresse ein.',
        'auth/requires-recent-login': 'Bitte melde dich ab und erneut an, bevor du deine E-Mail änderst.',
        'auth/user-not-found': 'Es konnte kein angemeldeter Benutzer gefunden werden.'
      }

      return map[code] || 'Änderungen konnten nicht gespeichert werden. Bitte versuche es später erneut.'
    }

    const startEditing = (field) => {
      if (savingField.value) {
        return
      }

      editingField.value = field
      editBuffer[field] = form[field] || ''
      successMessage.value = ''
      errorMessage.value = ''
    }

    const cancelEditing = () => {
      if (!editingField.value) {
        return
      }

      const field = editingField.value
      editBuffer[field] = form[field] || ''
      editingField.value = ''
      savingField.value = ''
      successMessage.value = ''
      errorMessage.value = ''
    }

    const handleSaveField = async (field) => {
      if (savingField.value || !user.value) {
        if (!user.value) {
          errorMessage.value = 'Es ist kein Benutzer angemeldet.'
        }
        return
      }

      successMessage.value = ''
      errorMessage.value = ''

      if (field === 'city') {
        const trimmedPostal = (editBuffer.postalCode ?? '').trim()
        const trimmedCity = (editBuffer.city ?? '').trim()
        const currentPostal = (form.postalCode || '').trim()
        const currentCity = (form.city || '').trim()

        if (trimmedPostal === currentPostal && trimmedCity === currentCity) {
          editingField.value = ''
          editBuffer.postalCode = form.postalCode || ''
          editBuffer.city = form.city || ''
          return
        }

        const payload = {
          postalCode: trimmedPostal,
          city: trimmedCity
        }

        savingField.value = field

        const result = await updateUserProfile(payload)

        if (result.success) {
          successMessage.value = 'PLZ und Ort wurden aktualisiert.'
          await loadUserData(user.value, false)
          editBuffer.postalCode = form.postalCode || ''
          editBuffer.city = form.city || ''
          editingField.value = ''
          // Clear success message after 5 seconds
          setTimeout(() => {
            successMessage.value = ''
          }, 5000)
        } else {
          errorMessage.value = getErrorMessage(result.error)
          // Clear error message after 5 seconds
          setTimeout(() => {
            errorMessage.value = ''
          }, 5000)
        }

        savingField.value = ''
        return
      }

      const rawValue = editBuffer[field] ?? ''
      const trimmedValue = rawValue.trim()
      const currentValue = (form[field] || '').trim()

      if (field === 'email' && !trimmedValue) {
        errorMessage.value = 'Die E-Mail-Adresse darf nicht leer sein.'
        // Clear error message after 5 seconds
        setTimeout(() => {
          errorMessage.value = ''
        }, 5000)
        return
      }

      if (field === 'displayName' && trimmedValue && trimmedValue.length < 2) {
        errorMessage.value = 'Der Name muss mindestens 2 Zeichen lang sein.'
        // Clear error message after 5 seconds
        setTimeout(() => {
          errorMessage.value = ''
        }, 5000)
        return
      }

      if (trimmedValue === currentValue) {
        editingField.value = ''
        editBuffer[field] = form[field] || ''
        return
      }

      let payload
      if (field === 'email') {
        payload = { email: trimmedValue.toLowerCase() }
      } else {
        payload = { [field]: trimmedValue }
      }

      savingField.value = field

      const result = await updateUserProfile(payload)

      if (result.success) {
        const successMap = {
          displayName: 'Dein Name wurde aktualisiert.',
          email: 'Deine E-Mail-Adresse wurde aktualisiert.',
          street: 'Deine Straße wurde aktualisiert.',
          country: 'Dein Land wurde aktualisiert.',
          phone: 'Deine Telefonnummer wurde aktualisiert.'
        }
        successMessage.value = successMap[field] || 'Dein Profil wurde aktualisiert.'
        await loadUserData(user.value, false)
        editBuffer[field] = form[field] || ''
        editingField.value = ''
        // Clear success message after 5 seconds
        setTimeout(() => {
          successMessage.value = ''
        }, 5000)
      } else {
        errorMessage.value = getErrorMessage(result.error)
        // Clear error message after 5 seconds
        setTimeout(() => {
          errorMessage.value = ''
        }, 5000)
      }

      savingField.value = ''
    }

    const handleSendVerificationEmail = async () => {
      if (sendingVerification.value) {
        return
      }

      successMessage.value = ''
      errorMessage.value = ''
      sendingVerification.value = true

      const result = await sendVerificationEmail()

      if (result.success) {
        successMessage.value = 'Bestätigungs-E-Mail wurde gesendet. Bitte überprüfe dein Postfach.'
        // Clear success message after 5 seconds
        setTimeout(() => {
          successMessage.value = ''
        }, 5000)
      } else {
        if (result.error === 'auth/email-already-verified') {
          errorMessage.value = 'Deine E-Mail-Adresse ist bereits verifiziert.'
        } else {
          errorMessage.value = 'Fehler beim Senden der Bestätigungs-E-Mail. Bitte versuche es später erneut.'
        }
        // Clear error message after 5 seconds
        setTimeout(() => {
          errorMessage.value = ''
        }, 5000)
      }

      sendingVerification.value = false
    }

    const handleRefreshVerificationStatus = async () => {
      if (refreshingVerification.value) {
        return
      }

      successMessage.value = ''
      errorMessage.value = ''
      refreshingVerification.value = true

      const result = await refreshEmailVerificationStatus()

      if (result.success) {
        // Reload user data without clearing messages
        await loadUserData(user.value, false, false)
        
        // Set message after loadUserData
        if (result.emailVerified) {
          successMessage.value = 'Deine E-Mail-Adresse wurde erfolgreich verifiziert!'
          errorMessage.value = ''
          // Clear success message after 5 seconds
          setTimeout(() => {
            successMessage.value = ''
          }, 5000)
        } else {
          errorMessage.value = 'Deine E-Mail-Adresse ist noch nicht verifiziert. Bitte überprüfe dein Postfach.'
          successMessage.value = ''
          // Clear error message after 5 seconds
          setTimeout(() => {
            errorMessage.value = ''
          }, 5000)
        }
      } else {
        errorMessage.value = 'Fehler beim Aktualisieren des Verifizierungsstatus.'
        successMessage.value = ''
        // Clear error message after 5 seconds
        setTimeout(() => {
          errorMessage.value = ''
        }, 5000)
      }

      refreshingVerification.value = false
    }

    const handleNewsletterToggle = async () => {
      if (savingNewsletter.value || !user.value) {
        return
      }

      savingNewsletter.value = true
      successMessage.value = ''
      errorMessage.value = ''

      const newValue = form.newsletter

      try {
        const { updateUserDocument } = await import('../../services/db')
        const result = await updateUserDocument(user.value.uid, {
          newsletter: newValue
        })

        if (result.success) {
          successMessage.value = newValue 
            ? 'Du hast den Newsletter abonniert.' 
            : 'Du hast den Newsletter abgemeldet.'
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            successMessage.value = ''
          }, 5000)
        } else {
          // Revert the toggle if save failed
          form.newsletter = !newValue
          errorMessage.value = 'Newsletter-Einstellungen konnten nicht gespeichert werden.'
          setTimeout(() => {
            errorMessage.value = ''
          }, 5000)
        }
      } catch (error) {
        console.error('Error updating newsletter preference:', error)
        // Revert the toggle on error
        form.newsletter = !newValue
        errorMessage.value = 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'
        setTimeout(() => {
          errorMessage.value = ''
        }, 5000)
      } finally {
        savingNewsletter.value = false
      }
    }

    onMounted(() => {
      unsubscribeAuth = observeAuthState(async (authUser) => {
        if (!authUser) {
          user.value = null
          userData.value = null
          loading.value = false
          return
        }

        // Reload user to get latest emailVerified status from Firebase
        const { reload, getAuth } = await import('firebase/auth')
        try {
          await reload(authUser)
          // Get the refreshed user object
          const auth = getAuth()
          user.value = auth.currentUser
        } catch (error) {
          console.log('Could not reload user:', error)
          user.value = authUser
        }

        await loadUserData(user.value || authUser, true)
      })
    })

    onBeforeUnmount(() => {
      if (unsubscribeAuth) {
        unsubscribeAuth()
      }
    })

    return {
      user,
      loading,
      form,
      editBuffer,
      fallbackName,
      initials,
      roleLabel,
      createdAtLabel,
      emailVerifiedLabel,
      isEmailVerified,
      cityLabel,
      successMessage,
      errorMessage,
      editingField,
      savingField,
      sendingVerification,
      refreshingVerification,
      savingNewsletter,
      startEditing,
      cancelEditing,
      handleSaveField,
      handleSendVerificationEmail,
      handleRefreshVerificationStatus,
      handleNewsletterToggle
    }
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 6rem 0;
  color: var(--gray-600);
}

.spinner {
  width: 56px;
  height: 56px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary-green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Guest Card */
.guest-card {
  text-align: center;
  background: var(--white);
  padding: 4rem 2rem;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  max-width: 500px;
  margin: 4rem auto;
}

.guest-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.guest-card h2 {
  margin-bottom: 0.75rem;
  font-size: 1.75rem;
  color: var(--gray-900);
}

.guest-card p {
  color: var(--gray-600);
  margin-bottom: 2rem;
  font-size: 1.05rem;
}

.btn-primary {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: var(--white);
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.alert-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.alert-error {
  background-color: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FEE2E2;
}

.alert-success {
  background-color: #ECFDF5;
  color: #059669;
  border: 1px solid #D1FAE5;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%);
  border-radius: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 2.5rem;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  font-size: 2.25rem;
  margin: 0 0 0.5rem 0;
  color: var(--gray-900);
  font-weight: 700;
}

.profile-email {
  color: var(--gray-600);
  font-size: 1.05rem;
  margin-bottom: 1rem;
}

.profile-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: capitalize;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.badge-icon {
  width: 16px;
  height: 16px;
}

.badge-role {
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: white;
}

.badge-admin {
  background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
  color: white;
  font-weight: 700;
  animation: pulse-subtle 2s ease-in-out infinite;
}

@keyframes pulse-subtle {
  0%, 100% {
    box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
  }
  50% {
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5);
  }
}

.badge-verified {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: 2px solid #D1FAE5;
}

.badge-unverified {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  border: 2px solid #FEF3C7;
  animation: pulse-warning 2s ease-in-out infinite;
}

@keyframes pulse-warning {
  0%, 100% {
    box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
  }
  50% {
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
  }
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Card */
.card {
  background: var(--white);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--gray-100);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid var(--gray-100);
}

.title-icon {
  width: 24px;
  height: 24px;
  color: var(--primary-green);
  stroke-width: 2.5;
}

.card-title h2 {
  font-size: 1.35rem;
  margin: 0;
  color: var(--gray-900);
  font-weight: 700;
}

/* Field Group */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-item {
  padding: 1.25rem;
  border-radius: 12px;
  background: var(--gray-50);
  border: 1.5px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.field-item:hover {
  background: var(--white);
  border-color: var(--primary-green);
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.1);
}

.field-item.toggle-field {
  cursor: default;
}

.field-item.toggle-field:hover {
  background: var(--gray-50);
  border-color: transparent;
  box-shadow: none;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625rem;
}

.field-header label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.edit-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
  flex-shrink: 0;
}

.edit-icon-btn svg {
  stroke-width: 2;
  flex-shrink: 0;
}

.edit-icon-btn:hover {
  background: linear-gradient(135deg, var(--primary-green-dark) 0%, var(--primary-green) 100%);
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}

.field-content {
  margin-bottom: 0;
}

.field-value {
  font-size: 1.05rem;
  color: var(--gray-900);
  font-weight: 500;
}

.field-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--primary-green);
  border-radius: 10px;
  font-size: 1rem;
  color: var(--gray-900);
  background: var(--white);
  transition: all 0.2s ease;
  font-family: inherit;
}

.field-input:focus {
  outline: none;
  border-color: var(--primary-green-dark);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.city-input-group {
  display: flex;
  gap: 0.75rem;
}

.postal-code-input {
  flex: 0 0 120px;
}

.city-input {
  flex: 1;
}

.field-description {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-600);
  font-style: italic;
}

.field-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-save {
  padding: 0.625rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cancel {
  background: var(--white);
  color: var(--gray-700);
  border: 1.5px solid var(--gray-300);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--gray-100);
  border-color: var(--gray-400);
}

.btn-save {
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.btn-cancel:disabled,
.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 30px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--gray-300);
  transition: 0.3s;
  border-radius: 34px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Info List */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--gray-100);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 10px;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 1rem;
  color: var(--gray-900);
  font-weight: 500;
}

/* Verification Box */
.verification-box {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border-radius: 12px;
  border: 2px solid #FEF3C7;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
  animation: pulse-box 3s ease-in-out infinite;
}

@keyframes pulse-box {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
    border-color: #FEF3C7;
  }
  50% {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    border-color: #FDE68A;
  }
}

.verification-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.verification-icon {
  flex-shrink: 0;
  color: white;
  stroke-width: 2.5;
  animation: shake 3s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: rotate(-5deg);
  }
  20%, 40%, 60%, 80% {
    transform: rotate(5deg);
  }
}

.verification-header h3 {
  font-size: 1.05rem;
  margin: 0 0 0.375rem 0;
  color: white;
  font-weight: 700;
}

.verification-header p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
}

.verification-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-verification {
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-verification svg {
  stroke-width: 2.5;
}

.btn-verification:not(.btn-secondary) {
  background: white;
  color: #D97706;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.btn-verification:not(.btn-secondary):hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.4);
  background: #FEF3C7;
  color: #92400E;
}

.btn-verification.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.btn-verification.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
}

.btn-verification:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 1.5rem 1rem 3rem;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 2rem;
  }

  .profile-avatar {
    width: 90px;
    height: 90px;
    font-size: 2rem;
  }

  .profile-info h1 {
    font-size: 1.75rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 1.5rem;
  }

  .field-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }

  .verification-actions {
    flex-direction: column;
  }

  .btn-verification {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .profile-header {
    padding: 1.5rem;
  }

  .profile-avatar {
    width: 75px;
    height: 75px;
    font-size: 1.75rem;
  }

  .profile-info h1 {
    font-size: 1.5rem;
  }

  .card-title h2 {
    font-size: 1.15rem;
  }
}
</style>
