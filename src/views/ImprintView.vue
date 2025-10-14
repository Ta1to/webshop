<template>
  <div class="legal-page">
    <section class="page-header">
      <p class="eyebrow">Rechtliches</p>
      <h1>Impressum</h1>
      <p class="intro">
        Angaben gemäss Telemediengesetz (TMG) für den Onlineauftritt der Evaris GmbH.
      </p>
    </section>

    <section class="legal-section">
      <h2>Verantwortlich für den Inhalt</h2>
      <address class="imprint-address">
        Evaris GmbH<br>
        Musterstraße 123<br>
        12345 Musterstadt<br>
        Deutschland
      </address>
      <p>
        Telefon: <a href="tel:+4915012345678">+49 150 123 456 78</a><br>
        E-Mail: <a href="mailto:info@evaris.de">info@evaris.de</a>
      </p>
    </section>

    <section class="legal-section">
      <h2>Geschäftsführung</h2>
      <p>Max Mustermann, Anna Beispiel</p>
      <p>Registergericht: Amtsgericht Musterstadt</p>
      <p>Handelsregister: HRB 123456</p>
      <p>Umsatzsteuer-ID: DE999999999</p>
    </section>

    <section class="legal-section">
      <h2>Hinweis zur Online-Streitbeilegung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">https://ec.europa.eu/consumers/odr</a>.
        Wir sind nicht verpflichtet und grundsätzlich nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </section>

    <section class="legal-section">
      <h2>Urheberrecht</h2>
      <p>
        Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Eine Vervielfältigung, Bearbeitung, Verbreitung oder jede Art der Verwertung
        außerhalb der Grenzen des Urheberrechts bedarf unserer schriftlichen Zustimmung. Downloads und Kopien dieser Seite sind nur für den privaten, nicht
        kommerziellen Gebrauch gestattet.
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

.imprint-address {
  font-style: normal;
  color: var(--gray-800);
  line-height: 1.6;
}

.legal-section a {
  color: var(--primary-green);
  text-decoration: none;
}

.legal-section a:hover {
  text-decoration: underline;
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
