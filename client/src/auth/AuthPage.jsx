import { useState } from 'react'
import './AuthPage.css'

const socialProviders = [
  { id: 'facebook', label: 'Continue with Facebook', text: 'f' },
  { id: 'google', label: 'Continue with Google', text: 'G' },
  { id: 'linkedin', label: 'Continue with LinkedIn', text: 'in' },
]

const validators = {
  name: (value) => (value.trim().length >= 2 ? '' : 'Please enter your full name.'),
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address.',
  password: (value) =>
    value.length >= 8 ? '' : 'Password must be at least 8 characters long.',
}

function AuthPage() {
  const [isActive, setIsActive] = useState(false)
  const [formValues, setFormValues] = useState({
    signup: { name: '', email: '', password: '' },
    signin: { email: '', password: '' },
  })
  const [formErrors, setFormErrors] = useState({ signup: {}, signin: {} })

  const renderSocialButtons = () =>
    socialProviders.map((provider) => (
      <button key={provider.id} type="button" className="social-btn" aria-label={provider.label}>
        <span>{provider.text}</span>
      </button>
    ))

  const handleToggle = (active) => () => setIsActive(active)

  const handleChange = (form, field) => (event) => {
    const { value } = event.target
    setFormValues((prev) => ({
      ...prev,
      [form]: {
        ...prev[form],
        [field]: value,
      },
    }))
  }

  const validateForm = (form) => {
    const entries = Object.entries(formValues[form])
    const nextErrors = entries.reduce((acc, [field, value]) => {
      const validator = validators[field]
      if (!validator) return acc
      const message = validator(value)
      if (message) acc[field] = message
      return acc
    }, {})

    setFormErrors((prev) => ({
      ...prev,
      [form]: nextErrors,
    }))

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (form) => (event) => {
    event.preventDefault()
    const isValid = validateForm(form)
    if (!isValid) return

    console.log(`${form} form submitted`, formValues[form])
  }

  return (
    <div className="auth-page">
      <main className="auth-page__wrapper">
        <div className={`container ${isActive ? 'active' : ''}`}>
          <div className="form-container sign-up-container">
            <form className="auth-form" onSubmit={handleSubmit('signup')} noValidate>
              <h1>Create Account</h1>
              <div className="social-container" aria-label="Continue with social accounts">
                {renderSocialButtons()}
              </div>
              <span className="form-caption">or use your email for registration</span>
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
                  minLength={8}
                  required
                />
                <small className="error-message">{formErrors.signup.password}</small>
              </label>
              <button type="submit" className="primary-btn">
                Sign Up
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
                  minLength={8}
                  required
                />
                <small className="error-message">{formErrors.signin.password}</small>
              </label>
              <button type="submit" className="primary-btn">
                Login
              </button>
            </form>
          </div>

          <div className="overlay-container" aria-hidden="true">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h2>Welcome Back!</h2>
                <p>To keep connected with us please login with your personal info</p>
                <button type="button" className="ghost-btn" onClick={handleToggle(false)}>
                  Login
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h2>Hello, Explorer!</h2>
                <p>Start discovering nearby solar-powered charging stations in minutes.</p>
                <button type="button" className="ghost-btn" onClick={handleToggle(true)}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AuthPage
