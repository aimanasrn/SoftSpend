import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type ProFeatureGateProps = {
  feature: string
  description: string
}

export function ProFeatureGate({ feature, description }: ProFeatureGateProps) {
  const navigate = useNavigate()

  return (
    <div className="pro-gate-page">
      <div className="pro-gate-card">
        <div className="pro-gate-icon"><LockKeyhole size={24} /></div>
        <span className="section-eyebrow">SoftSpend Pro</span>
        <h1>{feature} is part of Pro.</h1>
        <p>{description}</p>
        <div className="pro-gate-actions">
          <button className="primary-button" onClick={() => navigate('/app/settings')}>
            <Sparkles size={16} /> View Pro plan <ArrowRight size={16} />
          </button>
          <button className="ghost-button" onClick={() => navigate('/app/dashboard')}>
            Back to Dashboard
          </button>
        </div>
        <small>Free includes unlimited Dashboard, Budgets, and Transactions.</small>
      </div>
    </div>
  )
}
