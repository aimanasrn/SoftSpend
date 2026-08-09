import { UserRound, Users } from 'lucide-react'

export function VisibilityToggle({
  value,
  onChange,
  householdAvailable,
}: {
  value: 'shared' | 'personal'
  onChange: (value: 'shared' | 'personal') => void
  householdAvailable: boolean
}) {
  return (
    <div className="visibility-field">
      <span>Who can see this?</span>
      <div className="visibility-toggle">
        <button
          type="button"
          className={value === 'shared' ? 'active' : ''}
          onClick={() => onChange('shared')}
          disabled={!householdAvailable}
        >
          <Users size={14} /> Shared with household
        </button>
        <button type="button" className={value === 'personal' ? 'active' : ''} onClick={() => onChange('personal')}>
          <UserRound size={14} /> Personal only
        </button>
      </div>
      {!householdAvailable && <small className="visibility-help">Create a household to share this item.</small>}
    </div>
  )
}
