/**
 * Cookie Event Bus
 * Simple event emitter for cookie-related events across components
 */

class CookieEventBus {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
  }

  emit(event, data) {
    if (!this.listeners[event]) return
    this.listeners[event].forEach(callback => callback(data))
  }
}

export const cookieEventBus = new CookieEventBus()

// Event names
export const COOKIE_EVENTS = {
  OPEN_SETTINGS: 'openCookieSettings',
  SETTINGS_SAVED: 'cookieSettingsSaved',
  CONSENT_CHANGED: 'cookieConsentChanged'
}
