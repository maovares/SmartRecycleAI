import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  increment,
} from '@react-native-firebase/firestore';

const db = getFirestore();

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

  const materialKey = result.material?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown';
  await updateDoc(doc(db, 'users', uid), {
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
  await updateDoc(doc(db, 'users', uid), {
    ecoPoints: increment(points),
  });
}