import { useEffect } from 'react'
import { useUserStore } from '@spyon/store/useUserStore'
import React = require('react')

export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = React.useState(false)

  useEffect(() => {
    const unsub = useUserStore.persist.onHydrate(() => {
      setIsHydrated(true)
    })

    const timeout = setTimeout(() => setIsHydrated(true), 2000)

    return () => {
      unsub()
      clearTimeout(timeout)
    }
  }, [])

  return isHydrated
}