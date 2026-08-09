// @ts-nocheck
import { useEffect, useState } from 'react'
import { Check, MoreHorizontal, Plus, Target } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { compactMoney, money } from '../../lib/format'
import { colors, ErrorBox, Header, Loading, Modal } from '../shared/LivePagePrimitives'
import { RowActions } from '../../components/data/RowActions'
import { ConfirmDeleteDialog } from '../shared/LivePagePrimitives'
import { loadCurrentHousehold } from '../../lib/household'
import { VisibilityToggle } from '../../components/data/VisibilityToggle'

export function LiveGoalsPage() {
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
      .from('savings_goals')
      .select('id,name,description,target_amount,current_amount,target_date,status,household_id,visibility')
      .order('created_at', { ascending: false })
    if (e) setError(e.message)
    else
      setRows(
        (data || []).map((x) => ({
          ...x,
          target_amount: Number(x.target_amount || 0),
          current_amount: Number(x.current_amount || 0),
        })),
      )
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  const removeGoal = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError('')
    const { error: deleteQueryError } = await supabase.from('savings_goals').delete().eq('id', deleting.id)
    if (deleteQueryError) setDeleteError(deleteQueryError.message)
    else {
      setDeleting(null)
      await load()
    }
    setDeleteBusy(false)
  }
  const saved = rows.reduce((s, x) => s + x.current_amount, 0)
  const target = rows.reduce((s, x) => s + x.target_amount, 0)
  return (
    <div>
      <Header
        eyebrow="Make room for what matters"
        title="Savings goals"
        text="Your saved goals and progress."
        action={
          <button className="primary-button" onClick={() => setOpen(true)}>
            <Plus size={17} /> Create goal
          </button>
        }
      />
      <div className="goals-overview">
        <div className="goals-total">
          <span>Saved across goals</span>
          <strong>{compactMoney(saved)}</strong>
          <small>{compactMoney(target)} total target</small>
          <div className="goal-bar">
            <i style={{ width: `${target ? Math.min((saved / target) * 100, 100) : 0}%` }} />
          </div>
        </div>
        <div className="projection">
          <Target size={19} />
          <div>
            <span>Active goals</span>
            <strong>{rows.filter((x) => x.status === 'active').length}</strong>
            <small>Saved from your account</small>
          </div>
        </div>
      </div>
      <Loading loading={loading} error={error} />
      {!loading && !error && !rows.length ? (
        <div className="panel data-empty">No savings goals yet. Create your first goal.</div>
      ) : (
        <div className="goal-card-grid">
          {rows.map((goal, index) => {
            const pct = goal.target_amount ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0
            return (
              <div className="goal-card" key={goal.id}>
                <div className="goal-card-top">
                  <div className="goal-card-icon" style={{ background: colors[index % colors.length] }}>
                    <Target size={20} />
                  </div>
                  <RowActions label={goal.name} onEdit={() => setEditing(goal)} onDelete={() => setDeleting(goal)} />
                </div>
                <h3>{goal.name}</h3>
                <p>{goal.description || 'Keep moving toward this goal.'}</p>
                <div className="goal-amounts">
                  <strong>{money(goal.current_amount)}</strong>
                  <span>of {money(goal.target_amount)}</span>
                </div>
                <div className="goal-bar large">
                  <i style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="goal-foot">
                  <span>{pct}% complete</span>
                  <b>{goal.target_date ? dateLabel(goal.target_date) : 'No target date'}</b>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {open && (
        <GoalModal
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false)
            load()
          }}
        />
      )}
      {editing && (
        <GoalModal
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
          itemLabel="savings goal"
          onClose={() => {
            setDeleting(null)
            setDeleteError('')
          }}
          onConfirm={removeGoal}
          busy={deleteBusy}
          error={deleteError}
        />
      )}
    </div>
  )
}
function GoalModal({ onClose, onSaved, initial }: { onClose: () => void; onSaved: () => void; initial?: any }) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [target, setTarget] = useState(initial ? String(initial.target_amount) : '')
  const [date, setDate] = useState(initial?.target_date || '')
  const [visibility, setVisibility] = useState<'shared' | 'personal'>(initial?.visibility || 'personal')
  const [householdId, setHouseholdId] = useState(initial?.household_id || '')
  const [error, setError] = useState('')
  useEffect(() => {
    loadCurrentHousehold().then(({ household }) => setHouseholdId(household?.id || ''))
  }, [])
  const save = async () => {
    const value = Number(target)
    if (!name.trim() || !value) {
      setError('Enter a goal name and target amount.')
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
      setError('Create a household first from the Household page before sharing this goal.')
      return
    }
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      target_amount: value,
      target_date: date || null,
      visibility,
      household_id: visibility === 'shared' ? householdId : null,
    }
    const { error: e } = initial
      ? await supabase.from('savings_goals').update(payload).eq('id', initial.id)
      : await supabase.from('savings_goals').insert({
          user_id: user.id,
          created_by: user.id,
          ...payload,
          current_amount: 0,
          status: 'active',
        })
    if (e) setError(e.message)
    else onSaved()
  }
  return (
    <Modal title={initial ? 'Edit savings goal' : 'Create savings goal'} onClose={onClose}>
      <label>
        Goal name
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emergency fund" />
      </label>
      <label>
        Description
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you saving for?"
        />
      </label>
      <label>
        Target amount
        <div className="amount-input">
          <span>RM</span>
          <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0.00" />
        </div>
      </label>
      <label>
        Target date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <VisibilityToggle value={visibility} onChange={setVisibility} householdAvailable={Boolean(householdId)} />
      <ErrorBox>{error}</ErrorBox>
      <button className="primary-button full" onClick={save}>
        {initial ? 'Save changes' : 'Save goal'} <Check size={17} />
      </button>
    </Modal>
  )
}
