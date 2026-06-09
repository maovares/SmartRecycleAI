import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

const auth = getAuth();

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function register(email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await credential.user.sendEmailVerification();
  return credential.user;
}

export async function resendVerification() {
  const user = auth.currentUser;
  if (user) await user.sendEmailVerification();
}

export async function checkEmailVerified() {
  const user = auth.currentUser;
  if (user) {
    await user.reload();
    return auth.currentUser.emailVerified;
  }
  return false;
}

export async function logout() {
  await signOut(auth);
}

export async function getIdToken() {
  const user = auth.currentUser;
  if (user) return user.getIdToken();
  throw new Error('No hay sesión activa');
}

export async function updateUserDisplayName(name) {
  const user = auth.currentUser;
  if (user) await user.updateProfile({ displayName: name });
}