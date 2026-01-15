import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  reload,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from './config'
import { createUserDocument, updateUserDocument, getUserDocument } from './db'

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
    
    // Send email verification
    await sendEmailVerification(userCredential.user)
    
    // Save additional user data in Firestore
    await createUserDocument(userCredential.user.uid, {
      email: email,
      displayName: displayName || '',
      photoURL: userCredential.user.photoURL || '',
      role: 'user', // Default role
      newsletter: true,
      emailVerified: false // Initial verification status
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
    
    // Update emailVerified status in Firestore after login
    const isVerified = userCredential.user.emailVerified
    await updateUserDocument(userCredential.user.uid, {
      emailVerified: isVerified
    })
    
    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user
    
    // Check if user document exists in Firestore
    const userDoc = await getUserDocument(user.uid)
    
    if (!userDoc) {
      // Create user document for new Google users
      await createUserDocument(user.uid, {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: 'user',
        newsletter: true,
        emailVerified: user.emailVerified
      })
    } else {
      // Update existing user document
      await updateUserDocument(user.uid, {
        emailVerified: user.emailVerified,
        photoURL: user.photoURL || userDoc.photoURL
      })
    }
    
    return { success: true, user: user }
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

  const { displayName, email, photoURL, street, postalCode, city, country, phone } = profileUpdates
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

    // Address fields
    if (street !== undefined) {
      firestoreUpdates.street = street
    }

    if (postalCode !== undefined) {
      firestoreUpdates.postalCode = postalCode
    }

    if (city !== undefined) {
      firestoreUpdates.city = city
    }

    if (country !== undefined) {
      firestoreUpdates.country = country
    }

    if (phone !== undefined) {
      firestoreUpdates.phone = phone
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

// Send email verification
export const sendVerificationEmail = async () => {
  const user = auth.currentUser

  if (!user) {
    return { success: false, error: 'auth/user-not-found' }
  }

  if (user.emailVerified) {
    return { success: false, error: 'auth/email-already-verified' }
  }

  try {
    await sendEmailVerification(user)
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error: error.code || error.message }
  }
}

// Refresh email verification status
export const refreshEmailVerificationStatus = async () => {
  const user = auth.currentUser

  if (!user) {
    return { success: false, error: 'auth/user-not-found' }
  }

  try {
    await reload(user)
    const isVerified = auth.currentUser.emailVerified
    
    // Update Firestore
    await updateUserDocument(user.uid, {
      emailVerified: isVerified
    })

    return { success: true, emailVerified: isVerified }
  } catch (error) {
    console.error('Error refreshing verification status:', error)
    return { success: false, error: error.code || error.message }
  }
}
