// @ts-nocheck
import { useEffect, useState } from 'react'
import { Check, Download, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabaseClient'
import { compactMoney } from '../../lib/format'
import { Header } from '../shared/LivePagePrimitives'

export function LiveReportsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exported, setExported] = useState(false)
  useEffect(() => {
    loadTransactions().then((result) => {
      setRows(result.rows)
      setLoading(false)
    })
  }, [])
  const income = rows.filter((x) => x.type === 'income').reduce((s, x) => s + Number(x.amount), 0)
  const spent = rows.filter((x) => x.type === 'expense').reduce((s, x) => s + Number(x.amount), 0)
  const exportReport = () => {
    const sheet = XLSX.utils.json_to_sheet(
      rows.map((x) => ({
        Date: x.transaction_date,
        Description: x.description,
        Type: x.type,
        Amount: x.amount,
        Category: x.category?.name || 'Uncategorized',
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Transactions')
    XLSX.writeFile(workbook, 'softspend-report.xlsx')
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }
  return (
    <div>
      <Header
        eyebrow="Make it tangible"
        title="Reports"
        text="Export a real record of your saved transactions."
        action={
          <>
            <span className="live-data-badge large">Live data</span>
            <button className="primary-button" onClick={exportReport} disabled={loading}>
              <Download size={17} /> Export to Excel
            </button>
          </>
        }
      />
      <div className="report-hero">
        <div>
          <span className="section-eyebrow">Saved transaction summary</span>
          <h2>Your real numbers, in one file.</h2>
          <p>This report is generated from your Supabase transactions.</p>
        </div>
        <div className="report-hero-stats">
          <div>
            <span>Income</span>
            <strong>{compactMoney(income)}</strong>
          </div>
          <div>
            <span>Spent</span>
            <strong>{compactMoney(spent)}</strong>
          </div>
          <div>
            <span>Saved</span>
            <strong>{compactMoney(income - spent)}</strong>
          </div>
          <div>
            <span>Transactions</span>
            <strong>{rows.length}</strong>
          </div>
        </div>
      </div>
      <div className="report-grid">
        {[
          ['Monthly report', 'Income, expenses & savings'],
          ['Category report', 'Where your money went'],
          ['Transaction report', 'Every saved transaction'],
        ].map(([title, text]) => (
          <div className="report-card" key={title}>
            <div className="report-icon">
              <FileText size={19} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            <button onClick={exportReport}>
              Download <Download size={14} />
            </button>
          </div>
        ))}
      </div>
      {exported && (
        <div className="toast">
          <Check size={16} /> Real Excel report exported.
        </div>
      )}
    </div>
  )
}
