export const CookieManager = {
  /**
   * Set a cookie
   * @param {string} name - Cookie name
   * @param {any} value - Cookie value (will be JSON stringified)
   * @param {number} days - Expiry in days (default: 30)
   */
  set(name, value, days = 30) {
    if (!name) {
      throw new Error('Cookie name is required')
    }
    
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${JSON.stringify(value)};${expires};path=/;SameSite=Strict`
  },

  /**
   * Get a cookie value
   * @param {string} name - Cookie name
   * @returns {any|null} Parsed cookie value or null if not found
   */
  get(name) {
    if (!name) {
      return null
    }
    
    const nameEQ = `${name}=`
    const cookies = document.cookie.split(';')
    
    for (const cookie of cookies) {
      const trimmed = cookie.trim()
      if (trimmed.startsWith(nameEQ)) {
        try {
          return JSON.parse(trimmed.substring(nameEQ.length))
        } catch (e) {
          console.warn(`Failed to parse cookie "${name}":`, e)
          return null
        }
      }
    }
    return null
  },

  /**
   * Delete a cookie
   * @param {string} name - Cookie name
   */
  delete(name) {
    if (!name) {
      return
    }
    
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
  },

  /**
   * Check if a cookie exists
   * @param {string} name - Cookie name
   * @returns {boolean}
   */
  exists(name) {
    return this.get(name) !== null
  }
}
