// Login.jsx — Sign In / Sign Up page

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function switchMode(newMode) {
    setMode(newMode)
    setName('')
    setEmail('')
    setPassword('')
    setErrors({})
  }

  function validate() {
    const errs = {}

    if (mode === 'signup' && !name.trim()) {
      errs.name = 'Name is required.'
    }

    if (!email.trim()) {
      errs.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email.'
    }

    if (!password) {
      errs.password = 'Password is required.'
    } else if (password.length < 6) {
      errs.password = 'Minimum 6 characters.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    // store login info in localStorage
    const userData = {
      name: mode === 'signup' ? name.trim() : email.split('@')[0],
      email: email.trim()
    }
    localStorage.setItem('kn-auth', 'true')
    localStorage.setItem('kn-user', JSON.stringify(userData))

    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 300)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <span className="auth-logo-name">Keys Nearby</span>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={'auth-toggle-btn' + (mode === 'signin' ? ' active' : '')}
            onClick={() => switchMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={'auth-toggle-btn' + (mode === 'signup' ? ' active' : '')}
            onClick={() => switchMode('signup')}
          >
            Create Account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="full-name">Full Name</label>
              <input
                id="full-name"
                type="text"
                className={'form-input' + (errors.name ? ' error' : '')}
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={'form-input' + (errors.email ? ' error' : '')}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={'form-input' + (errors.password ? ' error' : '')}
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : 'Continue →'}
          </button>

        </form>

        <div className="auth-footer">
          <p>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              style={{ color: '#1d4ed8', background: 'none', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <button
          className="auth-back-link"
          onClick={() => navigate('/')}
          style={{ background: 'none' }}
        >
          ← Back to Home
        </button>

      </div>
    </div>
  )
}

export default Login