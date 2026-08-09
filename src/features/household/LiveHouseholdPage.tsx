// @ts-nocheck
import { useEffect, useState } from 'react'
import { Check, Copy, Link2, Mail, ShieldCheck, UserPlus, Users, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { createHousehold, loadCurrentHousehold } from '../../lib/household'
import { ErrorBox, Header, Loading } from '../shared/LivePagePrimitives'
import './household.css'

const compactMoney = (value: number) => `RM ${Number(value || 0).toLocaleString('en-MY', { maximumFractionDigits: 0 })}`

const tokenHash = async (token: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

const inviteToken = () => {
  const values = new Uint8Array(24)
  crypto.getRandomValues(values)
  return Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('')
}

export function LiveHouseholdPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [household, setHousehold] = useState<any>(null)
  const [membership, setMembership] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [incomingInvites, setIncomingInvites] = useState<any[]>([])
  const [sharedSpent, setSharedSpent] = useState(0)
  const [sharedIncome, setSharedIncome] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const current = await loadCurrentHousehold()
      setHousehold(current.household)
      setMembership(current.membership)
      const { data: incoming, error: incomingError } = await supabase.rpc('get_my_household_invites')
      if (incomingError) throw incomingError
      setIncomingInvites(incoming || [])
      if (!current.household) {
        setMembers([])
        setInvites([])
        setSharedSpent(0)
        setSharedIncome(0)
        return
      }

      const [membersResult, invitesResult, transactionsResult] = await Promise.all([
        supabase
          .from('household_members')
          .select('id,household_id,user_id,role,status,display_name,email,joined_at')
          .eq('household_id', current.household.id)
          .eq('status', 'active')
          .order('joined_at'),
        current.membership?.role === 'owner'
          ? supabase
              .from('household_invites')
              .select('id,email,role,expires_at,created_at')
              .eq('household_id', current.household.id)
              .is('accepted_at', null)
              .order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('transactions')
          .select('amount,type,transaction_date')
          .eq('household_id', current.household.id)
          .eq('visibility', 'shared'),
      ])
      if (membersResult.error) throw membersResult.error
      if (invitesResult.error) throw invitesResult.error
      if (transactionsResult.error) throw transactionsResult.error
      setMembers(membersResult.data || [])
      setInvites(invitesResult.data || [])
      setSharedSpent(
        (transactionsResult.data || []).reduce(
          (total, transaction) => total + (transaction.type === 'expense' ? Number(transaction.amount || 0) : 0),
          0,
        ),
      )
      setSharedIncome(
        (transactionsResult.data || []).reduce(
          (total, transaction) => total + (transaction.type === 'income' ? Number(transaction.amount || 0) : 0),
          0,
        ),
      )
    } catch (loadError: any) {
      setError(loadError.message || 'Could not load your household.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('invite')
    if (!token) return
    let active = true
    const acceptInvite = async () => {
      const { error: acceptError } = await supabase.rpc('accept_household_invite', { invite_token: token })
      if (!active) return
      if (acceptError) setError(acceptError.message)
      else setNotice('You joined the household successfully.')
      navigate('/app/household', { replace: true })
      load()
    }
    acceptInvite()
    return () => {
      active = false
    }
  }, [location.search])

  const sendInvite = async () => {
    const email = inviteEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      setInviteError('Enter a valid email address.')
      return
    }
    if (!household) {
      setInviteError('Create a household before inviting someone.')
      return
    }
    setInviteBusy(true)
    setInviteError('')
    const token = inviteToken()
    const hash = await tokenHash(token)
    const { data: invite, error: insertError } = await supabase
      .from('household_invites')
      .insert({ household_id: household.id, invited_by: membership?.user_id, email, role: 'member', token_hash: hash })
      .select('id')
      .single()
    if (insertError) {
      setInviteError(insertError.message)
      setInviteBusy(false)
      return
    }

    const redirectTo = `${window.location.origin}/app/household?invite=${token}`
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    if (emailError) {
      await supabase.from('household_invites').delete().eq('id', invite.id)
      setInviteError(emailError.message)
    } else {
      setInviteLink(redirectTo)
      setNotice(`Invitation sent to ${email}.`)
      await load()
    }
    setInviteBusy(false)
  }

  const copyInvite = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setNotice('Invite link copied.')
  }

  const acceptIncomingInvite = async (inviteId: string) => {
    setError('')
    const { error: acceptError } = await supabase.rpc('accept_household_invite_by_id', {
      target_invite_id: inviteId,
    })
    if (acceptError) setError(acceptError.message)
    else {
      setNotice('You joined the household successfully.')
      await load()
    }
  }

  const memberCount = members.length
  const owner = members.find((member) => member.role === 'owner')
  const isOwner = membership?.role === 'owner'
  const sharedPercent = sharedIncome ? Math.min(100, Math.round((sharedSpent / sharedIncome) * 100)) : 0

  return (
    <div className="household-page">
      <Header
        eyebrow="Money works better together"
        title="Household"
        text="Share the right things with the people who matter."
        action={
          household && isOwner ? (
            <button className="primary-button" onClick={() => setInviteOpen(true)}>
              <UserPlus size={17} /> Invite spouse
            </button>
          ) : undefined
        }
      />
      <Loading loading={loading} error={error} />
      {notice && (
        <div className="household-notice">
          <Check size={16} /> {notice}
          <button aria-label="Dismiss notification" onClick={() => setNotice('')}>
            <X size={15} />
          </button>
        </div>
      )}
      {incomingInvites.length > 0 && (
        <div className="household-invite-banner">
          <Mail size={18} />
          <div>
            <strong>You have a household invitation</strong>
            <span>
              {incomingInvites[0].household_name} · invited for {incomingInvites[0].email}
            </span>
          </div>
          <button className="primary-button small" onClick={() => acceptIncomingInvite(incomingInvites[0].id)}>
            Accept invitation
          </button>
        </div>
      )}
      {!loading && !household ? (
        <div className="panel household-empty">
          <div className="household-empty-icon">
            <Users size={25} />
          </div>
          <span className="section-eyebrow">Private by default</span>
          <h2>Create your family household</h2>
          <p>
            Create a shared space for you and your spouse. Your existing personal records remain private until you
            choose to share them.
          </p>
          <button
            className="primary-button"
            onClick={async () => {
              try {
                await createHousehold()
                setNotice('Your family household is ready.')
                await load()
              } catch (createError: any) {
                setError(createError.message || 'Could not create your household.')
              }
            }}
          >
            <PlusIcon /> Create household
          </button>
        </div>
      ) : (
        household && (
          <>
            <div className="household-hero">
              <div>
                <span className="section-eyebrow">{household.name}</span>
                <h2>A clearer money plan for two.</h2>
                <p>
                  Shared expenses, bills and goals stay visible to active household members. Personal items remain
                  private.
                </p>
                <div className="member-stack">
                  {members.slice(0, 3).map((member, index) => (
                    <span key={member.id} className={`member-avatar ${index > 0 ? 'partner' : ''}`}>
                      {initials(member.display_name || member.email || 'Member')}
                    </span>
                  ))}
                  <span className="member-count">
                    {memberCount} active member{memberCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <div className="household-hero-metric">
                <span>Shared spent</span>
                <strong>{compactMoney(sharedSpent)}</strong>
                <small>{sharedPercent}% of shared income</small>
                <div className="goal-bar">
                  <i style={{ width: `${sharedPercent}%` }} />
                </div>
              </div>
            </div>
            <div className="household-grid">
              <div className="panel members-panel">
                <div className="panel-head">
                  <div>
                    <span className="section-eyebrow">People with access</span>
                    <h2>Household members</h2>
                  </div>
                  {isOwner && (
                    <button className="link-button" onClick={() => setInviteOpen(true)}>
                      Add member <UserPlus size={15} />
                    </button>
                  )}
                </div>
                {members.map((member) => (
                  <div className="member-row" key={member.id}>
                    <div className={`member-avatar ${member.role === 'owner' ? '' : 'partner'}`}>
                      {initials(member.display_name || member.email || 'Member')}
                    </div>
                    <div>
                      <strong>
                        {member.user_id === owner?.user_id
                          ? `${member.display_name || 'You'} · You`
                          : member.display_name || 'Household member'}
                      </strong>
                      <span>
                        {member.email || 'Active household member'} · Joined {dateLabel(member.joined_at)}
                      </span>
                    </div>
                    <span className={`role-pill ${member.role === 'owner' ? 'owner' : ''}`}>{member.role}</span>
                  </div>
                ))}
                {invites.map((invite) => (
                  <div className="member-row pending-member" key={invite.id}>
                    <div className="member-avatar pending">
                      <Mail size={15} />
                    </div>
                    <div>
                      <strong>{invite.email}</strong>
                      <span>Invitation pending · Expires {dateLabel(invite.expires_at)}</span>
                    </div>
                    <span className="role-pill">Pending</span>
                  </div>
                ))}
                {isOwner && (
                  <button className="invite-row" onClick={() => setInviteOpen(true)}>
                    <span>
                      <UserPlus size={16} />
                    </span>{' '}
                    Invite another household member <Link2 size={15} />
                  </button>
                )}
              </div>
              <div className="panel privacy-panel">
                <div className="panel-head">
                  <div>
                    <span className="section-eyebrow">Your default</span>
                    <h2>Sharing rules</h2>
                  </div>
                  <ShieldCheck size={18} className="privacy-check" />
                </div>
                <div className="privacy-option active">
                  <div>
                    <strong>Shared items</strong>
                    <span>Visible to active household members</span>
                  </div>
                  <span className="radio-dot" />
                </div>
                <div className="privacy-option">
                  <div>
                    <strong>Personal items</strong>
                    <span>Only visible to the person who added them</span>
                  </div>
                  <span className="radio-dot" />
                </div>
                <p className="privacy-note">
                  Choose Shared when adding a transaction, bill, budget or goal. Personal is always the safe default.
                </p>
              </div>
            </div>
          </>
        )
      )}
      {inviteOpen && (
        <div className="overlay" onClick={() => setInviteOpen(false)}>
          <div className="modal invite-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="section-eyebrow">Build your household</span>
                <h2>Invite your spouse</h2>
              </div>
              <button className="icon-button" onClick={() => setInviteOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {!inviteLink ? (
              <>
                <p className="invite-intro">
                  We’ll send a secure sign-in link to your spouse. They can join this household after signing in with
                  the invited email.
                </p>
                <label>
                  Email address
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="spouse@example.com"
                  />
                </label>
                {inviteError && <ErrorBox>{inviteError}</ErrorBox>}
                <div className="modal-actions">
                  <button className="ghost-button" onClick={() => setInviteOpen(false)}>
                    Cancel
                  </button>
                  <button className="primary-button" disabled={inviteBusy} onClick={sendInvite}>
                    {inviteBusy ? 'Sending…' : 'Send invitation'} <Mail size={15} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="invite-success">
                  <Check size={20} />
                  <div>
                    <strong>Invitation sent</strong>
                    <span>Ask your spouse to check their email. The link expires in 7 days.</span>
                  </div>
                </div>
                <label>
                  Invite link
                  <input readOnly value={inviteLink} />
                </label>
                <div className="modal-actions">
                  <button
                    className="ghost-button"
                    onClick={() => {
                      setInviteLink('')
                      setInviteEmail('')
                    }}
                  >
                    Invite another
                  </button>
                  <button className="primary-button" onClick={copyInvite}>
                    <Copy size={15} /> Copy link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function dateLabel(value?: string | null) {
  if (!value) return 'today'
  return new Date(value).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PlusIcon() {
  return (
    <span aria-hidden="true" style={{ fontSize: 17, lineHeight: 1 }}>
      +
    </span>
  )
}
