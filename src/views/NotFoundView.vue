<template>
    <div class="not-found">
        <div class="content-card">
            
            <div class="error-code">404</div>
            <h1>Seite nicht gefunden</h1>
            <p>Die angeforderte Seite existiert leider nicht.</p>
            
            <div class="actions">
                <router-link to="/" class="btn-primary">
                    <HomeIcon :size="20" />
                    Zur Startseite
                </router-link>
                <button @click="goBack" class="btn-secondary">
                    <ArrowLeftIcon :size="20" />
                    Zurück
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { HomeIcon, ArrowLeftIcon, FrownIcon } from 'lucide-vue-next'

export default {
    name: 'NotFoundView',
    components: {
        HomeIcon,
        ArrowLeftIcon,
        FrownIcon
    },
    setup() {
        const router = useRouter()

        const goBack = () => {
            router.back()
        }

        return {
            goBack
        }
    }
}
</script>

<style scoped>
.not-found {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1rem;
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.content-card {
    padding: 3rem;
    text-align: center;
    width: 100%;
}

.icon-container {
    width: 100px;
    height: 100px;
    margin: 0 auto 2rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    color: var(--white);
}

.error-code {
    font-size: 9rem;
    font-weight: 900;
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    margin-bottom: 2rem;
    opacity: 0.8;
}

.content-card h1 {
    font-size: 2rem;
    color: var(--gray-900);
    margin-bottom: 1rem;
}

.content-card p {
    color: var(--gray-600);
    margin-bottom: 2.5rem;
    font-size: 1.125rem;
}

.actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn-primary, .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
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
    .error-code {
        font-size: 4rem;
    }

    .content-card h1 {
        font-size: 1.5rem;
    }

    .content-card {
        padding: 2rem 1.5rem;
    }

    .actions {
        flex-direction: column;
    }

    .btn-primary, .btn-secondary {
        width: 100%;
        justify-content: center;
    }
}
</style>