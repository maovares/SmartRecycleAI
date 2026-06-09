import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  reload,
  getIdToken,
  updateProfile,
} from '@react-native-firebase/auth';

const auth = getAuth();

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function register(email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(credential.user);
  return credential.user;
}

export async function resendVerification() {
  const user = auth.currentUser;
  if (user) await sendEmailVerification(user);
}

export async function checkEmailVerified() {
  const user = auth.currentUser;
  if (user) {
    await reload(user);
    return auth.currentUser.emailVerified;
  }
  return false;
}

export async function logout() {
  await signOut(auth);
}

export async function getUserIdToken() {
  const user = auth.currentUser;
  if (user) return getIdToken(user);
  throw new Error('No hay sesión activa');
}

export async function updateUserDisplayName(name) {
  const user = auth.currentUser;
  if (user) await updateProfile(user, { displayName: name });
}