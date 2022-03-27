import * as yup from 'yup'

export const sectionHeaderSchema = yup.object({
  id: yup.number(),
  heading: yup.string().required(),
  description: yup.string().optional(),
  subtitle: yup.string().optional()
})

export type SectionHeader = yup.InferType<typeof sectionHeaderSchema>

export const sectorSchema = yup
  .object({
    id: yup.number().required(),
    attributes: yup.object({
      name: yup.string().required()
    })
  })
  .required()

export type Sector = yup.InferType<typeof sectorSchema>

export const sectorCardSchema = yup.object({
  id: yup.number().required(),
  title: yup.string().required(),
  content: yup.string().required(),
  sector: yup.object({
    data: sectorSchema
  })
})

export const sectorOverviewSchema = yup.object({
  header: sectionHeaderSchema,
  cards: yup.array(sectorCardSchema)
})

export type SectorOverview = yup.InferType<typeof sectorOverviewSchema>
