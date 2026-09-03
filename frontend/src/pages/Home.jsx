import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../api.js'

export default function Home() {
  const { data: stats } = useApi('/stats')
  const [form, setForm] = useState({ checkIn: '', checkOut: '', numberOfGuests: 1 })
  const navigate = useNavigate()

  const search = (e) => {
    e.preventDefault()
    navigate('/bookings/search?' + new URLSearchParams(form))
  }

  const cards = [
    { count: stats?.customerCount, label: 'Kunder', to: '/customers', cta: 'Hantera kunder' },
    { count: stats?.roomCount, label: 'Rum', to: '/rooms', cta: 'Hantera rum' },
    { count: stats?.bookingCount, label: 'Bokningar', to: '/bookings', cta: 'Visa bokningar' },
  ]

  return (
    <>
      <section className="bk-hero">
        <div className="container">
          <h1>Hitta rätt rum</h1>
          <p>Sök och boka rum enkelt.</p>
          <form onSubmit={search}>
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
          </form>
        </div>
      </section>

      <main className="container py-4">
        <div className="row g-3 mb-4">
          {cards.map((c) => (
            <div className="col-md-4" key={c.label}>
              <div className="stat-card">
                <div className="stat-num">{c.count ?? 0}</div>
                <div className="stat-label">{c.label}</div>
                <Link className="btn btn-bk w-100" to={c.to}>{c.cta}</Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bk-card p-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h3 className="fw-bold mb-1">Enkel översikt</h3>
            <p className="text-muted mb-0">Hantera bokningar, kunder och rum på ett ställe.</p>
          </div>
          <Link className="btn btn-bk" to="/bookings/new">Ny bokning</Link>
        </div>

        <div className="mb-5">
          <h3 className="fw-bold mb-1">Rumstyper</h3>
          <p className="text-muted mb-4">Välj ett rum som passar dina gäster.</p>
          <div className="row g-3">
            {['Enkelrum', 'Dubbelrum', 'Extrasäng', 'Familjerum'].map((t) => (
              <div className="col-6 col-md-3" key={t}>
                <Link className="bk-card d-block p-4 text-center" to="/bookings/search">{t}</Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="fw-bold mb-1">Snabbval</h3>
          <p className="text-muted mb-4">Vanliga funktioner.</p>
          <div className="row g-3">
            {[
              { label: 'Ny bokning', to: '/bookings/new' },
              { label: 'Ny kund', to: '/customers/new' },
              { label: 'Nytt rum', to: '/rooms/new' },
              { label: 'Sök rum', to: '/bookings/search' },
            ].map((q) => (
              <div className="col-6 col-lg-3" key={q.label}>
                <Link className="bk-card d-flex align-items-center justify-content-center p-4 text-center"
                      style={{ minHeight: 100 }} to={q.to}>{q.label}</Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
