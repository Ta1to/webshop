/**
 * User Model
 */
export class User {
  constructor(data = {}) {
    this.id = data.id || null
    this.email = data.email || ''
    this.displayName = data.displayName || ''
    this.photoURL = data.photoURL || ''
    this.role = data.role || 'user'
    this.newsletter = data.newsletter ?? false
    this.createdAt = data.createdAt || null
    this.updatedAt = data.updatedAt || null
  }

  /**
   * Create User from Firestore document
   */
  static fromFirestore(doc) {
    const data = doc.data()
    return new User({
      id: doc.id,
      ...data
    })
  }

  /**
   * Convert to Firestore document data
   */
  toFirestore() {
    return {
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      role: this.role,
      newsletter: this.newsletter,
      updatedAt: this.updatedAt
    }
  }

  /**
   * Get user initials for avatar
   */
  getInitials() {
    if (this.displayName) {
      return this.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return this.email.charAt(0).toUpperCase()
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.role === 'admin'
  }

  /**
   * Get formatted created date
   */
  getFormattedCreatedDate(locale = 'de-DE') {
    if (!this.createdAt) return 'Unknown'
    const date = this.createdAt.toDate ? this.createdAt.toDate() : new Date(this.createdAt)
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Validate user data
   */
  validate() {
    const errors = []
    
    if (!this.email || !this.email.includes('@')) {
      errors.push('Invalid email address')
    }
    
    if (!this.displayName || this.displayName.length < 2) {
      errors.push('Display name must be at least 2 characters')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * User roles enum
 */
export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
}
