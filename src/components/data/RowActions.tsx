import React, { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import './actions.css'

type ExtraAction = {
  label: string
  onClick: () => void
  tone?: 'default' | 'success'
}

export function RowActions({
  label = 'row',
  onEdit,
  onDelete,
  extraActions = [],
}: {
  label?: string
  onEdit: () => void
  onDelete: () => void
  extraActions?: ExtraAction[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const choose = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <div className="row-actions" ref={ref}>
      <button
        className="more-button"
        aria-label={`More actions for ${label}`}
        title="More actions"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={17} />
      </button>
      {open && (
        <div className="row-actions-menu" role="menu">
          {extraActions.map((action) => (
            <button
              key={action.label}
              role="menuitem"
              className={action.tone === 'success' ? 'success-action' : ''}
              onClick={() => choose(action.onClick)}
            >
              {action.label}
            </button>
          ))}
          <button role="menuitem" onClick={() => choose(onEdit)}>
            <Pencil size={14} /> Edit
          </button>
          <button role="menuitem" className="danger-action" onClick={() => choose(onDelete)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
