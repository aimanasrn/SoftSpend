// @ts-nocheck
import React, { useState } from 'react'
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  MoreHorizontal,
  ShieldCheck,
  ShoppingBag,
  Target,
  UserPlus,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { PageHeader } from '../../components/layout/AppShell'

function HouseholdPage() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [space, setSpace] = useState<'personal' | 'family'>('family')
  const sendInvite = () => {
    setInviteOpen(false)
    setInviteSent(true)
    setTimeout(() => setInviteSent(false), 3200)
  }
  return (
    <div className="household-page">
      <PageHeader
        eyebrow="Money works better together"
        title="Household"
        text="Share the right things with the people who matter."
        action={
          <button className="primary-button" onClick={() => setInviteOpen(true)}>
            <UserPlus size={17} /> Invite spouse
          </button>
        }
      />
      <div className="workspace-switcher">
        <button className={space === 'personal' ? 'active' : ''} onClick={() => setSpace('personal')}>
          <UserRound size={16} />
          <span>
            <strong>Personal</strong>
            <small>Only you</small>
          </span>
        </button>
        <button className={space === 'family' ? 'active' : ''} onClick={() => setSpace('family')}>
          <Users size={16} />
          <span>
            <strong>Family household</strong>
            <small>2 members · shared view</small>
          </span>
          <ShieldCheck size={16} />
        </button>
      </div>
      <div className="household-hero">
        <div>
          <span className="section-eyebrow">Family workspace</span>
          <h2>A clearer money plan for two.</h2>
          <p>Shared expenses, bills and goals stay visible to both of you. Personal items remain private by default.</p>
          <div className="member-stack">
            <span className="member-avatar">AS</span>
            <span className="member-avatar partner">NS</span>
            <span className="member-count">2 members</span>
          </div>
        </div>
        <div className="household-hero-metric">
          <span>Shared spent this month</span>
          <strong>RM 1,420</strong>
          <small>31.6% of shared income</small>
          <div className="goal-bar">
            <i style={{ width: '32%' }} />
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
            <button className="link-button" onClick={() => setInviteOpen(true)}>
              Add member <UserPlus size={15} />
            </button>
          </div>
          <div className="member-row">
            <div className="member-avatar">AS</div>
            <div>
              <strong>Aiman Salleh</strong>
              <span>aiman@softspend.app · You</span>
            </div>
            <span className="role-pill owner">Owner</span>
          </div>
          <div className="member-row">
            <div className="member-avatar partner">NS</div>
            <div>
              <strong>Nur Salleh</strong>
              <span>nur@softspend.app · Joined today</span>
            </div>
            <span className="role-pill">Member</span>
            <button className="more-button">
              <MoreHorizontal size={17} />
            </button>
          </div>
          <button className="invite-row" onClick={() => setInviteOpen(true)}>
            <span>
              <UserPlus size={16} />
            </span>{' '}
            Invite another household member <ChevronRight size={15} />
          </button>
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
              <span>Visible to everyone in this household</span>
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
            You can choose the visibility of each expense, bill, budget or goal when you add it.
          </p>
        </div>
      </div>
      <div className="section-row-head">
        <div>
          <span className="section-eyebrow">What you share</span>
          <h2>Shared household activity</h2>
        </div>
        <button className="link-button">
          View activity <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="shared-activity">
        <div className="shared-activity-row">
          <div className="shared-icon mint">
            <WalletCards size={17} />
          </div>
          <div>
            <strong>Rent budget</strong>
            <span>Shared by Aiman · Updated today</span>
          </div>
          <b>RM 1,200</b>
          <span className="visibility-tag">
            <Users size={12} /> Shared
          </span>
        </div>
        <div className="shared-activity-row">
          <div className="shared-icon peach">
            <ShoppingBag size={17} />
          </div>
          <div>
            <strong>Groceries at Village Grocer</strong>
            <span>Shared by Nur · Aug 08</span>
          </div>
          <b>RM 186.40</b>
          <span className="visibility-tag">
            <Users size={12} /> Shared
          </span>
        </div>
        <div className="shared-activity-row">
          <div className="shared-icon lavender">
            <Target size={17} />
          </div>
          <div>
            <strong>Emergency Fund</strong>
            <span>Shared goal · 42% complete</span>
          </div>
          <b>RM 4,200</b>
          <span className="visibility-tag">
            <Users size={12} /> Shared
          </span>
        </div>
      </div>
      {inviteOpen && <InviteMemberModal onClose={() => setInviteOpen(false)} onSend={sendInvite} />}{' '}
      {inviteSent && (
        <div className="toast">
          <Check size={16} /> Invitation sent to your spouse.
        </div>
      )}
    </div>
  )
}
function InviteMemberModal({ onClose, onSend }: { onClose: () => void; onSend: () => void }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="section-eyebrow">Grow your household</span>
            <h2>Invite a spouse</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <p className="invite-intro">
          They will receive a secure invitation to join your Family household. Their personal items will remain private.
        </p>
        <label>
          Email address
          <input autoFocus type="email" placeholder="spouse@example.com" defaultValue="nur@softspend.app" />
        </label>
        <label>
          Role
          <select defaultValue="member">
            <option value="member">Member · can add and edit shared items</option>
            <option value="viewer">Viewer · can view shared items</option>
          </select>
        </label>
        <div className="invite-permissions">
          <ShieldCheck size={17} />
          <span>Only active household members can access shared financial records.</span>
        </div>
        <button className="primary-button full" onClick={onSend}>
          Send invitation <UserPlus size={17} />
        </button>
      </div>
    </div>
  )
}

export { HouseholdPage, InviteMemberModal }
