<template>
  <div class="returns-page">
    <section class="page-header">
      <p class="eyebrow">Kundenservice</p>
      <h1>Rückgabe & Umtausch</h1>
      <p class="intro">
        Sollte ein Artikel nicht passen oder gefallen, machen wir die Rücksendung so einfach wie möglich.
        Hier finden Sie alle Schritte vom Retourenlabel bis zur Rückerstattung im Überblick.
      </p>
    </section>

    <section class="card process">
      <h2>Rückgabe in drei Schritten</h2>
      <ol class="process-steps">
        <li v-for="step in steps" :key="step.number">
          <span class="step-number">{{ step.number }}</span>
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </li>
      </ol>
    </section>

    <div class="grid">
      <section class="card">
        <h2>Bedingungen</h2>
        <ul class="checklist">
          <li v-for="condition in conditions" :key="condition">
            <CheckCircle :size="18" />
            <span>{{ condition }}</span>
          </li>
        </ul>
      </section>

      <section class="card">
        <h2>Umtausch</h2>
        <p class="card-intro">
          Sie möchten einen Artikel in eine andere Größe oder Farbe tauschen? Wir reservieren gern den Wunschartikel.
        </p>
        <ul class="info-list">
          <li>
            <ArrowLeftRight :size="18" />
            <div>
              <p class="label">Direkter Austausch</p>
              <p class="helper">Rufen Sie uns an, wir legen den neuen Artikel sofort für sieben Tage zurück.</p>
            </div>
          </li>
          <li>
            <Gift :size="18" />
            <div>
              <p class="label">Geschenke</p>
              <p class="helper">Falsche Größe? Senden Sie anonym zurück, wir tauschen ohne Preisangabe um.</p>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <section class="card refund">
      <h2>Rückerstattung</h2>
      <div class="refund-grid">
        <article v-for="refund in refunds" :key="refund.method">
          <header>
            <component :is="refund.icon" :size="20" />
            <h3>{{ refund.method }}</h3>
          </header>
          <p>{{ refund.description }}</p>
          <p class="timing">Bearbeitung: {{ refund.timing }}</p>
        </article>
      </div>
      <p class="note">Hinweis: Bei Sammelbestellungen erstatten wir Teilretouren anteilig inklusive Versandkosten.</p>
    </section>

    <section class="card help">
      <h2>Noch Fragen?</h2>
      <div class="help-grid">
        <div>
          <p>Unser Retourenteam erreichen Sie montags bis freitags von 08:30 bis 18:30 Uhr.</p>
          <p>
            Schreiben Sie an <a href="mailto:returns@evaris.de">returns@evaris.de</a> oder rufen Sie uns unter
            <a href="tel:+4915012345678">+49 150 123 456 78</a> an.
          </p>
        </div>
        <router-link to="/faq" class="faq-link">
          <HelpCircle :size="18" />
          <span>Zu den FAQ</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { CheckCircle, Gift, HelpCircle, ArrowLeftRight, CreditCard, RefreshCcw, Wallet } from 'lucide-vue-next'

const createStep = (number, title, description) => ({ number, title, description })
const createRefund = (icon, method, description, timing) => ({ icon, method, description, timing })

export default {
  name: 'ReturnsView',
  components: {
  CheckCircle,
  Gift,
  HelpCircle,
  ArrowLeftRight,
  CreditCard,
  RefreshCcw,
  Wallet
  },
  setup() {
    const steps = [
      createStep('01', 'Retoure anmelden', 'Loggen Sie sich im Kundenkonto ein oder nutzen Sie unser Retourenformular ohne Login.'),
      createStep('02', 'Artikel verpacken', 'Legen Sie Ware und Lieferschein ins Paket. Nutzen Sie die Originalverpackung, wenn möglich.'),
      createStep('03', 'Paket abgeben', 'Bringen Sie die Sendung zur Wunschfiliale oder buchen Sie eine kostenfreie Abholung nach Hause.')
    ]

    const conditions = [
      'Artikel ist ungetragen, unbeschädigt und inklusive Etiketten',
      'Retourenfrist 30 Tage nach Zustellung',
      'Elektronik bitte mit komplettem Zubehör einsenden',
      'Individualanfertigungen sind vom Rückgaberecht ausgeschlossen'
    ]

    const refunds = [
      createRefund(CreditCard, 'Kreditkarte / PayPal', 'Rückbuchung erfolgt automatisch auf das ursprüngliche Zahlungsmittel.', '1-3 Werktage nach Prüfung'),
      createRefund(RefreshCcw, 'Gutschein', 'Sie erhalten einen digitalen Gutschein per Mail, sofort in Ihrem Konto verwendbar.', 'Sofort nach Freigabe'),
      createRefund(Wallet, 'Banküberweisung', 'Wir überweisen den Betrag auf das von Ihnen angegebene Konto.', '3-5 Werktage nach Prüfung')
    ]

    return {
      steps,
      conditions,
      refunds
    }
  }
}
</script>

<style scoped>
.returns-page {
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

.card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 18px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.04);
}

.card h2 {
  margin: 0;
  font-size: 1.6rem;
  color: var(--gray-900);
}

.card-intro {
  margin: 0;
  color: var(--gray-600);
  line-height: 1.5;
}

.process-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.process-steps li {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  background: var(--primary-green);
  color: var(--white);
  font-weight: 600;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.process-steps h3 {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  color: var(--gray-800);
}

.process-steps p {
  margin: 0;
  color: var(--gray-600);
  line-height: 1.5;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.checklist li {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  color: var(--gray-700);
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-list li {
  display: flex;
  gap: 0.9rem;
}

.label {
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 0.25rem;
}

.helper {
  margin: 0;
  color: var(--gray-600);
  line-height: 1.5;
}

.refund-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.refund-grid article {
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  padding: 1.5rem;
  background: var(--gray-50);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.refund-grid header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-green);
}

.refund-grid h3 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--gray-900);
}

.refund-grid p {
  margin: 0;
  color: var(--gray-600);
  line-height: 1.5;
}

.timing {
  font-size: 0.9rem;
  color: var(--gray-500);
}

.note {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gray-500);
}

.help {
  background: var(--primary-green-lighter);
  border: 1px solid var(--primary-green);
}

.help-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  justify-content: space-between;
}

.help-grid p {
  margin: 0;
  max-width: 520px;
  color: var(--primary-green-darker);
  line-height: 1.6;
}

.faq-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.4rem;
  border-radius: 999px;
  background: var(--white);
  color: var(--primary-green);
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 8px 15px rgba(16, 185, 129, 0.25);
  transition: transform 0.2s ease;
}

.faq-link:hover {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
