<template>
  <div class="legal-page">
    <section class="page-header">
      <p class="eyebrow">Rechtliches</p>
      <h1>Allgemeine Geschäftsbedingungen</h1>
      <p class="intro">
        Diese AGB regeln alle Bestellungen, Lieferungen und Serviceleistungen, die über den Evaris Onlineshop abgewickelt werden.
      </p>
    </section>

    <section class="legal-section">
      <h2>1. Vertragsgegenstand</h2>
      <p>
  Wir bieten Verbrauchern und Unternehmen Waren und digitale Leistungen an. Mit Aufgabe der Bestellung geben Sie ein verbindliches Angebot
  zum Abschluss eines Kaufvertrags ab. Ein Vertrag kommt erst zustande, wenn wir die Bestellung per E-Mail bestätigen oder die Ware versenden.
      </p>
      <ul>
        <li>Alle Produktdarstellungen sind Freibleibend und koennen jederzeit angepasst werden.</li>
        <li>Technische Produktangaben koennen geringfuegig von der gelieferten Ware abweichen.</li>
        <li>Wir behalten uns das Recht vor, offensichtliche Irrtümer bei Preis oder Beschreibung zu korrigieren.</li>
      </ul>
    </section>

    <section class="legal-section">
      <h2>2. Preise, Zahlung und Eigentumsvorbehalt</h2>
      <p>
  Sämtliche Preise verstehen sich inklusive gesetzlicher Mehrwertsteuer und zuzüglich Versandkosten. Wir akzeptieren die im Checkout angegebenen Zahlarten.
        Der Rechnungsbetrag ist sofort fällig. Bis zur vollständigen Zahlung bleiben gelieferte Waren unser Eigentum.
      </p>
      <div class="legal-highlight">
        <strong>Zahlungsverzug:</strong> Bei Zahlungsverzug berechnen wir Mahngebühren sowie Verzugszinsen in gesetzlicher Höhe.
        Eine Auslieferung weiterer Bestellungen kann bei offenen Forderungen ausgesetzt werden.
      </div>
    </section>

    <section class="legal-section">
      <h2>3. Lieferung und Gefahrenübergang</h2>
      <p>
  Wir versenden ausschließlich an Lieferadressen innerhalb der EU. Angegebene Lieferzeiten dienen als Orientierung und können je nach Verfügbarkeit variieren.
        Kommt es zu Teillieferungen, entstehen Ihnen dadurch keine Mehrkosten. Das Risiko des zufälligen Untergangs geht mit Übergabe an den Kunden über.
      </p>
      <ul>
        <li>Lieferungen erfolgen mit unseren Logistikpartnern Montag bis Samstag.</li>
        <li>Wir informieren Sie zeitnah über Lieferverzögerungen oder nicht vorrätige Artikel.</li>
        <li>Bitte prüfen Sie Sendungen unmittelbar auf äußere Beschädigungen und dokumentieren Sie Auffälligkeiten.</li>
      </ul>
    </section>

    <section class="legal-section">
      <h2>4. Widerrufsrecht und Rücksendungen</h2>
      <p>
        Verbraucher haben ein vierzehntägiges Widerrufsrecht. Details zum Ablauf sowie das Muster-Widerrufsformular finden Sie auf der Seite Rückgabe & Umtausch.
        Bitte registrieren Sie Rücksendungen über Ihr Kundenkonto, damit wir eine reibungslose Abwicklung sichern können.
      </p>
    </section>

    <section class="legal-section">
      <h2>5. Haftung</h2>
      <p>
        Wir haften unbegrenzt für Vorsatz und grobe Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit sowie nach dem Produkthaftungsgesetz.
        Bei leichter Fahrlässigkeit haften wir nur für die Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) und begrenzen den Schaden auf den
        vertragstypischen, vorhersehbaren Umfang.
      </p>
    </section>

    <section class="legal-section">
      <h2>6. Schlussbestimmungen</h2>
      <p>
        Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Erfüllungsort und Gerichtsstand für Kaufleute ist unser Firmensitz in Musterstadt.
        Sollten einzelne Bestimmungen unwirksam sein, berührt dies die Wirksamkeit der übrigen Regelungen nicht.
      </p>
    </section>
  </div>
</template>

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
  text-align: left;
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

.legal-section ul {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--gray-700);
}

.legal-highlight {
  background-color: var(--gray-50);
  border-radius: 12px;
  padding: 1.25rem;
  color: var(--gray-800);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .legal-page {
    padding: 3rem 1.25rem 4rem;
    gap: 2rem;
  }

  .page-header h1 {
    font-size: 1.9rem;
  }

  .legal-section {
    padding: 1.5rem;
  }
}
</style>
