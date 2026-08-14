import { useEffect, useState } from 'react'
import { Check, CheckCircle2, CircleX, Clock3, CreditCard, ExternalLink, LoaderCircle, Sparkles, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

type SubscriptionRecord = {
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
}

const proStatuses = new Set(['active', 'trialing'])
type BillingResult = 'success' | 'cancelled' | 'processing' | 'error' | null

export function SubscriptionPanel() {
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [billingResult, setBillingResult] = useState<BillingResult>(null)
  const [billingResultMessage, setBillingResultMessage] = useState('')

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
    const billingResult = new URLSearchParams(window.location.search).get('billing')
    if (billingResult) {
      const url = new URL(window.location.href)
      url.searchParams.delete('billing')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    }

    let cancelled = false
    let retryTimer: number | undefined
    let attempts = 0

    const refreshAfterCheckout = async () => {
      const { data, error: loadError } = await supabase
        .from('subscriptions')
        .select('status,current_period_end,cancel_at_period_end')
        .maybeSingle()

      if (cancelled) return
      if (loadError) {
        setLoading(false)
        setBillingResult('error')
        setBillingResultMessage('We could not confirm your subscription yet. Please refresh Settings in a moment.')
        return
      }

      setSubscription(data)
      setLoading(false)
      if (data && proStatuses.has(data.status)) {
        setBillingResult('success')
        setBillingResultMessage('Your SoftSpend Pro subscription is active. Pro features are now unlocked.')
        return
      }

      attempts += 1
      if (attempts < 8) {
        retryTimer = window.setTimeout(() => void refreshAfterCheckout(), 2000)
      } else {
        setBillingResult('processing')
        setBillingResultMessage('Stripe received your checkout, but activation is still processing. Please refresh Settings shortly.')
      }
    }

    if (billingResult === 'success') {
      setBillingResult('processing')
      setBillingResultMessage('We are confirming your payment and activating Pro…')
      void refreshAfterCheckout()
    } else if (billingResult === 'cancelled') {
      setBillingResult('cancelled')
      setBillingResultMessage('Checkout was cancelled. No payment was taken and your account remains on the Free plan.')
      void loadSubscription()
    } else {
      void loadSubscription()
    }

    return () => {
      cancelled = true
      if (retryTimer) window.clearTimeout(retryTimer)
    }
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
      setBillingResult('error')
      setBillingResultMessage(data?.error || functionError?.message || 'We could not open the billing page. Please try again.')
      setWorking(false)
      return
    }
    if (!data?.url) {
      setBillingResult('error')
      setBillingResultMessage('We could not open the billing page. Please try again.')
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
      {billingResult && (
        <div className="overlay" onClick={() => setBillingResult(null)}>
          <div className="billing-result-modal" role="dialog" aria-modal="true" aria-labelledby="billing-result-title" onClick={(event) => event.stopPropagation()}>
            <button className="billing-result-close" aria-label="Close" onClick={() => setBillingResult(null)}><X size={17} /></button>
            <div className={`billing-result-icon ${billingResult}`}>
              {billingResult === 'success' ? <CheckCircle2 size={28} /> : billingResult === 'cancelled' || billingResult === 'error' ? <CircleX size={28} /> : <Clock3 size={28} />}
            </div>
            <span className="section-eyebrow">Billing update</span>
            <h2 id="billing-result-title">
              {billingResult === 'success' ? 'You are now on Pro' : billingResult === 'cancelled' ? 'Checkout cancelled' : billingResult === 'error' ? 'Subscription not completed' : 'Activating Pro'}
            </h2>
            <p>{billingResultMessage}</p>
            <button className="primary-button small billing-result-button" onClick={() => setBillingResult(null)}>
              {billingResult === 'success' ? 'Continue to Settings' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
