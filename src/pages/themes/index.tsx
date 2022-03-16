import {
  Container,
  Heading,
  Text,
  Box,
  SimpleGrid,
  LinkOverlay,
  Link,
  LinkBox,
  VStack
} from '@chakra-ui/react'
import { GetStaticProps, NextPage } from 'next'
import NextLink from 'next/link'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { FwsmTemplate } from '../../components/template'
import { ReactNode } from 'react'
import axios from 'axios'
import { FwsmMarkdown } from '../../components/markdown'
import {
  FwsmPageHeader,
  FwsmPageHeaderContainer,
  FwsmPageHeaderTitle
} from '../../components/page-header'
import qs from 'qs'

interface ThemePageData {
  attributes: {
    title: string
    introduction: string
    content: string
    sectorOverview: {
      header: {
        heading: string
        description: string
      }
      cards: {
        id: number
        title: string
        content: string
        sector: {
          data: {
            id: number
          }
        }
      }[]
    }
  }
}

interface ThemePageProps {
  themePageData: ThemePageData
}

const ThemePage: NextPage<ThemePageProps> = (props) => {
  const { themePageData } = props

  return (
    <FwsmTemplate title={themePageData.attributes.title}>
      <FwsmPageHeader>
        <FwsmPageHeaderContainer>
          <FwsmPageHeaderTitle>Themes</FwsmPageHeaderTitle>
          <Text fontSize="xl">{themePageData.attributes.introduction}</Text>
        </FwsmPageHeaderContainer>
      </FwsmPageHeader>
      <Container>
        <Box maxW="80ch">
          <FwsmMarkdown>{themePageData.attributes.content}</FwsmMarkdown>
        </Box>
      </Container>
      <Box
        mt={[10, null, '4rem']}
        py={[10, null, '4rem']}
        backgroundColor="gray.700"
      >
        <Container maxW="80ch">
          <Heading as="h2" color="white" size="2xl" textAlign="center" mb={8}>
            {themePageData.attributes.sectorOverview.header.heading}
          </Heading>
          <Text color="white" mb={10} textAlign="center" fontSize="lg">
            {themePageData.attributes.sectorOverview.header.description}
          </Text>
        </Container>
        <Container>
          <SimpleGrid columns={[1, 1, 3]} spacing={8}>
            {themePageData.attributes.sectorOverview.cards.map((card) => {
              return (
                <SectorOverviewItem
                  key={`sector-overview-${card.id}`}
                  title={card.title}
                  href={
                    card.sector.data?.id
                      ? `/themes/${card.sector.data.id}`
                      : '/themes'
                  }
                >
                  {card.content}
                </SectorOverviewItem>
              )
            })}
          </SimpleGrid>
        </Container>
      </Box>
    </FwsmTemplate>
  )
}

function SectorOverviewItem(props: {
  title: string
  href: string
  children: ReactNode
}) {
  const { title, href, children } = props
  return (
    <LinkBox backgroundColor="gray.600" color="white" p={6} borderRadius={8}>
      <VStack align="flex-start" height="100%" justify="space-between">
        <Box>
          <Heading as="h3" size="md" mb={2}>
            {title}
          </Heading>
          <Text mb={2}>{children}</Text>
        </Box>
        <NextLink href={href} passHref>
          <LinkOverlay as={Link} textAlign="left" mt="auto">
            Read more <ArrowForwardIcon />
          </LinkOverlay>
        </NextLink>
      </VStack>
    </LinkBox>
  )
}

export const getStaticProps: GetStaticProps = async () => {
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

  const { data } = await axios(
    process.env.NEXT_PUBLIC_API_URL + '/theme?' + query
  ).then((res) => res.data)

  return {
    props: {
      themePageData: data
    }
  }
}

export default ThemePage
