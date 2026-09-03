import { useCallback, useEffect, useState } from 'react'

async function send(method, url, body) {
  const res = await fetch('/api' + url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : null
  if (!res.ok) {
    throw Object.assign(new Error(data?.message || 'Något gick fel'), { fields: data?.fields || {} })
  }
  return data
}

export const api = {
  get: (url) => send('GET', url),
  post: (url, body) => send('POST', url, body),
  put: (url, body) => send('PUT', url, body),
  del: (url) => send('DELETE', url),
}

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
