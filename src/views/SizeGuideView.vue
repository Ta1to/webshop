<template>
  <div class="size-guide-page">
    <section class="page-header">
      <p class="eyebrow">Kundenservice</p>
      <h1>Größentabelle</h1>
      <p class="intro">
        Finden Sie die passende Größe für Mode, Schuhe und Technik. Unsere Tabellen basieren auf
        herstellerübergreifenden Durchschnittswerten und helfen besonders beim Online-Kauf.
      </p>
    </section>

    <section class="card" v-for="section in sections" :key="section.title">
      <header class="card-header">
        <component :is="section.icon" :size="20" />
        <div>
          <h2>{{ section.title }}</h2>
          <p>{{ section.description }}</p>
        </div>
      </header>

      <table class="size-table">
        <thead>
          <tr>
            <th v-for="column in section.columns" :key="column">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in section.rows" :key="row.label">
            <td>{{ row.label }}</td>
            <td v-for="(value, index) in row.values" :key="index">{{ value }}</td>
          </tr>
        </tbody>
      </table>

      <ul class="tips">
        <li v-for="tip in section.tips" :key="tip">{{ tip }}</li>
      </ul>
    </section>

    <section class="card highlight">
      <h2>So messen Sie richtig</h2>
      <div class="measure-grid">
        <article v-for="step in measuringSteps" :key="step.title">
          <span class="step-indicator">{{ step.number }}</span>
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </article>
      </div>
      <p class="note">
        Tipp: Messen Sie abends, wenn der Körper leicht angeschwollen ist. So vermeiden Sie, dass Kleidung später zu eng sitzt.
      </p>
    </section>
  </div>
</template>

<script>
import { Shirt, Ruler, Watch, Laptop } from 'lucide-vue-next'

const createSection = (title, icon, description, columns, rows, tips) => ({
  title,
  icon,
  description,
  columns,
  rows,
  tips
})

const createRow = (label, ...values) => ({ label, values })
const createTip = (text) => text

export default {
  name: 'SizeGuideView',
  components: {
    Shirt,
    Ruler,
    Watch,
    Laptop
  },
  setup() {
    const sections = [
      createSection(
        'Oberbekleidung',
        Shirt,
        'Brust-, Taillen- und Hüftumfang für Damen und Herren.',
        ['Größe', 'Brustumfang (cm)', 'Taille (cm)', 'Hüfte (cm)'],
        [
          createRow('XS', '82-86', '66-70', '88-92'),
          createRow('S', '87-92', '71-76', '93-98'),
          createRow('M', '93-100', '77-84', '99-106'),
          createRow('L', '101-108', '85-92', '107-114'),
          createRow('XL', '109-116', '93-102', '115-122')
        ],
        [
          createTip('Maßband waagrecht über Brust und Schulterblätter führen.'),
          createTip('Beim Taillenumfang nicht einziehen, normal weiteratmen.'),
          createTip('Hüftumfang über die stärkste Stelle des Gesäßes messen.')
        ]
      ),
      createSection(
        'Schuhe',
        Ruler,
        'Innenlängen und EU/UK-Vergleichswerte für Sneaker und Business-Schuhe.',
        ['EU', 'UK', 'Innenlänge (cm)'],
        [
          createRow('36', '3.5', '22.5'),
          createRow('38', '5', '24'),
          createRow('40', '6.5', '25.3'),
          createRow('42', '8', '26.7'),
          createRow('44', '9.5', '28')
        ],
        [
          createTip('Beide Füße messen, der größere Fuß bestimmt die Schuhgröße.'),
          createTip('Abends messen, da Füße über den Tag anschwellen.'),
          createTip('Bei Wanderschuhen eine Fingerbreite zusätzlich einplanen.')
        ]
      ),
      createSection(
        'Handgelenke',
        Watch,
        'Empfohlene Armbandlängen für Smartwatches und klassische Uhren.',
        ['Handgelenkumfang (cm)', 'Empfohlene Armbandlänge (cm)'],
        [
          createRow('14-15', '15-17'),
          createRow('16-17', '17-19'),
          createRow('18-19', '19-21'),
          createRow('20-21', '21-23')
        ],
        [
          createTip('Maßband knapp oberhalb des Handgelenkknochens anlegen.'),
          createTip('Bei Metallarmbändern 0.5 cm Zusätzlich rechnen, bei Leder 0.5 cm abziehen.'),
          createTip('Smartwatch-Bänder aus Silikon sitzen optimal, wenn sie ca. 1 cm Spiel haben.')
        ]
      ),
      createSection(
        'Tech-Taschen',
        Laptop,
        'Vergleich von Innenmaß und Endgerät für Laptops und Tablets.',
        ['Gerät', 'Diagonal (Zoll)', 'Empfohlene Tasche (cm)'],
        [
          createRow('Tablet klein', '8-10', '28 x 20'),
          createRow('Laptop 13"', '13', '33 x 24'),
          createRow('Laptop 15"', '15', '38 x 27'),
          createRow('Laptop 17"', '17', '42 x 30')
        ],
        [
          createTip('Innenpolster sollte mindestens 1 cm Stärke haben, um Kanten zu schützen.'),
          createTip('Magnetverschlüsse vermeiden, wenn Ihr Gerät einen empfindlichen Sensor besitzt.'),
          createTip('Bei viel Reisegepäck lieber eine Nummer größer wählen für Zubehör.')
        ]
      )
    ]

    const measuringSteps = [
      { number: '01', title: 'Körperhaltung', description: 'Aufrecht vor einen Spiegel stellen und normal atmen.' },
      { number: '02', title: 'Maßband', description: 'Flexibles Maßband verwenden, es darf nicht einschneiden.' },
      { number: '03', title: 'Notieren', description: 'Alle Werte sofort aufschreiben und bei Bedarf mit alten Messungen vergleichen.' }
    ]

    return {
      sections,
      measuringSteps
    }
  }
}
</script>

<style scoped>
.size-guide-page {
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

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: var(--primary-green);
}

.card-header h2 {
  margin: 0;
  font-size: 1.6rem;
  color: var(--gray-900);
}

.card-header p {
  margin: 0.35rem 0 0;
  color: var(--gray-600);
}

.size-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  overflow: hidden;
}

.size-table th,
.size-table td {
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
}

.size-table th {
  background: var(--gray-100);
  font-weight: 600;
  color: var(--gray-800);
}

.size-table tr:last-child td {
  border-bottom: none;
}

.tips {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--gray-600);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.highlight {
  background: var(--primary-green-lighter);
  border: 1px solid var(--primary-green);
}

.measure-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.measure-grid article {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: var(--white);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--gray-200);
}

.step-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-green);
  color: var(--white);
  font-weight: 600;
}

.measure-grid h3 {
  margin: 0 0 0.25rem;
  font-size: 1.05rem;
  color: var(--gray-800);
}

.measure-grid p {
  margin: 0;
  color: var(--gray-600);
}

.note {
  margin: 0;
  color: var(--primary-green-darker);
}

@media (max-width: 640px) {
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
