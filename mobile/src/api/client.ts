import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api/v1';

export const api = axios.create({ baseURL: API_URL });

// حقن رمز الدخول (JWT) تلقائيًا في كل طلب بعد تسجيل الدخول
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function saveToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token);
}

export async function getToken() {
  return SecureStore.getItemAsync('auth_token');
}

export async function clearToken() {
  await SecureStore.deleteItemAsync('auth_token');
}
