import Router from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { getCurrentOrganization } from '../endpoints'
import { useUser } from './use-user'

export function useOrganization(organizationId?: number) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [isCurrentOrganization, setIsCurrentOrganization] = useState(false)

  const {
    data: organization,
    isLoading,
    isIdle
  } = useQuery('currentOrganization', getCurrentOrganization, {
    enabled: user?.isSignedIn === true
  })

  // useEffect(() => {
  //   if (!isLoading && !isIdle && !!user?.isSignedIn) {
  //     Router.push('/sign-up/organization')
  //   }
  // }, [user, isLoading, isIdle])

  useEffect(() => {
    if (organization && organization.data.id === organizationId) {
      setIsCurrentOrganization(() => true)
    } else {
      setIsCurrentOrganization(() => false)
    }
  }, [organization, organizationId])

  useEffect(() => {
    if (!user?.isSignedIn) {
      queryClient.invalidateQueries('currentOrganization')
    }
  }, [user, queryClient])

  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries('organizations')
    queryClient.invalidateQueries('organizationProfile')
  }, [queryClient])

  return {
    isCurrentOrganization,
    organization,
    isLoading,
    isIdle,
    invalidateCache
  } as const
}
