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
  writeBatch,
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
    totalWater: 0,
    recyclableCount: 0,
    materials: {},
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, defaultProfile);
  return defaultProfile;
}

export async function saveRecycleHistory(uid, result) {
  const { nearest_centers, ...resultToSave } = result;

  const histRef = collection(db, 'users', uid, 'history');
  await addDoc(histRef, {
    ...resultToSave,
    timestamp: new Date().toISOString(),
  });

  const materialKey = (result.material || 'unknown').replace(/[./]/g, '_');
  await updateDoc(doc(db, 'users', uid), {
    ecoPoints: increment(result.points || 0),
    totalScans: increment(1),
    totalCo2: increment(result.impact?.co2_kg || 0),
    totalWater: increment(result.impact?.water_l || 0),
    recyclableCount: increment(result.recyclable ? 1 : 0),
    [`materials.${materialKey}`]: increment(1),
  });
}

export async function getRecentHistory(uid, count = 3) {
  const histRef = collection(db, 'users', uid, 'history');
  const q = query(histRef, orderBy('timestamp', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getFullHistory(uid) {
  const histRef = collection(db, 'users', uid, 'history');
  const q = query(histRef, orderBy('timestamp', 'desc'), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateEcoPoints(uid, points) {
  await updateDoc(doc(db, 'users', uid), {
    ecoPoints: increment(points),
  });
}

export async function resetUserData(uid) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    ecoPoints: 0,
    totalScans: 0,
    totalCo2: 0,
    totalWater: 0,
    recyclableCount: 0,
    materials: {},
    createdAt: new Date().toISOString(),
  });

  const histRef = collection(db, 'users', uid, 'history');
  const snap = await getDocs(histRef);
  if (snap.docs.length > 0) {
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
