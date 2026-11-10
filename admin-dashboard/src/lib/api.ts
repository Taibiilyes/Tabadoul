const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function clearToken() {
  localStorage.removeItem('admin_token');
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

  if (res.status === 401 || res.status === 403) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || 'حدث خطأ في الاتصال بالخادم');
  }
  return data;
}

export const api = {
  login: (identifier: string, password: string, isEmail: boolean) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(isEmail ? { email: identifier, password } : { phoneNumber: identifier, password }),
    }),
  getPendingDocuments: () => request('/documents/pending'),
  approveDocument: (id: string, extractedFullName: string, extractedDateOfBirth: string) =>
    request(`/documents/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ extractedFullName, extractedDateOfBirth }),
    }),
  rejectDocument: (id: string, reason: string) =>
    request(`/documents/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  listUsers: (params?: string) => request(`/admin/users${params ? `?${params}` : ''}`),
  banByIdentifier: (identifier: string, reason: string) =>
    request('/admin/users/ban', { method: 'POST', body: JSON.stringify({ identifier, reason }) }),
  banByIp: (ip: string, reason: string) =>
    request('/admin/users/ban-by-ip', { method: 'POST', body: JSON.stringify({ ip, reason }) }),
  unbanUser: (id: string) => request(`/admin/users/${id}/unban`, { method: 'POST' }),
  banRoom: (id: string) => request(`/admin/rooms/${id}/ban`, { method: 'POST' }),
  getAuditLog: (limit = 200) => request(`/admin/audit-log?limit=${limit}`),
  listRooms: () => request('/rooms'),
};
