import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function compressImage(uri) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 600 } }],
    { compress: 0.45, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

// In-memory cache for nearby centers.
// CACHE_TTL:  fresh window — returns immediately without a network call.
// STALE_TTL:  stale window — data is returned immediately (SWR) while a
//             background refresh runs. Centers rarely move so 4 h is safe.
let _centersCache = null;
const CACHE_TTL  = 30 * 60 * 1000;  // 30 min fresh  (matches server TTL)
const STALE_TTL  =  4 * 60 * 60 * 1000;  // 4 h stale
const COORD_DELTA = 0.001;           // ~100 m bucket

let _inflight = null; // { lat, lng, promise } — deduplicates concurrent calls

function _coordMatch(lat, lng) {
  return (
    _centersCache !== null &&
    Math.abs(_centersCache.lat - lat) < COORD_DELTA &&
    Math.abs(_centersCache.lng - lng) < COORD_DELTA
  );
}

function _isFresh(lat, lng) {
  return _coordMatch(lat, lng) && Date.now() - _centersCache.ts < CACHE_TTL;
}

// Returns stale cached data (up to STALE_TTL old) or null.
// Used by CentersScreen to show something instantly while refreshing.
export function getStaleCenters(lat, lng) {
  if (!_coordMatch(lat, lng)) return null;
  if (Date.now() - _centersCache.ts > STALE_TTL) return null;
  return _centersCache.data;
}

async function _doFetch(lat, lng) {
  // Deduplicate: if there is already an in-flight request for the same
  // coordinate bucket, return the same Promise instead of opening a second
  // connection.
  if (_inflight && Math.abs(_inflight.lat - lat) < COORD_DELTA && Math.abs(_inflight.lng - lng) < COORD_DELTA) {
    return _inflight.promise;
  }

  const promise = (async () => {
    const url = `${BASE_URL}/centers/nearby?lat=${lat}&lng=${lng}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${data?.detail ?? ''}`);
    const centers = data.centers || [];
    _centersCache = { lat, lng, ts: Date.now(), data: centers };
    return centers;
  })().finally(() => { _inflight = null; });

  _inflight = { lat, lng, promise };
  return promise;
}

export async function fetchNearbyCenters(lat, lng) {
  if (_isFresh(lat, lng)) return _centersCache.data;
  return _doFetch(lat, lng);
}

export async function analyzeImage(imageUri, idToken) {
  const t0 = Date.now();
  console.log('[API] analyzeImage — compressing...');
  const compressedUri = await compressImage(imageUri);
  console.log(`[API] Compressed in ${((Date.now() - t0) / 1000).toFixed(2)}s`);

  const formData = new FormData();
  const filename = compressedUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const ext = (match ? match[1] : 'jpeg').toLowerCase().replace('jpg', 'jpeg');
  const type = `image/${ext}`;

  formData.append('image', { uri: compressedUri, name: filename, type });

  const t1 = Date.now();
  console.log('[API] POST /ai/analyze-image — sending request...');
  let response;
  try {
    response = await axios.post(`${BASE_URL}/ai/analyze-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${idToken}`,
      },
      timeout: 90000,
    });
    console.log(`[API] Response in ${((Date.now() - t1) / 1000).toFixed(2)}s (total: ${((Date.now() - t0) / 1000).toFixed(2)}s) — status: ${response.status}`);
    console.log('[API] Response:', JSON.stringify(response.data));
  } catch (err) {
    console.log(`[API] ERROR after ${((Date.now() - t1) / 1000).toFixed(2)}s — status: ${err.response?.status} | ${err.message}`);
    console.log('[API] ERROR data:', JSON.stringify(err.response?.data));
    throw err;
  }

  return response.data;
}
