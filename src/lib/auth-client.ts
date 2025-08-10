export interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
    role: string
    teamId?: string
    permissions: string[]
  }
  token: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role?: string
  teamId?: string
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error((() => { try { return JSON.parse(errText).error } catch { return errText || res.statusText } })())
  }
  return res.json() as Promise<T>
}

export const authClient = {
  login: (data: { email: string; password: string }) =>
    request<LoginResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  register: (data: RegisterRequest) =>
    request<LoginResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  me: (token: string) =>
    request<LoginResponse['user']>('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),

  logout: (token: string) =>
    request<void>('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
}
