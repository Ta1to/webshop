/**
 * Storage constants
 */
export const STORAGE = {
  COOKIE_EXPIRY_DAYS: 30,
  CART_COOKIE_NAME: 'webshop_cart',
  WISHLIST_COOKIE_NAME: 'webshop_wishlist',
  COOKIE_CONSENT_NAME: 'webshop_cookie_consent'
}

/**
 * Firestore collection names
 */
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  CATEGORIES: 'categories',
  OFFERS: 'offers'
}

/**
 * Product constants
 */
export const PRODUCT = {
  NEW_BADGE_DAYS: 7,
  LOW_STOCK_THRESHOLD: 10,
  MAX_STOCK: 9999,
  MIN_NAME_LENGTH: 3,
  MAX_QUANTITY: 999,
  MIN_QUANTITY: 1
}

/**
 * Validation constants
 */
export const VALIDATION = {
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  MIN_PASSWORD_LENGTH: 6,
  MAX_DESCRIPTION_LENGTH: 500
}

/**
 * UI constants
 */
export const UI = {
  TRUNCATE_SUFFIX: '...',
  ITEMS_PER_PAGE: 12,
  ADMIN_ITEMS_PER_PAGE: 20,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  IMAGE_VALIDATION_TIMEOUT: 5000
}

/**
 * Shipping constants
 */
export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 50,
  DEFAULT_SHIPPING_COST: 4.99
}

/**
 * Order status values
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
}

/**
 * Date/Time formats
 */
export const FORMATS = {
  DATE_LOCALE: 'de-DE',
  CURRENCY: 'EUR',
  DATE_OPTIONS: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  TIME_OPTIONS: {
    hour: '2-digit',
    minute: '2-digit'
  }
}

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
  AUTH_FAILED: 'Authentifizierung fehlgeschlagen.',
  INVALID_EMAIL: 'Ungültige E-Mail-Adresse.',
  INVALID_PASSWORD: 'Passwort muss mindestens 6 Zeichen lang sein.',
  PRODUCT_NOT_FOUND: 'Produkt nicht gefunden.',
  ORDER_CREATION_FAILED: 'Bestellung konnte nicht erstellt werden.',
  IMAGE_UPLOAD_FAILED: 'Bild konnte nicht hochgeladen werden.',
  CART_UPDATE_FAILED: 'Warenkorb konnte nicht aktualisiert werden.',
  UNKNOWN_ERROR: 'Ein unbekannter Fehler ist aufgetreten.'
}

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  PRODUCT_ADDED_TO_CART: 'Produkt wurde zum Warenkorb hinzugefügt.',
  PRODUCT_ADDED_TO_WISHLIST: 'Produkt wurde zur Wunschliste hinzugefügt.',
  ORDER_PLACED: 'Bestellung erfolgreich aufgegeben.',
  PROFILE_UPDATED: 'Profil erfolgreich aktualisiert.',
  NEWSLETTER_SUBSCRIBED: 'Newsletter erfolgreich abonniert.',
  PRODUCT_CREATED: 'Produkt erfolgreich erstellt.',
  PRODUCT_UPDATED: 'Produkt erfolgreich aktualisiert.',
  PRODUCT_DELETED: 'Produkt erfolgreich gelöscht.'
}
