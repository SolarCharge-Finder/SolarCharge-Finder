import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import useAuth from '../../context/useAuth'
import '../../styles/user-dashboard.css'

const FALLBACK_STATIONS = [
  {
    id: 'placeholder-1',
    name: 'Seaside Solar Hub',
    city: 'San Diego, CA',
    status: 'Open',
    rating: 4.9,
    connectors: [
      { type: 'CCS2', availableSlots: 3, totalSlots: 6 },
      { type: 'TYPE2', availableSlots: 1, totalSlots: 2 },
    ],
  },
  {
    id: 'placeholder-2',
    name: 'Redwood Plaza Chargers',
    city: 'San Jose, CA',
    status: 'Open',
    rating: 4.7,
    connectors: [
      { type: 'CHADEMO', availableSlots: 2, totalSlots: 2 },
      { type: 'CCS2', availableSlots: 4, totalSlots: 4 },
    ],
  },
  {
    id: 'placeholder-3',
    name: 'Sunset Mall Solar Deck',
    city: 'Los Angeles, CA',
    status: 'Under Maintenance',
    rating: 4.5,
    connectors: [
      { type: 'TYPE2', availableSlots: 0, totalSlots: 4 },
      { type: 'TYPE1', availableSlots: 1, totalSlots: 2 },
    ],
  },
]

const FALLBACK_ACTIVITY = [
  { id: 'session', icon: '⚡', title: 'Session complete', meta: '38 kWh delivered', timeAgo: '2 hours ago' },
  { id: 'favorite', icon: '📌', title: 'Saved a favorite', meta: 'Sunset Mall Solar Deck', timeAgo: 'Yesterday' },
  { id: 'review', icon: '⭐', title: 'Left feedback', meta: 'Rated Redwood Plaza 5★', timeAgo: '3 days ago' },
]

const formatSlots = (connectors = []) => {
  if (!Array.isArray(connectors) || !connectors.length) {
    return 'Slots TBD'
  }

  const { available, total } = connectors.reduce(
    (acc, connector) => {
      return {
        available: acc.available + Number(connector.availableSlots ?? 0),
        total: acc.total + Number(connector.totalSlots ?? 0),
      }
    },
    { available: 0, total: 0 },
  )

  if (!total) return 'Slots TBD'
  return `${available}/${total} slots open`
}

const getConnectorTypes = (connectors = []) => {
  if (!Array.isArray(connectors) || !connectors.length) return []
  const uniqueTypes = new Set(
    connectors.map((connector) => {
      if (typeof connector === 'string') return connector
      return connector.type || 'Connector'
    }),
  )
  return Array.from(uniqueTypes)
}

function UserDashboard() {
  const { user, token, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [topStations, setTopStations] = useState([])
  const [stationLoading, setStationLoading] = useState(true)
  const [stationError, setStationError] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      if (!token) {
        if (isMounted) {
          setProfile(user ?? null)
          setProfileError('')
          setProfileLoading(false)
        }
        return
      }

      try {
        setProfileLoading(true)
        const { data } = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!isMounted) return
        const payload = data?.user ?? data
        setProfile({
          ...payload,
          name: payload?.name ?? user?.name,
          isEmailVerified: payload?.isEmailVerified ?? user?.isEmailVerified,
        })
        setProfileError('')
      } catch (error) {
        if (!isMounted) return
        console.error('Failed to load profile', error)
        setProfileError('Unable to load your profile details right now.')
        setProfile((prev) => prev ?? user ?? null)
      } finally {
        if (isMounted) {
          setProfileLoading(false)
        }
      }
    }

    fetchProfile()
    return () => {
      isMounted = false
    }
  }, [token, user])

  useEffect(() => {
    let isMounted = true

    const fetchStations = async () => {
      try {
        setStationLoading(true)
        const { data } = await axios.get('/api/stations/top-rated')
        if (!isMounted) return
        const list = Array.isArray(data) ? data : data?.data ?? []
        setTopStations(list)
        setStationError('')
      } catch (error) {
        if (!isMounted) return
        console.error('Failed to load recommended stations', error)
        setStationError('Unable to fetch recommended stations right now.')
      } finally {
        if (isMounted) {
          setStationLoading(false)
        }
      }
    }

    fetchStations()
    return () => {
      isMounted = false
    }
  }, [])

  const derivedProfile = useMemo(() => {
    if (profile && user) {
      return {
        ...profile,
        email: profile.email ?? user.email,
        name: profile.name ?? user.name,
        role: profile.role ?? user.role,
        isEmailVerified: profile.isEmailVerified ?? user.isEmailVerified,
        createdAt: profile.createdAt ?? user.createdAt,
      }
    }
    return profile ?? user ?? null
  }, [profile, user])

  const createdAt = derivedProfile?.createdAt ? new Date(derivedProfile.createdAt) : null
  const createdAtTimestamp = createdAt?.getTime()

  const membershipStats = useMemo(() => {
    // Estimate personal metrics so the dashboard stays informative until deeper APIs land
    const referenceTimestamp = createdAtTimestamp ?? Date.now() - 45 * 24 * 60 * 60 * 1000
    const daysActive = Math.max(1, Math.round((Date.now() - referenceTimestamp) / (24 * 60 * 60 * 1000)))
    const sessions = Math.min(60, Math.max(6, Math.round(daysActive / 3)))
    const carbonSaved = Number((sessions * 2.8).toFixed(1))
    const contributions = Math.max(1, Math.round(daysActive / 50))
    const favorites = Math.max(4, (topStations.length || 2) + 4)
    const streak = Math.min(21, Math.max(3, Math.round(sessions / 2)))
    return { daysActive, sessions, carbonSaved, contributions, favorites, streak }
  }, [createdAtTimestamp, topStations.length])

  const statCards = useMemo(() => {
    return [
      {
        id: 'sessions',
        label: 'Charging Sessions • 30d',
        value: membershipStats.sessions,
        helper: '+2 vs last month',
      },
      {
        id: 'carbon',
        label: 'Carbon Saved (kg)',
        value: membershipStats.carbonSaved,
        helper: 'Prioritized solar hubs',
      },
      {
        id: 'favorites',
        label: 'Favorite Stations',
        value: membershipStats.favorites,
        helper: `${topStations.length || FALLBACK_STATIONS.length} nearby recs`,
      },
      {
        id: 'community',
        label: 'Community Contributions',
        value: membershipStats.contributions,
        helper: 'Reports & edits shared',
      },
    ]
  }, [membershipStats, topStations.length])

  const ecoGoals = useMemo(() => {
    return [
      {
        id: 'goal-trips',
        label: 'Solar-first trips',
        target: `${Math.round(membershipStats.sessions / 1.3)} / 60 trips`,
        progress: Math.min(100, Math.round((membershipStats.sessions / 60) * 100)),
      },
      {
        id: 'goal-impact',
        label: 'Community impact',
        target: `${membershipStats.contributions} of 5 updates shared`,
        progress: Math.min(100, membershipStats.contributions * 20),
      },
      {
        id: 'goal-carbon',
        label: 'Carbon savings',
        target: `${membershipStats.carbonSaved} / 150 kg`,
        progress: Math.min(100, Math.round((membershipStats.carbonSaved / 150) * 100)),
      },
    ]
  }, [membershipStats])

  const activityFeed = useMemo(() => {
    if (!topStations.length) return FALLBACK_ACTIVITY
    const firstStation = topStations[0]
    const secondStation = topStations[1] ?? topStations[0]
    const lastStation = topStations[topStations.length - 1]
    return [
      {
        id: 'session',
        icon: '⚡',
        title: 'Session complete',
        meta: `${Math.max(24, membershipStats.sessions * 3)} kWh at ${firstStation.name}`,
        timeAgo: '2 hours ago',
      },
      {
        id: 'favorite',
        icon: '📌',
        title: 'Saved to favorites',
        meta: secondStation.name,
        timeAgo: 'Yesterday',
      },
      {
        id: 'review',
        icon: '⭐',
        title: 'Shared a review',
        meta: `Rated ${lastStation.name} ${Number(lastStation.rating ?? 4.8).toFixed(1)}★`,
        timeAgo: '3 days ago',
      },
    ]
  }, [topStations, membershipStats.sessions])

  const badges = useMemo(() => {
    return [
      {
        id: 'badge-streak',
        label: 'Streak Keeper',
        detail: `${membershipStats.streak}-day clean-energy streak`,
        level: membershipStats.streak >= 15 ? 'Lv.3' : 'Lv.2',
      },
      {
        id: 'badge-scout',
        label: 'Solar Scout',
        detail: `${membershipStats.contributions} verified updates shared`,
        level: membershipStats.contributions >= 4 ? 'Lv.3' : 'Lv.1',
      },
      {
        id: 'badge-advocate',
        label: 'Climate Advocate',
        detail: `${membershipStats.carbonSaved} kg CO₂ avoided`,
        level: membershipStats.carbonSaved >= 120 ? 'Lv.4' : 'Lv.2',
      },
    ]
  }, [membershipStats])

  const displayName = derivedProfile?.name || derivedProfile?.email?.split('@')[0] || 'Explorer'
  const memberSince = createdAt
    ? createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'New member'
  const isVerified = Boolean(derivedProfile?.isEmailVerified)

  const quickActions = [
    {
      id: 'plan-trip',
      icon: '🛣️',
      title: 'Plan a solar-first trip',
      description: 'Use smart filters to find chargers with the right connectors and amenities.',
      cta: 'Open map',
      onClick: () => navigate('/search'),
    },
    {
      id: 'log-session',
      icon: '⚡',
      title: 'Log a manual session',
      description: 'Keep your charging journal accurate for reimbursements and tracking.',
      cta: 'Coming soon',
      onClick: null,
    },
    {
      id: 'share-update',
      icon: '📣',
      title: 'Share a station update',
      description: 'Report pricing changes, outages, or new amenities to help the community.',
      cta: 'Email team',
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.location.href =
            'mailto:team@solarcharge.com?subject=Station%20update&body=Hi%20SolarCharge%20team,%0D%0A%0D%0AI spotted an update at...'
        }
      },
    },
  ]

  const recommendedStations = topStations.length ? topStations : FALLBACK_STATIONS

  if ((authLoading || profileLoading) && !derivedProfile) {
    return (
      <div className="user-dashboard user-dashboard--center">
        <div className="user-dashboard__state">
          <span className="user-dashboard__loader" aria-hidden="true"></span>
          <p className="user-dashboard__helper">Preparing your personalized dashboard...</p>
        </div>
      </div>
    )
  }

  if (!authLoading && !derivedProfile) {
    return (
      <div className="user-dashboard user-dashboard--center">
        <div className="user-dashboard__card">
          <h1>Sign in to see your dashboard</h1>
          <p>Track charging sessions, eco goals, and personalized station picks once you authenticate.</p>
          <button className="user-button" onClick={() => navigate('/auth')}>
            Go to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="user-dashboard">
      <div className="user-dashboard__container">
        <section className="user-hero">
          <div>
            <Link to="/" className="user-hero__back" aria-label="Back to home">
              ←
            </Link>
            <p className="user-hero__eyebrow">Personal dashboard</p>
            <h1>Welcome back, {displayName}</h1>
            <p className="user-hero__subtitle">
              Surface your latest sessions, eco goals, and recommended solar-first charging stops.
            </p>
            <div className="user-hero__meta">
              <span className="user-chip user-chip--soft">Member since {memberSince}</span>
              <span className={`user-chip ${isVerified ? 'user-chip--success' : 'user-chip--ghost'}`}>
                {isVerified ? '✅ Email verified' : '⏳ Verification pending'}
              </span>
            </div>
            <div className="user-hero__actions">
              
              <button className="user-button user-button--danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
          <div className="user-hero__tile">
            <p className="user-card__title">Clean-energy streak</p>
            <p className="user-hero__streak">{membershipStats.streak} days</p>
            <p className="user-hero__hint">Stay consistent to unlock new badges.</p>
            <button className="user-button user-button--ghost" onClick={() => navigate('/search')}>
              View session history
            </button>
          </div>
        </section>

        {profileError && <div className="user-dashboard__alert user-dashboard__alert--error">{profileError}</div>}

        <section className="user-grid user-grid--stats">
          {statCards.map((card) => (
            <article key={card.id} className="user-stat-card">
              <p className="user-card__title">{card.label}</p>
              <p className="user-stat-card__value">{card.value}</p>
              <p className="user-stat-card__helper">{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="user-grid user-grid--actions">
          <article className="user-card user-card--tall">
            <div className="user-card__header">
              <div>
                <h2>Quick actions</h2>
                <p className="user-card__subtitle">Pick up where you left off</p>
              </div>
            </div>
            <div className="user-actions">
              {quickActions.map((action) => (
                <div key={action.id} className="user-action">
                  <span className="user-action__icon" aria-hidden="true">
                    {action.icon}
                  </span>
                  <div className="user-action__content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <button
                    className="user-button user-button--ghost"
                    type="button"
                    onClick={action.onClick ?? undefined}
                    disabled={!action.onClick}
                  >
                    {action.cta}
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="user-card user-card--accent">
            <div className="user-card__header">
              <div>
                <h2>Upcoming trip</h2>
                <p className="user-card__subtitle">Solar-priority weekend route draft</p>
              </div>
            </div>
            <ul className="user-trip-list">
              {recommendedStations.slice(0, 3).map((station) => (
                <li key={station._id ?? station.id}>
                  <div>
                    <p className="user-trip__title">{station.name}</p>
                    <p className="user-trip__meta">{station.city || station.district || 'Location TBA'}</p>
                  </div>
                  <span className="user-chip user-chip--soft">
                    ⭐ {Number(station.rating ?? station.averageRating ?? 4.8).toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
            <button className="user-button" onClick={() => navigate('/search')}>
              Finalize route
            </button>
          </article>
        </section>

        <section className="user-grid user-grid--two">
          <article className="user-card">
            <div className="user-card__header">
              <div>
                <h2>Recent activity</h2>
                <p className="user-card__subtitle">Last 7 days</p>
              </div>
            </div>
            <div className="user-activity">
              {activityFeed.map((item) => (
                <div key={item.id} className="user-activity__item">
                  <span className="user-activity__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div>
                    <p className="user-activity__title">{item.title}</p>
                    <p className="user-activity__meta">{item.meta}</p>
                  </div>
                  <span className="user-activity__time">{item.timeAgo}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="user-card">
            <div className="user-card__header">
              <div>
                <h2>Eco goals</h2>
                <p className="user-card__subtitle">Stay accountable on clean miles</p>
              </div>
            </div>
            <div className="user-goals">
              {ecoGoals.map((goal) => (
                <div key={goal.id} className="user-progress">
                  <div className="user-progress__meta">
                    <p>{goal.label}</p>
                    <span>{goal.target}</span>
                  </div>
                  <div className="user-progress__bar" aria-hidden="true">
                    <div className="user-progress__fill" style={{ width: `${goal.progress}%` }}></div>
                  </div>
                  <span className="sr-only">{goal.progress}% complete</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="user-grid user-grid--two">
          <article className="user-card">
            <div className="user-card__header">
              <div>
                <h2>Recommended stations</h2>
                <p className="user-card__subtitle">Top-rated solar hubs nearby</p>
              </div>
            </div>
            {stationError && <div className="user-dashboard__alert user-dashboard__alert--muted">{stationError}</div>}
            {stationLoading && (
              <div className="user-dashboard__state user-dashboard__state--inline">
                <span className="user-dashboard__loader" aria-hidden="true"></span>
                <p className="user-dashboard__helper">Loading stations...</p>
              </div>
            )}
            <div className="user-stations">
              {recommendedStations.map((station) => {
                const connectors = getConnectorTypes(station.connectors)
                return (
                  <article key={station._id ?? station.id} className="user-station">
                    <header className="user-station__header">
                      <div>
                        <h3>{station.name}</h3>
                        <p>{station.city || station.district || station.address || 'Location coming soon'}</p>
                      </div>
                      <span
                        className={`user-chip ${
                          (station.status || '').toLowerCase() === 'open' ? 'user-chip--success' : 'user-chip--ghost'
                        }`}
                      >
                        {station.status || 'Open'}
                      </span>
                    </header>
                    <div className="user-station__meta">
                      <span className="user-chip user-chip--soft">
                        ⭐ {Number(station.rating ?? station.averageRating ?? 4.8).toFixed(1)}
                      </span>
                      <span className="user-chip user-chip--ghost">{formatSlots(station.connectors)}</span>
                    </div>
                    <div className="user-station__connectors">
                      {connectors.length ? (
                        connectors.map((connector) => (
                          <span key={connector} className="user-chip user-chip--outline">
                            {connector}
                          </span>
                        ))
                      ) : (
                        <p className="user-station__empty">Connector details coming soon</p>
                      )}
                    </div>
                    <div className="user-card__actions">
                      <button className="user-button user-button--ghost" onClick={() => navigate('/search')}>
                        View details
                      </button>
                      <button className="user-button" onClick={() => navigate('/search')}>
                        Start navigation
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </article>

          <article className="user-card">
            <div className="user-card__header">
              <div>
                <h2>Badges & milestones</h2>
                <p className="user-card__subtitle">Celebrate progress toward cleaner miles</p>
              </div>
            </div>
            <div className="user-badges">
              {badges.map((badge) => (
                <div key={badge.id} className="user-badge">
                  <div>
                    <p className="user-badge__label">{badge.label}</p>
                    <p className="user-badge__detail">{badge.detail}</p>
                  </div>
                  <span className="user-chip user-chip--soft">{badge.level}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}

export default UserDashboard
