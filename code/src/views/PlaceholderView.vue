<template>
  <div class="placeholder-view">
    <div class="placeholder-content">
      <div class="placeholder-icon">
        <Construction :size="64" />
      </div>
      <h1 class="placeholder-title">{{ pageTitle }}</h1>
      <p class="placeholder-description">
        Diese Seite ist derzeit in Entwicklung und wird bald verfügbar sein.
      </p>
      <div class="placeholder-actions">
        <router-link to="/" class="back-button">
          <ArrowLeft :size="18" />
          Zurück zur Startseite
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Construction, ArrowLeft } from 'lucide-vue-next'

export default {
  name: 'PlaceholderView',
  components: {
    Construction,
    ArrowLeft
  },
  setup() {
    const route = useRoute()

    const pageTitle = computed(() => {
      const titles = {
        '/products': 'Produkte',
        '/categories': 'Kategorien',
        '/deals': 'Angebote',
        '/new-arrivals': 'Neuheiten',
        '/cart': 'Warenkorb',
        '/profile': 'Mein Profil',
        '/orders': 'Meine Bestellungen',
        '/wishlist': 'Wunschliste',
        '/contact': 'Kontakt',
        '/faq': 'Häufige Fragen',
        '/shipping': 'Versandinformationen',
        '/returns': 'Rückgabe & Umtausch',
        '/size-guide': 'Größentabelle',
        '/privacy': 'Datenschutz',
        '/terms': 'Allgemeine Geschäftsbedingungen',
        '/imprint': 'Impressum',
        '/sitemap': 'Sitemap',
        '/cookies': 'Cookie-Einstellungen'
      }
      
      return titles[route.path] || 'Seite in Entwicklung'
    })

    return {
      pageTitle
    }
  }
}
</script>

<style scoped>
.placeholder-view {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.placeholder-content {
  text-align: center;
  max-width: 500px;
  padding: 3rem 2rem;
  background-color: var(--white);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--gray-200);
}

.placeholder-icon {
  margin-bottom: 1.5rem;
  opacity: 0.8;
  display: flex;
  justify-content: center;
  color: var(--primary-green);
}

.placeholder-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1rem;
}

.placeholder-description {
  font-size: 1.1rem;
  color: var(--gray-600);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.placeholder-actions {
  display: flex;
  justify-content: center;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-green);
  color: var(--white);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.back-button:hover {
  background-color: var(--primary-green-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

@media (max-width: 768px) {
  .placeholder-content {
    padding: 2rem 1rem;
  }
  
  .placeholder-title {
    font-size: 1.5rem;
  }
  
  .placeholder-description {
    font-size: 1rem;
  }
}
</style>