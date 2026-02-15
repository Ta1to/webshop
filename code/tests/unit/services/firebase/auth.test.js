/**
 * Unit Tests for Firebase Authentication Service
 * Following the AAA (Arrange-Act-Assert) Pattern
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  registerUser, 
  loginUser, 
  signInWithGoogle,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  sendVerificationEmail,
  refreshEmailVerificationStatus
} from '@/services/firebase/auth'
import { USER_ROLES, ERROR_MESSAGES } from '@/constants'

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  reload: vi.fn(),
  sendEmailVerification: vi.fn(),
  GoogleAuthProvider: vi.fn().mockImplementation(function() {
    this.setCustomParameters = vi.fn()
  })
}))

// Mock Firebase Config
vi.mock('@/services/firebase/config', () => ({
  auth: {
    currentUser: null
  }
}))

// Mock Firebase DB
vi.mock('@/services/firebase/db', () => ({
  createUserDocument: vi.fn(),
  updateUserDocument: vi.fn(),
  getUserDocument: vi.fn()
}))

// Mock Error Handler
vi.mock('@/services/utils/errorHandler', () => ({
  errorHandler: {
    error: vi.fn(),
    warn: vi.fn()
  }
}))

import * as firebaseAuth from 'firebase/auth'
import { auth } from '@/services/firebase/config'
import { createUserDocument, updateUserDocument, getUserDocument } from '@/services/firebase/db'

describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully register a new user with valid credentials', async () => {
    // Arrange
    const email = 'test@example.com'
    const password = 'password123'
    const displayName = 'Test User'
    const mockUser = { 
      uid: 'user123', 
      email, 
      photoURL: null,
      emailVerified: false
    }

    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({ 
      user: mockUser 
    })
    firebaseAuth.updateProfile.mockResolvedValue()
    firebaseAuth.sendEmailVerification.mockResolvedValue()
    createUserDocument.mockResolvedValue({ success: true })

    // Act
    const result = await registerUser(email, password, displayName)

    // Assert
    expect(result.success).toBe(true)
    expect(result.user).toEqual(mockUser)
    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password)
    expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser, { displayName })
    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(mockUser)
    expect(createUserDocument).toHaveBeenCalledWith('user123', {
      email,
      displayName,
      photoURL: '',
      role: USER_ROLES.USER,
      newsletter: true,
      emailVerified: false
    })
  })

  it('should reject registration with invalid email', async () => {
    // Arrange
    const invalidEmail = 'invalid-email'
    const password = 'password123'

    // Act
    const result = await registerUser(invalidEmail, password, 'Test')

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(ERROR_MESSAGES.INVALID_EMAIL)
    expect(firebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled()
  })

  it('should reject registration with short password', async () => {
    // Arrange
    const email = 'test@example.com'
    const shortPassword = '12345' // Less than 6 characters

    // Act
    const result = await registerUser(email, shortPassword, 'Test')

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(ERROR_MESSAGES.INVALID_PASSWORD)
    expect(firebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled()
  })

  it('should reject registration with empty email', async () => {
    // Arrange
    const email = ''
    const password = 'password123'

    // Act
    const result = await registerUser(email, password, 'Test')

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(ERROR_MESSAGES.INVALID_EMAIL)
  })

  it('should handle registration errors from Firebase', async () => {
    // Arrange
    const email = 'test@example.com'
    const password = 'password123'
    const errorMessage = 'Email already in use'
    
    firebaseAuth.createUserWithEmailAndPassword.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await registerUser(email, password, 'Test')

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('loginUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully login with valid credentials', async () => {
    // Arrange
    const email = 'test@example.com'
    const password = 'password123'
    const mockUser = { 
      uid: 'user123', 
      email,
      emailVerified: true
    }

    firebaseAuth.signInWithEmailAndPassword.mockResolvedValue({ user: mockUser })
    updateUserDocument.mockResolvedValue({ success: true })

    // Act
    const result = await loginUser(email, password)

    // Assert
    expect(result.success).toBe(true)
    expect(result.user).toEqual(mockUser)
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password)
    expect(updateUserDocument).toHaveBeenCalledWith('user123', { emailVerified: true })
  })

  it('should reject login with invalid email', async () => {
    // Arrange
    const invalidEmail = 'not-an-email'
    const password = 'password123'

    // Act
    const result = await loginUser(invalidEmail, password)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(ERROR_MESSAGES.INVALID_EMAIL)
    expect(firebaseAuth.signInWithEmailAndPassword).not.toHaveBeenCalled()
  })

  it('should reject login without password', async () => {
    // Arrange
    const email = 'test@example.com'
    const password = ''

    // Act
    const result = await loginUser(email, password)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe('Password is required')
  })

  it('should handle login errors from Firebase', async () => {
    // Arrange
    const email = 'test@example.com'
    const password = 'wrongpassword'
    const errorMessage = 'Invalid credentials'
    
    firebaseAuth.signInWithEmailAndPassword.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await loginUser(email, password)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('signInWithGoogle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully sign in new user with Google', async () => {
    // Arrange
    const mockUser = {
      uid: 'google123',
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: 'https://example.com/photo.jpg',
      emailVerified: true
    }

    firebaseAuth.signInWithPopup.mockResolvedValue({ user: mockUser })
    getUserDocument.mockResolvedValue(null) // New user
    createUserDocument.mockResolvedValue({ success: true })

    // Act
    const result = await signInWithGoogle()

    // Assert
    expect(result.success).toBe(true)
    expect(result.user).toEqual(mockUser)
    expect(createUserDocument).toHaveBeenCalledWith('google123', {
      email: mockUser.email,
      displayName: mockUser.displayName,
      photoURL: mockUser.photoURL,
      role: USER_ROLES.USER,
      newsletter: true,
      emailVerified: true
    })
  })

  it('should update existing user on Google sign-in', async () => {
    // Arrange
    const mockUser = {
      uid: 'google123',
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: 'https://example.com/photo.jpg',
      emailVerified: true
    }

    firebaseAuth.signInWithPopup.mockResolvedValue({ user: mockUser })
    getUserDocument.mockResolvedValue({ 
      id: 'google123', 
      email: mockUser.email,
      photoURL: 'old-photo.jpg'
    })
    updateUserDocument.mockResolvedValue({ success: true })

    // Act
    const result = await signInWithGoogle()

    // Assert
    expect(result.success).toBe(true)
    expect(updateUserDocument).toHaveBeenCalledWith('google123', {
      emailVerified: true,
      photoURL: mockUser.photoURL
    })
  })

  it('should handle Google sign-in errors', async () => {
    // Arrange
    const errorMessage = 'Google sign-in failed'
    
    firebaseAuth.signInWithPopup.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await signInWithGoogle()

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('logoutUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully logout user', async () => {
    // Arrange
    firebaseAuth.signOut.mockResolvedValue()

    // Act
    const result = await logoutUser()

    // Assert
    expect(result.success).toBe(true)
    expect(firebaseAuth.signOut).toHaveBeenCalledWith(auth)
  })

  it('should handle logout errors', async () => {
    // Arrange
    const errorMessage = 'Logout failed'
    firebaseAuth.signOut.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await logoutUser()

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('getCurrentUser', () => {
  it('should return current user', () => {
    // Arrange
    const mockUser = { uid: 'user123', email: 'test@example.com' }
    auth.currentUser = mockUser

    // Act
    const result = getCurrentUser()

    // Assert
    expect(result).toEqual(mockUser)
  })

  it('should return null when no user is logged in', () => {
    // Arrange
    auth.currentUser = null

    // Act
    const result = getCurrentUser()

    // Assert
    expect(result).toBeNull()
  })
})

describe('updateUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully update user profile', async () => {
    // Arrange
    const mockUser = {
      uid: 'user123',
      email: 'old@example.com',
      displayName: 'Old Name',
      photoURL: 'old-photo.jpg'
    }
    auth.currentUser = mockUser

    const profileUpdates = {
      displayName: 'New Name',
      email: 'new@example.com',
      photoURL: 'new-photo.jpg',
      street: 'Main St',
      city: 'Berlin'
    }

    firebaseAuth.updateProfile.mockResolvedValue()
    firebaseAuth.updateEmail.mockResolvedValue()
    firebaseAuth.reload.mockResolvedValue()
    updateUserDocument.mockResolvedValue({ success: true })

    // Act
    const result = await updateUserProfile(profileUpdates)

    // Assert
    expect(result.success).toBe(true)
    expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser, {
      displayName: 'New Name',
      photoURL: 'new-photo.jpg'
    })
    expect(firebaseAuth.updateEmail).toHaveBeenCalledWith(mockUser, 'new@example.com')
    expect(updateUserDocument).toHaveBeenCalledWith('user123', {
      displayName: 'New Name',
      email: 'new@example.com',
      photoURL: 'new-photo.jpg',
      street: 'Main St',
      city: 'Berlin'
    })
  })

  it('should return error when no user is logged in', async () => {
    // Arrange
    auth.currentUser = null

    // Act
    const result = await updateUserProfile({ displayName: 'Test' })

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe('auth/user-not-found')
  })

  it('should handle profile update errors', async () => {
    // Arrange
    const mockUser = { uid: 'user123', email: 'test@example.com', displayName: 'Old Name' }
    auth.currentUser = mockUser
    const errorMessage = 'Update failed'

    firebaseAuth.updateProfile.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await updateUserProfile({ displayName: 'New Name' })

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('sendVerificationEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully send verification email', async () => {
    // Arrange
    const mockUser = { uid: 'user123', emailVerified: false }
    auth.currentUser = mockUser

    firebaseAuth.sendEmailVerification.mockResolvedValue()

    // Act
    const result = await sendVerificationEmail()

    // Assert
    expect(result.success).toBe(true)
    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(mockUser)
  })

  it('should return error when no user is logged in', async () => {
    // Arrange
    auth.currentUser = null

    // Act
    const result = await sendVerificationEmail()

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe('auth/user-not-found')
  })

  it('should return error when email is already verified', async () => {
    // Arrange
    const mockUser = { uid: 'user123', emailVerified: true }
    auth.currentUser = mockUser

    // Act
    const result = await sendVerificationEmail()

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe('auth/email-already-verified')
  })

  it('should handle send verification email errors', async () => {
    // Arrange
    const mockUser = { uid: 'user123', emailVerified: false }
    auth.currentUser = mockUser
    const errorCode = 'auth/too-many-requests'

    firebaseAuth.sendEmailVerification.mockRejectedValue({ code: errorCode })

    // Act
    const result = await sendVerificationEmail()

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorCode)
  })
})

describe('refreshEmailVerificationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully refresh verification status', async () => {
    // Arrange
    const mockUser = { uid: 'user123', emailVerified: false }
    auth.currentUser = mockUser

    firebaseAuth.reload.mockResolvedValue()
    auth.currentUser = { ...mockUser, emailVerified: true }
    updateUserDocument.mockResolvedValue({ success: true })

    // Act
    const result = await refreshEmailVerificationStatus()

    // Assert
    expect(result.success).toBe(true)
    expect(result.emailVerified).toBe(true)
    expect(updateUserDocument).toHaveBeenCalledWith('user123', { emailVerified: true })
  })

  it('should return error when no user is logged in', async () => {
    // Arrange
    auth.currentUser = null

    // Act
    const result = await refreshEmailVerificationStatus()

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe('auth/user-not-found')
  })

  it('should handle refresh errors', async () => {
    // Arrange
    const mockUser = { uid: 'user123', emailVerified: false }
    auth.currentUser = mockUser
    const errorCode = 'auth/network-request-failed'

    firebaseAuth.reload.mockRejectedValue({ code: errorCode })

    // Act
    const result = await refreshEmailVerificationStatus()

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorCode)
  })
})
