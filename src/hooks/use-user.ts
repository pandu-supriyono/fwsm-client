import Router from 'next/router'
import { destroyCookie } from 'nookies'
import { useCallback, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { Constants } from '../constants'
import { getCurrentUser } from '../endpoints'

interface UseUserOptions {
  redirectTo?: string
  redirectIfFound?: boolean
}

export function useUser(options: UseUserOptions = {}) {
  const queryClient = useQueryClient()
  const { redirectTo = '', redirectIfFound = false } = options

  const { data: user, isLoading } = useQuery('currentUser', () =>
    getCurrentUser()
  )

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user?.isSignedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isSignedIn)
    ) {
      Router.push(redirectTo)
    }
  })

  const signOut = useCallback(() => {
    destroyCookie(null, Constants.JWT_COOKIE, {
      path: '/'
    })
    queryClient.invalidateQueries('currentUser')
    Router.push('/')
  }, [queryClient])

  return { user, signOut } as const
}
