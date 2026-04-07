import { useState } from 'react';
import axios from 'axios';
import LocationPickerMap from '../map/LocationPickerMap';
import useAuth from '../../context/useAuth';
import './AddSellRequest.css';

export default function AddSellRequest() {
  const { user, token } = useAuth();
  const [energyAmount, setEnergyAmount] = useState('');
  const [comment, setComment] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!user) {
      alert('Please login to submit a sell request');
      return;
    }

    if (!location) {
      alert('Please select a location on the map');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        energyAmount: Number(energyAmount),
        location: {
          type: 'Point',
          coordinates: [location[1], location[0]],
        },
        comment,
      };

      await axios.post('/api/sell-request', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Sell request submitted successfully');

      setEnergyAmount('');
      setComment('');
      setLocation(null);
    } catch (error) {
      console.error(error);
      alert('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sell-request-container">
      <h2 className="sell-request-title">Sell Excess Solar Energy</h2>

      <form onSubmit={handleSubmit} className="sell-request-form">
        <div className="form-group">
          <label>Energy Amount (kWh)</label>
          <input
            type="number"
            value={energyAmount}
            onChange={e => setEnergyAmount(e.target.value)}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Comment (Optional)</label>
          <textarea rows="3" value={comment} onChange={e => setComment(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Select Location</label>
          <LocationPickerMap value={location} onChange={setLocation} />
        </div>

        <button type="submit" className="sell-request-cta-btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Sell Request'}
        </button>
      </form>
    </div>
  );
}
