// @ts-nocheck
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { supabase } from '../../lib/supabaseClient'
import { compactMoney, money } from '../../lib/format'
import { colors, Header, Loading } from '../shared/LivePagePrimitives'

async function loadTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('id,type,amount,description,transaction_date,category:categories(name)')
    .order('transaction_date', { ascending: false })
  return { rows: data || [], error: error?.message || '' }
}
function categoryTotals(rows: any[]) {
  const totals = {}
  rows
    .filter((x) => x.type === 'expense')
    .forEach((x) => {
      const key = x.category?.name || 'Uncategorized'
      totals[key] = (totals[key] || 0) + Number(x.amount || 0)
    })
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({ name, value: Number(value), color: colors[index % colors.length] }))
}
function monthTotals(rows: any[]) {
  const output = []
  const now = new Date()
  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const monthRows = rows.filter((x) => {
      const tx = new Date(`${x.transaction_date}T00:00:00`)
      return tx.getMonth() === date.getMonth() && tx.getFullYear() === date.getFullYear()
    })
    output.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      income: monthRows.filter((x) => x.type === 'income').reduce((s, x) => s + Number(x.amount), 0),
      expense: monthRows.filter((x) => x.type === 'expense').reduce((s, x) => s + Number(x.amount), 0),
    })
  }
  return output
}
export function LiveAnalyticsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    loadTransactions().then((result) => {
      setRows(result.rows)
      setError(result.error)
      setLoading(false)
    })
  }, [])
  const now = new Date()
  const current = rows.filter((x) => {
    const date = new Date(`${x.transaction_date}T00:00:00`)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })
  const spent = current.filter((x) => x.type === 'expense').reduce((s, x) => s + Number(x.amount), 0)
  const categories = categoryTotals(current)
  return (
    <div>
      <Header
        eyebrow="See the bigger picture"
        title="Analytics"
        text="Patterns calculated from your saved transactions."
        action={<span className="live-data-badge large">Live data</span>}
      />
      <Loading loading={loading} error={error} />
      <div className="analytics-grid">
        <div className="panel chart-panel wide">
          <div className="panel-head">
            <div>
              <span className="section-eyebrow">Last six months</span>
              <h2>Income vs expenses</h2>
            </div>
            <span className="chart-total">
              {compactMoney(spent)} <small>this month</small>
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthTotals(rows)}>
              <CartesianGrid vertical={false} stroke="#eef0f5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `RM${v / 1000}k`} />
              <Tooltip formatter={(v: number) => money(v)} />
              <Bar dataKey="income" fill="#b9aefb" radius={[5, 5, 0, 0]} />
              <Bar dataKey="expense" fill="#9fd6c0" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel category-panel">
          <div className="panel-head">
            <div>
              <span className="section-eyebrow">Current month</span>
              <h2>Spending by category</h2>
            </div>
          </div>
          {categories.length === 0 ? (
            <div className="data-empty">No expenses recorded this month.</div>
          ) : (
            <div className="category-content">
              <div className="donut-large">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} dataKey="value" innerRadius={53} outerRadius={77} paddingAngle={3}>
                      {categories.map((x) => (
                        <Cell key={x.name} fill={x.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <strong>{compactMoney(spent)}</strong>
                  <span>Total spent</span>
                </div>
              </div>
              <div className="category-legend">
                {categories.map((x) => (
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
      </div>
    </div>
  )
}
