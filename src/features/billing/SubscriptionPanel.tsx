import { useEffect, useState } from 'react'
import { Check, CreditCard, ExternalLink, LoaderCircle, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

type SubscriptionRecord = {
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
}

const proStatuses = new Set(['active', 'trialing'])

export function SubscriptionPanel() {
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadSubscription = async () => {
    setLoading(true)
    const { data, error: loadError } = await supabase
      .from('subscriptions')
      .select('status,current_period_end,cancel_at_period_end')
      .maybeSingle()
    if (loadError) setError(loadError.message)
    else setSubscription(data)
    setLoading(false)
  }

  useEffect(() => {
    void loadSubscription()
    const billingResult = new URLSearchParams(window.location.search).get('billing')
    if (billingResult === 'success') setNotice('Checkout completed. Your Pro status will appear as soon as Stripe confirms the subscription.')
    if (billingResult === 'cancelled') setNotice('Checkout was cancelled. No payment was taken.')
  }, [])

  const isPro = Boolean(subscription && proStatuses.has(subscription.status))
  const periodEnd = subscription?.current_period_end
    ? new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium' }).format(new Date(subscription.current_period_end))
    : null

  const openBilling = async (functionName: 'create-checkout-session' | 'create-portal-session') => {
    setWorking(true)
    setError('')
    setNotice('')
    const { data, error: functionError } = await supabase.functions.invoke(functionName, { body: {} })
    if (functionError || data?.error) {
      setError(data?.error || functionError?.message || 'Unable to open billing.')
      setWorking(false)
      return
    }
    if (!data?.url) {
      setError('The billing service did not return a checkout link.')
      setWorking(false)
      return
    }
    window.location.assign(data.url)
  }

  return (
    <div className="settings-section subscription-section">
      <div className="subscription-heading">
        <div>
          <span className="section-eyebrow">Billing</span>
          <h2>Choose the plan that fits your household</h2>
        </div>
        <div className="subscription-icon"><CreditCard size={18} /></div>
      </div>
      <div className="subscription-card">
        <div className="subscription-card-copy">
          <div className="subscription-title-row">
            <strong>SoftSpend Pro</strong>
            <span className={isPro ? 'subscription-status active' : 'subscription-status'}>
              {loading ? 'Checking...' : isPro ? 'Active' : 'Free plan'}
            </span>
          </div>
          <p>More room for shared finances, Excel imports, reports, and advanced money insights.</p>
          <div className="subscription-price"><strong>RM 9.90</strong><span>per month</span></div>
          <div className="subscription-benefits">
            {['Household sharing', 'Excel import', 'Downloadable reports'].map((benefit) => (
              <span key={benefit}><Check size={13} /> {benefit}</span>
            ))}
          </div>
        </div>
        <div className="subscription-action">
          {isPro ? (
            <>
              <button className="primary-button small" onClick={() => void openBilling('create-portal-session')} disabled={working || loading}>
                {working ? <LoaderCircle size={14} className="spin" /> : <ExternalLink size={14} />}
                Manage subscription
              </button>
              <small>{subscription?.cancel_at_period_end ? `Cancels on ${periodEnd ?? 'the period end'}` : `Renews ${periodEnd ?? 'monthly'}`}</small>
            </>
          ) : (
            <button className="primary-button small" onClick={() => void openBilling('create-checkout-session')} disabled={working || loading}>
              {working ? <LoaderCircle size={14} className="spin" /> : <Sparkles size={14} />}
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
      {notice && <div className="subscription-notice">{notice}</div>}
      {error && <div className="subscription-error">{error}</div>}
      {!loading && !subscription && <p className="subscription-footnote">You are currently using the free plan. Upgrade whenever you are ready.</p>}
    </div>
  )
}
