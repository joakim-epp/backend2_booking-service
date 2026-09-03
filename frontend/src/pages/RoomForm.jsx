import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, useApi } from '../api.js'
import { Flash, PageBar } from '../Layout.jsx'

const EMPTY = { roomNumber: '', type: '', extraBeds: 0, pricePerNight: '' }

export default function RoomForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: types } = useApi('/rooms/types')
  const [room, setRoom] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const pageTitle = id ? 'Redigera rum' : 'Nytt rum'

  useEffect(() => {
    if (id) api.get('/rooms/' + id).then(setRoom, (e) => setError(e.message))
  }, [id])

  const submit = (e) => {
    e.preventDefault()
    const body = { ...room, extraBeds: room.type === 'SINGLE' ? 0 : Number(room.extraBeds) }
    const req = id ? api.put('/rooms/' + id, body) : api.post('/rooms', body)
    req.then(
      () => navigate('/rooms', { state: { msg: id ? 'Rummet uppdaterades.' : 'Rummet skapades.' } }),
      (err) => { setErrors(err.fields); setError(err.message) },
    )
  }

  const invalid = (name) => (errors[name] ? ' is-invalid' : '')

  return (
    <>
      <PageBar title={pageTitle} crumbs={[{ label: 'Rum', to: '/rooms' }, { label: pageTitle }]} />

      <main className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <Flash message={error} kind="danger" onClose={() => setError(null)} />
            <div className="bk-card">
              <div className="bk-card-header">
                <i className="bi bi-door-open me-2" style={{ color: 'var(--bk-blue)' }}></i>
                <span>{pageTitle}</span>
              </div>
              <div className="p-4">
                <form onSubmit={submit} noValidate>
                  <div className="mb-3">
                    <label className="bk-label">
                      <i className="bi bi-hash me-1"></i>Rumsnummer <span className="text-danger">*</span>
                    </label>
                    <input type="text" placeholder="t.ex. 101"
                           className={'form-control bk-input' + invalid('roomNumber')}
                           value={room.roomNumber}
                           onChange={(e) => setRoom({ ...room, roomNumber: e.target.value })} />
                    <div className="invalid-feedback">{errors.roomNumber}</div>
                  </div>

                  <div className="mb-3">
                    <label className="bk-label">
                      <i className="bi bi-grid me-1"></i>Rumstyp <span className="text-danger">*</span>
                    </label>
                    <select className={'form-select bk-input' + invalid('type')}
                            value={room.type ?? ''}
                            onChange={(e) => setRoom({ ...room, type: e.target.value })}>
                      <option value="">– Välj typ –</option>
                      {types?.map((t) => <option key={t.name} value={t.name}>{t.displayName}</option>)}
                    </select>
                    <div className="invalid-feedback">{errors.type}</div>
                  </div>

                  {room.type !== 'SINGLE' && (
                    <div className="mb-3">
                      <label className="bk-label">
                        <i className="bi bi-plus-circle me-1"></i>Extrasängar
                        <span className="text-muted fw-normal"> (0–2)</span>
                      </label>
                      <select className="form-select bk-input" value={room.extraBeds}
                              onChange={(e) => setRoom({ ...room, extraBeds: Number(e.target.value) })}>
                        <option value={0}>0 – inga extrasängar</option>
                        <option value={1}>1 extrasäng (+1 gäst)</option>
                        <option value={2}>2 extrasängar (+2 gäster)</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="bk-label">
                      <i className="bi bi-currency-exchange me-1"></i>Pris per natt <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input type="number" min="1" step="1" placeholder="800"
                             className={'form-control bk-input' + invalid('pricePerNight')}
                             style={{ borderRadius: '4px 0 0 4px' }}
                             value={room.pricePerNight ?? ''}
                             onChange={(e) => setRoom({ ...room, pricePerNight: e.target.value })} />
                      <span className="input-group-text"
                            style={{ borderRadius: '0 4px 4px 0', background: '#f5f7fb', fontWeight: 700 }}>kr</span>
                      <div className="invalid-feedback">{errors.pricePerNight}</div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-bk px-4" type="submit">
                      <i className="bi bi-check-lg me-1"></i>Spara rum
                    </button>
                    <Link className="btn btn-outline-secondary" to="/rooms">
                      <i className="bi bi-x me-1"></i>Avbryt
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
