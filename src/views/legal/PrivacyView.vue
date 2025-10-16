<template>
  <div class="legal-page">
    <section class="page-header">
      <p class="eyebrow">Rechtliches</p>
      <h1>Datenschutzerklärung</h1>
      <p class="intro">
        Der Schutz Ihrer personenbezogenen Daten hat für uns oberste Priorität. Nachfolgend informieren wir Sie transparent
        über Art, Umfang und Zweck der Datenverarbeitung im Evaris Onlineshop.
      </p>
    </section>

    <section class="legal-section">
      <h2>1. Verantwortliche Stelle</h2>
      <p>
        Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist die Evaris GmbH, Musterstraße 123, 12345 Musterstadt.
        Bei Fragen zum Datenschutz erreichen Sie uns per E-Mail an <a href="mailto:privacy@evaris.de">privacy@evaris.de</a>.
      </p>
    </section>

    <section class="legal-section">
      <h2>2. Verarbeitete Daten und Zwecke</h2>
      <div class="grid">
        <article class="data-card">
          <h3>Bestellung und Versand</h3>
          <p>
            Wir verarbeiten Stammdaten, Lieferadressen, Zahlungsdetails und Bestellpositionen, um Kaufverträge zu erfüllen, Rechnungen auszustellen und
            Lieferungen zu organisieren.
          </p>
        </article>
        <article class="data-card">
          <h3>Newsletter</h3>
          <p>
            Nach Ihrer aktiven Einwilligung speichern wir Ihre E-Mail-Adresse, um Ihnen Produktneuigkeiten und Aktionen zu senden. Sie können den Newsletter
            jederzeit über einen Abmeldelink oder Ihr Profil abbestellen.
          </p>
        </article>
        <article class="data-card">
          <h3>Supportanfragen</h3>
          <p>
            Anfragen aus dem Kontaktformular erfassen wir einschließlich Ihrer angegebenen Kontaktdaten, um Rückfragen zu beantworten und Anliegen zu dokumentieren.
          </p>
        </article>
      </div>
    </section>

    <section class="legal-section">
      <h2>3. Rechtsgrundlagen</h2>
      <ul>
        <li>Art. 6 Abs. 1 lit. b DSGVO für die Erfüllung von Vertragsverhältnissen.</li>
        <li>Art. 6 Abs. 1 lit. c DSGVO zur Erfüllung gesetzlicher Aufbewahrungspflichten.</li>
        <li>Art. 6 Abs. 1 lit. a DSGVO bei erteilter Einwilligung, insbesondere für den Newsletter.</li>
        <li>Art. 6 Abs. 1 lit. f DSGVO für berechtigte Interessen wie Betrugsprävention und Reichweitenmessung.</li>
      </ul>
    </section>

    <section class="legal-section">
      <h2>4. Speicherdauer</h2>
      <p>
        Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist. Gesetzliche Aufbewahrungsfristen (z. B. aus dem Handels-
        und Steuerrecht) betragen bis zu zehn Jahre. Newsletter-Daten löschen wir bei Widerruf unverzüglich.
      </p>
    </section>

    <section class="legal-section">
      <h2>5. Weitergabe an Dritte</h2>
      <p>
        Eine Weitergabe erfolgt ausschließlich an Dienstleister, die wir für Zahlungsabwicklung, Versandlogistik, IT-Betrieb und Kundenservice einsetzen.
        Diese Unternehmen sind vertraglich zur Einhaltung strenger Datenschutzanforderungen verpflichtet.
      </p>
    </section>

    <section class="legal-section">
      <h2>6. Rechte betroffener Personen</h2>
      <p>
        Sie haben jederzeit das Recht auf Auskunft, Berichtigung oder Löschung Ihrer Daten, Einschränkung der Verarbeitung sowie Datenübertragbarkeit.
        Zudem steht Ihnen ein Widerspruchsrecht gegen Verarbeitungen zu, die auf berechtigten Interessen beruhen.
      </p>
      <div class="legal-highlight">
        <strong>Beschwerderecht:</strong> Sie können sich bei einer Datenschutzaufsichtsbehörde beschweren, zum Beispiel beim
        Landesbeauftragten für Datenschutz in Ihrem Bundesland.
      </div>
    </section>

    <section class="legal-section">
      <h2>7. Automatisierte Entscheidungen</h2>
      <p>
        Wir treffen keine Entscheidungen, die ausschließlich auf einer automatisierten Verarbeitung einschließlich Profiling beruhen und Ihnen gegenüber
        rechtliche Wirkung entfalten.
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

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.data-card {
  background-color: var(--gray-50);
  border-radius: 14px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  color: var(--gray-800);
}

.data-card h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--gray-900);
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
