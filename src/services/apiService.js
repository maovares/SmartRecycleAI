import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function compressImage(uri) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

export async function fetchNearbyCenters(lat, lng) {
  const url = `${BASE_URL}/centers/nearby?lat=${lat}&lng=${lng}`;
  console.log('[API] GET', url);
  const resp = await fetch(url);
  const data = await resp.json();
  console.log('[API] status:', resp.status, '| response:', JSON.stringify(data));
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${data?.detail ?? ''}`);
  return data.centers || [];
}

export async function analyzeImage(imageUri, idToken, location) {
  const compressedUri = await compressImage(imageUri);
  const formData = new FormData();
  const filename = compressedUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const ext = (match ? match[1] : 'jpeg').toLowerCase().replace('jpg', 'jpeg');
  const type = `image/${ext}`;

  formData.append('image', { uri: compressedUri, name: filename, type });
  if (location?.latitude != null && location?.longitude != null) {
    formData.append('lat', String(location.latitude));
    formData.append('lng', String(location.longitude));
  }

  let response;
  try {
    response = await axios.post(`${BASE_URL}/ai/analyze-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${idToken}`,
      },
      timeout: 90000,
    });
    console.log('[API] Status:', response.status);
    console.log('[API] Response:', JSON.stringify(response.data));
  } catch (err) {
    console.log('[API] ERROR status:', err.response?.status);
    console.log('[API] ERROR data:', JSON.stringify(err.response?.data));
    console.log('[API] ERROR message:', err.message);
    throw err;
  }

  return response.data;
}
