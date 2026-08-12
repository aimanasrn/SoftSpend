// @ts-nocheck
import React, { useEffect, useState } from 'react'
import {
  ArrowDownRight,
  Car,
  Check,
  CircleDollarSign,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { loadCurrentHousehold } from '../../lib/household'
import { transactions, type Transaction } from '../../data'
import { money } from '../../lib/format'
import { PageHeader } from '../../components/layout/AppShell'
import { RowActions } from '../../components/data/RowActions'
import { ConfirmDeleteDialog } from '../shared/LivePagePrimitives'
import { VisibilityToggle } from '../../components/data/VisibilityToggle'

function TransactionRow({ transaction: t }: { transaction: Transaction }) {
  const Icon =
    t.icon === 'car'
      ? Car
      : t.icon === 'play'
        ? CircleDollarSign
        : t.icon === 'wallet'
          ? WalletCards
          : t.icon === 'zap'
            ? Zap
            : ShoppingBag
  return (
    <div className="transaction-row">
      <div className="transaction-icon" style={{ background: t.color }}>
        <Icon size={16} />
      </div>
      <div className="transaction-info">
        <strong>{t.merchant}</strong>
        <span>
          {t.category} · {t.date.replace(', 2026', '')}
        </span>
      </div>
      <b className={t.type === 'income' ? 'income-text' : ''}>
        {t.type === 'income' ? '+' : '-'}
        {money(t.amount)}
      </b>
    </div>
  )
}
const mapLiveTransaction = (row: any): Transaction => {
  const type = row.type === 'income' ? 'income' : 'expense'
  const date = row.transaction_date
    ? new Date(`${row.transaction_date}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    : '—'
  return {
    id: row.id,
    categoryId: row.category_id,
    budgetId: row.budget_id,
    householdId: row.household_id,
    createdBy: row.created_by,
    rawDate: row.transaction_date,
    visibility: row.visibility || 'personal',
    date,
    merchant: row.description || 'Untitled transaction',
    category: row.category?.name || 'Uncategorized',
    method: row.payment_method || '—',
    amount: Number(row.amount) || 0,
    type,
    icon: type === 'income' ? 'wallet' : 'shopping-basket',
    color: type === 'income' ? '#bcebd7' : '#f5c0d0',
  }
}
function TransactionsPage({ liveData = false }: { liveData?: boolean }) {
  const [filter, setFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [items, setItems] = useState<Transaction[]>(transactions)
  const [loading, setLoading] = useState(liveData)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<any>(null)
  const [deleting, setDeleting] = useState<any>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [exported, setExported] = useState(false)
  const load = async () => {
    if (!liveData) {
      setItems(transactions)
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const { data, error: queryError } = await supabase
      .from('transactions')
      .select(
        'id,type,amount,description,transaction_date,payment_method,visibility,household_id,created_by,category_id,budget_id,category:categories(name)',
      )
      .order('transaction_date', { ascending: false })
    if (queryError) {
      setError(queryError.message)
      setItems([])
    } else setItems((data || []).map(mapLiveTransaction))
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [liveData])
  const removeTransaction = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError('')
    const { error: deleteQueryError } = await supabase.from('transactions').delete().eq('id', deleting.id)
    if (deleteQueryError) setDeleteError(deleteQueryError.message)
    else {
      setDeleting(null)
      await load()
    }
    setDeleteBusy(false)
  }
  const filtered = items.filter((t) => filter === 'All' || t.type === filter.toLowerCase())
  const downloadTransactions = () => {
    if (filtered.length === 0) return

    const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const rows = [
      ['Date', 'Description', 'Type', 'Category', 'Payment method', 'Amount'],
      ...filtered.map((t) => [
        t.date,
        t.merchant,
        t.type === 'income' ? 'Income' : 'Expense',
        t.category,
        t.method,
        t.amount.toFixed(2),
      ]),
    ]
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const scope = filter === 'All' ? 'Transactions' : `${filter}_Transactions`
    link.href = url
    link.download = `SoftSpend_${scope}_SSReport.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setExported(true)
    window.setTimeout(() => setExported(false), 2800)
  }
  return (
    <div>
      <PageHeader
        eyebrow="Money in motion"
        title="Transactions"
        text={liveData ? 'Your saved income and expenses.' : 'Every income and expense, all in one place.'}
        action={
          <button className="primary-button" onClick={() => setShowAdd(true)}>
            <Plus size={17} /> Add transaction
          </button>
        }
      />
      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input placeholder="Search transactions" />
        </div>
        <div className="filter-tabs">
          {['All', 'Expense', 'Income'].map((f) => (
            <button className={filter === f ? 'active' : ''} onClick={() => setFilter(f)} key={f}>
              {f}
            </button>
          ))}
        </div>
        <button className="filter-button">
          <SlidersHorizontal size={16} /> Filters
        </button>
        <button
          className="icon-button"
          aria-label="Download transactions report"
          title="Download transactions report"
          onClick={downloadTransactions}
          disabled={filtered.length === 0}
        >
          <Download size={17} />
        </button>
      </div>
      {error && <div className="data-error">Could not load transactions: {error}</div>}
      <div className="panel table-panel">
        <div className="table-head">
          <span>Date</span>
          <span>Description</span>
          <span>Category</span>
          <span>Payment method</span>
          <span>Amount</span>
          <span />
        </div>
        {loading ? (
          <div className="data-empty">Loading your transactions…</div>
        ) : filtered.length === 0 ? (
          <div className="data-empty">No transactions yet. Add your first one to get started.</div>
        ) : (
          filtered.map((t) => (
            <div className="table-row" key={t.id}>
              <span>{t.date}</span>
              <span className="table-description">
                <div className="transaction-icon" style={{ background: t.color }}>
                  {t.type === 'income' ? <WalletCards size={16} /> : <ShoppingBag size={16} />}
                </div>
                <strong>{t.merchant}</strong>
              </span>
              <span className="category-chip">{t.category}</span>
              <span>{t.method}</span>
              <strong className={t.type === 'income' ? 'income-text' : ''}>
                {t.type === 'income' ? '+' : '-'}
                {money(t.amount)}
              </strong>
              <RowActions label={t.merchant} onEdit={() => setEditing(t)} onDelete={() => setDeleting(t)} />
            </div>
          ))
        )}
      </div>
      {showAdd && <AddTransaction liveData={liveData} onClose={() => setShowAdd(false)} onSaved={load} />}
      {editing && (
        <AddTransaction liveData={liveData} initial={editing} onClose={() => setEditing(null)} onSaved={load} />
      )}
      {deleting && (
        <ConfirmDeleteDialog
          itemLabel="transaction"
          onClose={() => {
            setDeleting(null)
            setDeleteError('')
          }}
          onConfirm={removeTransaction}
          busy={deleteBusy}
          error={deleteError}
        />
      )}
      {exported && <div className="toast"><Download size={16} /> Transactions report downloaded.</div>}
    </div>
  )
}
const EXPENSE_CATEGORY_NAMES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Housing',
  'Subscriptions',
  'Health & Wellness',
  'Other expense',
]
const INCOME_CATEGORY_NAMES = ['Salary', 'Freelance', 'Business', 'Investments', 'Gifts', 'Other income']

function AddTransaction({
  onClose,
  onSaved,
  liveData,
  initial,
}: {
  onClose: () => void
  onSaved?: () => void
  liveData?: boolean
  initial?: any
}) {
  const [visibility, setVisibility] = useState<'shared' | 'personal'>(initial?.visibility || 'personal')
  const [type, setType] = useState<'expense' | 'income'>(initial?.type || 'expense')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category || EXPENSE_CATEGORY_NAMES[0])
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [categoryOptions, setCategoryOptions] = useState(EXPENSE_CATEGORY_NAMES.map((name) => ({ id: '', name })))
  const [budgetId, setBudgetId] = useState(initial?.budgetId || '')
  const [budgetOptions, setBudgetOptions] = useState<any[]>([])
  const [budgetLoading, setBudgetLoading] = useState(false)
  const [date, setDate] = useState(initial?.rawDate || new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState(initial?.merchant || '')
  const [method, setMethod] = useState(initial?.method || 'Debit Card')
  const [householdId, setHouseholdId] = useState(initial?.householdId || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!liveData) return
    loadCurrentHousehold()
      .then(({ household }) => setHouseholdId(household?.id || ''))
      .catch(() => setHouseholdId(''))
  }, [liveData])

  useEffect(() => {
    const defaults = type === 'income' ? INCOME_CATEGORY_NAMES : EXPENSE_CATEGORY_NAMES
    setCategory(initial?.category || defaults[0])
    setCategoryId(initial?.categoryId || '')
    if (!liveData) {
      setCategoryOptions(defaults.map((name) => ({ id: '', name })))
      return
    }
    let active = true
    supabase
      .from('categories')
      .select('id,name')
      .eq('type', type)
      .order('name')
      .then(({ data, error: queryError }) => {
        if (!active) return
        const savedOptions = queryError ? [] : data || []
        const optionsByName = new Map(savedOptions.map((option) => [option.name, option]))
        const combinedOptions = [
          ...savedOptions,
          ...defaults.filter((name) => !optionsByName.has(name)).map((name) => ({ id: '', name })),
        ]
        setCategoryOptions(combinedOptions)
        const selected = combinedOptions.find(
          (option) => option.id === initial?.categoryId || option.name === initial?.category,
        )
        setCategory(selected?.name || combinedOptions[0]?.name || defaults[0])
        setCategoryId(selected?.id || combinedOptions[0]?.id || '')
      })
    return () => {
      active = false
    }
  }, [type, liveData])

  useEffect(() => {
    if (!liveData || type !== 'expense' || !categoryId) {
      setBudgetOptions([])
      setBudgetId('')
      return
    }
    const [year, month] = date.split('-').map(Number)
    let active = true
    setBudgetLoading(true)
    supabase
      .from('budgets')
      .select('id,name,budget_amount,month,year,category_id')
      .eq('category_id', categoryId)
      .eq('month', month)
      .eq('year', year)
      .order('name')
      .then(({ data, error: queryError }) => {
        if (!active) return
        const options = queryError ? [] : data || []
        setBudgetOptions(options)
        setBudgetId((current) => (current && options.some((option) => option.id === current) ? current : ''))
        setBudgetLoading(false)
      })
    return () => {
      active = false
    }
  }, [categoryId, date, liveData, type])

  const save = async () => {
    if (!liveData) {
      onClose()
      return
    }
    const amountValue = Number(amount.replace(/,/g, ''))
    if (!amountValue || amountValue < 0) {
      setError('Enter a valid amount.')
      return
    }
    if (!description.trim()) {
      setError('Add a description for this transaction.')
      return
    }
    setSaving(true)
    setError('')
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Your session has expired. Please log in again.')
      setSaving(false)
      return
    }
    if (visibility === 'shared') {
      if (!householdId) {
        setError('Create a household first from the Household page before sharing this transaction.')
        setSaving(false)
        return
      }
    }

    let selectedCategoryId = categoryId
    if (!selectedCategoryId) {
      const { data: existingCategory, error: lookupError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', category)
        .eq('type', type)
        .limit(1)
        .maybeSingle()
      if (lookupError) {
        setError(lookupError.message)
        setSaving(false)
        return
      }
      if (existingCategory?.id) selectedCategoryId = existingCategory.id
      else {
        const { data: createdCategory, error: createError } = await supabase
          .from('categories')
          .insert({ user_id: user.id, name: category, type, is_default: false })
          .select('id')
          .single()
        if (createError) {
          setError(createError.message)
          setSaving(false)
          return
        }
        selectedCategoryId = createdCategory.id
      }
    }

    const transactionPayload = {
      category_id: selectedCategoryId,
      budget_id: type === 'expense' ? budgetId || null : null,
      type,
      amount: amountValue,
      description: description.trim(),
      transaction_date: date,
      payment_method: method,
      visibility,
      household_id: visibility === 'shared' ? householdId : null,
    }
    const { error: transactionError } = initial
      ? await supabase.from('transactions').update(transactionPayload).eq('id', initial.id)
      : await supabase.from('transactions').insert({ ...transactionPayload, user_id: user.id, created_by: user.id })
    if (transactionError) {
      setError(transactionError.message)
      setSaving(false)
      return
    }
    onSaved?.()
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="section-eyebrow">New entry</span>
            <h2>{initial ? 'Edit transaction' : 'Add transaction'}</h2>
          </div>
          <button className="icon-button" onClick={() => onClose()}>
            <X size={18} />
          </button>
        </div>
        <div className="type-toggle">
          <button className={type === 'expense' ? 'active' : ''} onClick={() => setType('expense')}>
            Expense
          </button>
          <button className={type === 'income' ? 'active' : ''} onClick={() => setType('income')}>
            Income
          </button>
        </div>
        <label>
          Amount
          <div className="amount-input">
            <span>RM</span>
            <input autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
        </label>
        <div className="form-grid">
          <label>
            Category
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setCategoryId(categoryOptions.find((option) => option.name === e.target.value)?.id || '')
                setBudgetId('')
              }}
            >
              {categoryOptions.map((option) => (
                <option key={option.id || option.name}>{option.name}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        {liveData && type === 'expense' && (
          <label>
            Budget <small className="field-hint">Optional</small>
            <select
              value={budgetId}
              onChange={(e) => setBudgetId(e.target.value)}
              disabled={budgetLoading || !categoryId || !budgetOptions.length}
            >
              <option value="">
                {budgetLoading
                  ? 'Loading budgets…'
                  : budgetOptions.length
                    ? 'No budget selected'
                    : 'No budget for this category and month'}
              </option>
              {budgetOptions.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name} ({money(budget.budget_amount)} limit)
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Description
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              type === 'income' ? 'e.g. Monthly salary, freelance work...' : 'e.g. Groceries, dinner, coffee...'
            }
          />
        </label>
        <label>
          Payment method
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>Debit Card</option>
            <option>Cash</option>
            <option>Credit Card</option>
            <option>E-Wallet</option>
            <option>Online Banking</option>
            <option>IBG</option>
          </select>
        </label>
        <VisibilityToggle value={visibility} onChange={setVisibility} householdAvailable={Boolean(householdId)} />
        {error && <div className="data-error">{error}</div>}
        <button className="primary-button full" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Save changes' : `Save ${visibility} transaction`} <Check size={17} />
        </button>
      </div>
    </div>
  )
}

export { AddTransaction, TransactionsPage, mapLiveTransaction, TransactionRow }
