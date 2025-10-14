import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  reload
} from 'firebase/auth'
import { auth } from './config'
import { createUserDocument, updateUserDocument } from './db'

// Register a new user
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update user profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      })
    }
    
    // Save additional user data in Firestore
    await createUserDocument(userCredential.user.uid, {
      email: email,
      displayName: displayName || '',
      photoURL: userCredential.user.photoURL || '',
      role: 'user' // Default role
    })
    
    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Login a user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Auth state observer
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser
}

// Update current user profile and sync with Firestore
export const updateUserProfile = async (profileUpdates = {}) => {
  const user = auth.currentUser

  if (!user) {
    return { success: false, error: 'auth/user-not-found' }
  }

  const { displayName, email, photoURL } = profileUpdates
  const authProfileUpdates = {}

  if (displayName !== undefined && displayName !== user.displayName) {
    authProfileUpdates.displayName = displayName
  }

  if (photoURL !== undefined && photoURL !== user.photoURL) {
    authProfileUpdates.photoURL = photoURL
  }

  try {
    if (Object.keys(authProfileUpdates).length > 0) {
      await updateProfile(user, authProfileUpdates)
    }

    if (email !== undefined && email !== user.email) {
      await updateEmail(user, email)
    }

    const firestoreUpdates = {}

    if (displayName !== undefined) {
      firestoreUpdates.displayName = displayName
    }

    if (email !== undefined) {
      firestoreUpdates.email = email
    }

    if (photoURL !== undefined) {
      firestoreUpdates.photoURL = photoURL
    }

    if (Object.keys(firestoreUpdates).length > 0) {
      await updateUserDocument(user.uid, firestoreUpdates)
    }

    await reload(user)

    return { success: true, user: auth.currentUser }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { success: false, error: error.code || error.message }
  }
}
