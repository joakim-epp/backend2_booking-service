import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api, kr, useApi } from '../api.js'
import { Empty, Flash, PageBar } from '../Layout.jsx'

export default function Rooms() {
  const { data: rooms, reload } = useApi('/rooms')
  const [flash, setFlash] = useState(useLocation().state?.msg)
  const [error, setError] = useState(null)

  const remove = (r) => {
    if (!window.confirm('Ta bort rummet?')) return
    api.del('/rooms/' + r.id).then(
      () => { setFlash('Rummet togs bort.'); reload() },
      (e) => setError(e.message),
    )
  }

  return (
    <>
      <PageBar icon="bi-door-open" title="Rum" crumbs={[{ label: 'Rum' }]}
               action={<Link className="btn-nav-solid" style={{ padding: '8px 18px' }} to="/rooms/new">
                 <i className="bi bi-plus-lg me-1"></i>Nytt rum</Link>} />

      <main className="container py-4">
        <Flash message={flash} onClose={() => setFlash(null)} />
        <Flash message={error} kind="danger" onClose={() => setError(null)} />

        {rooms?.length === 0 && (
          <Empty emoji="🚪" title="Inga rum registrerade"
                 text="Lägg till rum för att kunna ta emot bokningar."
                 to="/rooms/new" cta="Lägg till rum" />
        )}

        {rooms?.length > 0 && (
          <div className="bk-card">
            <div className="bk-card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-door-open me-2" style={{ color: 'var(--bk-blue)' }}></i>Alla rum</span>
              <span className="text-muted" style={{ fontSize: 12, fontWeight: 400 }}>{rooms.length} rum</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="bk-table">
                <thead>
                <tr>
                  <th>Rumsnr.</th>
                  <th>Typ</th>
                  <th>Beskrivning</th>
                  <th className="text-center">Extrasängar</th>
                  <th className="text-center">Kapacitet</th>
                  <th className="text-end">Pris / natt</th>
                  <th className="text-end">Åtgärder</th>
                </tr>
                </thead>
                <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td><span className="fw-bold" style={{ fontSize: 15 }}>{r.roomNumber}</span></td>
                    <td>
                      <span className={r.type === 'SINGLE' ? 'badge-type-single' : 'badge-type-double'}>
                        {r.typeDisplayName}
                      </span>
                    </td>
                    <td><span className="text-muted" style={{ fontSize: 12 }}>{r.typeDescription}</span></td>
                    <td className="text-center">
                      {r.type === 'SINGLE' ? <span className="text-muted">–</span> : (
                        <span>
                          <span className="fw-bold">{r.extraBeds}</span>
                          <span className="text-muted" style={{ fontSize: 11 }}> st</span>
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      <i className="bi bi-people" style={{ color: 'var(--bk-text-light)', fontSize: 12 }}></i>
                      <span className="fw-bold">{r.capacity}</span>
                      <span className="text-muted" style={{ fontSize: 11 }}> pers.</span>
                    </td>
                    <td className="text-end">
                      <span className="fw-bold" style={{ color: 'var(--bk-navy)', fontSize: 15 }}>{kr(r.pricePerNight)}</span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <Link className="btn btn-bk btn-sm" to={`/rooms/${r.id}/edit`}>
                          <i className="bi bi-pencil me-1"></i>Redigera
                        </Link>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => remove(r)}>
                          <i className="bi bi-trash me-1"></i>Ta bort
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
