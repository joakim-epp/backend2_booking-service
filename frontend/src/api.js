import { useCallback, useEffect, useState } from 'react'

const TOKEN_KEY = 'booking-service-token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function send(method, url, body) {
  const token = getToken()
  const res = await fetch('/api' + url, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : null

  // A 401 anywhere but on login means the token is gone or stale: start over.
  if (res.status === 401 && url !== '/auth/login') {
    clearToken()
    location.assign('/login')
  }

  if (!res.ok) {
    // Both services answer problem+json: detail is the message, errors the per-field messages.
    const fields = Object.fromEntries((data?.errors ?? []).map((e) => [e.field, e.message]))
    throw Object.assign(new Error(data?.detail || 'Något gick fel'), { status: res.status, fields })
  }
  return data
}

export const api = {
  get: (url) => send('GET', url),
  post: (url, body) => send('POST', url, body),
  put: (url, body) => send('PUT', url, body),
  del: (url) => send('DELETE', url),
}

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then(({ token }) => localStorage.setItem(TOKEN_KEY, token))

export function useApi(url) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const reload = useCallback(() => {
    api.get(url).then(setData, (e) => setError(e.message))
  }, [url])
  useEffect(reload, [reload])
  return { data, error, reload, setError }
}

export const kr = (n) => Number(n ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' kr'

export const fullName = (c) => `${c.firstName} ${c.lastName}`
