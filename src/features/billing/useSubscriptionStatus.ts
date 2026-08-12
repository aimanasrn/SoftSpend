import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const activeStatuses = new Set(['active', 'trialing'])

export function useSubscriptionStatus(enabled: boolean, refreshKey = '') {
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setStatus(null)
      return
    }

    let cancelled = false
    const load = async () => {
      const { data } = await supabase.from('subscriptions').select('status').maybeSingle()
      if (!cancelled) setStatus(data?.status ?? null)
    }
    void load()
    const waitingForStripe = refreshKey.includes('billing=success')
    const retryTimer = waitingForStripe ? window.setInterval(() => void load(), 2500) : undefined
    return () => {
      cancelled = true
      if (retryTimer) window.clearInterval(retryTimer)
    }
  }, [enabled, refreshKey])

  return { status, isPro: Boolean(status && activeStatuses.has(status)) }
}
