import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

function OAuthCallback() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (token) {
      // Get user data from URL if available
      const userData = searchParams.get('user')
      const parsedUser = userData ? JSON.parse(decodeURIComponent(userData)) : null
      
      console.log('OAuthCallback: Logging in with token', token)
      console.log('OAuthCallback: User data', parsedUser)
      
      login(token, parsedUser)
      navigate('/admin')
    } else if (error) {
      console.error('OAuthCallback: Authentication error', error)
      navigate('/auth')
    } else {
      navigate('/auth')
    }
  }, [searchParams, login, navigate])

  return (
    <div className="auth-page">
      <div className="container">
        <div className="form-container">
          <div className="auth-form">
            <h1>Processing Authentication...</h1>
            <p>Please wait while we complete your login.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OAuthCallback
