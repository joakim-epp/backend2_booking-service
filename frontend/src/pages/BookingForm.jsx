import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, fullName, kr, useApi } from '../api.js'
import { Flash, PageBar } from '../Layout.jsx'

export default function BookingForm() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { data: customers } = useApi('/customers')
  const { data: rooms } = useApi('/rooms')
  const [error, setError] = useState(null)
  const [booking, setBooking] = useState({
    customerId: '',
    roomId: params.get('roomId') ?? '',
    checkIn: params.get('checkIn') ?? '',
    checkOut: params.get('checkOut') ?? '',
    numberOfGuests: Number(params.get('numberOfGuests') ?? 1),
  })
  const pageTitle = id ? 'Redigera bokning' : 'Ny bokning'

  useEffect(() => {
    if (id) api.get('/bookings/' + id).then(setBooking, (e) => setError(e.message))
  }, [id])

  const set = (name) => (e) => setBooking({ ...booking, [name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const body = {
      customerId: Number(booking.customerId),
      roomId: Number(booking.roomId),
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      numberOfGuests: Number(booking.numberOfGuests),
    }
    const req = id ? api.put('/bookings/' + id, body) : api.post('/bookings', body)
    req.then(
      () => navigate('/bookings', { state: { msg: id ? 'Bokningen uppdaterades.' : 'Bokningen skapades.' } }),
      (err) => setError(err.message),
    )
  }

  return (
    <>
      <PageBar title={pageTitle} crumbs={[{ label: 'Bokningar', to: '/bookings' }, { label: pageTitle }]} />

      <main className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <Flash message={error} kind="danger" onClose={() => setError(null)} />
            <div className="bk-card">
              <div className="bk-card-header">
                <i className="bi bi-calendar-check me-2" style={{ color: 'var(--bk-blue)' }}></i>
                <span>{pageTitle}</span>
              </div>
              <div className="p-4">
                <form onSubmit={submit}>
                  <div className="mb-3">
                    <label className="bk-label">
                      <i className="bi bi-person me-1"></i>Kund <span className="text-danger">*</span>
                    </label>
                    <select className="form-select bk-input" required
                            value={booking.customerId ?? ''} onChange={set('customerId')}>
                      <option value="">– Välj kund –</option>
                      {customers?.map((c) => (
                        <option key={c.id} value={c.id}>{fullName(c)}{c.phone ? ' · ' + c.phone : ''}</option>
                      ))}
                    </select>
                    <div className="mt-1" style={{ fontSize: 12, color: 'var(--bk-text-light)' }}>
                      Ingen kund? <Link to="/customers/new" style={{ color: 'var(--bk-blue)', fontWeight: 700 }}>Lägg till kund</Link>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="bk-label">
                      <i className="bi bi-door-open me-1"></i>Rum <span className="text-danger">*</span>
                    </label>
                    <select className="form-select bk-input" required
                            value={booking.roomId ?? ''} onChange={set('roomId')}>
                      <option value="">– Välj rum –</option>
                      {rooms?.map((r) => (
                        <option key={r.id} value={r.id}>
                          Rum {r.roomNumber} – {r.typeDescription} – {kr(r.pricePerNight)}/natt
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="bk-label">
                        <i className="bi bi-calendar-arrow-down me-1"></i>Incheckning <span className="text-danger">*</span>
                      </label>
                      <input className="form-control bk-input" type="date" required
                             value={booking.checkIn ?? ''} onChange={set('checkIn')} />
                    </div>
                    <div className="col-6">
                      <label className="bk-label">
                        <i className="bi bi-calendar-arrow-up me-1"></i>Utcheckning <span className="text-danger">*</span>
                      </label>
                      <input className="form-control bk-input" type="date" required
                             value={booking.checkOut ?? ''} onChange={set('checkOut')} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="bk-label">
                      <i className="bi bi-people me-1"></i>Antal gäster <span className="text-danger">*</span>
                    </label>
                    <select className="form-select bk-input" required
                            value={booking.numberOfGuests} onChange={set('numberOfGuests')}>
                      {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'gäst' : 'gäster'}</option>)}
                    </select>
                  </div>

                  <div style={{
                    background: '#f0f7ff', border: '1px solid #c0d8ff', borderRadius: 6,
                    padding: '12px 14px', marginBottom: 20, fontSize: 13,
                  }}>
                    <i className="bi bi-info-circle-fill me-2" style={{ color: 'var(--bk-blue)' }}></i>
                    Priset beräknas automatiskt baserat på rum och antal nätter vid sparande.
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-bk px-4" type="submit">
                      <i className="bi bi-check-lg me-1"></i>Spara bokning
                    </button>
                    <Link className="btn btn-outline-secondary" to="/bookings">
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
