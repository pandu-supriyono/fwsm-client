import axios from 'axios'
import * as z from 'zod'
import qs from 'qs'
import { subsectorDecoder } from './subsectors'
import { imageDecoder } from './common'
import { parseCookies } from 'nookies'
import { Constants } from '../constants'

const organizationAttributesDecoder = z.object({
  name: z.string(),
  shortDescription: z.string(),
  description: z.string().nullable(),
  website: z.string().nullable()
})

const organizationDecoder = z.object({
  id: z.number(),
  attributes: organizationAttributesDecoder
})

export type Organization = z.infer<typeof organizationDecoder>

const getOrganizationDecoder = z.object({
  data: organizationDecoder
})

const highlightedOrganizationDecoder = organizationDecoder.extend({
  attributes: organizationAttributesDecoder.extend({
    subsector: z.object({
      data: subsectorDecoder
    }),
    featuredImage: z.object({
      data: imageDecoder.nullable()
    })
  })
})

export type HighlightedOrganization = z.infer<
  typeof highlightedOrganizationDecoder
>

const getHighlightedOrganizationsDecoder = z.object({
  data: z.array(highlightedOrganizationDecoder)
})

export const getHighlightedOrganizations = async (subsectorId?: number) => {
  const filter = subsectorId
    ? {
        filters: {
          subsector: {
            sector: {
              id: {
                $eq: subsectorId
              }
            }
          }
        }
      }
    : {}

  const query = qs.stringify(
    {
      pagination: {
        start: 0,
        limit: 2
      },
      sort: ['createdAt:desc'],
      populate: ['subsector', 'subsector.sector', 'featuredImage'],
      ...filter
    },
    { encodeValuesOnly: true }
  )

  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/organizations?' + query)
    .then((res) => getHighlightedOrganizationsDecoder.parse(res.data))
}

const organizationProfileDecoder = z.object({
  id: z.number(),
  attributes: organizationAttributesDecoder.extend({
    address: z.object({
      country: z.string(),
      address: z.string(),
      postcode: z.string(),
      province: z.string(),
      city: z.string()
    }),
    email: z.string().email(),
    logo: z.object({
      data: imageDecoder.nullable()
    }),
    images: z.object({
      data: z.array(imageDecoder).nullable()
    }),
    subsector: z.object({
      data: subsectorDecoder
    }),
    createdAt: z.string(),
    updatedAt: z.string()
  })
})

export type OrganizationProfile = z.infer<typeof organizationProfileDecoder>

export const getOrganization = async (id: number) => {
  const query = qs.stringify({
    populate: ['subsector.sector', 'logo', 'address', 'images']
  })

  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/organizations/' + id + '?' + query)
    .then((res) =>
      z
        .object({
          data: organizationProfileDecoder
        })
        .parse(res.data)
    )
}

const organizationWithSectorDataDecoder = organizationDecoder.extend({
  attributes: organizationAttributesDecoder.extend({
    subsector: z.object({
      data: subsectorDecoder
    })
  })
})

export type OrganizationWithSectorData = z.infer<
  typeof organizationWithSectorDataDecoder
>

const getOrganizationsDecoder = z.object({
  data: z.array(organizationWithSectorDataDecoder)
})

interface GetOrganizationsOptions {
  sectorId?: number
  subsectorId?: number
}

export const getOrganizations = async (
  options: GetOrganizationsOptions = {}
) => {
  const { sectorId, subsectorId } = options

  const query = qs.stringify(
    {
      populate: ['subsector', 'subsector.sector'],
      ...(sectorId
        ? {
            filters: {
              subsector: {
                sector: {
                  id: {
                    $eq: sectorId
                  }
                }
              }
            }
          }
        : {}),
      ...(subsectorId
        ? {
            filters: {
              subsector: {
                id: {
                  $eq: subsectorId
                }
              }
            }
          }
        : {})
    },
    {
      encodeValuesOnly: true
    }
  )

  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/organizations?' + query)
    .then((res) => getOrganizationsDecoder.parse(res.data))
}

const getCurrentOrganizationDecoder = z.object({
  data: organizationDecoder
})

export const getCurrentOrganization = async () => {
  const cookies = parseCookies()

  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/organizations/me', {
      headers: {
        Authorization: 'Bearer ' + cookies[Constants.JWT_COOKIE]
      }
    })
    .then((res) => getCurrentOrganizationDecoder.parse(res.data))
}

export const updateOrganization = async <T>(id: number, updated: T) => {
  const cookies = parseCookies()

  return await axios
    .put(
      process.env.NEXT_PUBLIC_API_URL + '/organizations/' + id,
      {
        data: updated
      },
      {
        headers: {
          Authorization: 'Bearer ' + cookies[Constants.JWT_COOKIE]
        }
      }
    )
    .then((res) => getOrganizationDecoder.parse(res.data))
}

const createOrganizationDecoder = getOrganizationDecoder

export const createOrganization = async <T>(data: T) => {
  const cookies = parseCookies()

  return await axios
    .post(
      process.env.NEXT_PUBLIC_API_URL + '/organizations',
      {
        data
      },
      {
        headers: {
          Authorization: 'Bearer ' + cookies[Constants.JWT_COOKIE]
        }
      }
    )
    .then((res) => createOrganizationDecoder.parse(res.data))
}
