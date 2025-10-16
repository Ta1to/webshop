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
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading">Anmeldung läuft...</span>
          <span v-else>Anmelden</span>
        </button>
      </form>

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
import { loginUser } from '../../services/auth'

export default {
  name: 'LoginView',
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

    const getErrorMessage = (errorCode) => {
      const errorMessages = {
        'auth/invalid-email': 'Ungültige E-Mail-Adresse',
        'auth/user-disabled': 'Dieser Benutzer wurde deaktiviert',
        'auth/user-not-found': 'Benutzer nicht gefunden',
        'auth/wrong-password': 'Falsches Passwort',
        'auth/invalid-credential': 'Ungültige Anmeldedaten',
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
      handleLogin
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

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.divider {
  height: 1px;
  background-color: var(--gray-200);
  margin: 2rem 0;
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
