import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import FIREBASE from 'config/firebase.config'

// Initialize Firebase instance
const firebaseClient = initializeApp(FIREBASE)

// Get Firebase authentication instance
const firebaseAuth = getAuth()

export { firebaseAuth }
export default firebaseClient
