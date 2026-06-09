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

// In-memory cache: avoids refetching if coords haven't moved ~100m within 5 min
let _centersCache = null;
const CACHE_TTL = 5 * 60 * 1000;
const COORD_DELTA = 0.001;

function cacheHit(lat, lng) {
  return (
    _centersCache !== null &&
    Date.now() - _centersCache.ts < CACHE_TTL &&
    Math.abs(_centersCache.lat - lat) < COORD_DELTA &&
    Math.abs(_centersCache.lng - lng) < COORD_DELTA
  );
}

export async function fetchNearbyCenters(lat, lng) {
  if (cacheHit(lat, lng)) return _centersCache.data;

  const url = `${BASE_URL}/centers/nearby?lat=${lat}&lng=${lng}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${data?.detail ?? ''}`);
  const centers = data.centers || [];
  _centersCache = { lat, lng, ts: Date.now(), data: centers };
  return centers;
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
