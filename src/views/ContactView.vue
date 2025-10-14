<template>
  <div class="contact-page">
    <section class="page-header">
      <p class="eyebrow">Kundenservice</p>
      <h1>Kontakt</h1>
      <p class="intro">
        Unser Support-Team hilft Ihnen gern bei Fragen zu Bestellung, Lieferung oder Produkten.
        Wählen Sie den passenden Kanal oder nutzen Sie das Formular, wir melden uns schnellstmöglich.
      </p>
    </section>

    <div class="contact-layout">
      <div class="contact-top">
        <section class="card contact-overview">
        <h2>Kontaktieren Sie uns</h2>
        <p class="card-intro">Wir sind montags bis freitags von 08:30 bis 18:30 Uhr für Sie da.</p>
        <ul class="contact-methods">
          <li>
            <div class="icon-badge">
              <Phone :size="18" />
            </div>
            <div>
              <p class="label">Telefon</p>
              <p class="value">+49 150 123 456 78</p>
              <p class="helper">Kostenlos aus allen deutschen Netzen</p>
            </div>
          </li>
          <li>
            <div class="icon-badge">
              <Mail :size="18" />
            </div>
            <div>
              <p class="label">E-Mail</p>
              <p class="value">support@evaris.de</p>
              <p class="helper">Antwort innerhalb von 12 Stunden</p>
            </div>
          </li>
          <li>
            <div class="icon-badge">
              <MessageCircle :size="18" />
            </div>
            <div>
              <p class="label">Live-Chat</p>
              <p class="value">Täglich 09:30 - 22:30 Uhr</p>
              <p class="helper">Erreichbar über das Icon unten rechts</p>
            </div>
          </li>
        </ul>
        <div class="info-block">
          <h3>Adresse</h3>
          <p class="value">Musterstraße 123<br />12345 Musterstadt</p>
          <p class="helper">Bitte vereinbaren Sie vorab einen Termin für Abholungen oder Retouren.</p>
        </div>
        </section>

      <section class="card service-promises">
        <h2>So helfen wir</h2>
        <ul class="promises">
          <li>
            <div class="icon-badge">
              <Clock :size="18" />
            </div>
            <div>
              <p class="label">Schnelle Antworten</p>
              <p class="helper">Die meisten Anfragen klären wir noch am selben Werktag.</p>
            </div>
          </li>
          <li>
            <div class="icon-badge">
              <Package :size="18" />
            </div>
            <div>
              <p class="label">Bestellstatus</p>
              <p class="helper">Wir prüfen Ihre Lieferung in Echtzeit und informieren proaktiv.</p>
            </div>
          </li>
          <li>
            <div class="icon-badge">
              <ShieldCheck :size="18" />
            </div>
            <div>
              <p class="label">Garantie & Reklamation</p>
              <p class="helper">Wir finden gemeinsam eine faire Lösung - ohne unnötige Wartezeiten.</p>
            </div>
          </li>
        </ul>
        <div class="info-block alt">
          <h3>Rechnungs- und Supportteam</h3>
          <p class="helper">Mo-Fr 08:30 - 18:30 Uhr, Sa 10:30 - 14:30 Uhr
            <br />Feiertage: eingeschränkter Service, siehe FAQ.</p>
        </div>
        </section>
      </div>

      <section class="card form-card">
        <h2>Nachricht senden</h2>
        <p class="card-intro">Wir antworten innerhalb eines Werktages. Bitte geben Sie eine Bestellnummer an, falls vorhanden.</p>
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="form-row">
            <div class="form-field">
              <label for="name">Name*</label>
              <input id="name" v-model="form.name" type="text" required />
            </div>
            <div class="form-field">
              <label for="email">E-Mail*</label>
              <input id="email" v-model="form.email" type="email" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="subject">Betreff*</label>
              <input id="subject" v-model="form.subject" type="text" required />
            </div>
            <div class="form-field">
              <label for="order">Bestellnummer (optional)</label>
              <input id="order" v-model="form.orderId" type="text" placeholder="z. B. EV-12345" />
            </div>
          </div>
          <div class="form-field">
            <label for="message">Nachricht*</label>
            <textarea
              id="message"
              v-model="form.message"
              rows="6"
              required
              placeholder="Wie können wir helfen?"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="isSubmitting">
              <Send :size="16" />
              <span>{{ isSubmitting ? 'Wird gesendet...' : 'Nachricht senden' }}</span>
            </button>
            <p v-if="isSubmitted" class="success">Danke für Ihre Nachricht - wir melden uns in Kürze.</p>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Phone, Mail, MessageCircle, Clock, Package, ShieldCheck, Send } from 'lucide-vue-next'

export default {
  name: 'ContactView',
  components: {
    Phone,
    Mail,
    MessageCircle,
    Clock,
    Package,
    ShieldCheck,
    Send
  },
  setup() {
    const form = ref({
      name: '',
      email: '',
      subject: '',
      orderId: '',
      message: ''
    })
    const isSubmitting = ref(false)
    const isSubmitted = ref(false)

    const resetForm = () => {
      form.value = {
        name: '',
        email: '',
        subject: '',
        orderId: '',
        message: ''
      }
    }

    const handleSubmit = async () => {
      if (isSubmitting.value) return
      isSubmitting.value = true
      await new Promise((resolve) => setTimeout(resolve, 600)) // simulate request latency
      isSubmitted.value = true
      resetForm()
      setTimeout(() => {
        isSubmitted.value = false
      }, 4000)
      isSubmitting.value = false
    }

    return {
      form,
      isSubmitting,
      isSubmitted,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.contact-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-green);
}

.page-header h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--gray-900);
}

.intro {
  max-width: 720px;
  color: var(--gray-600);
  line-height: 1.6;
}

.contact-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-top {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: stretch;
}

.contact-top .card {
  height: 100%;
}

.card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.04);
}

.card h2 {
  font-size: 1.4rem;
  margin: 0;
  color: var(--gray-900);
}

.card-intro {
  margin: 0;
  color: var(--gray-600);
  line-height: 1.5;
}

.contact-methods {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-methods li {
  display: flex;
  gap: 1rem;
}

.icon-badge {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-green-lighter);
  color: var(--primary-green);
  flex-shrink: 0;
}

.label {
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 0.25rem 0;
}

.value {
  margin: 0;
  color: var(--gray-900);
  font-size: 1rem;
}

.helper {
  margin: 0.3rem 0 0 0;
  color: var(--gray-500);
  font-size: 0.9rem;
  line-height: 1.4;
}

.info-block {
  background: var(--gray-50);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-block.alt {
  background: var(--primary-green-lighter);
  color: var(--primary-green-darker);
}

.promises {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.promises li {
  display: flex;
  gap: 1rem;
}

.form-card form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--gray-700);
}

input,
textarea {
  border: 1px solid var(--gray-300);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: var(--gray-800);
  background: var(--white);
}

input:focus,
textarea:focus {
  border-color: var(--primary-green);
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-green-lighter);
}

textarea {
  resize: vertical;
  min-height: 180px;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

button[type="submit"] {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-green);
  border: none;
  color: var(--white);
  padding: 0.85rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 15px rgba(16, 185, 129, 0.25);
}

button[type="submit"]:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

button[type="submit"]:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.success {
  font-size: 0.9rem;
  color: var(--primary-green-darker);
  margin: 0;
}

@media (max-width: 768px) {
  .contact-page {
    padding: 2.5rem 1rem 3.5rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
