import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  reload,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export async function login(email, password) {
  const auth = getAuth(app);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function register(email, password) {
  const auth = getAuth(app);
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(credential.user);
  return credential.user;
}

export async function resendVerification() {
  const auth = getAuth(app);
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

export async function checkEmailVerified() {
  const auth = getAuth(app);
  if (auth.currentUser) {
    await reload(auth.currentUser);
    return auth.currentUser.emailVerified;
  }
  return false;
}

export async function logout() {
  const auth = getAuth(app);
  await signOut(auth);
}

export async function getIdToken() {
  const auth = getAuth(app);
  if (auth.currentUser) {
    return auth.currentUser.getIdToken();
  }
  throw new Error('No hay sesión activa');
}
