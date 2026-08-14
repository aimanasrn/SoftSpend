import { motion, type Transition } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

type BlurTextProps = {
  text?: string
  delay?: number
  className?: string
  animateBy?: 'words' | 'letters'
  direction?: 'top' | 'bottom'
  threshold?: number
  rootMargin?: string
  stepDuration?: number
}

type Frame = Record<string, string | number>

function buildKeyframes(from: Frame, steps: Frame[]) {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))])
  return Object.fromEntries([...keys].map((key) => [key, [from[key], ...steps.map((step) => step[key])]]))
}

export function BlurText({
  text = '',
  delay = 90,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.2,
  rootMargin = '0px 0px -8% 0px',
  stepDuration = 0.38,
}: BlurTextProps) {
  const segments = animateBy === 'words' ? text.split(' ') : text.split('')
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setInView(true)
        observer.unobserve(entry.target)
      },
      { threshold, rootMargin },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [rootMargin, threshold])

  const from = useMemo<Frame>(
    () => (direction === 'top' ? { filter: 'blur(12px)', opacity: 0, y: -24 } : { filter: 'blur(12px)', opacity: 0, y: 24 }),
    [direction],
  )
  const to = useMemo<Frame[]>(
    () => [
      { filter: 'blur(4px)', opacity: 0.55, y: direction === 'top' ? 3 : -3 },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction],
  )
  const keyframes = buildKeyframes(from, to)
  const transitionDuration = stepDuration * to.length

  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap' }}>
      {segments.map((segment, index) => {
        const transition: Transition = {
          duration: transitionDuration,
          times: [0, 0.5, 1],
          delay: (index * delay) / 1000,
          ease: 'easeOut',
        }

        return (
          <motion.span
            key={`${segment}-${index}`}
            initial={reducedMotion ? { filter: 'blur(0px)', opacity: 1, y: 0 } : from}
            animate={reducedMotion ? { filter: 'blur(0px)', opacity: 1, y: 0 } : inView ? keyframes : from}
            transition={transition}
            style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
          >
            {segment}
            {animateBy === 'words' && index < segments.length - 1 ? '\u00a0' : null}
          </motion.span>
        )
      })}
    </p>
  )
}
