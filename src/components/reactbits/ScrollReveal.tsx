import { motion, useReducedMotion } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'

type ScrollRevealProps = HTMLMotionProps<'div'> & {
  delay?: number
  distance?: number
  duration?: number
}

export function ScrollReveal({
  children,
  delay = 0,
  distance = 28,
  duration = 0.72,
  ...props
}: ScrollRevealProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: distance }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16, margin: '0px 0px -8% 0px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
