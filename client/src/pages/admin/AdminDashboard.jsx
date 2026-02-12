import AdminSidebar from '../../components/admin/AdminSidebar'
import '../../styles/admin.css'

const statCards = [
  // Mock metrics - replace with real API data
  { title: 'Total Users', value: '1,248', change: '+8% vs last month', accent: 'linear-gradient(90deg,#34d399,#10b981)' },
  { title: 'Total Stations', value: '312', change: '+15 new this week', accent: 'linear-gradient(90deg,#a3e635,#facc15)' },
  { title: 'Total Reviews', value: '4,580', change: '+120 this week', accent: 'linear-gradient(90deg,#fcd34d,#f97316)' },
]

const goals = ['Reduce grid load by 25%', 'Add 1,000 solar stations', 'Plant 10k new trees']

const insightStats = [
  { label: 'User Signups', value: 68 },
  { label: 'Stations Verified', value: 24 },
  { label: 'Reviews Submitted', value: 130 },
]

function AdminDashboard() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-card__title">Admin Panel</p>
            <h1>Dashboard</h1>
          </div>
          <div className="admin-header__actions">
            <div>
              <p className="admin-card__title" style={{ margin: 0 }}>
                Welcome back,
              </p>
              <p className="admin-card__value" style={{ fontSize: '1.2rem', marginTop: '0.4rem' }}>
                Sachithra Indrachapa
              </p>
            </div>
            <button className="admin-button admin-button--outline">Logout</button>
          </div>
        </header>

        <section className="admin-card-grid">
          {statCards.map((card) => (
            <article key={card.title} className="admin-card">
              <p className="admin-card__title">{card.title}</p>
              <p className="admin-card__value">{card.value}</p>
              <p className="admin-card__change">{card.change}</p>
              <div className="admin-card__accent" style={{ background: card.accent }}></div>
            </article>
          ))}
        </section>

        <section className="admin-panel-grid">
          <div className="admin-panel">
            <h2>Sustainability Goals</h2>
            <p className="admin-card__title" style={{ marginTop: '0.5rem' }}>
              Tracking the growth of solar-powered charging infrastructure nationwide.
            </p>
            <ul className="admin-goal-list">
              {goals.map((goal) => (
                <li key={goal} className="admin-goal">
                  {goal}
                  <span>In progress</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="admin-panel admin-panel--dark">
            <h2>Weekly Insights</h2>
            <p style={{ color: 'rgba(248,250,252,0.7)', marginTop: '0.5rem' }}>
              Community engagement for solar adoption
            </p>
            <div className="admin-card-list" style={{ marginTop: '1.5rem' }}>
              {insightStats.map((item) => (
                <div key={item.label} className="admin-progress">
                  <div className="admin-progress__meta">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill"
                      style={{ width: `${Math.min(item.value, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard
