import { useCallback, useEffect, useState } from 'react'

interface SetPropsOptions {
  responsive?: 'fromDesktop'
}

export function useToggleVisible(initialState = false) {
  const [isVisible, setIsVisble] = useState(initialState)

  const setProps = (display = 'block', options: SetPropsOptions = {}) => {
    const { responsive } = options

    const isFromDesktop = responsive === 'fromDesktop'

    const defaults = {
      display: isVisible ? display : 'none'
    }

    return {
      display: {
        base: defaults.display,
        ...(isFromDesktop ? { lg: 'block' } : {})
      }
    } as const
  }

  const setToggle = useCallback(() => {
    setIsVisble((v) => !v)
  }, [])

  return {
    setProps,
    setToggle,
    isVisible
  } as const
}
