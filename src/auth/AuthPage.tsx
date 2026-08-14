import { useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { getSessionErrorMessage, isSessionError } from '../lib/auth'
import './auth.css'

type AuthMode = 'login' | 'signup' | 'reset'

function getAuthErrorMessage(caught: unknown, mode: AuthMode) {
  const error = caught as { message?: string; code?: string; status?: number }
  const rawMessage = String(error?.message || '').toLowerCase()
  const code = String(error?.code || '').toLowerCase()

  if (rawMessage.includes('failed to fetch') || rawMessage.includes('network') || rawMessage.includes('fetch')) {
    return 'We could not connect to SoftSpend. Check your internet connection and try again.'
  }
  if (
    rawMessage.includes('authentication credentials invalid') ||
    rawMessage.includes('domain is not verified') ||
    rawMessage.includes('verify your domain') ||
    rawMessage.includes('smtp') ||
    rawMessage.includes('535') ||
    (mode === 'signup' && error?.status === 500)
  ) {
    return mode === 'signup'
      ? 'We could not finish registration because the confirmation email service is temporarily unavailable. Please try again later.'
      : 'The email service is temporarily unavailable. Please try again later.'
  }
  if (rawMessage.includes('email rate limit') || code.includes('email_rate_limit') || rawMessage.includes('over_email_send_rate_limit')) {
    return 'Too many email requests right now. Please wait a few minutes and try again.'
  }
  if (rawMessage.includes('rate limit') || rawMessage.includes('too many requests') || error?.status === 429) {
    return 'Too many attempts right now. Please wait a few minutes before trying again.'
  }
  if (rawMessage.includes('invalid login credentials') || rawMessage.includes('invalid credentials')) {
    return 'The email or password is incorrect. Check both and try again, or use “Forgot password?”.'
  }
  if (rawMessage.includes('email not confirmed') || rawMessage.includes('email_not_confirmed')) {
    return 'Please confirm your email address from the message we sent before logging in.'
  }
  if (rawMessage.includes('already registered') || rawMessage.includes('user already exists') || code.includes('user_already_exists')) {
    return 'An account with this email already exists. Try logging in instead.'
  }
  if (rawMessage.includes('invalid email')) {
    return 'Enter a valid email address and try again.'
  }
  if (rawMessage.includes('password should be at least') || rawMessage.includes('password must be at least')) {
    return 'Your password must be at least 6 characters long.'
  }
  if (rawMessage.includes('weak password')) {
    return 'Choose a stronger password with a mix of letters, numbers, or symbols.'
  }
  if (mode === 'reset') {
    return 'We could not send the reset email. Check the address and try again.'
  }
  if (mode === 'signup') {
    return 'We could not create your account right now. Please check your details and try again.'
  }
  return 'We could not log you in right now. Please check your details and try again.'
}

export default function AuthPage({ onDemo, onBack }: { onDemo: () => void; onBack: () => void }) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)

    try {
      if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (resetError) throw resetError
        setMessage('If an account exists for that email, a reset link is on its way.')
        return
      }

      if (mode === 'signup') {
        if (password.length < 6) {
          setError('Use a password with at least 6 characters.')
          return
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: window.location.origin,
          },
        })
        if (signUpError) throw signUpError
        setMessage(
          data.session
            ? 'Your account is ready.'
            : 'Account created. Check your email to confirm your account, then log in.',
        )
        if (data.session) onDemo()
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
    } catch (caught) {
      setError(isSessionError(caught) ? getSessionErrorMessage(caught) : getAuthErrorMessage(caught, mode))
    } finally {
      setBusy(false)
    }
  }

  const title =
    mode === 'login' ? 'Welcome back.' : mode === 'signup' ? 'Make money feel simpler.' : 'Reset your password.'
  const description =
    mode === 'login'
      ? 'Pick up where you left off and keep your month on track.'
      : mode === 'signup'
        ? 'Create your free account and start building a calmer money habit.'
        : 'Enter your email and we’ll send you a secure reset link.'

  return (
    <div className="auth-screen">
      <div className="auth-ambient ambient-one" />
      <div className="auth-ambient ambient-two" />
      <div className="auth-layout wrap">
        <section className="auth-intro">
          <button className="auth-back" onClick={onBack}>
            <ArrowLeft size={16} /> Back to SoftSpend
          </button>
          <div className="auth-brand">
            <span className="logo-mark">
              <span />
            </span>
            <strong>SoftSpend</strong>
          </div>
          <div className="auth-intro-copy">
            <span className="section-eyebrow">A calmer money workspace</span>
            <h1>
              Feel good about
              <br />
              <em>your next payday.</em>
            </h1>
            <p>Everything you need to plan, share and understand your money — in one peaceful place.</p>
          </div>
          <div className="auth-proof">
            <div className="auth-proof-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>Your data stays yours.</strong>
              <span>Secure sign-in powered by Supabase.</span>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-card-head">
              <div className="auth-mobile-brand">
                <span className="logo-mark">
                  <span />
                </span>
                <strong>SoftSpend</strong>
              </div>
              <span className="auth-card-kicker">
                <Sparkles size={14} /> Start here
              </span>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>

            {mode !== 'reset' && (
              <div className="auth-tabs">
                <button className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>
                  Log in
                </button>
                <button className={mode === 'signup' ? 'active' : ''} onClick={() => changeMode('signup')}>
                  Create account
                </button>
              </div>
            )}

            <form className="auth-form" onSubmit={submit}>
              {mode === 'signup' && (
                <label>
                  <span>Your name</span>
                  <div className="auth-input">
                    <UserRound size={17} />
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Aiman Salleh"
                      autoComplete="name"
                      required
                    />
                  </div>
                </label>
              )}
              <label>
                <span>Email address</span>
                <div className="auth-input">
                  <Mail size={17} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>
              {mode !== 'reset' && (
                <label>
                  <span>Password</span>
                  <div className="auth-input">
                    <LockKeyhole size={17} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>
              )}
              {mode === 'login' && (
                <button type="button" className="auth-forgot" onClick={() => changeMode('reset')}>
                  Forgot password?
                </button>
              )}
              {error && (
                <div className="auth-alert error">
                  <span>!</span>
                  {error}
                </div>
              )}
              {message && (
                <div className="auth-alert success">
                  <Check size={16} />
                  {message}
                </div>
              )}
              <button className="primary-button auth-submit" disabled={busy}>
                {busy
                  ? 'Please wait…'
                  : mode === 'login'
                    ? 'Log in'
                    : mode === 'signup'
                      ? 'Create free account'
                      : 'Send reset link'}{' '}
                <ArrowUpRight size={17} />
              </button>
            </form>

            {mode === 'reset' ? (
              <button className="auth-secondary-link" onClick={() => changeMode('login')}>
                Back to log in
              </button>
            ) : (
              <button className="auth-demo" onClick={onDemo}>
                Continue with demo data <ArrowUpRight size={15} />
              </button>
            )}
            <div className="auth-note">
              <LockKeyhole size={13} /> No credit card required · Free to get started
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
