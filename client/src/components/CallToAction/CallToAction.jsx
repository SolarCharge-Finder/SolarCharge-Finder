import { useState } from 'react'
import { FiGlobe } from 'react-icons/fi'

function CallToAction() {
  const [open, setOpen] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://solarcharge.com'
  const title = 'SolarCharge — find solar charging stations'

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: 'Check out SolarCharge — find nearby solar charging stations', url: shareUrl })
      } catch {
        // user cancelled or share failed silently
      }
      return
    }
    setOpen((s) => !s)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard')
      setOpen(false)
    } catch {
      alert('Could not copy link. You can manually copy: ' + shareUrl)
    }
  }

  const openSocial = (provider) => {
    const encodedText = encodeURIComponent(`${title} ${shareUrl}`)
    let url = ''
    if (provider === 'whatsapp') url = `https://api.whatsapp.com/send?text=${encodedText}`
    if (provider === 'facebook') url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    if (provider === 'twitter') url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
    if (provider === 'linkedin') url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    if (url) window.open(url, '_blank')
    setOpen(false)
  }

  return (
    <section className="cta-section" id="cta">
      <div className="cta-container">
        <div className="cta-card">
          <div className="cta-glow"></div>
          <div className="cta-content">
            <span className="cta-badge">
              <FiGlobe aria-hidden="true" />
              Join the Movement
            </span>
            <h2 className="cta-title">Know a Solar Charging Station?</h2>
            <p className="cta-desc">
              Help fellow users by sharing solar charging locations in your area.
              Every station added makes clean energy more accessible for everyone.
            </p>
            <div className="cta-buttons">
              <button className="cta-btn-secondary" type="button" onClick={handleShare} aria-haspopup="true" aria-expanded={open}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share a Solar Station
              </button>

              {open && (
                <div className="cta-share-popover" role="dialog" aria-label="Share options">
                  <button className="cta-share-item" onClick={handleCopy}>Copy link</button>
                  <button className="cta-share-item" onClick={() => openSocial('whatsapp')}>WhatsApp</button>
                  <button className="cta-share-item" onClick={() => openSocial('facebook')}>Facebook</button>
                  <button className="cta-share-item" onClick={() => openSocial('twitter')}>Twitter</button>
                  <button className="cta-share-item" onClick={() => openSocial('linkedin')}>LinkedIn</button>
                </div>
              )}
            </div>
            <div className="cta-trust">
              <div className="trust-avatars">
                <div className="avatar" style={{ background: '#22c55e' }}>G</div>
                <div className="avatar" style={{ background: '#3b82f6' }}>A</div>
                <div className="avatar" style={{ background: '#f59e0b' }}>M</div>
                <div className="avatar" style={{ background: '#8b5cf6' }}>S</div>
              </div>
              <span className="trust-text">Join <strong>2,500+</strong> contributors sharing clean energy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction;
