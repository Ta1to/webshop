<template>
  <div class="faq-page">
    <section class="page-header">
      <p class="eyebrow">Kundenservice</p>
      <h1>Hauefige Fragen</h1>
      <p class="intro">
        In unseren FAQ finden Sie kompakte Antworten auf die wichtigsten Fragen rund um Bestellung,
        Versand, Zahlung und Rücksendung. Falls etwas offen bleibt, kontaktieren Sie gern den Support.
      </p>
    </section>

    <div class="faq-layout">
      <aside class="faq-sidebar">
        <h2>Uebersicht</h2>
        <ul>
          <li v-for="category in categories" :key="category.id">
            <button
              type="button"
              :class="['sidebar-link', { active: category.id === activeCategory } ]"
              @click="setActiveCategory(category.id)"
            >
              <component :is="category.icon" :size="16" />
              <span>{{ category.title }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <section class="faq-content">
        <div v-for="category in filteredCategories" :key="category.id" class="faq-group">
          <h2>{{ category.title }}</h2>
          <p class="group-description">{{ category.description }}</p>
          <div class="faq-items">
            <article
              v-for="item in category.items"
              :key="item.question"
              class="faq-item"
            >
              <header @click="toggle(item.question)">
                <h3>{{ item.question }}</h3>
                <ChevronDown :size="18" :class="{ open: isOpen(item.question) }" />
              </header>
              <transition name="faq">
                <div v-if="isOpen(item.question)" class="answer">
                  <p v-for="(paragraph, index) in item.answer" :key="index">{{ paragraph }}</p>
                </div>
              </transition>
            </article>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Package, CreditCard, RefreshCcw, HelpCircle, ChevronDown, Truck } from 'lucide-vue-next'

const createCategory = (id, title, icon, description, items) => ({
  id,
  title,
  icon,
  description,
  items
})

export default {
  name: 'FAQView',
  components: {
    Package,
    CreditCard,
    RefreshCcw,
    HelpCircle,
    ChevronDown,
    Truck
  },
  setup() {
    const categories = [
      createCategory('orders', 'Bestellung', Package, 'Alles zu Warenkorb, Bestellbestätigung und Auftragsstatus.', [
        {
          question: 'Kann ich meine Bestellung nachträglich ändern?',
          answer: [
            'Innerhalb von 30 Minuten nach Abschluss können wir die Bestellung noch anpassen. Rufen Sie uns an oder nutzen Sie den Live-Chat.',
            'Nach der Versandfreigabe ist eine Änderung nicht mehr möglich. In diesem Fall helfen wir mit einer Rücksendung.'
          ]
        },
        {
          question: 'Wie finde ich meine Bestellnummer?',
          answer: [
            'Sie erhalten Ihre Bestellnummer in der Bestätigungs-Mail sowie im Kundenkonto unter "Bestellungen".',
            'Die Nummer beginnt mit EV und besteht aus fünf Ziffern, zum Beispiel EV-12345.'
          ]
        }
      ]),
      createCategory('shipping', 'Versand', Truck, 'Versandkosten, Lieferzeiten und Zustellung im Überblick.', [
        {
          question: 'Welche Versandoptionen stehen zur Verfügung?',
          answer: [
            'Wir bieten Standardversand (2-3 Werktage) sowie Expressversand (1 Werktag) an.',
            'Ab 79 Euro Warenwert liefern wir innerhalb Deutschlands versandkostenfrei.'
          ]
        },
        {
          question: 'Kann ich meine Lieferung verfolgen?',
          answer: [
            'Sobald Ihr Paket unser Lager verlässt, erhalten Sie eine Versandmail mit Tracking-Link.',
            'Im Kundenkonto finden Sie den aktuellen Status jederzeit in der Bestellübersicht.'
          ]
        }
      ]),
      createCategory('payment', 'Zahlung', CreditCard, 'Informationen zu Zahlungsarten, Reservierungen und Rechnungen.', [
        {
          question: 'Welche Zahlungsmethoden akzeptieren Sie?',
          answer: [
            'Sie können per Kreditkarte, PayPal, Klarna Rechnung oder Sofortüberweisung bezahlen.',
            'Bei Stammkunden steht zudem der Kauf auf Rechnung zur Verfügung.'
          ]
        },
        {
          question: 'Wann erfolgt die Abbuchung?',
          answer: [
            'Bei Käufen mit der Kreditkarte und PayPal wird der Betrag sofort reserviert, aber erst beim Versand abgebucht.',
            'Bei einem Kauf auf Rechnung zahlen Sie innerhalb von 14 Tagen nach Erhalt der Ware.'
          ]
        }
      ]),
      createCategory('returns', 'Rückgabe', RefreshCcw, 'Hinweise zur Retoure, Umtausch und Erstattung.', [
        {
          question: 'Wie lange kann ich Artikel zurücksenden?',
          answer: [
            'Sie haben ein Rückgaberecht von 30 Tagen nach Erhalt der Ware.',
            'Bitte nutzen Sie das beiliegende Retourenlabel oder registrieren Sie die Rücksendung online.'
          ]
        },
        {
          question: 'Wann erhalte ich meine Rückerstattung?',
          answer: [
            'Nach Eingang der Retoure prüfen wir den Artikel innerhalb von 2 Werktagen.',
            'Die Rückerstattung erfolgt anschliessend je nach Zahlungsart innerhalb von 3-5 Werktagen.'
          ]
        }
      ]),
      createCategory('general', 'Allgemein', HelpCircle, 'Weitere Fragen rund um Konto, Sicherheit und Newsletter.', [
        {
          question: 'Wie melde ich mich für den Newsletter an oder ab?',
          answer: [
            'Im Footer finden Sie den Link zur Anmeldung. Nach der Bestätigung per Double-Opt-In sind Sie registriert.',
            'Zum Abmelden nutzen Sie den Link am Ende jedes Newsletters oder die Kontoeinstellungen.'
          ]
        },
        {
          question: 'Wie sicher sind meine Daten?',
          answer: [
            'Wir verwenden TLS-Verschlüsselung, zertifizierte Rechenzentren und führen regelmäßige Audits durch.',
            'Alle Zahlungsdaten werden ausschließlich über PCI-DSS-konforme Dienstleister verarbeitet.'
          ]
        }
      ])
    ]

    const activeCategory = ref(categories[0].id)
    const openQuestions = ref(new Set())

    const filteredCategories = computed(() => categories.filter((category) => category.id === activeCategory.value))

    const setActiveCategory = (id) => {
      activeCategory.value = id
      openQuestions.value = new Set()
    }

    const toggle = (question) => {
      const next = new Set(openQuestions.value)
      if (next.has(question)) {
        next.delete(question)
      } else {
        next.add(question)
      }
      openQuestions.value = next
    }

    const isOpen = (question) => openQuestions.value.has(question)

    return {
      categories,
      activeCategory,
      filteredCategories,
      setActiveCategory,
      toggle,
      isOpen
    }
  }
}
</script>

<style scoped>
.faq-page {
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

.faq-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
}

.faq-sidebar {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  padding: 1.5rem;
  height: fit-content;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.faq-sidebar h2 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--gray-900);
}

.faq-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  background: var(--white);
  color: var(--gray-700);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-link.active,
.sidebar-link:hover {
  border-color: var(--primary-green);
  background: var(--primary-green-lighter);
  color: var(--primary-green-darker);
}

.faq-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.faq-group {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-group h2 {
  margin: 0;
  font-size: 1.6rem;
  color: var(--gray-900);
}

.group-description {
  margin: 0;
  color: var(--gray-600);
  line-height: 1.5;
}

.faq-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  border: 1px solid var(--gray-200);
  border-radius: 14px;
  background: var(--gray-50);
}

.faq-item header {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  cursor: pointer;
}

.faq-item h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--gray-800);
}

.faq-item .answer {
  padding: 0 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--gray-600);
  line-height: 1.6;
}

.faq-item svg {
  transition: transform 0.2s ease;
  color: var(--gray-500);
}

.faq-item svg.open {
  transform: rotate(180deg);
  color: var(--primary-green);
}

.faq-enter-active,
.faq-leave-active {
  transition: all 0.2s ease;
}

.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 960px) {
  .faq-layout {
    grid-template-columns: 1fr;
  }

  .faq-sidebar {
    position: sticky;
    top: 80px;
    z-index: 5;
  }
}

@media (max-width: 640px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .faq-group {
    padding: 1.5rem;
  }
}
</style>
