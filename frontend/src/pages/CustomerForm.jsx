import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { Flash, PageBar } from '../Layout.jsx'

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', address: '' }

export default function CustomerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const pageTitle = id ? 'Redigera kund' : 'Ny kund'

  useEffect(() => {
    if (id) api.get('/customers/' + id).then(setCustomer, (e) => setError(e.message))
  }, [id])

  const field = (name) => ({
    value: customer[name] ?? '',
    onChange: (e) => setCustomer({ ...customer, [name]: e.target.value }),
    className: 'form-control bk-input' + (errors[name] ? ' is-invalid' : ''),
  })

  const submit = (e) => {
    e.preventDefault()
    const req = id ? api.put('/customers/' + id, customer) : api.post('/customers', customer)
    req.then(
      () => navigate('/customers', { state: { msg: id ? 'Kundens uppgifter uppdaterades.' : 'Kunden skapades.' } }),
      (err) => { setErrors(err.fields); setError(err.message) },
    )
  }

  return (
    <>
      <PageBar title={pageTitle} crumbs={[{ label: 'Kunder', to: '/customers' }, { label: pageTitle }]} />

      <main className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <Flash message={error} kind="danger" onClose={() => setError(null)} />
            <div className="bk-card">
              <div className="bk-card-header">
                <i className="bi bi-person me-2" style={{ color: 'var(--bk-blue)' }}></i>
                <span>{pageTitle}</span>
              </div>
              <div className="p-4">
                <form onSubmit={submit} noValidate>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="bk-label">Förnamn <span className="text-danger">*</span></label>
                      <input type="text" placeholder="Anna" {...field('firstName')} />
                      <div className="invalid-feedback">{errors.firstName}</div>
                    </div>
                    <div className="col-6">
                      <label className="bk-label">Efternamn <span className="text-danger">*</span></label>
                      <input type="text" placeholder="Svensson" {...field('lastName')} />
                      <div className="invalid-feedback">{errors.lastName}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="bk-label"><i className="bi bi-envelope me-1"></i>E-post</label>
                    <input type="email" placeholder="anna@exempel.se" {...field('email')} />
                  </div>

                  <div className="mb-3">
                    <label className="bk-label"><i className="bi bi-telephone me-1"></i>Telefon</label>
                    <input type="text" placeholder="070-123 45 67" {...field('phone')} />
                  </div>

                  <div className="mb-4">
                    <label className="bk-label"><i className="bi bi-geo-alt me-1"></i>Adress</label>
                    <input type="text" placeholder="Storgatan 1, Stockholm" {...field('address')} />
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-bk px-4" type="submit">
                      <i className="bi bi-check-lg me-1"></i>Spara kund
                    </button>
                    <Link className="btn btn-outline-secondary" to="/customers">
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
