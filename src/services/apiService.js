import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function analyzeImage(imageUri, idToken) {
  const formData = new FormData();
  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('image', { uri: imageUri, name: filename, type });

  const response = await axios.post(`${BASE_URL}/ai/analyze-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${idToken}`,
    },
    timeout: 30000,
  });

  return response.data;
}
