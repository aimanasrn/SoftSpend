// @ts-nocheck
import React, { useEffect, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  MoreHorizontal,
  Plane,
  Sparkles,
  Target,
  TrendingUp,
  Utensils,
  WalletCards,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { budgets, categoryData, spendingTrend, transactions, type Transaction } from '../../data'
import { supabase } from '../../lib/supabaseClient'
import { money, compactMoney } from '../../lib/format'
import { PageHeader } from '../../components/layout/AppShell'
import { mapLiveTransaction, TransactionRow } from '../transactions/TransactionsPage'

function SummaryCard({
  label,
  value,
  meta,
  icon: Icon,
  tone,
  trend,
}: {
  label: string
  value: string
  meta: string
  icon: React.ElementType
  tone: string
  trend?: 'up' | 'down'
}) {
  return (
    <div className="summary-card">
      <div className="summary-card-head">
        <span>{label}</span>
        <div className={`summary-icon ${tone}`}>
          <Icon size={18} />
        </div>
      </div>
      <strong>{value}</strong>
      <div className="summary-meta">
        {trend && (
          <span className={trend === 'up' ? 'positive' : 'negative'}>
            {trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{' '}
            {trend === 'up' ? '+12.4%' : '-8.1%'}
          </span>
        )}
        <span>{meta}</span>
      </div>
    </div>
  )
}
function Dashboard({ setPage }: { setPage: (p: Page) => void }) {
  const [month, setMonth] = useState('August 2026')
  const spent = 2750
  const income = 4500
  const usage = Math.round((spent / income) * 100)
  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="Tuesday, August 8, 2026"
        title={
          <>
            Good afternoon, Aiman <span className="wave">👋</span>
          </>
        }
        text="Here's your financial overview for August."
        action={
          <div className="month-selector">
            <button onClick={() => setMonth(month === 'August 2026' ? 'July 2026' : 'August 2026')}>
              <ChevronLeft size={16} />
            </button>
            <CalendarDays size={16} />
            <span>{month}</span>
            <button onClick={() => setMonth(month === 'August 2026' ? 'September 2026' : 'August 2026')}>
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />
      <div className="summary-grid">
        <SummaryCard
          label="Monthly income"
          value={compactMoney(income)}
          meta="Total income this month"
          icon={CircleDollarSign}
          tone="mint"
          trend="up"
        />
        <SummaryCard
          label="Total spent"
          value={compactMoney(spent)}
          meta="61.1% of salary used"
          icon={ArrowDownRight}
          tone="peach"
        />
        <SummaryCard
          label="Remaining balance"
          value={compactMoney(income - spent)}
          meta="38.9% remaining"
          icon={WalletCards}
          tone="blue"
        />
        <SummaryCard
          label="Monthly savings"
          value={compactMoney(650)}
          meta="from RM 580 last month"
          icon={TrendingUp}
          tone="lavender"
          trend="up"
        />
      </div>
      <div className="dashboard-grid top-panels">
        <SalaryUsage usage={usage} spent={spent} income={income} />
        <FinancialScore />
      </div>
      <div className="dashboard-grid charts-row">
        <SpendingChart />
        <CategoryBreakdown />
      </div>
      <div className="section-row-head">
        <div>
          <span className="section-eyebrow">Stay on top of your plan</span>
          <h2>Budget overview</h2>
        </div>
        <button className="link-button" onClick={() => setPage('budgets')}>
          View all budgets <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="budget-list">
        {budgets.slice(0, 4).map((b) => (
          <BudgetRow key={b.name} budget={b} />
        ))}
      </div>
      <div className="dashboard-grid bottom-panels">
        <RecentTransactions setPage={setPage} />
        <UpcomingBills setPage={setPage} />
      </div>
      <div className="dashboard-grid final-panels">
        <GoalsPreview setPage={setPage} />
        <Insights />
      </div>
    </div>
  )
}

function SalaryUsage({ usage, spent, income }: { usage: number; spent: number; income: number }) {
  return (
    <div className="panel salary-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">This month</span>
          <h2>Salary usage</h2>
        </div>
        <button className="more-button">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="usage-content">
        <div className="usage-ring" style={{ '--usage': `${usage * 3.6}deg` } as React.CSSProperties}>
          <div>
            <strong>{usage}%</strong>
            <span>used</span>
          </div>
        </div>
        <div className="usage-copy">
          <strong>
            {money(spent)} <span>of {money(income)}</span>
          </strong>
          <p>
            You're doing well. <b>39%</b> of your salary is still available.
          </p>
          <div className="legend">
            <span>
              <i className="dot healthy" /> Healthy <small>0–50%</small>
            </span>
            <span>
              <i className="dot moderate" /> Moderate <small>51–75%</small>
            </span>
          </div>
        </div>
      </div>
      <div className="usage-scale">
        <span>0</span>
        <i />
        <i />
        <i />
        <i />
        <span>100%</span>
      </div>
    </div>
  )
}
function FinancialScore() {
  return (
    <div className="panel score-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">Your money at a glance</span>
          <h2>Financial health</h2>
        </div>
        <CircleHelp size={18} className="muted-icon" />
      </div>
      <div className="score-content">
        <div className="score-number">
          <strong>82</strong>
          <span>/ 100</span>
        </div>
        <div className="score-badge">
          <span className="score-check">
            <Check size={16} />
          </span>
          <div>
            <strong>Good</strong>
            <span>You're on a healthy track</span>
          </div>
        </div>
      </div>
      <div className="score-bar">
        <i style={{ width: '82%' }} />
      </div>
      <p className="score-note">Your budget adherence and savings habits are working well. Keep going.</p>
      <div className="score-factors">
        <span>
          Budget adherence <b>Good</b>
        </span>
        <span>
          Savings rate <b>Great</b>
        </span>
        <span>
          Bills paid <b>Good</b>
        </span>
      </div>
    </div>
  )
}
function SpendingChart() {
  return (
    <div className="panel chart-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">Monthly overview</span>
          <h2>Income vs expenses</h2>
        </div>
        <div className="chart-legend">
          <span>
            <i className="income-dot" /> Income
          </span>
          <span>
            <i className="expense-dot" /> Expenses
          </span>
          <button className="select-button">
            Last 6 months <ChevronDown size={14} />
          </button>
        </div>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={spendingTrend} barGap={10}>
            <CartesianGrid vertical={false} stroke="#eef0f5" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9aa0ae', fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9aa0ae', fontSize: 12 }}
              tickFormatter={(v) => `RM${v / 1000}k`}
              width={38}
            />
            <Tooltip
              cursor={{ fill: '#fafaff' }}
              formatter={(v: number) => money(v)}
              contentStyle={{ borderRadius: 12, border: '1px solid #eef0f5', fontSize: 12 }}
            />
            <Bar dataKey="income" fill="#b9aefb" radius={[5, 5, 0, 0]} maxBarSize={17} />
            <Bar dataKey="expense" fill="#9fd6c0" radius={[5, 5, 0, 0]} maxBarSize={17} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
function CategoryBreakdown() {
  return (
    <div className="panel category-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">Where it went</span>
          <h2>Spending by category</h2>
        </div>
        <button className="more-button">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="category-content">
        <div className="donut-large">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie data={categoryData} innerRadius={53} outerRadius={77} paddingAngle={3} dataKey="value" stroke="none">
                {categoryData.map((x) => (
                  <Cell key={x.name} fill={x.color} />
                ))}
              </Pie>
            </RePieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>RM 2,750</strong>
            <span>Total spent</span>
          </div>
        </div>
        <div className="category-legend">
          {categoryData.map((x) => (
            <div key={x.name}>
              <span>
                <i style={{ background: x.color }} />
                {x.name}
              </span>
              <b>{compactMoney(x.value)}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
function BudgetRow({ budget }: { budget: (typeof budgets)[number] }) {
  const pct = Math.round((budget.spent / budget.limit) * 100)
  return (
    <div className="budget-row">
      <div className="budget-main">
        <span className="budget-color" style={{ background: budget.color }} />
        <div>
          <strong>{budget.name}</strong>
          <span>
            {money(budget.spent)} of {money(budget.limit)}
          </span>
        </div>
      </div>
      <div className="budget-status">
        <span className={pct >= 100 ? 'over' : pct > 70 ? 'near' : 'on'}>
          {pct >= 100 ? 'Over budget' : pct > 70 ? 'Approaching limit' : 'On track'}
        </span>
        <b>{pct}%</b>
      </div>
      <div className="budget-progress">
        <i style={{ width: `${Math.min(pct, 100)}%`, background: budget.color }} />
      </div>
      <ChevronRight className="row-chevron" size={16} />
    </div>
  )
}
function RecentTransactions({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="panel list-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">Latest activity</span>
          <h2>Recent transactions</h2>
        </div>
        <button className="link-button" onClick={() => setPage('transactions')}>
          View all <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="transaction-list">
        {transactions.slice(0, 4).map((t) => (
          <TransactionRow key={t.id} transaction={t} />
        ))}
      </div>
    </div>
  )
}
function UpcomingBills({ setPage }: { setPage: (p: Page) => void }) {
  const bills = [
    ['Internet', 'RM 129', 'Aug 12', Zap, '#d8d0ff'],
    ['Electricity', 'RM 86', 'Aug 15', Zap, '#f8e4ae'],
    ['Netflix', 'RM 55', 'Aug 18', CircleDollarSign, '#f6c8d5'],
  ]
  return (
    <div className="panel list-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">Don't miss a payment</span>
          <h2>Upcoming bills</h2>
        </div>
        <button className="link-button" onClick={() => setPage('bills')}>
          View all <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="bill-list">
        {bills.map(([name, amt, due, Icon, color]) => {
          const BillIcon = Icon as React.ElementType
          return (
            <div className="bill-row" key={name as string}>
              <div className="bill-icon" style={{ background: color as string }}>
                <BillIcon size={16} />
              </div>
              <div>
                <strong>{name}</strong>
                <span>Due {due}</span>
              </div>
              <b>{amt}</b>
              <button className="bill-check">
                <Check size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
function GoalsPreview({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="panel goals-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">Keep moving forward</span>
          <h2>Savings goals</h2>
        </div>
        <button className="link-button" onClick={() => setPage('goals')}>
          View all <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="goal-highlight">
        <div className="goal-illustration">
          <Target size={24} />
          <span>42%</span>
        </div>
        <div>
          <strong>Emergency Fund</strong>
          <span>
            {money(4200)} saved of {money(10000)}
          </span>
          <div className="goal-bar">
            <i style={{ width: '42%' }} />
          </div>
          <small>RM 5,800 to go</small>
        </div>
      </div>
      <div className="goal-small">
        <div className="goal-small-icon">
          <Plane size={17} />
        </div>
        <div>
          <strong>Vacation in Bali</strong>
          <span>
            {money(1500)} of {money(5000)}
          </span>
        </div>
        <b>30%</b>
      </div>
    </div>
  )
}
function Insights() {
  return (
    <div className="panel insights-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">A little perspective</span>
          <h2>Smart insights</h2>
        </div>
        <div className="insight-spark">
          <Sparkles size={17} />
        </div>
      </div>
      <div className="insight-card">
        <div className="insight-icon">
          <Utensils size={17} />
        </div>
        <div>
          <strong>Food spending is on track</strong>
          <p>You've used 70% of your Food budget with 23 days left.</p>
        </div>
        <ChevronRight size={17} />
      </div>
      <div className="insight-card">
        <div className="insight-icon mint">
          <TrendingUp size={17} />
        </div>
        <div>
          <strong>You're saving more</strong>
          <p>You saved RM 300 more this month than in July.</p>
        </div>
        <ChevronRight size={17} />
      </div>
    </div>
  )
}
function buildLiveCategoryData(items: Transaction[]) {
  const colors = ['#9389ff', '#f2a9be', '#f4d68d', '#9dceff', '#bdebd8', '#d8c8ff']
  const totals: Record<string, number> = {}
  items
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount
    })
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }))
}
function buildLiveSpendingTrend(items: Transaction[]) {
  const months = []
  const now = new Date()
  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const income = items
      .filter(
        (t) =>
          t.type === 'income' &&
          new Date(t.date).getMonth() === date.getMonth() &&
          new Date(t.date).getFullYear() === date.getFullYear(),
      )
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = items
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.date).getMonth() === date.getMonth() &&
          new Date(t.date).getFullYear() === date.getFullYear(),
      )
      .reduce((sum, t) => sum + t.amount, 0)
    months.push({ month, income, expense })
  }
  return months
}
function LiveSpendingChart({ data }: { data: { month: string; income: number; expense: number }[] }) {
  return (
    <div className="panel chart-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">Monthly overview</span>
          <h2>Income vs expenses</h2>
        </div>
        <div className="chart-legend">
          <span>
            <i className="income-dot" /> Income
          </span>
          <span>
            <i className="expense-dot" /> Expenses
          </span>
          <span className="live-data-badge">Live data</span>
        </div>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={10}>
            <CartesianGrid vertical={false} stroke="#eef0f5" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9aa0ae', fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9aa0ae', fontSize: 12 }}
              tickFormatter={(v) => `RM${v / 1000}k`}
              width={38}
            />
            <Tooltip
              cursor={{ fill: '#fafaff' }}
              formatter={(v: number) => money(v)}
              contentStyle={{ borderRadius: 12, border: '1px solid #eef0f5', fontSize: 12 }}
            />
            <Bar dataKey="income" fill="#b9aefb" radius={[5, 5, 0, 0]} maxBarSize={17} />
            <Bar dataKey="expense" fill="#9fd6c0" radius={[5, 5, 0, 0]} maxBarSize={17} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
function LiveCategoryBreakdown({
  data,
  total,
}: {
  data: { name: string; value: number; color: string }[]
  total: number
}) {
  return (
    <div className="panel category-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">Where it went</span>
          <h2>Spending by category</h2>
        </div>
        <span className="live-data-badge">Live data</span>
      </div>
      {data.length === 0 ? (
        <div className="data-empty">No expenses recorded this month.</div>
      ) : (
        <div className="category-content">
          <div className="donut-large">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={data} innerRadius={53} outerRadius={77} paddingAngle={3} dataKey="value" stroke="none">
                  {data.map((x) => (
                    <Cell key={x.name} fill={x.color} />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <strong>{compactMoney(total)}</strong>
              <span>Total spent</span>
            </div>
          </div>
          <div className="category-legend">
            {data.map((x) => (
              <div key={x.name}>
                <span>
                  <i style={{ background: x.color }} />
                  {x.name}
                </span>
                <b>{compactMoney(x.value)}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
function LiveRecentTransactions({ setPage, items }: { setPage: (p: Page) => void; items: Transaction[] }) {
  return (
    <div className="panel list-panel">
      <div className="panel-head">
        <div>
          <span className="section-eyebrow">Latest activity</span>
          <h2>Recent transactions</h2>
        </div>
        <button className="link-button" onClick={() => setPage('transactions')}>
          View all <ArrowUpRight size={15} />
        </button>
      </div>
      {items.length === 0 ? (
        <div className="data-empty">No transactions recorded yet.</div>
      ) : (
        <div className="transaction-list">
          {items.slice(0, 4).map((t) => (
            <TransactionRow key={t.id} transaction={t} />
          ))}
        </div>
      )}
    </div>
  )
}
function DashboardReal({ setPage, liveData }: { setPage: (p: Page) => void; liveData: boolean }) {
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(liveData)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!liveData) {
      setLoading(false)
      return
    }
    let active = true
    supabase
      .from('transactions')
      .select('id,type,amount,description,transaction_date,payment_method,category:categories(name)')
      .order('transaction_date', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!active) return
        if (queryError) setError(queryError.message)
        else setItems((data || []).map(mapLiveTransaction))
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [liveData])
  if (!liveData) return <Dashboard setPage={setPage} />
  if (loading)
    return (
      <div className="dashboard-data-loading">
        <div className="logo-mark">
          <span />
        </div>
        <span>Loading your dashboard…</span>
      </div>
    )
  const now = new Date()
  const monthItems = items.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })
  const income = monthItems.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const spent = monthItems.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const remaining = income - spent
  const usage = income > 0 ? Math.min(Math.round((spent / income) * 100), 999) : 0
  const categories = buildLiveCategoryData(monthItems)
  const trend = buildLiveSpendingTrend(items)
  return (
    <div className="dashboard-page">
      {error && <div className="data-error">Could not load dashboard data: {error}</div>}
      <PageHeader
        eyebrow="Your live overview"
        title={
          <>
            Your money at a glance <span className="wave">👋</span>
          </>
        }
        text="Updated from your saved transactions."
        action={<span className="live-data-badge large">Live data</span>}
      />
      <div className="summary-grid">
        <SummaryCard
          label="Monthly income"
          value={compactMoney(income)}
          meta="Saved income this month"
          icon={CircleDollarSign}
          tone="mint"
          trend="up"
        />
        <SummaryCard
          label="Total spent"
          value={compactMoney(spent)}
          meta={`${usage}% of income used`}
          icon={ArrowDownRight}
          tone="peach"
        />
        <SummaryCard
          label="Remaining balance"
          value={compactMoney(remaining)}
          meta={`${remaining >= 0 ? Math.max(100 - usage, 0) : 0}% available`}
          icon={WalletCards}
          tone="blue"
        />
        <SummaryCard
          label="Monthly savings"
          value={compactMoney(remaining)}
          meta="Income minus spending"
          icon={TrendingUp}
          tone="lavender"
          trend={remaining >= 0 ? 'up' : 'down'}
        />
      </div>
      <div className="dashboard-grid top-panels">
        <SalaryUsage usage={usage} spent={spent} income={income} />
        <FinancialScore />
      </div>
      <div className="dashboard-grid charts-row">
        <LiveSpendingChart data={trend} />
        <LiveCategoryBreakdown data={categories} total={spent} />
      </div>
      <div className="section-row-head">
        <div>
          <span className="section-eyebrow">Stay on top of your plan</span>
          <h2>Budget overview</h2>
        </div>
        <button className="link-button" onClick={() => setPage('budgets')}>
          View all budgets <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="budget-list">
        {budgets.slice(0, 4).map((b) => (
          <BudgetRow key={b.name} budget={b} />
        ))}
      </div>
      <div className="dashboard-grid bottom-panels">
        <LiveRecentTransactions setPage={setPage} items={monthItems} />
        <UpcomingBills setPage={setPage} />
      </div>
      <div className="dashboard-grid final-panels">
        <GoalsPreview setPage={setPage} />
        <Insights />
      </div>
    </div>
  )
}

export { BudgetRow, CategoryBreakdown, Dashboard, DashboardReal, FinancialScore }
