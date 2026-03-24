import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AddSellRequest from '../SellRequest/AddSellRequest';

function SellEnergySection() {
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const closeModal = () => setSellModalOpen(false);

  useEffect(() => {
    if (!sellModalOpen) {
      return undefined;
    }

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setSellModalOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sellModalOpen]);

  return (
    <section className="cta-section sell-energy-standalone" id="sell-energy">
      <div className="cta-container">
        <div className="sell-request-cta-card">
          <h2 className="cta-title">Sell Your Excess Solar Energy</h2>
          <p className="cta-desc">
            Have extra energy from your home solar panels? Submit it here so nearby charging
            stations can use it.
          </p>

          <button
            className="cta-btn-secondary"
            type="button"
            onClick={() => setSellModalOpen(prev => !prev)}
          >
            {sellModalOpen ? 'Hide Form' : 'Sell Excess Solar Energy'}
          </button>

          {sellModalOpen &&
            createPortal(
              <div
                className="sell-request-modal-overlay"
                role="dialog"
                aria-modal="true"
                aria-label="Sell Excess Solar Energy form"
                onClick={closeModal}
              >
                <div
                  className="sell-request-modal-content"
                  onClick={event => event.stopPropagation()}
                >
                  <button
                    className="sell-request-modal-close"
                    type="button"
                    onClick={closeModal}
                    aria-label="Close sell request form"
                  >
                    ✕
                  </button>
                  <AddSellRequest />
                </div>
              </div>,
              document.body
            )}
        </div>
      </div>
    </section>
  );
}

export default SellEnergySection;
