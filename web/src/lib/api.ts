const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_token');
}

export function setToken(token: string) {
  localStorage.setItem('user_token', token);
}

export function clearToken() {
  localStorage.removeItem('user_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || 'حدث خطأ في الاتصال بالخادم');
  }
  return data;
}

export const api = {
  me: () => request('/users/me'),
  register: (payload: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (identifier: string, password: string, isEmail: boolean) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(isEmail ? { email: identifier, password } : { phoneNumber: identifier, password }),
    }),
  uploadDocument: (type: string, storageKey: string) =>
    request('/documents/upload', { method: 'POST', body: JSON.stringify({ type, storageKey }) }),
  listRooms: () => request('/rooms'),
  createRoom: (title: string) => request('/rooms', { method: 'POST', body: JSON.stringify({ title }) }),
  closeRoom: (id: string) => request(`/rooms/${id}/close`, { method: 'POST' }),
  walletHistory: () => request('/wallet/history'),
  purchaseCheckout: (packageCoins: number) =>
    request('/wallet/purchase/checkout', { method: 'POST', body: JSON.stringify({ packageCoins }) }),
  chargeCall: (durationSeconds: number) =>
    request('/wallet/charge-call', { method: 'POST', body: JSON.stringify({ durationSeconds }) }),
};
