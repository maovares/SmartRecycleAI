import auth from '@react-native-firebase/auth';

export async function login(email, password) {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  return credential.user;
}

export async function register(email, password) {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  await credential.user.sendEmailVerification();
  return credential.user;
}

export async function resendVerification() {
  const user = auth().currentUser;
  if (user) await user.sendEmailVerification();
}

export async function checkEmailVerified() {
  const user = auth().currentUser;
  if (user) {
    await user.reload();
    return auth().currentUser.emailVerified;
  }
  return false;
}

export async function logout() {
  await auth().signOut();
}

export async function getIdToken() {
  const user = auth().currentUser;
  if (user) return user.getIdToken();
  throw new Error('No hay sesión activa');
}
