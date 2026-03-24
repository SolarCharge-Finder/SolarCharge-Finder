import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!email) {
      setMessage({
        type: 'error',
        text: 'No email provided. Please start the password reset process again.',
      });
      setTimeout(() => navigate('/forgot-password'), 3000);
    }
  }, [email, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!resetCode || resetCode.length !== 6) {
      setMessage({
        type: 'error',
        text: 'Please enter the 6-digit reset code.',
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.',
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE.replace(/\/$/, '')}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Password reset successfully! Redirecting to login...',
        });
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/auth'), 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to reset password. Please try again.',
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <main className="reset-password-page__wrapper">
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
              <h1>Enter Reset Code</h1>
              <span className="form-caption">check your email for the 6-digit code</span>

              <label className="input-field">
                <span>Reset Code</span>
                <input
                  type="text"
                  name="resetCode"
                  placeholder="123456"
                  value={resetCode}
                  onChange={e => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  required
                  style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }}
                />
              </label>

              <label className="input-field">
                <span>New Password</span>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  minLength="6"
                  required
                />
              </label>

              <label className="input-field">
                <span>Confirm Password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  minLength="6"
                  required
                />
              </label>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <div className="reset-back-row">
              <button onClick={() => navigate('/auth')} className="reset-back-link">
                &larr; Back to Login
              </button>
            </div>
          </div>
        </div>

        <div className="reset-back-row" style={{ display: 'none' }}>
          {/* Hidden to avoid duplicate */}
        </div>
      </main>
    </div>
  );
}

export default ResetPassword;
