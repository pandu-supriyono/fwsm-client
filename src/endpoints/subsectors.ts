import axios from 'axios'
import * as z from 'zod'
import { sectorDecoder } from './sectors'
import qs from 'qs'

export const subsectorDecoder = z.object({
  id: z.number(),
  attributes: z.object({
    name: z.string(),
    description: z.string(),
    sector: z.object({
      data: sectorDecoder
    })
  })
})

export type Subsector = z.infer<typeof subsectorDecoder>

export const getSubsectorsDecoder = z.object({
  data: z.array(subsectorDecoder)
})

interface GetSubsectorsOptions {
  sectorId?: number
}

export const getSubsectors = async (options: GetSubsectorsOptions = {}) => {
  const { sectorId } = options

  const query = qs.stringify(
    {
      populate: {
        sector: '*'
      },
      ...(sectorId
        ? {
            filters: {
              sector: {
                id: {
                  $eq: sectorId
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
    .get(process.env.NEXT_PUBLIC_API_URL + '/subsectors?' + query)
    .then((res) => getSubsectorsDecoder.parse(res.data))
}
