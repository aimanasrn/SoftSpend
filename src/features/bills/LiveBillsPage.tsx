// @ts-nocheck
import { useEffect, useState } from 'react'
import { Check, MoreHorizontal, Plus, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { compactMoney, money } from '../../lib/format'
import { dateLabel, ErrorBox, Header, Loading, Modal, today } from '../shared/LivePagePrimitives'
import { RowActions } from '../../components/data/RowActions'
import { ConfirmDeleteDialog } from '../shared/LivePagePrimitives'
import { loadCurrentHousehold } from '../../lib/household'
import { VisibilityToggle } from '../../components/data/VisibilityToggle'

export function LiveBillsPage() {
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
    const { data, error: e } = await supabase
      .from('bills')
      .select('id,name,amount,due_date,status,household_id,visibility')
      .order('due_date')
    if (e) setError(e.message)
    else setRows((data || []).map((x) => ({ ...x, amount: Number(x.amount || 0) })))
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  const markPaid = async (id: string) => {
    await supabase.from('bills').update({ status: 'paid', payment_date: today() }).eq('id', id)
    load()
  }
  const removeBill = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError('')
    const { error: deleteQueryError } = await supabase.from('bills').delete().eq('id', deleting.id)
    if (deleteQueryError) setDeleteError(deleteQueryError.message)
    else {
      setDeleting(null)
      await load()
    }
    setDeleteBusy(false)
  }
  const due = rows.filter((x) => x.status !== 'paid').reduce((s, x) => s + x.amount, 0)
  const paid = rows.filter((x) => x.status === 'paid').reduce((s, x) => s + x.amount, 0)
  return (
    <div>
      <Header
        eyebrow="Never miss a payment"
        title="Bills"
        text="Your saved upcoming and paid bills."
        action={
          <button className="primary-button" onClick={() => setOpen(true)}>
            <Plus size={17} /> Add bill
          </button>
        }
      />
      <div className="bill-stat-grid">
        <div className="bill-stat">
          <span>Due this month</span>
          <strong>{compactMoney(due)}</strong>
          <small>{rows.filter((x) => x.status !== 'paid').length} pending bills</small>
        </div>
        <div className="bill-stat mint">
          <span>Paid total</span>
          <strong>{compactMoney(paid)}</strong>
          <small>{rows.filter((x) => x.status === 'paid').length} paid bills</small>
        </div>
        <div className="bill-stat yellow">
          <span>Total bills</span>
          <strong>{rows.length}</strong>
          <small>Saved records</small>
        </div>
      </div>
      <Loading loading={loading} error={error} />
      {!loading && !error && !rows.length ? (
        <div className="panel data-empty">No bills yet. Add your first bill.</div>
      ) : (
        <div className="panel table-panel bills-table">
          <div className="table-head">
            <span>Bill</span>
            <span>Category</span>
            <span>Amount</span>
            <span>Due date</span>
            <span>Status</span>
            <span />
          </div>
          {rows.map((row) => (
            <div className="table-row" key={row.id}>
              <span className="table-description">
                <div className="transaction-icon" style={{ background: '#d8d0ff' }}>
                  <Zap size={16} />
                </div>
                <strong>{row.name}</strong>
              </span>
              <span>Bill</span>
              <strong>{money(row.amount)}</strong>
              <span>{dateLabel(row.due_date)}</span>
              <span className={`status-pill ${row.status === 'paid' ? 'paid' : 'pending'}`}>
                {row.status === 'paid' ? 'Paid' : 'Pending'}
              </span>
              <RowActions
                label={row.name}
                onEdit={() => setEditing(row)}
                onDelete={() => setDeleting(row)}
                extraActions={
                  row.status !== 'paid'
                    ? [{ label: 'Mark as paid', tone: 'success', onClick: () => markPaid(row.id) }]
                    : []
                }
              />
            </div>
          ))}
        </div>
      )}
      {open && (
        <BillModal
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false)
            load()
          }}
        />
      )}
      {editing && (
        <BillModal
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
          itemLabel="bill"
          onClose={() => {
            setDeleting(null)
            setDeleteError('')
          }}
          onConfirm={removeBill}
          busy={deleteBusy}
          error={deleteError}
        />
      )}
    </div>
  )
}
function BillModal({ onClose, onSaved, initial }: { onClose: () => void; onSaved: () => void; initial?: any }) {
  const [name, setName] = useState(initial?.name || '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [due, setDue] = useState(initial?.due_date || today())
  const [visibility, setVisibility] = useState<'shared' | 'personal'>(initial?.visibility || 'personal')
  const [householdId, setHouseholdId] = useState(initial?.household_id || '')
  const [error, setError] = useState('')
  useEffect(() => {
    loadCurrentHousehold().then(({ household }) => setHouseholdId(household?.id || ''))
  }, [])
  const save = async () => {
    const value = Number(amount)
    if (!name.trim() || !value) {
      setError('Enter a bill name and amount.')
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
      setError('Create a household first from the Household page before sharing this bill.')
      return
    }
    const payload = {
      name: name.trim(),
      amount: value,
      due_date: due,
      visibility,
      household_id: visibility === 'shared' ? householdId : null,
    }
    const { error: e } = initial
      ? await supabase.from('bills').update(payload).eq('id', initial.id)
      : await supabase.from('bills').insert({ user_id: user.id, created_by: user.id, ...payload, status: 'pending' })
    if (e) setError(e.message)
    else onSaved()
  }
  return (
    <Modal title={initial ? 'Edit bill' : 'Add bill'} onClose={onClose}>
      <label>
        Bill name
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Internet" />
      </label>
      <label>
        Amount
        <div className="amount-input">
          <span>RM</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>
      </label>
      <label>
        Due date
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      </label>
      <VisibilityToggle value={visibility} onChange={setVisibility} householdAvailable={Boolean(householdId)} />
      <ErrorBox>{error}</ErrorBox>
      <button className="primary-button full" onClick={save}>
        {initial ? 'Save changes' : 'Save bill'} <Check size={17} />
      </button>
    </Modal>
  )
}
