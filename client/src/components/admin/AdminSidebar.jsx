import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Manage Users' },
  { to: '/admin/stations', label: 'Manage Stations' },
  { to: '/admin/reviews', label: 'Manage Reviews' },
]

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__logo">☀️</span>
        <div>
          <p className="admin-sidebar__brand-title">SolarCharge</p>
          <p className="admin-sidebar__subtitle">Admin Panel</p>
        </div>
      </div>
      <nav className="admin-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `admin-sidebar__link ${isActive ? 'is-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar
