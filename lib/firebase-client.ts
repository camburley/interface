import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_WEB_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

let clientApp: FirebaseApp | undefined
let clientAuth: Auth | undefined

export function getFirebaseClient(): { app: FirebaseApp; auth: Auth } {
  if (!clientApp || !clientAuth) {
    clientApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
    clientAuth = getAuth(clientApp)
  }
  return { app: clientApp, auth: clientAuth }
}
