import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, limit, getDocs, increment } from 'firebase/firestore';
import { app } from './authService';

const db = getFirestore(app);

export async function getUserProfile(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();

  const defaultProfile = {
    uid,
    ecoPoints: 0,
    totalScans: 0,
    totalCo2: 0,
    materials: {},
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, defaultProfile);
  return defaultProfile;
}

export async function saveRecycleHistory(uid, result) {
  const histRef = collection(db, 'users', uid, 'history');
  await addDoc(histRef, {
    ...result,
    timestamp: new Date().toISOString(),
  });

  const userRef = doc(db, 'users', uid);
  const materialKey = result.material?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown';
  await updateDoc(userRef, {
    ecoPoints: increment(result.points || 0),
    totalScans: increment(1),
    totalCo2: increment(result.impact?.co2_kg || 0),
    [`materials.${materialKey}`]: increment(1),
  });
}

export async function getRecentHistory(uid, count = 3) {
  const histRef = collection(db, 'users', uid, 'history');
  const q = query(histRef, orderBy('timestamp', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateEcoPoints(uid, points) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { ecoPoints: increment(points) });
}
