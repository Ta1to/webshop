<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <h1>evaris</h1>
        <p>Willkommen zurück</p>
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">E-Mail</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="deine@email.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Passwort</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="error-message">
          <AlertCircle :size="20" />
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading">Anmeldung läuft...</span>
          <span v-else>Anmelden</span>
        </button>
      </form>

      <div class="divider">
        <span>oder</span>
      </div>

      <button @click="handleGoogleSignIn" type="button" class="btn-google" :disabled="loading">
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
          <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
        </svg>
        <span>Mit Google anmelden</span>
      </button>

      <div class="divider"></div>

      <p class="register-link">
        Noch kein Konto? 
        <router-link to="/register">Jetzt registrieren</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser, signInWithGoogle } from '../../services/auth'
import { AlertCircle } from 'lucide-vue-next'

export default {
  name: 'LoginView',
  components: {
    AlertCircle
  },
  setup() {
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)
    const router = useRouter()

    const handleLogin = async () => {
      error.value = ''
      loading.value = true

      const result = await loginUser(email.value, password.value)

      if (result.success) {
        router.push('/')
      } else {
        error.value = getErrorMessage(result.error)
      }

      loading.value = false
    }

    const handleGoogleSignIn = async () => {
      error.value = ''
      loading.value = true

      const result = await signInWithGoogle()

      if (result.success) {
        router.push('/')
      } else {
        error.value = getErrorMessage(result.error)
      }

      loading.value = false
    }

    const getErrorMessage = (errorCode) => {
      const errorMessages = {
        'auth/invalid-email': 'Ungültige E-Mail-Adresse',
        'auth/user-disabled': 'Dieser Benutzer wurde deaktiviert',
        'auth/user-not-found': 'Benutzer nicht gefunden',
        'auth/wrong-password': 'Falsches Passwort',
        'auth/invalid-credential': 'Ungültige Anmeldedaten',
        'auth/popup-closed-by-user': 'Anmeldung wurde abgebrochen',
        'auth/cancelled-popup-request': 'Anmeldung wurde abgebrochen',
      }
      
      for (const [key, message] of Object.entries(errorMessages)) {
        if (errorCode.includes(key)) {
          return message
        }
      }
      
      return 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
    }

    return {
      email,
      password,
      error,
      loading,
      handleLogin,
      handleGoogleSignIn
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 4rem);
  padding: 2rem;
}

.login-card {
  background: var(--white);
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 440px;
}

.logo {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo h1 {
  color: var(--primary-green);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.logo p {
  color: var(--gray-600);
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--gray-700);
  font-weight: 500;
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid var(--gray-300);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: var(--white);
}

input:hover {
  border-color: var(--gray-400);
}

input:focus {
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px var(--primary-green-lighter);
}

.btn-primary {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: var(--white);
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background-color: var(--error-light);
  color: var(--error);
  padding: 0.875rem 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.divider {
  height: 1px;
  background-color: var(--gray-200);
  margin: 2rem 0;
  position: relative;
  text-align: center;
}

.divider span {
  background-color: var(--white);
  color: var(--gray-500);
  padding: 0 1rem;
  position: relative;
  top: -0.65rem;
  font-size: 0.875rem;
}

.btn-google {
  width: 100%;
  padding: 0.875rem;
  background: var(--white);
  color: var(--gray-700);
  border: 1.5px solid var(--gray-300);
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-google:hover:not(:disabled) {
  background-color: var(--gray-50);
  border-color: var(--gray-400);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-google:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-google svg {
  flex-shrink: 0;
}

.register-link {
  text-align: center;
  color: var(--gray-600);
  font-size: 0.95rem;
}

.register-link a {
  color: var(--primary-green);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.register-link a:hover {
  color: var(--primary-green-dark);
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem;
  }
  
  .logo h1 {
    font-size: 2rem;
  }
}
</style>
