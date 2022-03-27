import axios from 'axios'
import * as z from 'zod'

export const sectorDecoder = z.object({
  id: z.number(),
  attributes: z.object({
    name: z.string(),
    description: z.string()
  })
})

export type Sector = z.TypeOf<typeof sectorDecoder>

export const getSectorDecoder = z.object({
  data: sectorDecoder
})

export const getSector = async (id: number) =>
  await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/sectors/' + id)
    .then((res) => getSectorDecoder.parse(res.data))

export const getSectorsDecoder = z.object({
  data: z.array(sectorDecoder)
})

export const getSectors = async () =>
  await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/sectors')
    .then((res) => getSectorsDecoder.parse(res.data))
