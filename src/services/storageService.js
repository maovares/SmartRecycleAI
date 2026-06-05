import firestore from '@react-native-firebase/firestore';

export async function getUserProfile(uid) {
  const ref = firestore().collection('users').doc(uid);
  const snap = await ref.get();
  if (snap.exists) return snap.data();

  const defaultProfile = {
    uid,
    ecoPoints: 0,
    totalScans: 0,
    totalCo2: 0,
    materials: {},
    createdAt: new Date().toISOString(),
  };
  await ref.set(defaultProfile);
  return defaultProfile;
}

export async function saveRecycleHistory(uid, result) {
  const histRef = firestore().collection('users').doc(uid).collection('history');
  await histRef.add({
    ...result,
    timestamp: new Date().toISOString(),
  });

  const materialKey = result.material?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown';
  await firestore().collection('users').doc(uid).update({
    ecoPoints: firestore.FieldValue.increment(result.points || 0),
    totalScans: firestore.FieldValue.increment(1),
    totalCo2: firestore.FieldValue.increment(result.impact?.co2_kg || 0),
    [`materials.${materialKey}`]: firestore.FieldValue.increment(1),
  });
}

export async function getRecentHistory(uid, count = 3) {
  const snap = await firestore()
    .collection('users')
    .doc(uid)
    .collection('history')
    .orderBy('timestamp', 'desc')
    .limit(count)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateEcoPoints(uid, points) {
  await firestore()
    .collection('users')
    .doc(uid)
    .update({ ecoPoints: firestore.FieldValue.increment(points) });
}
