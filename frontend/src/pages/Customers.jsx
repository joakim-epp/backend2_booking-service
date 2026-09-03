import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api, useApi } from '../api.js'
import { Empty, Flash, PageBar } from '../Layout.jsx'

export default function Customers() {
  const { data: customers, reload } = useApi('/customers')
  const [flash, setFlash] = useState(useLocation().state?.msg)
  const [error, setError] = useState(null)

  const remove = (c) => {
    if (!window.confirm('Ta bort kunden?')) return
    api.del('/customers/' + c.id).then(
      () => { setFlash('Kunden togs bort.'); reload() },
      (e) => setError(e.message),
    )
  }

  return (
    <>
      <PageBar icon="bi-people" title="Kunder" crumbs={[{ label: 'Kunder' }]}
               action={<Link className="btn-nav-solid" style={{ padding: '8px 18px' }} to="/customers/new">
                 <i className="bi bi-person-plus me-1"></i>Ny kund</Link>} />

      <main className="container py-4">
        <Flash message={flash} onClose={() => setFlash(null)} />
        <Flash message={error} kind="danger" onClose={() => setError(null)} />

        {customers?.length === 0 && (
          <Empty emoji="👤" title="Inga kunder registrerade ännu"
                 text="Lägg till din första kund för att kunna skapa bokningar."
                 to="/customers/new" cta="Lägg till kund" />
        )}

        {customers?.length > 0 && (
          <div className="bk-card">
            <div className="bk-card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-people me-2" style={{ color: 'var(--bk-blue)' }}></i>Alla kunder</span>
              <span className="text-muted" style={{ fontSize: 12, fontWeight: 400 }}>{customers.length} kunder</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="bk-table">
                <thead>
                <tr>
                  <th>Namn</th>
                  <th>E-post</th>
                  <th>Telefon</th>
                  <th>Adress</th>
                  <th className="text-center">Bokningar</th>
                  <th className="text-end">Åtgärder</th>
                </tr>
                </thead>
                <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: 'var(--bk-navy)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 800, flexShrink: 0,
                        }}>{c.fullName.charAt(0)}</div>
                        <span className="fw-bold">{c.fullName}</span>
                      </div>
                    </td>
                    <td>
                      {c.email
                        ? <a href={'mailto:' + c.email} style={{ color: 'var(--bk-blue)' }}>{c.email}</a>
                        : <span className="text-muted">–</span>}
                    </td>
                    <td>{c.phone || '–'}</td>
                    <td><span className="text-muted" style={{ fontSize: 12 }}>{c.address || '–'}</span></td>
                    <td className="text-center">
                      <span style={{
                        display: 'inline-block', minWidth: 28, padding: '2px 8px', borderRadius: 12,
                        fontSize: 12, fontWeight: 700,
                        background: c.bookingCount === 0 ? '#f0f0f0' : '#cce5ff',
                        color: c.bookingCount === 0 ? '#666' : '#003f8c',
                      }}>{c.bookingCount}</span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <Link className="btn btn-bk btn-sm" to={`/customers/${c.id}/edit`}>
                          <i className="bi bi-pencil me-1"></i>Redigera
                        </Link>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => remove(c)}
                                disabled={c.bookingCount > 0}
                                title={c.bookingCount > 0 ? 'Kunden har aktiva bokningar' : undefined}>
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
