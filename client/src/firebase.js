// Firebase initialization template.
// Replace the placeholder values with your Firebase project config.
// To get config: Firebase Console -> Project Settings -> SDK setup and configuration
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// EDIT THESE VALUES or set environment variables and update this file.
const firebaseConfig = {
  apiKey: "AIzaSyC762G8ucHk6CkE0CQc1khNbNlYiS9eiUU",
  authDomain: "todo-website1234.firebaseapp.com",
  projectId: "todo-website1234",
  storageBucket: "todo-website1234.firebasestorage.app",
  messagingSenderId: "39724501948",
  appId: "1:39724501948:web:5852e7e5aff2e2c24179b9",
  measurementId: "G-BCDQGHN7BT"
};

export function isFirebaseConfigured(){
  return firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('REPLACE')
}

let app = null
let auth = null
let db = null
let storage = null
if(isFirebaseConfigured()){
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

export { app, auth, db, storage }
