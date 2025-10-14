<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Profil wird geladen...</p>
    </div>

    <div v-else-if="!user" class="guest-card">
      <h2>Bitte melde dich an</h2>
      <p>Um dein Profil zu bearbeiten, melde dich mit deinem Konto an.</p>
      <router-link to="/login" class="btn-primary">Zur Anmeldung</router-link>
    </div>

    <div v-else class="profile-content">
      <section class="profile-card">
        <div class="card-header">
          <div class="profile-avatar">{{ initials }}</div>
          <div class="header-info">
            <h1>{{ form.displayName || fallbackName }}</h1>
            <p>{{ form.email }}</p>
          </div>
        </div>

        <div class="card-body">
          <div class="editable-section">
            <h2>Persönliche Daten</h2>

            <div v-if="errorMessage" class="alert alert-error">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="alert alert-success">
              {{ successMessage }}
            </div>

            <div class="details-list">
              <div class="details-row">
                <div class="details-label">Name</div>
                <div class="details-value">
                  <template v-if="editingField === 'displayName'">
                    <input
                      id="displayName"
                      type="text"
                      v-model="editBuffer.displayName"
                      maxlength="64"
                      placeholder="Dein Name"
                      autofocus
                    />
                  </template>
                  <template v-else>
                    {{ form.displayName || 'Nicht angegeben' }}
                  </template>
                </div>
                <div class="details-actions">
                  <template v-if="editingField === 'displayName'">
                    <button
                      type="button"
                      class="action-button ghost"
                      @click="cancelEditing"
                      :disabled="savingField === 'displayName'"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      class="action-button primary"
                      @click="handleSaveField('displayName')"
                      :disabled="savingField === 'displayName'"
                    >
                      <span v-if="savingField === 'displayName'">Speichere...</span>
                      <span v-else>Speichern</span>
                    </button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      class="action-button ghost"
                      @click="startEditing('displayName')"
                    >
                      Bearbeiten
                    </button>
                  </template>
                </div>
              </div>

              <div class="details-row">
                <div class="details-label">E-Mail</div>
                <div class="details-value">
                  <template v-if="editingField === 'email'">
                    <input
                      id="email"
                      type="email"
                      v-model="editBuffer.email"
                      placeholder="deine@email.com"
                    />
                  </template>
                  <template v-else>
                    {{ form.email }}
                  </template>
                </div>
                <div class="details-actions">
                  <template v-if="editingField === 'email'">
                    <button
                      type="button"
                      class="action-button ghost"
                      @click="cancelEditing"
                      :disabled="savingField === 'email'"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      class="action-button primary"
                      @click="handleSaveField('email')"
                      :disabled="savingField === 'email'"
                    >
                      <span v-if="savingField === 'email'">Speichere...</span>
                      <span v-else>Speichern</span>
                    </button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      class="action-button ghost"
                      @click="startEditing('email')"
                    >
                      Bearbeiten
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div class="meta-section">
            <h2>Kontoübersicht</h2>
            <ul class="meta-list">
              <li>
                <span class="meta-label">Rolle</span>
                <span class="badge">{{ roleLabel }}</span>
              </li>
              <li>
                <span class="meta-label">Mitglied seit</span>
                <span class="meta-value">{{ createdAtLabel }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { observeAuthState, updateUserProfile } from '../services/auth'
import { getUserDocument } from '../services/db'

export default {
  name: 'ProfileView',
  setup() {
    const user = ref(null)
    const userData = ref(null)
    const loading = ref(true)
    const successMessage = ref('')
    const errorMessage = ref('')
    const editingField = ref('')
    const savingField = ref('')

    const form = reactive({
      displayName: '',
      email: ''
    })

    const editBuffer = reactive({
      displayName: '',
      email: ''
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

    const applyFormValues = (authUser, data) => {
      const resolvedDisplayName = data?.displayName || authUser?.displayName || ''
      const resolvedEmail = data?.email || authUser?.email || ''

      form.displayName = resolvedDisplayName
      form.email = resolvedEmail

      if (editingField.value !== 'displayName') {
        editBuffer.displayName = resolvedDisplayName
      }

      if (editingField.value !== 'email') {
        editBuffer.email = resolvedEmail
      }
    }

    const loadUserData = async (authUser, showLoader = true) => {
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
        applyFormValues(authUser, result.data)
        errorMessage.value = ''
      } else {
        errorMessage.value = 'Benutzerdaten konnten nicht geladen werden.'
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
      if (savingField.value) {
        return
      }

      successMessage.value = ''
      errorMessage.value = ''

      const rawValue = editBuffer[field] ?? ''
      const trimmedValue = rawValue.trim()
      const currentValue = (form[field] || '').trim()

      if (field === 'email' && !trimmedValue) {
        errorMessage.value = 'Die E-Mail-Adresse darf nicht leer sein.'
        return
      }

      if (field === 'displayName' && trimmedValue && trimmedValue.length < 2) {
        errorMessage.value = 'Der Name muss mindestens 2 Zeichen lang sein.'
        return
      }

      if (!user.value) {
        errorMessage.value = 'Es ist kein Benutzer angemeldet.'
        return
      }

      if (trimmedValue === currentValue) {
        editingField.value = ''
        editBuffer[field] = form[field] || ''
        return
      }

      const payload = field === 'email'
        ? { email: trimmedValue.toLowerCase() }
        : { displayName: trimmedValue }

      savingField.value = field

      const result = await updateUserProfile(payload)

      if (result.success) {
        const successMap = {
          displayName: 'Dein Name wurde aktualisiert.',
          email: 'Deine E-Mail-Adresse wurde aktualisiert.'
        }
        successMessage.value = successMap[field] || 'Dein Profil wurde aktualisiert.'
        await loadUserData(user.value, false)
        editBuffer[field] = form[field] || ''
        editingField.value = ''
      } else {
        errorMessage.value = getErrorMessage(result.error)
      }

      savingField.value = ''
    }

    onMounted(() => {
      unsubscribeAuth = observeAuthState(async (authUser) => {
        user.value = authUser

        if (!authUser) {
          userData.value = null
          loading.value = false
          return
        }

        await loadUserData(authUser, true)
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
      successMessage,
      errorMessage,
      editingField,
      savingField,
      startEditing,
      cancelEditing,
      handleSaveField
    }
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  color: var(--gray-600);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.guest-card {
  text-align: center;
  background: var(--white);
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 118, 110, 0.1);
}

.guest-card h2 {
  margin-bottom: 0.5rem;
}

.guest-card p {
  color: var(--gray-600);
  margin-bottom: 1.5rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: var(--white);
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.profile-card {
  background: var(--white);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15, 118, 110, 0.15);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  border-bottom: 1px solid var(--gray-100);
}

.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 2.25rem;
  flex-shrink: 0;
  box-shadow: 0 12px 24px rgba(16, 185, 129, 0.35);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-info h1 {
  font-size: 2rem;
  margin: 0;
  color: var(--gray-900);
}

.header-info p {
  color: var(--gray-600);
  font-size: 1.05rem;
  word-break: break-word;
}

.card-body {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
  gap: 3rem;
  padding: 2.5rem;
}

.editable-section,
.meta-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editable-section h2,
.meta-section h2 {
  font-size: 1.35rem;
  margin: 0;
}

.meta-section {
  background: var(--gray-50);
  border: 1px solid var(--gray-100);
  border-radius: 16px;
  padding: 2rem;
  align-self: flex-start;
  justify-self: end;
  width: clamp(240px, 90%, 320px);
  margin-left: auto;
}

.meta-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.meta-list li {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.95rem;
  color: var(--gray-700);
}

.meta-label {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
  color: var(--gray-500);
}

.meta-value {
  font-size: 1rem;
  color: var(--gray-900);
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.details-row {
  display: grid;
  grid-template-columns: minmax(140px, 1fr) minmax(260px, 2fr) minmax(150px, auto);
  gap: 1rem 1.5rem;
  align-items: center;
}

.details-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-700);
}

.details-value {
  font-size: 1rem;
  color: var(--gray-800);
}

.details-value input {
  width: 100%;
}

.details-actions {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.action-button {
  padding: 0.55rem 1.1rem;
  font-size: 0.95rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  min-width: 130px;
  text-align: center;
}

.action-button.primary {
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: var(--white);
  border: 1px solid transparent;
}

.action-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(16, 185, 129, 0.25);
}

.action-button.ghost {
  background: var(--white);
  color: var(--primary-green);
  border: 1.5px solid var(--primary-green);
}

.action-button.ghost:hover:not(:disabled) {
  background: var(--primary-green-lighter);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.alert {
  padding: 0.875rem 1rem;
  border-radius: 10px;
  font-size: 0.95rem;
}

.alert-error {
  background-color: var(--error-light);
  color: var(--error);
}

.alert-success {
  background-color: var(--primary-green-lighter);
  color: var(--primary-green-dark);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background-color: var(--primary-green-lighter);
  color: var(--primary-green-dark);
  font-weight: 600;
  text-transform: capitalize;
  font-size: 0.9rem;
}

@media (max-width: 960px) {
  .card-body {
    grid-template-columns: 1fr;
  }

  .meta-section {
    align-self: stretch;
  }
}

@media (max-width: 640px) {
  .profile-avatar {
    width: 72px;
    height: 72px;
    font-size: 1.5rem;
    box-shadow: 0 8px 18px rgba(16, 185, 129, 0.28);
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 2rem;
    gap: 1.25rem;
  }

  .card-body {
    padding: 2rem;
    gap: 2rem;
  }

  .details-row {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .details-actions {
    justify-content: flex-start;
  }
}
</style>
