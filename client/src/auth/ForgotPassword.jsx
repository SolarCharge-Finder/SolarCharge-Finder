import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async e => {
    e.preventDefault();

    if (!email) {
      setMessage({
        type: 'error',
        text: 'Please enter your email address.',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5001/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Password reset code sent to your email. Please check your inbox.',
        });
        // Redirect to reset password page after 3 seconds
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to send reset code. Please try again.',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <main className="forgot-password-page__wrapper">
        {/* Message Display */}
        {message.text && (
          <div
            className={`auth-message ${message.type === 'success' ? 'success' : 'error'}`}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '15px 20px',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '500',
              zIndex: '1000',
              maxWidth: '400px',
              backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545',
            }}
          >
            {message.text}
          </div>
        )}

        <div className="container">
          <div className="form-container">
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <h1>Reset Password</h1>
              <span className="form-caption">or use your email to reset password</span>

              <label className="input-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
              </button>
            </form>

            <div className="forgot-back-row">
              <button onClick={() => navigate('/auth')} className="forgot-back-link">
                &larr; Back to Login
              </button>
            </div>
          </div>
        </div>

        <div className="forgot-back-row" style={{ display: 'none' }}>
          {/* Hidden to avoid duplicate */}
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;
