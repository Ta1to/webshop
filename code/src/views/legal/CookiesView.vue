<template>
  <div class="legal-page">
    <section class="page-header">
      <p class="eyebrow">Rechtliches</p>
      <h1>Cookie-Richtlinie</h1>
      <p class="intro">
        Diese Cookie-Richtlinie erklärt, wie Evaris Cookies und ähnliche Technologien verwendet, 
        um Ihnen ein optimales Einkaufserlebnis zu bieten und unsere Website kontinuierlich zu verbessern.
      </p>
    </section>

    <section class="legal-section">
      <h2>Was sind Cookies?</h2>
      <p>
        Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen. 
        Sie helfen uns, Ihre Präferenzen zu speichern, Ihre Sitzung zu verwalten und Informationen über Ihre 
        Nutzung unserer Website zu sammeln. Cookies enthalten keine persönlichen Informationen, die Sie direkt identifizieren.
      </p>
    </section>

    <section class="legal-section">
      <h2>Welche Cookies verwenden wir?</h2>
      <p class="section-intro">
        Wir setzen verschiedene Arten von Cookies ein, die unterschiedliche Zwecke erfüllen:
      </p>

      <div class="cookie-type-grid">
        <article class="cookie-type-card necessary">
          <div class="card-icon">
            <Shield :size="28" />
          </div>
          <h3>Notwendige Cookies</h3>
          <span class="badge">Erforderlich</span>
          <p>
            Diese Cookies sind für die Grundfunktionen der Website unerlässlich und können nicht deaktiviert werden. 
            Sie ermöglichen Kernfunktionen wie Sicherheit, Netzwerkverwaltung und Zugänglichkeit.
          </p>
        </article>

        <article class="cookie-type-card functional">
          <div class="card-icon">
            <Sliders :size="28" />
          </div>
          <h3>Funktionale Cookies</h3>
          <span class="badge optional">Optional</span>
          <p>
            Diese Cookies ermöglichen erweiterte Funktionalitäten und Personalisierung. 
            Sie können von uns oder von Drittanbietern gesetzt werden, deren Dienste wir auf unseren Seiten eingebunden haben.
          </p>
        </article>

        <article class="cookie-type-card analytics">
          <div class="card-icon">
            <BarChart3 :size="28" />
          </div>
          <h3>Analyse Cookies</h3>
          <span class="badge optional">Optional</span>
          <p>
            Diese Cookies sammeln anonymisierte Informationen darüber, wie Besucher unsere Website nutzen. 
            Wir verwenden diese Daten, um die Leistung zu messen und das Nutzererlebnis zu verbessern.
          </p>
        </article>

        <article class="cookie-type-card marketing">
          <div class="card-icon">
            <Target :size="28" />
          </div>
          <h3>Marketing Cookies</h3>
          <span class="badge optional">Optional</span>
          <p>
            Diese Cookies werden verwendet, um Werbung relevanter für Sie zu gestalten. 
            Sie verhindern, dass dieselbe Anzeige wiederholt erscheint, und helfen uns, die Effektivität von Werbekampagnen zu messen.
          </p>
        </article>
      </div>
    </section>

    <section class="legal-section">
      <h2>Cookie-Verwaltung</h2>
      <p>
        Sie haben die volle Kontrolle über die Verwendung von Cookies auf unserer Website. 
        Sie können Ihre Präferenzen jederzeit ändern oder Cookies blockieren.
      </p>

      <div class="management-options">
        <div class="option-card">
          <h3>Über unsere Website</h3>
          <p>
            Klicken Sie auf den Button unten, um Ihre Cookie-Einstellungen anzupassen. 
            Sie können einzelne Cookie-Kategorien aktivieren oder deaktivieren.
          </p>
          <button @click="openCookieSettings" class="action-btn primary">
            <Settings :size="20" />
            Cookie-Einstellungen öffnen
          </button>
        </div>

        <div class="option-card">
          <h3>Über Ihren Browser</h3>
          <p>
            Die meisten Browser ermöglichen es Ihnen, Cookies über die Einstellungen zu verwalten. 
            Beachten Sie, dass das Blockieren aller Cookies die Funktionalität unserer Website beeinträchtigen kann.
          </p>
          <div class="browser-links">
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Chrome</a>
            <a href="https://support.mozilla.org/de/kb/cookies-erlauben-und-ablehnen" target="_blank" rel="noopener">Firefox</a>
            <a href="https://support.apple.com/de-de/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a>
            <a href="https://support.microsoft.com/de-de/microsoft-edge/cookies-in-microsoft-edge-löschen-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener">Edge</a>
          </div>
        </div>
      </div>
    </section>

    <section class="legal-section">
      <h2>Cookies von Drittanbietern</h2>
      <p>
        Einige Cookies werden von Drittanbietern gesetzt, deren Dienste wir auf unserer Website nutzen. 
        Dazu gehören Analyse- und Werbedienste. Diese Anbieter können Informationen über Ihre Aktivitäten 
        auf verschiedenen Websites sammeln.
      </p>

      <div class="third-party-list">
        <div class="third-party-item">
          <h4>Google Analytics</h4>
          <p>
            Wir nutzen Google Analytics zur Analyse des Nutzerverhaltens. Die Daten werden anonymisiert erfasst.
          </p>
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">
            Datenschutzerklärung von Google
          </a>
        </div>
      </div>
    </section>

    <section class="legal-section">
      <h2>Weitere Technologien</h2>
      <p>
        Neben Cookies verwenden wir auch andere Technologien wie Local Storage und Session Storage, 
        um bestimmte Präferenzen und Daten lokal auf Ihrem Gerät zu speichern. Diese Technologien 
        funktionieren ähnlich wie Cookies, werden aber nicht bei jeder Serveranfrage übertragen.
      </p>
    </section>

    <section class="legal-section">
      <h2>Aktualisierung dieser Richtlinie</h2>
      <p>
        Wir können diese Cookie-Richtlinie von Zeit zu Zeit aktualisieren, um Änderungen in unseren 
        Praktiken oder aus anderen betrieblichen, rechtlichen oder aufsichtsrechtlichen Gründen zu berücksichtigen. 
        Bitte überprüfen Sie diese Seite regelmäßig, um über unsere Verwendung von Cookies informiert zu bleiben.
      </p>
      <div class="update-info">
        <strong>Letzte Aktualisierung:</strong> {{ lastUpdated }}
      </div>
    </section>

    <section class="legal-section contact-section">
      <h2>Fragen?</h2>
      <p>
        Wenn Sie Fragen zu unserer Verwendung von Cookies haben, kontaktieren Sie uns bitte:
      </p>
      <div class="contact-details">
        <div class="contact-item">
          <Mail :size="20" />
          <a href="mailto:privacy@evaris.de">privacy@evaris.de</a>
        </div>
        <div class="contact-item">
          <Phone :size="20" />
          <a href="tel:+4912345678">+49 123 456 78</a>
        </div>
      </div>
      <router-link to="/contact" class="contact-link">
        Zum Kontaktformular →
      </router-link>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Shield, Sliders, BarChart3, Target, Settings, Mail, Phone } from 'lucide-vue-next'
import { cookieEventBus, COOKIE_EVENTS } from '@/services/cookieEvents'

const lastUpdated = ref('14. Januar 2026')

const openCookieSettings = () => {
  cookieEventBus.emit(COOKIE_EVENTS.OPEN_SETTINGS)
}
</script>

<style scoped>
.legal-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 4rem 1.5rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
  color: var(--primary-green);
  font-weight: 600;
}

.page-header h1 {
  margin: 0;
  font-size: 2.25rem;
  color: var(--gray-900);
}

.intro {
  margin: 0;
  color: var(--gray-700);
  line-height: 1.7;
}

.legal-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.legal-section h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray-900);
}

.legal-section p {
  margin: 0;
  color: var(--gray-700);
  line-height: 1.7;
}

.section-intro {
  font-weight: 500;
  color: var(--gray-800);
}

/* Cookie Type Grid */
.cookie-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
}

.cookie-type-card {
  background: var(--gray-50);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cookie-type-card.necessary {
  background: linear-gradient(to bottom, var(--primary-green-lighter), var(--gray-50));
  border-left: 4px solid var(--primary-green);
}

.cookie-type-card.functional {
  border-left: 4px solid #059669;
}

.cookie-type-card.analytics {
  border-left: 4px solid #047857;
}

.cookie-type-card.marketing {
  border-left: 4px solid #065f46;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.necessary .card-icon {
  background: var(--primary-green-lighter);
  color: var(--primary-green);
}

.functional .card-icon {
  background: #d1fae5;
  color: #059669;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.necessary .card-icon {
  background: var(--primary-green-lighter);
  color: var(--primary-green);
}

.functional .card-icon {
  background: #d1fae5;
  color: #059669;
}

.analytics .card-icon {
  background: #a7f3d0;
  color: #047857;
}

.marketing .card-icon {
  background: #6ee7b7;
  color: #065f46;
}

.cookie-type-card h3 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--gray-900);
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge:not(.optional) {
  background: var(--primary-green);
  color: var(--white);
}

.badge.optional {
  background: var(--gray-200);
  color: var(--gray-600);
}

.cookie-type-card p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-700);
  line-height: 1.5;
}

.examples li {
  color: var(--gray-600);
  font-size: 0.875rem;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.examples strong {
  color: var(--gray-700);
  font-size: 0.85rem;
}

.examples ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.25rem;
}

.examples li {
  color: var(--gray-600);
  font-size: 0.8rem;
  margin: 0.25rem 0;
  line-height: 1.5;
}

.examples code {
  background: var(--gray-100);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--gray-800);
}

.cookie-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gray-300);
  margin: 1rem;
  margin-top: 1rem;
}

.option-card {
  background: var(--gray-50);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-card h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--gray-900);
}

.option-card p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gray-700);
  line-height: 1.6
}
.action-btn {
  display: inline-flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  margin-top: 0.5rem;
}

.action-btn.primary {
  background: var(--primary-green);
  color: var(--white);
}

.action-btn.primary:hover {
  background: var(--primary-green-dark);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.browser-links {
  margin-top: 0.5rem;
}

.browser-links a {
  padding: 0.4rem 0.85rem;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  color: var(--primary-green);
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.browser-links a:hover {
  background: var(--gray-100);
  border-color: var(--gray-400);
}

.browser-links a:hover {
  background: var(--primary-green-lighter);
  border-color: var(--primary-green);
}

/* Third Party List */
.third-party-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.third-party-item {
  background: var(--gray-50);
  padding: 0.875rem;
  border-left: 3px solid var(--primary-green);
  border-radius: 8px;
}

.third-party-item h4 {
  margin: 0 0 0.375rem 0;
  font-size: 0.95rem;
  color: var(--gray-900);
}

.third-party-item p {
  margin: 0 0 0.375rem 0;
  font-size: 0.85rem;
  color: var(--gray-700);
  line-height: 1.5;
}

.third-party-item a {
  color: var(--primary-green);
  font-size: 0.85rem;
}

/* Update Info */
.update-info {
  background: var(--gray-50);
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  color: var(--gray-700);
  font-size: 0.9rem;
}

/* Contact Section */
.contact-section {
  background-color: var(--white);
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
  font-size: 0.9rem;
}

.contact-item a {
  color: var(--primary-green);
  font-weight: 500;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--primary-green);
  color: var(--white);
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  margin-top: 1rem;
}

.contact-link:hover {
  background: var(--primary-green-dark);
  transform: translateX(4px);
  padding: 1.3rem 1.25rem 1.4rem;
  gap: 2rem;
  }
  
  .page-header h1 {
    font-size: 1.9rem;
  }
  
  .legal-section {
    padding: 1.5rem;
    padding: 2rem 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .cookie-type-grid {
    grid-template-columns: 1fr;
  }
  
  .management-options {
    grid-template-columns: 1fr;
  }
</style>
