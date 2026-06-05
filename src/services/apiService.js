import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function analyzeImage(imageUri, idToken) {
  const formData = new FormData();
  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const ext = (match ? match[1] : 'jpeg').toLowerCase().replace('jpg', 'jpeg');
  const type = `image/${ext}`;

  formData.append('image', { uri: imageUri, name: filename, type });

  console.log('=== POSTMAN DEBUG ===');
  console.log('METHOD: POST');
  console.log('URL:', `${BASE_URL}/ai/analyze-image`);
  console.log('HEADERS:');
  console.log('  Content-Type: multipart/form-data');
  console.log('  Authorization: Bearer', idToken);
  console.log('BODY (form-data):');
  console.log('  image:', imageUri);
  console.log('  filename:', filename);
  console.log('  type:', type);
  console.log('====================');

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
