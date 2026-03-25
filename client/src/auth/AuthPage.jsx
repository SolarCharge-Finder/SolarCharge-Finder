import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../context/useAuth';
import './AuthPage.css';

const socialProviders = [{ id: 'google', label: 'Continue with Google', text: 'G' }];

const validators = {
  name: value => (value.trim().length >= 2 ? '' : 'Please enter your full name.'),
  email: value => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address.'),
  password: value => (value.length >= 6 ? '' : 'Password must be at least 6 characters long.'),
};

function AuthPage() {
  const navigate = useNavigate();
  const { login, logout, loading: authLoading, user } = useAuth();
  const redirectGuardRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [formValues, setFormValues] = useState({
    signup: { name: '', email: '', password: '' },
    signin: { email: '', password: '' },
  });
  const [formErrors, setFormErrors] = useState({ signup: {}, signin: {} });
  const [loading, setLoading] = useState({ signup: false, signin: false });
  const [message, setMessage] = useState({ type: '', text: '' });

  const getRoleRedirectPath = (role = '') => {
    return role?.toLowerCase() === 'admin' ? '/admin' : '/';
  };

  useEffect(() => {
    if (authLoading || !user || redirectGuardRef.current) return;
    redirectGuardRef.current = true;
    navigate(getRoleRedirectPath(user.role), { replace: true });
  }, [authLoading, user, navigate]);

  // Show loading state while AuthContext is initializing
  if (authLoading) {
    return (
      <div className="auth-page">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            fontSize: '18px',
            color: '#666',
          }}
        >
          Loading authentication...
        </div>
      </div>
    );
  }

  const renderSocialButtons = () =>
    socialProviders.map(provider => (
      <button
        key={provider.id}
        type="button"
        className="social-btn"
        aria-label={provider.label}
        onClick={() => handleGoogleLogin()}
      >
        <span>{provider.text}</span>
      </button>
    ));

  const handleGoogleLogin = () => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    window.location.href = `${API_BASE.replace(/\/$/, '')}/auth/google`;
  };

  const handleToggle = active => () => {
    if (active && user) {
      logout();
      redirectGuardRef.current = false;
    }
    setIsActive(active);
  };

  const handleChange = (form, field) => event => {
    const { value } = event.target;
    setFormValues(prev => ({
      ...prev,
      [form]: {
        ...prev[form],
        [field]: value,
      },
    }));
  };

  const validateForm = form => {
    const entries = Object.entries(formValues[form]);
    const nextErrors = entries.reduce((acc, [field, value]) => {
      const validator = validators[field];
      if (!validator) return acc;
      const message = validator(value);
      if (message) acc[field] = message;
      return acc;
    }, {});

    setFormErrors(prev => ({
      ...prev,
      [form]: nextErrors,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = form => async event => {
    event.preventDefault();
    const isValid = validateForm(form);
    if (!isValid) return;

    setLoading(prev => ({ ...prev, [form]: true }));
    setMessage({ type: '', text: '' });

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

      if (form === 'signup') {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formValues.signup.name,
            email: formValues.signup.email,
            password: formValues.signup.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({
            type: 'success',
            text: 'Registration successful! Please check your email and click the verification link to activate your account.',
          });
          // Reset form
          setFormValues(prev => ({
            ...prev,
            signup: { name: '', email: '', password: '' },
          }));
          // Switch to login form after successful registration
          setTimeout(() => setIsActive(false), 3000);
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Registration failed. Please try again.',
          });
        }
      } else if (form === 'signin') {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formValues.signin.email,
            password: formValues.signin.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Use AuthContext login function
          login(data.data.token, data.data.user);

          setMessage({
            type: 'success',
            text: 'Login successful! Redirecting...',
          });

          const redirectPath = getRoleRedirectPath(data?.data?.user?.role);
          redirectGuardRef.current = true;
          setTimeout(() => {
            navigate(redirectPath);
          }, 1500);
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Login failed. Please check your credentials.',
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setLoading(prev => ({ ...prev, [form]: false }));
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-page__wrapper">
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

        <div className={`container ${isActive ? 'active' : ''}`}>
          <div className="form-container sign-up-container">
            <form className="auth-form" onSubmit={handleSubmit('signup')} noValidate>
              <h1>Admin Account</h1>
              <div className="social-container" aria-label="Continue with social accounts">
                {renderSocialButtons()}
              </div>
              <span className="form-caption">or use your email for admin registration</span>
              <label className="input-field">
                <span>Full Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Kumara Sangakkara"
                  value={formValues.signup.name}
                  onChange={handleChange('signup', 'name')}
                  required
                />
                <small className="error-message">{formErrors.signup.name}</small>
              </label>
              <label className="input-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formValues.signup.email}
                  onChange={handleChange('signup', 'email')}
                  required
                />
                <small className="error-message">{formErrors.signup.email}</small>
              </label>
              <label className="input-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formValues.signup.password}
                  onChange={handleChange('signup', 'password')}
                  minLength={6}
                  required
                />
                <small className="error-message">{formErrors.signup.password}</small>
              </label>
              <button type="submit" className="primary-btn" disabled={loading.signup}>
                {loading.signup ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>
          </div>

          <div className="form-container sign-in-container">
            <form className="auth-form" onSubmit={handleSubmit('signin')} noValidate>
              <h1>Welcome Back</h1>
              <div className="social-container" aria-label="Continue with social accounts">
                {renderSocialButtons()}
              </div>
              <span className="form-caption">or use your credentials</span>
              <label className="input-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formValues.signin.email}
                  onChange={handleChange('signin', 'email')}
                  required
                />
                <small className="error-message">{formErrors.signin.email}</small>
              </label>
              <label className="input-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formValues.signin.password}
                  onChange={handleChange('signin', 'password')}
                  minLength={6}
                  required
                />
                <small className="error-message">{formErrors.signin.password}</small>
              </label>
              <button type="submit" className="primary-btn" disabled={loading.signin}>
                {loading.signin ? 'Logging In...' : 'Login'}
              </button>

              <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </form>
          </div>

          <div className="overlay-container" aria-hidden="true">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h2>Welcome Admin!</h2>
                <p>Access your admin dashboard to manage the solar charging station system</p>
                <button type="button" className="ghost-btn" onClick={handleToggle(false)}>
                  Login
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h2>Admin Registration</h2>
                <p>Create your admin account to manage the solar charging station platform</p>
                <button type="button" className="ghost-btn" onClick={handleToggle(true)}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-back-row">
          <Link to="/" className="auth-back-link">
            &larr; Back to Home Page
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AuthPage;
