/**
 * Migration Script - Lädt Mock-Daten in Firestore
 * Dieses Skript sollte nur einmal ausgeführt werden, um die initialen Daten zu laden.
 * 
 * WICHTIG: Führe dieses Skript aus der Browser-Konsole aus, nachdem du dich als Admin eingeloggt hast!
 */

import { createDocument } from '../services/db'
import { categories as categoriesData } from '../data/Categories'
import { products as productsData } from '../data/Products'

export const migrateDataToFirestore = async () => {
  console.log('🚀 Starte Migration...')
  
  try {
    // Migrate Categories
    console.log('📁 Lade Kategorien...')
    for (const category of categoriesData) {
      const { id, ...categoryData } = category
      const result = await createDocument('categories', categoryData)
      if (result.success) {
        console.log(`✅ Kategorie "${category.name}" erstellt (ID: ${result.id})`)
      } else {
        console.error(`❌ Fehler bei "${category.name}":`, result.error)
      }
    }

    // Migrate Products
    console.log('\n📦 Lade Produkte...')
    for (const product of productsData) {
      const { id, categoryId, image, ...productData } = product
      
      // Find category name by categoryId
      const category = categoriesData.find(c => c.id === categoryId)
      const categoryName = category ? category.name : 'Unbekannt'
      
      const firestoreProduct = {
        ...productData,
        category: categoryName,
        imageUrl: image || '',
        featured: false
      }
      
      const result = await createDocument('products', firestoreProduct)
      if (result.success) {
        console.log(`✅ Produkt "${product.name}" erstellt (ID: ${result.id})`)
      } else {
        console.error(`❌ Fehler bei "${product.name}":`, result.error)
      }
    }

    console.log('\n✨ Migration erfolgreich abgeschlossen!')
    console.log(`📊 ${categoriesData.length} Kategorien und ${productsData.length} Produkte wurden geladen.`)
    
  } catch (error) {
    console.error('💥 Migrationsfehler:', error)
  }
}

// Anleitung für die Browser-Konsole:
console.log(`
╔════════════════════════════════════════════════════════╗
║          FIRESTORE MIGRATION SCRIPT                     ║
╠════════════════════════════════════════════════════════╣
║                                                         ║
║  Um die Mock-Daten in Firestore zu laden:             ║
║                                                         ║
║  1. Logge dich als Admin ein                           ║
║  2. Öffne die Browser-Konsole (F12)                    ║
║  3. Führe folgenden Befehl aus:                        ║
║                                                         ║
║     await window.migrateDataToFirestore()              ║
║                                                         ║
║  Hinweis: Dies sollte nur einmal ausgeführt werden!   ║
║                                                         ║
╚════════════════════════════════════════════════════════╝
`)

// Make function available in window for browser console
if (typeof window !== 'undefined') {
  window.migrateDataToFirestore = migrateDataToFirestore
}
