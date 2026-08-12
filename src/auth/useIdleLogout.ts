import { useEffect, useRef } from 'react'

type IdleLogoutOptions = {
  enabled: boolean
  timeoutMs: number
  onIdle: () => void | Promise<void>
}

export function useIdleLogout({ enabled, timeoutMs, onIdle }: IdleLogoutOptions) {
  const onIdleRef = useRef(onIdle)
  onIdleRef.current = onIdle

  useEffect(() => {
    if (!enabled) return

    let timer: number | undefined
    let lastActivity = Date.now()
    let loggingOut = false

    const scheduleLogoutCheck = () => {
      if (timer !== undefined) window.clearTimeout(timer)

      const remaining = timeoutMs - (Date.now() - lastActivity)
      if (remaining <= 0) {
        if (!loggingOut) {
          loggingOut = true
          void Promise.resolve(onIdleRef.current()).catch(() => undefined)
        }
        return
      }

      timer = window.setTimeout(scheduleLogoutCheck, remaining)
    }

    const recordActivity = () => {
      if (loggingOut) return
      lastActivity = Date.now()
      scheduleLogoutCheck()
    }

    const checkAfterVisibilityChange = () => {
      if (document.visibilityState === 'visible') scheduleLogoutCheck()
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
    ]

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true })
    })
    document.addEventListener('visibilitychange', checkAfterVisibilityChange)
    scheduleLogoutCheck()

    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity)
      })
      document.removeEventListener('visibilitychange', checkAfterVisibilityChange)
    }
  }, [enabled, timeoutMs])
}
