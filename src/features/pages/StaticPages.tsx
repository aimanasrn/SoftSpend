// @ts-nocheck
import React, { useState } from 'react'
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  Moon,
  MoreHorizontal,
  Palette,
  Plane,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { budgets } from '../../data'
import { money } from '../../lib/format'
import type { AppIdentity } from '../../app/types'
import { PageHeader } from '../../components/layout/AppShell'
import { BudgetRow, CategoryBreakdown, FinancialScore } from '../dashboard/DashboardPage'
import { SubscriptionPanel } from '../billing/SubscriptionPanel'

function BudgetsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Plan with intention"
        title="Budgets"
        text="Give every ringgit a job before the month begins."
        action={
          <button className="primary-button">
            <Plus size={17} /> Create budget
          </button>
        }
      />
      <div className="budget-summary">
        <div>
          <span>August 2026 budget</span>
          <strong>RM 3,750</strong>
          <small>of RM 4,500 income</small>
        </div>
        <div>
          <span>Allocated</span>
          <strong>83%</strong>
          <small>RM 750 unallocated</small>
        </div>
        <div>
          <span>Safe to spend today</span>
          <strong>RM 66</strong>
          <small>18 days remaining</small>
        </div>
      </div>
      <div className="section-row-head">
        <div>
          <span className="section-eyebrow">Your categories</span>
          <h2>Monthly plan</h2>
        </div>
        <button className="ghost-button">
          <Download size={16} /> Copy last month
        </button>
      </div>
      <div className="budget-list full-budget-list">
        {budgets.map((b) => (
          <BudgetRow key={b.name} budget={b} />
        ))}
      </div>
    </div>
  )
}
function BillsPage() {
  const bills = [
    ['Internet', 'Bills & Utilities', 'RM 129', 'Aug 12', 'Pending', '#d8d0ff'],
    ['Electricity', 'Bills & Utilities', 'RM 86', 'Aug 15', 'Pending', '#f8e4ae'],
    ['Netflix', 'Subscriptions', 'RM 55', 'Aug 18', 'Paid', '#f6c8d5'],
    ['Rent', 'Housing', 'RM 1,200', 'Aug 01', 'Paid', '#c8c0ff'],
  ]
  return (
    <div>
      <PageHeader
        eyebrow="Never miss a payment"
        title="Bills"
        text="Keep upcoming payments visible and stress-free."
        action={
          <button className="primary-button">
            <Plus size={17} /> Add bill
          </button>
        }
      />
      <div className="bill-stat-grid">
        <div className="bill-stat">
          <span>Due this month</span>
          <strong>RM 215</strong>
          <small>2 pending bills</small>
        </div>
        <div className="bill-stat mint">
          <span>Paid this month</span>
          <strong>RM 1,255</strong>
          <small>On time — nice work</small>
        </div>
        <div className="bill-stat yellow">
          <span>Subscriptions</span>
          <strong>RM 74.80</strong>
          <small>3 recurring payments</small>
        </div>
      </div>
      <div className="panel table-panel bills-table">
        <div className="table-head">
          <span>Bill</span>
          <span>Category</span>
          <span>Amount</span>
          <span>Due date</span>
          <span>Status</span>
          <span />
        </div>
        {bills.map((b) => (
          <div className="table-row" key={b[0]}>
            <span className="table-description">
              <div className="transaction-icon" style={{ background: b[5] }}>
                <Zap size={16} />
              </div>
              <strong>{b[0]}</strong>
            </span>
            <span>{b[1]}</span>
            <strong>{b[2]}</strong>
            <span>{b[3]}</span>
            <span className={`status-pill ${b[4] === 'Paid' ? 'paid' : 'pending'}`}>{b[4]}</span>
            <button className="more-button">
              <MoreHorizontal size={17} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
function GoalsPage() {
  const goals = [
    ['Emergency Fund', 'Build a safety net for the unexpected', 4200, 10000, 42, '#d5ceff', Target],
    ['Vacation in Bali', 'A little sunshine goes a long way', 1500, 5000, 30, '#bfe9d6', Plane],
    ['New laptop', 'Save for a creative upgrade', 1800, 3200, 56, '#f6c4d3', Sparkles],
  ]
  return (
    <div>
      <PageHeader
        eyebrow="Make room for what matters"
        title="Savings goals"
        text="Turn your plans into achievable progress."
        action={
          <button className="primary-button">
            <Plus size={17} /> Create goal
          </button>
        }
      />
      <div className="goals-overview">
        <div className="goals-total">
          <span>Saved across goals</span>
          <strong>RM 7,500</strong>
          <small>RM 18,200 total target</small>
          <div className="goal-bar">
            <i style={{ width: '41%' }} />
          </div>
        </div>
        <div className="projection">
          <Clock3 size={19} />
          <div>
            <span>Next milestone</span>
            <strong>RM 500 monthly contribution</strong>
            <small>Emergency Fund · 12 months to go</small>
          </div>
        </div>
      </div>
      <div className="goal-card-grid">
        {goals.map(([name, desc, current, target, pct, color, Icon]) => {
          const GoalIcon = Icon as React.ElementType
          return (
            <div className="goal-card" key={name as string}>
              <div className="goal-card-top">
                <div className="goal-card-icon" style={{ background: color as string }}>
                  <GoalIcon size={20} />
                </div>
                <button className="more-button">
                  <MoreHorizontal size={17} />
                </button>
              </div>
              <h3>{name}</h3>
              <p>{desc}</p>
              <div className="goal-amounts">
                <strong>{money(current as number)}</strong>
                <span>of {money(target as number)}</span>
              </div>
              <div className="goal-bar large">
                <i style={{ width: `${pct}%` }} />
              </div>
              <div className="goal-foot">
                <span>{pct}% complete</span>
                <b>{name === 'Emergency Fund' ? 'Aug 2027' : 'In progress'}</b>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="See the bigger picture"
        title="Analytics"
        text="Patterns that make your next month easier."
        action={
          <button className="month-selector">
            <CalendarDays size={16} /> August 2026 <ChevronDown size={15} />
          </button>
        }
      />
      <div className="analytics-grid">
        <div className="panel chart-panel wide">
          <div className="panel-head">
            <div>
              <span className="section-eyebrow">Daily spending</span>
              <h2>Monthly spending trend</h2>
            </div>
            <span className="chart-total">
              RM 2,750 <small>this month</small>
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={[
                { day: '1', amount: 210 },
                { day: '5', amount: 520 },
                { day: '10', amount: 710 },
                { day: '15', amount: 1120 },
                { day: '20', amount: 1500 },
                { day: '25', amount: 2030 },
                { day: '30', amount: 2750 },
              ]}
            >
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9f95ff" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#9f95ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#eef0f5" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9aa0ae', fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9aa0ae', fontSize: 12 }}
                tickFormatter={(v) => `RM${v / 1000}k`}
                width={38}
              />
              <Tooltip
                formatter={(v: number) => money(v)}
                contentStyle={{ borderRadius: 12, border: '1px solid #eef0f5' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#8b80f9" strokeWidth={3} fill="url(#area)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <CategoryBreakdown />
        <div className="panel chart-panel wide">
          <div className="panel-head">
            <div>
              <span className="section-eyebrow">A healthier direction</span>
              <h2>Salary usage trend</h2>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={[
                { month: 'Jan', usage: 64 },
                { month: 'Feb', usage: 72 },
                { month: 'Mar', usage: 55 },
                { month: 'Apr', usage: 69 },
                { month: 'May', usage: 60 },
                { month: 'Jun', usage: 61 },
              ]}
            >
              <CartesianGrid vertical={false} stroke="#eef0f5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9aa0ae', fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9aa0ae', fontSize: 12 }}
                tickFormatter={(v) => `${v}%`}
                width={38}
              />
              <Line
                type="monotone"
                dataKey="usage"
                stroke="#f0aabd"
                strokeWidth={3}
                dot={{ fill: '#fff', stroke: '#f0aabd', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <FinancialScore />
      </div>
    </div>
  )
}
function ReportsPage() {
  const [exported, setExported] = useState(false)
  const download = () => {
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }
  return (
    <div>
      <PageHeader
        eyebrow="Make it tangible"
        title="Reports"
        text="A clear monthly record you can keep, share or export."
        action={
          <button className="primary-button" onClick={download}>
            <Download size={17} /> Export to Excel
          </button>
        }
      />
      <div className="report-hero">
        <div>
          <span className="section-eyebrow">August 2026 summary</span>
          <h2>Your month in one page.</h2>
          <p>Income, spending, savings and budget performance — all ready when you are.</p>
        </div>
        <div className="report-hero-stats">
          <div>
            <span>Income</span>
            <strong>RM 4,500</strong>
          </div>
          <div>
            <span>Spent</span>
            <strong>RM 2,750</strong>
          </div>
          <div>
            <span>Saved</span>
            <strong>RM 1,750</strong>
          </div>
          <div>
            <span>Savings rate</span>
            <strong>38.9%</strong>
          </div>
        </div>
      </div>
      <div className="report-grid">
        {[
          ['Monthly report', 'Income, expenses & savings', 'RM'],
          ['Category report', 'Where your money went', 'Pie'],
          ['Budget performance', 'Planned vs actual', 'Bars'],
          ['Savings report', 'Goals and progress', 'Goal'],
        ].map(([title, text, icon]) => (
          <div className="report-card" key={title}>
            <div className="report-icon">
              <FileText size={19} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            <button onClick={download}>
              Download <Download size={14} />
            </button>
          </div>
        ))}
      </div>
      {exported && (
        <div className="toast">
          <Check size={16} /> Excel workbook exported successfully.
        </div>
      )}
    </div>
  )
}
function SettingsPage({ theme, setTheme, isAuthenticated = false }: { theme: 'light' | 'dark'; setTheme: (t: 'light' | 'dark') => void; isAuthenticated?: boolean }) {
  return (
    <div>
      <PageHeader eyebrow="Make SoftSpend yours" title="Settings" text="A few thoughtful defaults go a long way." />
      <div className="settings-layout">
        <aside className="settings-nav">
          <button className="active">
            <Settings size={17} /> General
          </button>
          <button>
            <Palette size={17} /> Appearance
          </button>
          <button>
            <Bell size={17} /> Notifications
          </button>
          <button>
            <CircleDollarSign size={17} /> Currency & dates
          </button>
          <button>
            <ShieldIcon /> Security
          </button>
        </aside>
        <div className="settings-content">
          <div className="panel settings-panel">
            <div className="settings-section">
              <span className="section-eyebrow">Profile</span>
              <h2>Your workspace</h2>
              <div className="profile-edit">
                <div className="large-avatar">AS</div>
                <div>
                  <strong>Aiman Salleh</strong>
                  <span>aiman@softspend.app</span>
                  <button className="ghost-button small">Change photo</button>
                </div>
              </div>
            </div>
            {isAuthenticated && <SubscriptionPanel />}
            <div className="settings-section">
              <span className="section-eyebrow">Preferences</span>
              <h2>Personal defaults</h2>
              <div className="settings-fields">
                <label>
                  Preferred currency
                  <select>
                    <option>MYR — Malaysian Ringgit</option>
                    <option>USD — US Dollar</option>
                  </select>
                </label>
                <label>
                  Timezone
                  <select>
                    <option>Asia/Kuala Lumpur (GMT+8)</option>
                  </select>
                </label>
                <label>
                  Monthly income
                  <div className="amount-input">
                    <span>RM</span>
                    <input value="4,500" readOnly />
                  </div>
                </label>
              </div>
            </div>
            <div className="settings-section">
              <span className="section-eyebrow">Appearance</span>
              <h2>Make it feel like home</h2>
              <div className="theme-options">
                <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>
                  <Sun size={18} />
                  <strong>Light</strong>
                  <span>Soft and airy</span>
                </button>
                <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>
                  <Moon size={18} />
                  <strong>Dark</strong>
                  <span>Calm and focused</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
function ShieldIcon() {
  return <span className="shield-icon">✦</span>
}

function ProfileSettingsPage({
  theme,
  setTheme,
  profile,
  isAuthenticated = false,
  isPro = false,
}: {
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
  profile: AppIdentity
  isAuthenticated?: boolean
  isPro?: boolean
}) {
  return (
    <div className="profile-aware-settings">
      <div className="profile-live-card">
        <div className="large-avatar">{profile.initials}</div>
        <div>
          <span className="section-eyebrow">Signed-in profile</span>
          <strong className="profile-name-line">
            {profile.name}
            {isPro && <span className="pro-badge">Pro</span>}
          </strong>
          <span>{profile.email}</span>
        </div>
      </div>
      <SettingsPage theme={theme} setTheme={setTheme} isAuthenticated={isAuthenticated} />
    </div>
  )
}

export { AnalyticsPage, BillsPage, BudgetsPage, GoalsPage, ProfileSettingsPage, ReportsPage, SettingsPage }
