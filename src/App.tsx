// @ts-nocheck
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import AuthPage from './auth/AuthPage'
import { useIdleLogout } from './auth/useIdleLogout'
import { AppShell } from './components/layout/AppShell'
import { Landing } from './components/landing/Landing'
import { useSubscriptionStatus } from './features/billing/useSubscriptionStatus'
import { ProFeatureGate } from './features/billing/ProFeatureGate'
import type { AppIdentity, Page, ProfileRecord } from './app/types'

const lazyNamed = (loader: () => Promise<any>, exportName: string) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })))

const DashboardReal = lazyNamed(() => import('./features/dashboard/DashboardPage'), 'DashboardReal')
const TransactionsPage = lazyNamed(() => import('./features/transactions/TransactionsPage'), 'TransactionsPage')
const LiveAnalyticsPage = lazyNamed(() => import('./features/analytics/LiveAnalyticsPage'), 'LiveAnalyticsPage')
const LiveBillsPage = lazyNamed(() => import('./features/bills/LiveBillsPage'), 'LiveBillsPage')
const LiveBudgetsPage = lazyNamed(() => import('./features/budgets/LiveBudgetsPage'), 'LiveBudgetsPage')
const LiveGoalsPage = lazyNamed(() => import('./features/goals/LiveGoalsPage'), 'LiveGoalsPage')
const LiveReportsPage = lazyNamed(() => import('./features/reports/LiveReportsPage'), 'LiveReportsPage')
const HouseholdPage = lazyNamed(() => import('./features/household/HouseholdPage'), 'HouseholdPage')
const LiveHouseholdPage = lazyNamed(() => import('./features/household/LiveHouseholdPage'), 'LiveHouseholdPage')
const AnalyticsPage = lazyNamed(() => import('./features/pages/StaticPages'), 'AnalyticsPage')
const BillsPage = lazyNamed(() => import('./features/pages/StaticPages'), 'BillsPage')
const BudgetsPage = lazyNamed(() => import('./features/pages/StaticPages'), 'BudgetsPage')
const GoalsPage = lazyNamed(() => import('./features/pages/StaticPages'), 'GoalsPage')
const ProfileSettingsPage = lazyNamed(() => import('./features/pages/StaticPages'), 'ProfileSettingsPage')
const ReportsPage = lazyNamed(() => import('./features/pages/StaticPages'), 'ReportsPage')

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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('softspend-theme')
    return storedTheme === 'dark' ? 'dark' : 'light'
  })
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const navigate = useNavigate()
  const { isPro } = useSubscriptionStatus(Boolean(session), `${page}:${location.search}`)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

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
    localStorage.setItem('softspend-theme', t)
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
        return (
          <ProfileSettingsPage
            theme={theme}
            setTheme={setThemeSafe}
            profile={identity}
            profileRecord={profile}
            isAuthenticated={Boolean(session)}
            isPro={isPro}
            onProfileSaved={(nextProfile) => setProfile(nextProfile)}
            onLogout={logout}
          />
        )
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
      <Suspense fallback={<div className="page-loading" role="status">Loading your workspace…</div>}>
        {content}
      </Suspense>
    </AppShell>
  )
}
