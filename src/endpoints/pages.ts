import axios from 'axios'
import qs from 'qs'
import * as z from 'zod'
import { sectionHeaderDecoder } from './components'
import { sectorDecoder } from './sectors'

const homePageContentDecoder = z.object({
  id: z.number(),
  attributes: z.object({
    title: z.string(),
    lead: z.string(),
    functionalityHighlight: z.object({
      header: sectionHeaderDecoder,
      steps: z.array(
        z.object({
          id: z.number(),
          stepNumber: z.number(),
          heading: z.string(),
          content: z.string().nullable()
        })
      )
    }),
    sectorOverview: z.object({
      header: sectionHeaderDecoder,
      cards: z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          content: z.string(),
          sector: z.object({
            data: sectorDecoder
          })
        })
      )
    })
  })
})

export type HomePageContent = z.infer<typeof homePageContentDecoder>

const getHomePageContentDecoder = z.object({
  data: homePageContentDecoder
})

export const getHomePageContent = async () => {
  const homePageContentQuery = qs.stringify(
    {
      populate: {
        functionalityHighlight: {
          populate: '*'
        },
        sectorOverview: {
          populate: ['header', 'cards', 'cards.sector']
        }
      }
    },
    { encodeValuesOnly: true }
  )
  return await axios(
    process.env.NEXT_PUBLIC_API_URL + '/home?' + homePageContentQuery
  ).then((res) => getHomePageContentDecoder.parse(res.data))
}

const themesPageContentDecoder = z.object({
  id: z.number(),
  attributes: z.object({
    introduction: z.string(),
    content: z.string(),
    title: z.string(),
    sectorOverview: z.object({
      header: sectionHeaderDecoder,
      cards: z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          content: z.string(),
          sector: z.object({
            data: sectorDecoder
          })
        })
      )
    })
  })
})

export type ThemesPageContent = z.infer<typeof themesPageContentDecoder>

const getThemesPageContentDecoder = z.object({
  data: themesPageContentDecoder
})

export const getThemesPageContent = async () => {
  const query = qs.stringify(
    {
      populate: [
        'sectorOverview',
        'sectorOverview.cards',
        'sectorOverview.cards.sector',
        'sectorOverview.header'
      ]
    },
    { encodeValuesOnly: true }
  )

  return await axios(process.env.NEXT_PUBLIC_API_URL + '/theme?' + query).then(
    (res) => getThemesPageContentDecoder.parse(res.data)
  )
}

const aboutPageContentDecoder = z.object({
  id: z.number(),
  attributes: z.object({
    title: z.string(),
    introduction: z.string(),
    content: z.string()
  })
})

export type AboutPageContent = z.infer<typeof aboutPageContentDecoder>

const getAboutPageContentDecoder = z.object({
  data: aboutPageContentDecoder
})

export const getAboutPageContent = async () => {
  return await axios(process.env.NEXT_PUBLIC_API_URL + '/about').then((res) =>
    getAboutPageContentDecoder.parse(res.data)
  )
}
