import * as z from 'zod'

export const sectionHeaderDecoder = z.object({
  id: z.number(),
  heading: z.string(),
  subtitle: z.string().nullable(),
  description: z.string().nullable()
})

export type sectionHeader = z.infer<typeof sectionHeaderDecoder>
