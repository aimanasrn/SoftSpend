// @ts-nocheck
import { useEffect, useState } from 'react'
import { Check, MoreHorizontal, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { compactMoney, money } from '../../lib/format'
import { colors, ErrorBox, Header, Loading, Modal } from '../shared/LivePagePrimitives'
import { RowActions } from '../../components/data/RowActions'
import { ConfirmDeleteDialog } from '../shared/LivePagePrimitives'
import { loadCurrentHousehold } from '../../lib/household'
import { VisibilityToggle } from '../../components/data/VisibilityToggle'

const DEFAULT_BUDGET_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Housing',
  'Subscriptions',
  'Health & Wellness',
  'Other expense',
]

export function LiveBudgetsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleting, setDeleting] = useState<any>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const load = async () => {
    setLoading(true)
    const [{ data, error: e }, { data: txs }] = await Promise.all([
      supabase
        .from('budgets')
        .select('id,name,budget_amount,month,year,category_id,household_id,visibility,category:categories(id,name)')
        .order('year', { ascending: false })
        .order('month', { ascending: false }),
      supabase.from('transactions').select('budget_id,amount,type,transaction_date'),
    ])
    if (e) setError(e.message)
    const spent = (txs || [])
      .filter((x) => x.type === 'expense')
      .reduce((map, x) => {
        const date = new Date(`${x.transaction_date}T00:00:00`)
        if (!x.budget_id) return map
        const key = `${x.budget_id}:${date.getFullYear()}:${date.getMonth() + 1}`
        map[key] = (map[key] || 0) + Number(x.amount || 0)
        return map
      }, {})
    setRows(
      (data || []).map((x) => ({
        ...x,
        amount: Number(x.budget_amount || 0),
        spent: Number(spent[`${x.id}:${x.year}:${x.month}`] || 0),
        category: x.category?.name || x.name,
      })),
    )
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  const removeBudget = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError('')
    const { error: deleteQueryError } = await supabase.from('budgets').delete().eq('id', deleting.id)
    if (deleteQueryError) setDeleteError(deleteQueryError.message)
    else {
      setDeleting(null)
      await load()
    }
    setDeleteBusy(false)
  }
  const allocated = rows.reduce((s, x) => s + x.amount, 0)
  const spent = rows.reduce((s, x) => s + x.spent, 0)
  return (
    <div>
      <Header
        eyebrow="Plan with intention"
        title="Budgets"
        text="Your saved monthly spending plans."
        action={
          <button className="primary-button" onClick={() => setOpen(true)}>
            <Plus size={17} /> Create budget
          </button>
        }
      />
      <div className="budget-summary">
        <div>
          <span>Saved budget total</span>
          <strong>{compactMoney(allocated)}</strong>
          <small>{rows.length} categories</small>
        </div>
        <div>
          <span>Spent against budgets</span>
          <strong>{compactMoney(spent)}</strong>
          <small>{allocated ? Math.round((spent / allocated) * 100) : 0}% used</small>
        </div>
        <div>
          <span>Unallocated</span>
          <strong>{compactMoney(Math.max(allocated - spent, 0))}</strong>
          <small>Based on saved budgets</small>
        </div>
      </div>
      <Loading loading={loading} error={error} />
      {!loading && !error && !rows.length ? (
        <div className="panel data-empty">No budgets yet. Create your first monthly budget.</div>
      ) : (
        <div className="budget-list full-budget-list">
          {rows.map((row, index) => (
            <div className="budget-row" key={row.id}>
              <div className="budget-main">
                <span className="budget-color" style={{ background: colors[index % colors.length] }} />
                <div>
                  <strong>{row.name}</strong>
                  <span>
                    {row.category} · {money(row.spent)} of {money(row.amount)}
                  </span>
                </div>
              </div>
              <div className="budget-status">
                <span className={row.spent > row.amount ? 'over' : row.spent / row.amount > 0.7 ? 'near' : 'on'}>
                  {row.spent > row.amount
                    ? 'Over budget'
                    : row.spent / row.amount > 0.7
                      ? 'Approaching limit'
                      : 'On track'}
                </span>
                <b>{row.amount ? Math.round((row.spent / row.amount) * 100) : 0}%</b>
              </div>
              <div className="budget-progress">
                <i
                  style={{
                    width: `${Math.min(row.amount ? (row.spent / row.amount) * 100 : 0, 100)}%`,
                    background: colors[index % colors.length],
                  }}
                />
              </div>
              <RowActions label={row.name} onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />
            </div>
          ))}
        </div>
      )}
      {open && (
        <BudgetModal
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false)
            load()
          }}
        />
      )}
      {editing && (
        <BudgetModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
      {deleting && (
        <ConfirmDeleteDialog
          itemLabel="budget"
          onClose={() => {
            setDeleting(null)
            setDeleteError('')
          }}
          onConfirm={removeBudget}
          busy={deleteBusy}
          error={deleteError}
        />
      )}
    </div>
  )
}
function BudgetModal({ onClose, onSaved, initial }: { onClose: () => void; onSaved: () => void; initial?: any }) {
  const [name, setName] = useState(initial?.name || '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [categoryName, setCategoryName] = useState(initial?.category?.name || '')
  const [categoryId, setCategoryId] = useState(initial?.category_id || '')
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_BUDGET_CATEGORIES.map((name) => ({ id: '', name })))
  const [visibility, setVisibility] = useState<'shared' | 'personal'>(initial?.visibility || 'personal')
  const [householdId, setHouseholdId] = useState(initial?.household_id || '')
  const [error, setError] = useState('')
  useEffect(() => {
    loadCurrentHousehold().then(({ household }) => setHouseholdId(household?.id || ''))
  }, [])
  useEffect(() => {
    let active = true
    supabase
      .from('categories')
      .select('id,name')
      .eq('type', 'expense')
      .order('name')
      .then(({ data, error: queryError }) => {
        if (!active) return
        const savedOptions = queryError ? [] : data || []
        const savedNames = new Set(savedOptions.map((option) => option.name))
        const combinedOptions = [
          ...savedOptions,
          ...DEFAULT_BUDGET_CATEGORIES.filter((name) => !savedNames.has(name)).map((name) => ({ id: '', name })),
        ]
        setCategoryOptions(combinedOptions)
        const selected = combinedOptions.find(
          (option) => option.id === initial?.category_id || option.name === initial?.category?.name,
        )
        setCategoryName(selected?.name || combinedOptions[0]?.name || '')
        setCategoryId(selected?.id || '')
      })
    return () => {
      active = false
    }
  }, [initial])
  const save = async () => {
    const value = Number(amount)
    if (!name.trim() || !value || !categoryName) {
      setError('Enter a budget name, category, and amount.')
      return
    }
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Your session has expired.')
      return
    }
    if (visibility === 'shared' && !householdId) {
      setError('Create a household first from the Household page before sharing this budget.')
      return
    }
    let selectedCategoryId = categoryId
    if (!selectedCategoryId) {
      const { data: existingCategory, error: lookupError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', categoryName)
        .eq('type', 'expense')
        .limit(1)
        .maybeSingle()
      if (lookupError) {
        setError(lookupError.message)
        return
      }
      if (existingCategory?.id) selectedCategoryId = existingCategory.id
      else {
        const { data: createdCategory, error: createError } = await supabase
          .from('categories')
          .insert({ user_id: user.id, name: categoryName, type: 'expense', is_default: false })
          .select('id')
          .single()
        if (createError) {
          setError(createError.message)
          return
        }
        selectedCategoryId = createdCategory.id
      }
    }
    const now = new Date()
    const payload = {
      name: name.trim(),
      budget_amount: value,
      category_id: selectedCategoryId,
      visibility,
      household_id: visibility === 'shared' ? householdId : null,
    }
    const { error: e } = initial
      ? await supabase.from('budgets').update(payload).eq('id', initial.id)
      : await supabase.from('budgets').insert({
          user_id: user.id,
          ...payload,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          created_by: user.id,
        })
    if (e) setError(e.message)
    else onSaved()
  }
  return (
    <Modal title={initial ? 'Edit budget' : 'Create budget'} onClose={onClose}>
      <label>
        Category
        <select
          value={categoryName}
          onChange={(e) => {
            setCategoryName(e.target.value)
            setCategoryId(categoryOptions.find((option) => option.name === e.target.value)?.id || '')
          }}
        >
          {categoryOptions.map((option) => (
            <option key={option.id || option.name}>{option.name}</option>
          ))}
        </select>
      </label>
      <label>
        Budget name
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Food & Dining" />
      </label>
      <label>
        Monthly amount
        <div className="amount-input">
          <span>RM</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>
      </label>
      <VisibilityToggle value={visibility} onChange={setVisibility} householdAvailable={Boolean(householdId)} />
      <ErrorBox>{error}</ErrorBox>
      <button className="primary-button full" onClick={save}>
        {initial ? 'Save changes' : 'Save budget'} <Check size={17} />
      </button>
    </Modal>
  )
}
