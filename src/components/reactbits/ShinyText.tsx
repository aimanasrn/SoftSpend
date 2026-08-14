import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import './ShinyText.css'

type ShinyTextProps = {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
  color?: string
  shineColor?: string
  spread?: number
  pauseOnHover?: boolean
  direction?: 'left' | 'right'
  delay?: number
}

export function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#778092',
  shineColor = '#8b80f9',
  spread = 110,
  pauseOnHover = false,
  direction = 'left',
  delay = 0,
}: ShinyTextProps) {
  const reducedMotion = useReducedMotion()
  const [isPaused, setIsPaused] = useState(false)
  const progress = useMotionValue(0)
  const elapsed = useRef(0)
  const lastTime = useRef<number | null>(null)
  const directionValue = useRef(direction === 'left' ? 1 : -1)
  const duration = speed * 1000
  const delayDuration = delay * 1000

  useAnimationFrame((time) => {
    if (disabled || reducedMotion || isPaused) {
      lastTime.current = null
      return
    }
    if (lastTime.current === null) {
      lastTime.current = time
      return
    }
    elapsed.current += time - lastTime.current
    lastTime.current = time
    const cycleDuration = duration + delayDuration
    const cycleTime = elapsed.current % cycleDuration
    if (cycleTime < duration) {
      const value = (cycleTime / duration) * 100
      progress.set(directionValue.current === 1 ? value : 100 - value)
    } else {
      progress.set(directionValue.current === 1 ? 100 : 0)
    }
  })

  useEffect(() => {
    directionValue.current = direction === 'left' ? 1 : -1
    elapsed.current = 0
    progress.set(0)
  }, [direction, progress])

  const backgroundPosition = useTransform(progress, (value) => `${150 - value * 2}% center`)
  const handleMouseEnter = useCallback(() => pauseOnHover && setIsPaused(true), [pauseOnHover])
  const handleMouseLeave = useCallback(() => pauseOnHover && setIsPaused(false), [pauseOnHover])
  const gradientStyle = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text' as const,
    backgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
  }

  return (
    <motion.span
      className={`shiny-text ${className}`}
      style={{ ...gradientStyle, backgroundPosition }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
    </motion.span>
  )
}
