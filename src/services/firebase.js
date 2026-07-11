import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// ⚠️ Remplacez par vos vraies clés Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDox7zP7woRPvRegGHMTfdl4O3MdKz7NPk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'novacaredakar.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'novacaredakar',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'novacaredakar.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1014303348490',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1014303348490:web:bfc6537d9d8ddf0ea98cf3'
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app