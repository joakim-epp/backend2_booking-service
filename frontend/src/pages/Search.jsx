import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, kr } from '../api.js'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const [form, setForm] = useState({
    checkIn: params.get('checkIn') ?? '',
    checkOut: params.get('checkOut') ?? '',
    numberOfGuests: Number(params.get('numberOfGuests') ?? 1),
  })
  const [rooms, setRooms] = useState(null)
  const [error, setError] = useState(null)

  const checkIn = params.get('checkIn')
  const checkOut = params.get('checkOut')
  const guests = params.get('numberOfGuests') ?? 1

  useEffect(() => {
    if (!checkIn || !checkOut) return
    setError(null)
    api.get(`/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}&numberOfGuests=${guests}`)
      .then(setRooms, (e) => { setRooms(null); setError(e.message) })
  }, [checkIn, checkOut, guests])

  const submit = (e) => {
    e.preventDefault()
    if (!form.checkIn || !form.checkOut) {
      setError('Incheckning och utcheckning är obligatoriska')
      return
    }
    setParams(form)
  }

  return (
    <>
      <section className="bk-hero">
        <div className="container">
          <h1>Sök rum</h1>
          <p>Hitta lediga rum snabbt och enkelt</p>
          <form onSubmit={submit}>
            <div className="bk-search-strip">
              <div>
                <label>Incheckning</label>
                <input className="form-control" type="date" value={form.checkIn}
                       onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
              </div>
              <div>
                <label>Utcheckning</label>
                <input className="form-control" type="date" value={form.checkOut}
                       onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
              </div>
              <div>
                <label>Gäster</label>
                <select className="form-select" value={form.numberOfGuests}
                        onChange={(e) => setForm({ ...form, numberOfGuests: e.target.value })}>
                  {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'gäst' : 'gäster'}</option>)}
                </select>
              </div>
              <button className="btn-bk-search" type="submit">Sök</button>
            </div>
            {error && <div className="mt-2 text-warning small">{error}</div>}
          </form>
        </div>
      </section>

      <main className="container py-4">
        {!rooms && !error && (
          <div className="bk-card p-5 text-center">
            <h5 className="fw-bold mb-2">Sök lediga rum</h5>
            <p className="text-muted mb-0">Välj datum och antal gäster ovan.</p>
          </div>
        )}

        {rooms?.length === 0 && (
          <div className="bk-card p-5 text-center">
            <h5 className="fw-bold mb-2">Inga rum hittades</h5>
            <p className="text-muted mb-0">Testa andra datum eller färre gäster.</p>
          </div>
        )}

        {rooms?.length > 0 && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div><span className="fw-bold">{rooms.length}</span> lediga rum</div>
              <div className="text-muted small">Pris per natt</div>
            </div>

            <div className="d-flex flex-column gap-3">
              {rooms.map((r) => (
                <div className="room-result-card" key={r.id}>
                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <h5 className="fw-bold mb-2">Rum {r.roomNumber}</h5>
                    <div className="mb-2"><span className="badge bg-primary">{r.typeDisplayName}</span></div>
                    <p className="text-muted mb-3">{r.typeDescription}</p>
                    <div className="small text-muted d-flex flex-column gap-1">
                      <span>Max <strong>{r.capacity}</strong> personer</span>
                      {r.extraBeds > 0 && <span>{r.extraBeds} extrasäng(ar)</span>}
                      <span>Tillgängligt</span>
                    </div>
                  </div>
                  <div className="room-result-price">
                    <div className="text-end">
                      <div className="small text-muted">från</div>
                      <div className="fw-bold fs-4">{kr(r.pricePerNight)}</div>
                      <div className="small text-muted">per natt</div>
                    </div>
                    <Link className="btn btn-bk-yellow w-100"
                          to={`/bookings/new?roomId=${r.id}&checkIn=${checkIn}&checkOut=${checkOut}&numberOfGuests=${guests}`}>
                      Boka
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  )
}
