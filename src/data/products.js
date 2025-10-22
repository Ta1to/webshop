/**
 * Mock Products for Sustainable Webshop
 */
export const mockProducts = [
  // Nachhaltige Mode
  {
    name: 'Bio-Baumwoll T-Shirt "Earth"',
    description: 'Fair-Trade T-Shirt aus 100% Bio-Baumwolle. GOTS-zertifiziert, vegan und in Europa produziert. Zeitloses Design in verschiedenen Naturfarben erhältlich.',
    price: 29.99,
    category: 'Nachhaltige Mode',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    stock: 45,
    featured: true,
    tags: ['Bio', 'Fair-Trade', 'GOTS', 'Vegan']
  },
  {
    name: 'Recycelte Jeans "Ocean Blue"',
    description: 'Stylische Jeans aus recyceltem Denim. Hergestellt aus alten Jeans und PET-Flaschen. Spart 80% Wasser im Vergleich zur herkömmlichen Produktion.',
    price: 89.99,
    category: 'Nachhaltige Mode',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
    stock: 28,
    featured: true,
    tags: ['Recycelt', 'Wassersparend', 'Circular Fashion']
  },
  {
    name: 'Hanf-Hoodie "Nature Lover"',
    description: 'Kuscheliger Hoodie aus Hanf-Bio-Baumwoll-Mix. Antibakteriell, atmungsaktiv und besonders langlebig. Produziert mit Ökostrom.',
    price: 79.99,
    category: 'Nachhaltige Mode',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    stock: 35,
    featured: false,
    tags: ['Hanf', 'Bio', 'Langlebig']
  },
  {
    name: 'Vegane Lederjacke aus Kakteen',
    description: 'Innovative Lederjacke aus Kaktusleder (Desserto). Tierfrei, biologisch abbaubar und stylisch. Made in Mexico.',
    price: 249.99,
    category: 'Nachhaltige Mode',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    stock: 12,
    featured: true,
    tags: ['Vegan', 'Innovation', 'Biologisch abbaubar']
  },

  // Zero Waste
  {
    name: 'Bienenwachstücher Set (5-teilig)',
    description: 'Wiederverwendbare Alternative zu Frischhaltefolie. Hergestellt aus Bio-Baumwolle und regionalem Bienenwachs. Verschiedene Größen für jeden Bedarf.',
    price: 24.99,
    category: 'Zero Waste',
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
    stock: 67,
    featured: true,
    tags: ['Zero Waste', 'Wiederverwendbar', 'Bio']
  },
  {
    name: 'Edelstahl Trinkflasche "Hydrate"',
    description: 'Isolierte Trinkflasche aus hochwertigem Edelstahl. Hält Getränke 24h kalt oder 12h warm. BPA-frei, 750ml Fassungsvermögen.',
    price: 32.99,
    category: 'Zero Waste',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
    stock: 89,
    featured: true,
    tags: ['BPA-frei', 'Langlebig', 'Isoliert']
  },
  {
    name: 'Bambus Besteck-Set mit Tasche',
    description: 'Praktisches To-Go Besteckset aus nachhaltigem Bambus. Inkl. Gabel, Messer, Löffel, Stäbchen und Trinkhalm in Stofftasche.',
    price: 16.99,
    category: 'Zero Waste',
    imageUrl: 'https://images.unsplash.com/photo-1616016833892-c778818d4011?w=800',
    stock: 120,
    featured: false,
    tags: ['Bambus', 'To-Go', 'Plastikfrei']
  },
  {
    name: 'Wiederverwendbare Einkaufstaschen (3er Set)',
    description: 'Robuste Einkaufsnetze aus Bio-Baumwolle. Perfekt für Obst, Gemüse und Brot. Waschbar und extrem reißfest.',
    price: 14.99,
    category: 'Zero Waste',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    stock: 95,
    featured: false,
    tags: ['Bio-Baumwolle', 'Waschbar', 'Plastikfrei']
  },
  {
    name: 'Mehrweg Coffee-to-Go Becher "KeepCup"',
    description: 'Stylisher Mehrwegbecher aus Borosilikatglas mit Korkband. Auslaufsicher, mikrowellengeeignet, 350ml.',
    price: 22.99,
    category: 'Zero Waste',
    imageUrl: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800',
    stock: 78,
    featured: false,
    tags: ['Glas', 'Auslaufsicher', 'Mikrowellengeeignet']
  },

  // Bio-Lebensmittel
  {
    name: 'Bio-Kaffee "Fair Morning" (500g)',
    description: 'Aromatische Bio-Kaffeebohnen aus fairem Handel. Schonend geröstet in Deutschland. Sorte: 100% Arabica aus Äthiopien.',
    price: 18.99,
    category: 'Bio-Lebensmittel',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',
    stock: 156,
    featured: true,
    tags: ['Bio', 'Fair-Trade', 'Arabica']
  },
  {
    name: 'Rohes Kakaopulver Bio (250g)',
    description: 'Unbehandeltes Kakaopulver aus peruanischem Bio-Anbau. Reich an Antioxidantien und Magnesium. Perfekt für Smoothies.',
    price: 12.99,
    category: 'Bio-Lebensmittel',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    stock: 83,
    featured: false,
    tags: ['Bio', 'Roh', 'Superfood']
  },
  {
    name: 'Mandelmus aus regionalem Anbau (500g)',
    description: 'Cremiges Mandelmus aus deutschen Bio-Mandeln. 100% Mandeln, sonst nichts. Handgefertigt in kleinen Chargen.',
    price: 16.99,
    category: 'Bio-Lebensmittel',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800',
    stock: 64,
    featured: false,
    tags: ['Regional', 'Bio', 'Handgefertigt']
  },
  {
    name: 'Bio-Honig "Wildblüte" vom Imker (450g)',
    description: 'Naturbelassener Blütenhonig von regionalen Imkern. Ohne Zusätze, kaltgeschleudert. Unterstützt lokale Biodiversität.',
    price: 14.99,
    category: 'Bio-Lebensmittel',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784053?w=800',
    stock: 72,
    featured: true,
    tags: ['Regional', 'Imker', 'Naturbelassen']
  },

  // Naturkosmetik
  {
    name: 'Festes Shampoo "Lavendel Liebe"',
    description: 'Zero-Waste Haarshampoo mit Bio-Lavendelöl. Vegan, palmölfrei und für 60-80 Wäschen. Entspricht ca. 2-3 Shampoo-Flaschen.',
    price: 11.99,
    category: 'Naturkosmetik',
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800',
    stock: 145,
    featured: true,
    tags: ['Vegan', 'Zero Waste', 'Palmölfrei']
  },
  {
    name: 'Gesichtscreme "Rosengold" (50ml)',
    description: 'Anti-Aging Creme mit Bio-Rosenöl und Hyaluronsäure. Tierversuchsfrei, zertifizierte Naturkosmetik. Im Glastiegel.',
    price: 28.99,
    category: 'Naturkosmetik',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
    stock: 58,
    featured: true,
    tags: ['Naturkosmetik', 'Tierversuchsfrei', 'Anti-Aging']
  },
  {
    name: 'Bambus-Zahnbürsten (4er Set)',
    description: 'Biologisch abbaubare Zahnbürsten mit Aktivkohle-Borsten. BPA-frei, vegan und kompostierbar. Nachhaltige Zahnpflege.',
    price: 9.99,
    category: 'Naturkosmetik',
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800',
    stock: 203,
    featured: false,
    tags: ['Bambus', 'Kompostierbar', 'Vegan']
  },
  {
    name: 'Deo-Creme "Frische Brise" (30ml)',
    description: 'Natürliches Deo ohne Aluminium und Alkohol. Mit Natron und ätherischen Ölen. Langanhaltender Schutz, hautfreundlich.',
    price: 8.99,
    category: 'Naturkosmetik',
    imageUrl: 'https://images.unsplash.com/photo-1631731000840-a6ee4316e4f4?w=800',
    stock: 112,
    featured: false,
    tags: ['Aluminiumfrei', 'Natürlich', 'Hautfreundlich']
  },
  {
    name: 'Waschbare Abschminktücher (10er Set)',
    description: 'Weiche Abschminktücher aus Bio-Baumwolle. Wiederverwendbar, waschmaschinenfest. Ersetzt tausende Einweg-Pads.',
    price: 19.99,
    category: 'Naturkosmetik',
    imageUrl: 'https://images.unsplash.com/photo-1556228852-80c227764d42?w=800',
    stock: 87,
    featured: false,
    tags: ['Wiederverwendbar', 'Bio-Baumwolle', 'Zero Waste']
  },

  // Öko-Haushalt
  {
    name: 'Bio-Reinigungsmittel Starter-Set',
    description: 'Komplettes Putzmittel-Set aus biologischen Inhaltsstoffen. Enthält Allzweckreiniger, Badreiniger und Glasreiniger. Vegan.',
    price: 34.99,
    category: 'Öko-Haushalt',
    imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800',
    stock: 76,
    featured: true,
    tags: ['Bio', 'Vegan', 'Starter-Set']
  },
  {
    name: 'Kompostierbare Müllbeutel (25 Stück)',
    description: 'Biologisch abbaubare Müllbeutel aus Maisstärke. TÜV-zertifiziert kompostierbar. Reißfest und geruchsneutral. 10 Liter.',
    price: 7.99,
    category: 'Öko-Haushalt',
    imageUrl: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800',
    stock: 189,
    featured: false,
    tags: ['Kompostierbar', 'Maisstärke', 'TÜV-zertifiziert']
  },
  {
    name: 'Edelstahl-Trinkhalme Set (8 Stück)',
    description: 'Wiederverwendbare Trinkhalme mit Reinigungsbürsten. Spülmaschinenfest, rostfrei. Verschiedene Größen und Formen.',
    price: 12.99,
    category: 'Öko-Haushalt',
    imageUrl: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=800',
    stock: 143,
    featured: false,
    tags: ['Edelstahl', 'Wiederverwendbar', 'Spülmaschinenfest']
  },
  {
    name: 'Bienenwachstuch-DIY-Kit',
    description: 'Stelle deine eigenen Bienenwachstücher her! Set enthält Bio-Baumwollstoffe, Bienenwachs und Anleitung. Für 10 Tücher.',
    price: 29.99,
    category: 'Öko-Haushalt',
    imageUrl: 'https://images.unsplash.com/photo-1593998066526-65fcab3021a2?w=800',
    stock: 45,
    featured: false,
    tags: ['DIY', 'Bio', 'Kreativ']
  },

  // Grüne Technologie
  {
    name: 'Solar-Powerbank 20.000mAh',
    description: 'Tragbare Solar-Ladestation für Smartphones und Tablets. Wasserdicht, mit LED-Taschenlampe. Lädt auch per USB-C.',
    price: 49.99,
    category: 'Grüne Technologie',
    imageUrl: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=800',
    stock: 92,
    featured: true,
    tags: ['Solar', 'Wasserdicht', 'LED']
  },
  {
    name: 'LED-Pflanzenlampe "GrowGreen"',
    description: 'Energiesparende Pflanzenlampe für Indoor-Gärten. Vollspektrum-LED, Timer-Funktion. Nur 15W Verbrauch.',
    price: 39.99,
    category: 'Grüne Technologie',
    imageUrl: 'https://images.unsplash.com/photo-1523301551780-cd17359a95d0?w=800',
    stock: 54,
    featured: false,
    tags: ['LED', 'Energiesparend', 'Indoor-Garten']
  },
  {
    name: 'Energiemessgerät Smart',
    description: 'Überwache deinen Stromverbrauch! Intelligentes Messgerät mit App-Anbindung. Hilft beim Energiesparen.',
    price: 34.99,
    category: 'Grüne Technologie',
    imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800',
    stock: 67,
    featured: false,
    tags: ['Smart Home', 'Energiesparen', 'App']
  },
  {
    name: 'Solarbetriebene Gartenleuchten (6er Set)',
    description: 'Stimmungsvolle Gartenbeleuchtung ohne Stromkosten. Automatische Dämmerungserkennung. Wetterfest und langlebig.',
    price: 44.99,
    category: 'Grüne Technologie',
    imageUrl: 'https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?w=800',
    stock: 38,
    featured: true,
    tags: ['Solar', 'Wetterfest', 'Automatisch']
  },

  // Upcycling & Handwerk
  {
    name: 'Geldbörse aus recyceltem Segeltuch',
    description: 'Einzigartige Brieftasche aus alten Segeln. Jedes Stück ein Unikat mit eigener Geschichte. Wasserabweisend und robust.',
    price: 39.99,
    category: 'Upcycling & Handwerk',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800',
    stock: 23,
    featured: true,
    tags: ['Upcycling', 'Unikat', 'Wasserabweisend']
  },
  {
    name: 'Handgefertigte Kerzen aus Bienenwachs (3er Set)',
    description: 'Natürliche Kerzen von lokalen Imkern. Rußfrei, luftreinigend und mit honigähnlichem Duft. Brenndauer: je 15h.',
    price: 22.99,
    category: 'Upcycling & Handwerk',
    imageUrl: 'https://images.unsplash.com/photo-1602874801006-96632be7c0a6?w=800',
    stock: 56,
    featured: false,
    tags: ['Handgefertigt', 'Bienenwachs', 'Natürlich']
  },
  {
    name: 'Notizbuch aus recyceltem Papier',
    description: 'Hochwertiges Journal aus 100% Altpapier. Handgebunden mit Leinenfaden. 200 Seiten blanko. Made in Germany.',
    price: 16.99,
    category: 'Upcycling & Handwerk',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800',
    stock: 84,
    featured: false,
    tags: ['Recycelt', 'Handgebunden', 'Made in Germany']
  },
  {
    name: 'Rucksack aus alten Feuerwehrschläuchen',
    description: 'Stylischer Upcycling-Rucksack aus ausgedienten Feuerwehrschläuchen. Extrem robust, wasserabweisend. Jedes Stück ein Unikat.',
    price: 129.99,
    category: 'Upcycling & Handwerk',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    stock: 15,
    featured: true,
    tags: ['Upcycling', 'Robust', 'Unikat']
  },

  // Nachhaltige Mobilität
  {
    name: 'Fahrrad-Reparatur-Set Kompakt',
    description: 'Alles für unterwegs! Multitool, Reifenheber, Flickzeug und Mini-Pumpe in Satteltasche. Qualitätswerkzeug für jede Tour.',
    price: 34.99,
    category: 'Nachhaltige Mobilität',
    imageUrl: 'https://images.unsplash.com/photo-1521840890009-5b31f5c116c2?w=800',
    stock: 98,
    featured: false,
    tags: ['Fahrrad', 'Werkzeug', 'Kompakt']
  },
  {
    name: 'LED-Fahrradlicht Set "SafeRide"',
    description: 'StVZO-zugelassenes Beleuchtungsset mit USB-Aufladung. Wasserdicht, 15 Stunden Leuchtdauer. Front- und Rücklicht.',
    price: 28.99,
    category: 'Nachhaltige Mobilität',
    imageUrl: 'https://images.unsplash.com/photo-1521676259650-675b5bfec1ae?w=800',
    stock: 127,
    featured: true,
    tags: ['LED', 'StVZO', 'USB-Aufladung']
  },
  {
    name: 'Recycelter Fahrradkorb "Urban"',
    description: 'Trendy Fahrradkorb aus recyceltem Kunststoff. Wetterfest, mit Schnellbefestigung. Trägt bis zu 10kg.',
    price: 42.99,
    category: 'Nachhaltige Mobilität',
    imageUrl: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800',
    stock: 41,
    featured: false,
    tags: ['Recycelt', 'Wetterfest', 'Urban']
  },
  {
    name: 'Fahrrad-Trinkflaschenhalter aus Bambus',
    description: 'Eleganter Flaschenhalter aus nachhaltigem Bambus. Passend für Standard-Trinkflaschen. Einfache Montage.',
    price: 18.99,
    category: 'Nachhaltige Mobilität',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    stock: 73,
    featured: false,
    tags: ['Bambus', 'Elegant', 'Einfache Montage']
  }
]
