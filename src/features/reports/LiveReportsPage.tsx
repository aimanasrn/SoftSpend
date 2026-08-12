// @ts-nocheck
import { useEffect, useState } from 'react'
import { Check, Download, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabaseClient'
import { compactMoney } from '../../lib/format'
import { Header, Loading } from '../shared/LivePagePrimitives'

async function loadTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('id,type,amount,description,transaction_date,category:categories(name)')
    .order('transaction_date', { ascending: false })

  return { rows: data || [], error: error?.message || '' }
}

export function LiveReportsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportOwner, setReportOwner] = useState('SoftSpend')
  const [exportedFile, setExportedFile] = useState('')
  useEffect(() => {
    loadTransactions().then((result) => {
      setRows(result.rows)
      setError(result.error)
      setLoading(false)
    })
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0]
      if (name) setReportOwner(name)
    })
  }, [])
  const income = rows.filter((x) => x.type === 'income').reduce((s, x) => s + Number(x.amount), 0)
  const spent = rows.filter((x) => x.type === 'expense').reduce((s, x) => s + Number(x.amount), 0)
  const exportReport = (reportType: 'Monthly' | 'Category' | 'Transaction' = 'Transaction') => {
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
    const safeOwner = reportOwner.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') || 'SoftSpend'
    const month = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())
    const reportLabel = reportType === 'Monthly' ? month.replace(' ', '_') : reportType
    const fileName = `${safeOwner}_${reportLabel}_SSReport.xlsx`
    XLSX.writeFile(workbook, fileName)
    setExportedFile(fileName)
    setTimeout(() => setExportedFile(''), 2500)
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
            <button className="primary-button" onClick={() => exportReport('Transaction')} disabled={loading}>
              <Download size={17} /> Export to Excel
            </button>
          </>
        }
      />
      <Loading loading={loading} error={error} />
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
          ['Monthly report', 'Income, expenses & savings', 'Monthly'],
          ['Category report', 'Where your money went', 'Category'],
          ['Transaction report', 'Every saved transaction', 'Transaction'],
        ].map(([title, text, reportType]) => (
          <div className="report-card" key={title}>
            <div className="report-icon">
              <FileText size={19} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            <button onClick={() => exportReport(reportType as 'Monthly' | 'Category' | 'Transaction')}>
              Download <Download size={14} />
            </button>
          </div>
        ))}
      </div>
      {exportedFile && (
        <div className="toast">
          <Check size={16} /> Exported {exportedFile}.
        </div>
      )}
    </div>
  )
}
