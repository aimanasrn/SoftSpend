// @ts-nocheck
import React from 'react'
import { X } from 'lucide-react'

const money = (value: number) =>
  `RM ${Number(value || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const compactMoney = (value: number) => `RM ${Number(value || 0).toLocaleString('en-MY', { maximumFractionDigits: 0 })}`
const today = () => new Date().toISOString().slice(0, 10)
const dateLabel = (value: string) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : '—'
const colors = ['#9389ff', '#f2a9be', '#f4d68d', '#9dceff', '#bdebd8', '#d8c8ff']

function Header({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string
  title: string
  text: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        <span className="section-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action && <div className="page-header-actions">{action}</div>}
    </div>
  )
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="section-eyebrow">Saved to Supabase</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
function ErrorBox({ children }: { children: React.ReactNode }) {
  return children ? <div className="data-error">{children}</div> : null
}
function Loading({ loading, error }: { loading: boolean; error: string }) {
  if (loading) return <div className="data-empty">Loading your data…</div>
  if (error) return <ErrorBox>Could not load data: {error}</ErrorBox>
  return null
}

export function ConfirmDeleteDialog({
  itemLabel,
  onClose,
  onConfirm,
  busy = false,
  error = '',
}: {
  itemLabel: string
  onClose: () => void
  onConfirm: () => void
  busy?: boolean
  error?: string
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal confirm-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="section-eyebrow">Please confirm</span>
            <h2>Delete {itemLabel}?</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="confirm-copy">
          This action cannot be undone. The saved {itemLabel.toLowerCase()} will be permanently removed.
        </p>
        {error && <div className="data-error">{error}</div>}
        <div className="modal-actions">
          <button className="ghost-button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="danger-button" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export { colors, dateLabel, ErrorBox, Header, Loading, Modal, today }
