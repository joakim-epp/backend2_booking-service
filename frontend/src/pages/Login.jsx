import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api.js'
import { Flash, PageBar } from '../Layout.jsx'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const from = useLocation().state?.from ?? '/'

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.status === 401 ? 'Fel användarnamn eller lösenord' : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageBar icon="bi-box-arrow-in-right" title="Logga in" crumbs={[{ label: 'Logga in' }]} />
      <main className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <Flash message={error} kind="danger" onClose={() => setError(null)} />
            <div className="bk-card">
              <div className="bk-card-header">Inloggning sker hos kundtjänsten</div>
              <div className="p-4">
                <form onSubmit={submit}>
                  <div className="mb-3">
                    <label className="bk-label" htmlFor="username">Användarnamn</label>
                    <input id="username" className="form-control bk-input" value={username} autoFocus required
                           onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="mb-4">
                    <label className="bk-label" htmlFor="password">Lösenord</label>
                    <input id="password" className="form-control bk-input" type="password" value={password} required
                           onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <button className="btn btn-bk w-100" type="submit" disabled={busy}>
                    {busy ? 'Loggar in…' : 'Logga in'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
