import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api, kr, useApi } from '../api.js'
import { Empty, Flash, PageBar } from '../Layout.jsx'

export default function Bookings() {
  const { data: bookings, reload } = useApi('/bookings')
  const [flash, setFlash] = useState(useLocation().state?.msg)
  const [error, setError] = useState(null)

  const remove = (b) => {
    if (!window.confirm('Avboka denna bokning?')) return
    api.del('/bookings/' + b.id).then(
      () => { setFlash('Bokningen avbokades.'); reload() },
      (e) => setError(e.message),
    )
  }

  return (
    <>
      <PageBar icon="bi-calendar-check" title="Bokningar" crumbs={[{ label: 'Bokningar' }]}
               action={<Link className="btn-nav-solid" style={{ padding: '8px 18px' }} to="/bookings/new">
                 <i className="bi bi-plus-lg me-1"></i>Ny bokning</Link>} />

      <main className="container py-4">
        <Flash message={flash} onClose={() => setFlash(null)} />
        <Flash message={error} kind="danger" onClose={() => setError(null)} />

        {bookings?.length === 0 && (
          <Empty emoji="📋" title="Inga bokningar registrerade"
                 text="Kom igång genom att söka efter lediga rum och skapa din första bokning."
                 to="/bookings/search" cta="Sök lediga rum" />
        )}

        {bookings?.length > 0 && (
          <>
            <div className="row g-3 mb-3">
              <div className="col-sm-6 col-lg-3">
                <div style={{
                  background: '#fff', border: '1px solid var(--bk-border)', borderRadius: 8,
                  padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                }}>
                  <i className="bi bi-calendar2-check-fill" style={{ fontSize: '1.5rem', color: 'var(--bk-blue)' }}></i>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--bk-navy)' }}>{bookings.length}</div>
                    <div style={{ fontSize: 12, color: 'var(--bk-text-light)' }}>Totalt bokningar</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bk-card">
              <div className="bk-card-header d-flex justify-content-between align-items-center">
                <span><i className="bi bi-table me-2"></i>Alla bokningar</span>
                <span className="text-muted" style={{ fontSize: 12, fontWeight: 400 }}>{bookings.length} poster</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="bk-table">
                  <thead>
                  <tr>
                    <th>#</th>
                    <th>Kund</th>
                    <th>Rum</th>
                    <th>Incheckning</th>
                    <th>Utcheckning</th>
                    <th className="text-center">Nätter</th>
                    <th className="text-center">Gäster</th>
                    <th className="text-end">Totalpris</th>
                    <th className="text-end">Åtgärder</th>
                  </tr>
                  </thead>
                  <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td><span style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>#{b.id}</span></td>
                      <td><div className="fw-bold">{b.customerFullName}</div></td>
                      <td>
                        <span className="fw-semibold">Rum {b.roomNumber}</span>
                        {b.roomTypeDisplayName && <span className="badge-type-single ms-1">{b.roomTypeDisplayName}</span>}
                      </td>
                      <td>{b.checkIn}</td>
                      <td>{b.checkOut}</td>
                      <td className="text-center">
                        <span className="fw-bold">{b.nights}</span>
                        <span style={{ fontSize: 11, color: '#999' }}> nätter</span>
                      </td>
                      <td className="text-center">
                        <i className="bi bi-person-fill" style={{ color: 'var(--bk-text-light)', fontSize: 12 }}></i>
                        <span>{b.numberOfGuests}</span>
                      </td>
                      <td className="text-end">
                        <span className="fw-bold" style={{ color: 'var(--bk-navy)', fontSize: 15 }}>{kr(b.totalPrice)}</span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <Link className="btn btn-bk btn-sm" to={`/bookings/${b.id}/edit`}>
                            <i className="bi bi-pencil me-1"></i>Ändra
                          </Link>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => remove(b)}>
                            <i className="bi bi-x-lg me-1"></i>Avboka
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}
