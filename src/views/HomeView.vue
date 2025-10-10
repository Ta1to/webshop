<template>
    <div class="home">
        <div class="hero">
            <h1>Willkommen bei evaris</h1>
            <p class="subtitle">Dein moderner Online-Shop</p>
        </div>

        <div v-if="user" class="user-section">
            <div class="welcome-card">
                <div class="welcome-header">
                    <div class="avatar">
                        {{ getInitials(user.displayName || user.email) }}
                    </div>
                    <div>
                        <h2>Hallo, {{ user.displayName || 'Freund' }}!</h2>
                        <p>Schön, dass du wieder da bist</p>
                    </div>
                </div>
            </div>

            <div v-if="userData" class="user-details-card">
                <h3>Dein Profil</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <div class="detail-label">Name</div>
                            <div class="detail-value">{{ userData.displayName || 'Nicht angegeben' }}</div>
                        </div>
                    </div>

                    <div class="detail-item">
                        <div class="detail-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <div class="detail-label">E-Mail</div>
                            <div class="detail-value">{{ userData.email }}</div>
                        </div>
                    </div>

                    <div class="detail-item">
                        <div class="detail-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <div class="detail-label">Rolle</div>
                            <div class="detail-value">
                                <span class="role-badge">{{ userData.role || 'user' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-item">
                        <div class="detail-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <div class="detail-label">Mitglied seit</div>
                            <div class="detail-value">{{ formatDate(userData.createdAt) }}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div v-else-if="loading" class="loading">
                <div class="spinner"></div>
                <p>Lade Benutzerdaten...</p>
            </div>
        </div>
        
        <div v-else class="guest-section">
            <div class="guest-card">
                <h2>Starte jetzt durch!</h2>
                <p>Erstelle ein Konto oder melde dich an, um alle Funktionen zu nutzen.</p>
                <div class="guest-actions">
                    <router-link to="/register" class="btn-primary">Registrieren</router-link>
                    <router-link to="/login" class="btn-secondary">Anmelden</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { observeAuthState } from '../services/auth'
import { getUserDocument } from '../services/db'

export default {
    name: 'HomeView',
    setup() {
        const user = ref(null)
        const userData = ref(null)
        const loading = ref(false)

        const loadUserData = async (userId) => {
            loading.value = true
            const result = await getUserDocument(userId)
            if (result.success) {
                userData.value = result.data
            }
            loading.value = false
        }

        const formatDate = (timestamp) => {
            if (!timestamp) return 'Unbekannt'
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
            return date.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }

        const getInitials = (name) => {
            if (!name) return '?'
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }

        onMounted(() => {
            observeAuthState((authUser) => {
                user.value = authUser
                if (authUser) {
                    loadUserData(authUser.uid)
                } else {
                    userData.value = null
                }
            })
        })

        return {
            user,
            userData,
            loading,
            formatDate,
            getInitials
        }
    }
}
</script>

<style scoped>
.home {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.hero {
    text-align: center;
    margin-bottom: 3rem;
}

.hero h1 {
    font-size: 3rem;
    color: var(--gray-900);
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.subtitle {
    font-size: 1.25rem;
    color: var(--gray-600);
}

.user-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.welcome-card {
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    padding: 2.5rem;
    border-radius: 16px;
    color: var(--white);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.welcome-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--white);
    border: 3px solid rgba(255, 255, 255, 0.3);
}

.welcome-header h2 {
    color: var(--white);
    margin-bottom: 0.5rem;
    font-size: 1.75rem;
}

.welcome-header p {
    opacity: 0.9;
    font-size: 1rem;
}

.user-details-card {
    background: var(--white);
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.user-details-card h3 {
    color: var(--gray-900);
    margin-bottom: 2rem;
    font-size: 1.5rem;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--gray-50);
    border-radius: 12px;
    transition: all 0.2s ease;
}

.detail-item:hover {
    background-color: var(--primary-green-lighter);
    transform: translateY(-2px);
}

.detail-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.detail-icon svg {
    width: 20px;
    height: 20px;
    color: var(--primary-green);
}

.detail-label {
    font-size: 0.875rem;
    color: var(--gray-500);
    margin-bottom: 0.25rem;
}

.detail-value {
    color: var(--gray-900);
    font-weight: 500;
    font-size: 1rem;
}

.role-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: var(--primary-green);
    color: var(--white);
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}

.loading {
    text-align: center;
    padding: 3rem;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--gray-200);
    border-top-color: var(--primary-green);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.guest-section {
    max-width: 600px;
    margin: 0 auto;
}

.guest-card {
    background: var(--white);
    padding: 3rem;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.guest-card h2 {
    color: var(--gray-900);
    margin-bottom: 1rem;
    font-size: 2rem;
}

.guest-card p {
    color: var(--gray-600);
    margin-bottom: 2rem;
    font-size: 1.125rem;
}

.guest-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn-primary, .btn-secondary {
    padding: 0.875rem 2rem;
    border-radius: 10px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
    display: inline-block;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    color: var(--white);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
    background: var(--white);
    color: var(--primary-green);
    border: 2px solid var(--primary-green);
}

.btn-secondary:hover {
    background: var(--primary-green-lighter);
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .hero h1 {
        font-size: 2rem;
    }
    
    .details-grid {
        grid-template-columns: 1fr;
    }
    
    .guest-actions {
        flex-direction: column;
    }
    
    .btn-primary, .btn-secondary {
        width: 100%;
    }
}
</style>