import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from './api.js'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const loggedIn = Boolean(getToken())

  // Everything but the login page needs a token: the customer pages are relayed to the customer
  // service, which rejects every unauthenticated call.
  if (!loggedIn && location.pathname !== '/login') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  const logout = () => {
    clearToken()
    navigate('/login')
  }

  return (
    <>
      <nav className="bk-nav">
        <div className="container">
          <Link className="brand" to="/">Pensionat<span>.</span></Link>
          <div className="bk-nav-links">
            <NavLink to="/customers">Kunder</NavLink>
            <NavLink to="/rooms">Rum</NavLink>
            <NavLink to="/bookings">Bokningar</NavLink>
            <NavLink className="btn-nav-search" to="/bookings/search">Sök rum</NavLink>
            {loggedIn
              ? <button className="btn btn-link text-white" onClick={logout}>Logga ut</button>
              : <NavLink to="/login">Logga in</NavLink>}
          </div>
        </div>
      </nav>

      <Outlet />

      <footer className="bk-footer">
        <div className="container">
          <div className="bk-footer-cols">
            <div className="bk-footer-col">
              <div className="bk-footer-brand">Pensionat<span>.</span></div>
              <p className="bk-footer-tagline">Enkel bokningshantering för pensionat och mindre hotell.</p>
            </div>
            <div className="bk-footer-col">
              <h4>Navigation</h4>
              <Link to="/">Hem</Link>
              <Link to="/bookings/search">Sök rum</Link>
              <Link to="/bookings/new">Ny bokning</Link>
              <Link to="/bookings">Bokningar</Link>
            </div>
            <div className="bk-footer-col">
              <h4>Hantera</h4>
              <Link to="/customers">Kunder</Link>
              <Link to="/customers/new">Ny kund</Link>
              <Link to="/rooms">Rum</Link>
              <Link to="/rooms/new">Nytt rum</Link>
            </div>
            <div className="bk-footer-col">
              <h4>Info</h4>
              <div className="bk-footer-info-item">Säker hantering</div>
              <div className="bk-footer-info-item">Öppet dygnet runt</div>
              <div className="bk-footer-info-item">Mobilanpassad</div>
              <div className="bk-footer-info-item">Lokal lagring</div>
            </div>
          </div>
          <div className="bk-footer-divider"></div>
          <div className="bk-footer-bottom">
            <span>© 2025 Pensionat</span>
            <div className="bk-footer-bottom-links">
              <Link to="/">Hem</Link>
              <Link to="/bookings/search">Sök rum</Link>
              <Link to="/customers">Kunder</Link>
              <Link to="/rooms">Rum</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export function PageBar({ icon, title, crumbs = [], action }) {
  return (
    <div className="bk-page-bar">
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <h2>{icon && <i className={`bi ${icon} me-2`}></i>}{title}</h2>
          <div className="bk-breadcrumb">
            <Link to="/">Hem</Link>
            {crumbs.map((c) => (
              <span key={c.label}>
                <span className="sep">/</span>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
              </span>
            ))}
          </div>
        </div>
        {action}
      </div>
    </div>
  )
}

export function Flash({ message, kind = 'success', onClose }) {
  if (!message) return null
  return (
    <div className={`bk-alert-${kind === 'success' ? 'success' : 'danger'} d-flex justify-content-between align-items-center mb-3`}>
      <span>{message}</span>
      {onClose && <button className="btn-close btn-sm ms-3" onClick={onClose}></button>}
    </div>
  )
}

export function Empty({ emoji, title, text, to, cta }) {
  return (
    <div className="bk-card p-5 text-center">
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>{emoji}</div>
      <h5 className="fw-bold mb-2">{title}</h5>
      <p className="text-muted mb-3">{text}</p>
      <Link className="btn btn-bk" to={to}>{cta}</Link>
    </div>
  )
}
