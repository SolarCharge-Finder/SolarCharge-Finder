import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EmailVerification.css';

function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const isVerifying = useRef(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent multiple requests
    if (isVerifying.current) {
      console.log('Verification already in progress, preventing duplicate request');
      return;
    }

    const verifyEmail = async () => {
      isVerifying.current = true;
      hasVerified.current = false;

      try {
        console.log('Attempting to verify token:', token);

        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const response = await fetch(`${API_BASE.replace(/\/$/, '')}/users/verify-email/${token}`);
        const data = await response.json();

        console.log('Verification response:', data);

        if (response.ok) {
          hasVerified.current = true;
          setStatus('success');
          setMessage(data.message);

          // Clear any existing redirect timeout
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
          console.error('Verification failed:', data);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
        console.error('Network error:', error);
      } finally {
        isVerifying.current = false;
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
      console.error('No token provided');
    }
  }, [token, navigate]);

  return (
    <div className="email-verification">
      <div className="verification-container">
        <div className="verification-card">
          <div className="verification-icon">
            {status === 'loading' && <div className="spinner"></div>}
            {status === 'success' && <div className="success-icon">✓</div>}
            {status === 'error' && <div className="error-icon">✕</div>}
          </div>

          <h2 className="verification-title">
            {status === 'loading' && 'Verifying Your Email...'}
            {status === 'success' && 'Email Verified Successfully!'}
            {status === 'error' && 'Verification Failed'}
          </h2>

          <p className="verification-message">{message}</p>

          {status === 'success' && (
            <p className="redirect-message">
              You will be redirected to the login page in a few seconds...
            </p>
          )}

          {status === 'error' && (
            <div className="error-actions">
              <button className="btn btn-primary" onClick={() => navigate('/auth')}>
                Go to Login
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  // Clear any stored verification state
                  localStorage.removeItem('verificationAttempt');
                  navigate('/auth');
                }}
              >
                Request New Verification Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;
