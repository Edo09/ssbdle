import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  /** Key used to detect page changes (e.g. the current mode string). */
  pageKey: string
  children: ReactNode
  /** Duration in ms – must match the CSS `--page-transition-duration`. */
  duration?: number
}

/**
 * Wraps page content and applies a smooth crossfade + slide transition
 * whenever `pageKey` changes. The outgoing page fades/slides out,
 * then the incoming page fades/slides in.
 */
export function PageTransition({
  pageKey,
  children,
  duration = 280,
}: Props) {
  const [displayedKey, setDisplayedKey] = useState(pageKey)
  const [displayedChildren, setDisplayedChildren] = useState(children)
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    // Same page — just update children in place (no transition).
    if (pageKey === displayedKey) {
      setDisplayedChildren(children)
      return
    }

    // Page changed — start exit animation.
    setPhase('exit')
    clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      // After exit completes, swap content and start enter animation.
      setDisplayedKey(pageKey)
      setDisplayedChildren(children)
      setPhase('enter')

      timeoutRef.current = setTimeout(() => {
        setPhase('idle')
      }, duration)
    }, duration)

    return () => clearTimeout(timeoutRef.current)
    // We intentionally omit `children` from deps so content only swaps on key change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, duration])

  // When key stays the same but children update, keep content fresh.
  useEffect(() => {
    if (pageKey === displayedKey && phase === 'idle') {
      setDisplayedChildren(children)
    }
  }, [children, pageKey, displayedKey, phase])

  return (
    <div
      className={
        phase === 'exit'
          ? 'page-transition page-exit'
          : phase === 'enter'
            ? 'page-transition page-enter'
            : 'page-transition'
      }
      style={{ '--page-transition-duration': `${duration}ms` } as React.CSSProperties}
    >
      {displayedChildren}
    </div>
  )
}
