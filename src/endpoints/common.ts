import * as z from 'zod'

export const imageDecoder = z.object({
  id: z.number(),
  attributes: z.object({
    url: z.string(),
    formats: z.object({
      thumbnail: z.object({
        url: z.string()
      })
    })
  })
})

export type Image = z.infer<typeof imageDecoder>
