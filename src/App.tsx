// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import AuthPage from './auth/AuthPage'
import { useIdleLogout } from './auth/useIdleLogout'
import { LiveAnalyticsPage } from './features/analytics/LiveAnalyticsPage'
import { LiveBillsPage } from './features/bills/LiveBillsPage'
import { LiveBudgetsPage } from './features/budgets/LiveBudgetsPage'
import { LiveGoalsPage } from './features/goals/LiveGoalsPage'
import { LiveReportsPage } from './features/reports/LiveReportsPage'
import { AppShell } from './components/layout/AppShell'
import { Landing } from './components/landing/Landing'
import { HouseholdPage } from './features/household/HouseholdPage'
import { LiveHouseholdPage } from './features/household/LiveHouseholdPage'
import { DashboardReal } from './features/dashboard/DashboardPage'
import { TransactionsPage } from './features/transactions/TransactionsPage'
import { useSubscriptionStatus } from './features/billing/useSubscriptionStatus'
import { ProFeatureGate } from './features/billing/ProFeatureGate'
import {
  AnalyticsPage,
  BillsPage,
  BudgetsPage,
  GoalsPage,
  ProfileSettingsPage,
  ReportsPage,
} from './features/pages/StaticPages'
import type { AppIdentity, Page, ProfileRecord } from './app/types'

const appPages: Page[] = [
  'dashboard',
  'transactions',
  'budgets',
  'bills',
  'goals',
  'analytics',
  'reports',
  'household',
  'settings',
]

const IDLE_TIMEOUT_MS = 10 * 60 * 1000

function pageFromPath(pathname: string): Page {
  const candidate = pathname.split('/')[2] as Page
  return appPages.includes(candidate) ? candidate : 'dashboard'
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [authOpen, setAuthOpen] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const location = useLocation()
  const [page, setPageState] = useState<Page>(() => pageFromPath(location.pathname))
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const navigate = useNavigate()
  const { isPro } = useSubscriptionStatus(Boolean(session), `${page}:${location.search}`)

  useEffect(() => {
    setPageState(pageFromPath(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setProfile(null)
      return
    }
    let cancelled = false
    const user = session.user
    const fallbackName = String(user.user_metadata?.full_name || user.email?.split('@')[0] || 'SoftSpend user').trim()
    const syncProfile = async () => {
      const fields = 'id, full_name, avatar_url, currency, timezone, default_income'
      const { data } = await supabase.from('profiles').select(fields).eq('id', user.id).maybeSingle()
      if (data) {
        if (!cancelled) setProfile(data as ProfileRecord)
        return
      }
      const { data: created } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: fallbackName }, { onConflict: 'id' })
        .select(fields)
        .single()
      if (!cancelled) setProfile((created as ProfileRecord | null) || { id: user.id, full_name: fallbackName })
    }
    syncProfile()
    return () => {
      cancelled = true
    }
  }, [session?.user.id])

  const setThemeSafe = (t: 'light' | 'dark') => {
    setTheme(t)
    document.documentElement.dataset.theme = t
  }
  const identityName = demoMode
    ? 'Aiman Salleh'
    : profile?.full_name ||
      session?.user.user_metadata?.full_name ||
      session?.user.email?.split('@')[0] ||
      'SoftSpend user'
  const identityEmail = demoMode ? 'aiman@softspend.app' : session?.user.email || ''
  const identity: AppIdentity = {
    name: identityName,
    email: identityEmail,
    initials: identityName
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  }
  const enterApp = () => {
    setDemoMode(true)
    setAuthOpen(false)
    setPageState('dashboard')
    navigate('/app/dashboard')
  }
  const setPage = (nextPage: Page) => {
    setPageState(nextPage)
    const nextPath = `/app/${nextPage}`
    if (location.pathname !== nextPath) navigate(nextPath)
  }
  const logout = useCallback(async () => {
    if (session) await supabase.auth.signOut()
    setDemoMode(false)
    setAuthOpen(false)
    setPageState('dashboard')
    navigate('/')
  }, [navigate, session])
  useIdleLogout({ enabled: Boolean(session), timeoutMs: IDLE_TIMEOUT_MS, onIdle: logout })
  const content = useMemo(() => {
    switch (page) {
      case 'transactions':
        return <TransactionsPage liveData={Boolean(session)} />
      case 'budgets':
        return session ? <LiveBudgetsPage /> : <BudgetsPage />
      case 'bills':
        return isPro ? (session ? <LiveBillsPage /> : <BillsPage />) : <ProFeatureGate feature="Bills" description="Keep upcoming payments organized with reminders and paid status tracking." />
      case 'goals':
        return isPro ? (session ? <LiveGoalsPage /> : <GoalsPage />) : <ProFeatureGate feature="Goals" description="Turn your plans into measurable savings goals and watch your progress grow." />
      case 'analytics':
        return isPro ? (session ? <LiveAnalyticsPage /> : <AnalyticsPage />) : <ProFeatureGate feature="Analytics" description="See deeper spending patterns and understand where your money is going." />
      case 'reports':
        return isPro ? (session ? <LiveReportsPage /> : <ReportsPage />) : <ProFeatureGate feature="Reports" description="Download clear monthly, category, and transaction reports for your records." />
      case 'household':
        return isPro ? (session ? <LiveHouseholdPage /> : <HouseholdPage />) : <ProFeatureGate feature="Household sharing" description="Share selected expenses, budgets, and goals with the people who matter." />
      case 'settings':
        return <ProfileSettingsPage theme={theme} setTheme={setThemeSafe} profile={identity} isAuthenticated={Boolean(session)} isPro={isPro} />
      default:
        return <DashboardReal setPage={setPage} liveData={Boolean(session)} />
    }
  }, [page, theme, session?.user.id, isPro])

  if (session === undefined)
    return (
      <div className="auth-loading">
        <div className="logo-mark">
          <span />
        </div>
        <span>Loading SoftSpend…</span>
      </div>
    )
  if (!session && !demoMode) {
    if (authOpen) return <AuthPage onDemo={enterApp} onBack={() => setAuthOpen(false)} />
    return <Landing onEnter={() => setAuthOpen(true)} />
  }
  return (
    <AppShell page={page} setPage={setPage} theme={theme} setTheme={setThemeSafe} onLogout={logout} profile={identity} isPro={isPro}>
      {content}
    </AppShell>
  )
}
