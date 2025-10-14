<template>
  <div class="shipping-page">
    <section class="page-header">
      <p class="eyebrow">Kundenservice</p>
      <h1>Versandinformationen</h1>
      <p class="intro">
        Erfahren Sie alles zu Lieferzeiten, Versandpartnern und Kosten. Wir halten Ihre Bestellung transparent
        nachverfolgbar und informieren proaktiv über jeden Schritt.
      </p>
    </section>

    <div class="shipping-grid">
      <section class="card">
        <h2>Lieferzeiten</h2>
        <p class="card-intro">Unsere Versandzeiten gelten für Lagerware innerhalb Deutschlands.</p>
        <ul class="info-list">
          <li>
            <div class="icon-badge"><Truck :size="18" /></div>
            <div>
              <p class="label">Standardversand</p>
              <p class="helper">2-3 Werktage, klimaneutral mit DHL GoGreen</p>
            </div>
          </li>
          <li>
            <div class="icon-badge"><Zap :size="18" /></div>
            <div>
              <p class="label">Expressversand</p>
              <p class="helper">Zustellung am nächsten Werktag bei Bestellung bis 15:00 Uhr</p>
            </div>
          </li>
          <li>
            <div class="icon-badge"><Globe :size="18" /></div>
            <div>
              <p class="label">Europaweiter Versand</p>
              <p class="helper">4-6 Werktage, verzollte Lieferung in EU-Laender</p>
            </div>
          </li>
        </ul>
      </section>

      <section class="card">
        <h2>Versandkosten</h2>
        <table class="shipping-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Standard</th>
              <th>Express</th>
              <th>Frei ab</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Deutschland</td>
              <td>4,90 EUR</td>
              <td>12,90 EUR</td>
              <td>79,00 EUR</td>
            </tr>
            <tr>
              <td>Oesterreich</td>
              <td>7,90 EUR</td>
              <td>19,90 EUR</td>
              <td>129,00 EUR</td>
            </tr>
            <tr>
              <td>Schweiz</td>
              <td>14,90 EUR</td>
              <td>29,90 EUR</td>
              <td>149,00 EUR</td>
            </tr>
            <tr>
              <td>EU restlich</td>
              <td>11,90 EUR</td>
              <td>24,90 EUR</td>
              <td>149,00 EUR</td>
            </tr>
          </tbody>
        </table>
        <p class="table-note">Alle Preise inkl. Verpackung und Versicherung. Zollgebühren für Nicht-EU-Länder werden separat ausgewiesen.</p>
      </section>

      <section class="card">
        <h2>Versandpartner</h2>
        <p class="card-intro">Wir arbeiten mit zuverlässigen Logistikern für eine flexible Zustellung.</p>
        <div class="partner-grid">
          <article v-for="partner in partners" :key="partner.name" class="partner-card">
            <div class="partner-header">
              <component :is="partner.icon" :size="22" />
              <h3>{{ partner.name }}</h3>
            </div>
            <p>{{ partner.description }}</p>
            <ul>
              <li v-for="service in partner.services" :key="service">{{ service }}</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="card highlight">
        <h2>Tracking & Benachrichtigungen</h2>
        <div class="benefits">
          <div class="benefit">
            <Bell :size="18" />
            <p>Live-Status per Mail oder Push in der App mit jeder Statusänderung.</p>
          </div>
          <div class="benefit">
            <MapPin :size="18" />
            <p>Präzise Sendungsverfolgung inklusive voraussichtlicher Zustellzeit.</p>
          </div>
          <div class="benefit">
            <Calendar :size="18" />
            <p>Flexibel: Liefertermin verschieben oder Abstellgenehmigung digital erteilen.</p>
          </div>
        </div>
        <p class="note">
          Tipp: Aktivieren Sie im Kundenkonto die SMS-Benachrichtigung. So informieren wir Sie auch unterwegs über Abweichungen.
        </p>
      </section>
    </div>
  </div>
</template>

<script>
import { Bell, Calendar, Globe, MapPin, Truck, Zap, Box, PackageCheck } from 'lucide-vue-next'

const createPartner = (name, icon, description, services) => ({ name, icon, description, services })

export default {
  name: 'ShippingView',
  components: {
    Bell,
    Calendar,
    Globe,
    MapPin,
    Truck,
    Zap,
    Box,
    PackageCheck
  },
  setup() {
    const partners = [
      createPartner('DHL Paket', Truck, 'Standardversand innerhalb Deutschlands und Europas.', [
        'Frei Haus ab 79 Euro Bestellwert',
        'Packstation und Filialzustellung',
        'CO2-neutrale Lieferung mit GoGreen'
      ]),
      createPartner('UPS Express', Zap, 'Zeitkritische Lieferungen für eilige Bestellungen.', [
        'Garantierte Zustellung am nächsten Werktag',
        'Samstagszustellung in Ballungsräumen',
        'Live-Tracking mit Zeitfenster-Ankündigung'
      ]),
      createPartner('DB Schenker', Box, 'Speditionslieferung für Großgeräte und Paletten.', [
        'Terminavis 24 Stunden vor Zustellung',
        'Transport bis Bordsteinkante oder Wunschraum',
        'Optionale Montage durch Fachpersonal'
      ]),
      createPartner('Post CH', PackageCheck, 'Zuverlässiger Versand in die Schweiz mit Verzollung.', [
        'DDP-Versand inklusive Zollabwicklung',
        'Track & Trace in Echtzeit',
        'Verpackung in recycelten Materialien'
      ])
    ]

    return {
      partners
    }
  }
}
</script>

<style scoped>
.shipping-page {
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

.shipping-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
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
  margin: 0 0 0.25rem;
}

.helper {
  margin: 0;
  color: var(--gray-600);
  line-height: 1.4;
}

.shipping-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--gray-200);
  border-radius: 14px;
  overflow: hidden;
  font-size: 0.95rem;
}

.shipping-table th,
.shipping-table td {
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
}

.shipping-table th {
  background: var(--gray-100);
  font-weight: 600;
  color: var(--gray-800);
}

.shipping-table tr:last-child td {
  border-bottom: none;
}

.table-note {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gray-500);
}

.partner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.partner-card {
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  padding: 1.5rem;
  background: var(--gray-50);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.partner-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-green);
}

.partner-header h3 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--gray-900);
}

.partner-card ul {
  list-style: disc;
  margin: 0 0 0 1.1rem;
  padding: 0;
  color: var(--gray-600);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.highlight {
  background: var(--primary-green-lighter);
  border: 1px solid var(--primary-green);
}

.benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.benefit {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  color: var(--primary-green-darker);
}

.note {
  margin: 0;
  color: var(--primary-green-darker);
  font-size: 0.95rem;
}

@media (max-width: 640px) {
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
