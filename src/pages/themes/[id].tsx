import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList
} from '@chakra-ui/react'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import {
  FwsmPageHeader,
  FwsmPageHeaderContainer,
  FwsmPageHeaderTitle
} from '../../components/page-header'
import { FwsmTemplate } from '../../components/template'
import { FwsmMarkdown } from '../../components/markdown'
import {
  getSector,
  getSectors,
  getSubsectors,
  Sector,
  Subsector
} from '../../endpoints'

interface FwsmThemePageProps {
  sector: Sector
  subsectors: Subsector[]
}

const FwsmThemePage: NextPage<FwsmThemePageProps> = (props) => {
  const { sector, subsectors } = props
  return (
    <FwsmTemplate>
      <FwsmPageHeader>
        <FwsmPageHeaderContainer>
          <FwsmPageHeaderTitle>{sector.attributes.name}</FwsmPageHeaderTitle>
          {sector.attributes.description && (
            <Text
              fontSize="2xl"
              mb={{
                base: 8,
                lg: '3rem'
              }}
            >
              {sector.attributes.description}
            </Text>
          )}
          <Heading as="h2" size="sm" fontFamily="body" mb={1}>
            Explore subsectors
          </Heading>
          <UnorderedList listStyleType="none" ml={0}>
            {subsectors.map((subsector) => (
              <ListItem
                key={`subsector-${subsector.id}`}
                pos="relative"
                pl={6}
                _before={{
                  content: '"—"',
                  position: 'absolute',
                  left: 0,
                  width: '20px'
                }}
              >
                <Link href={`#${subsector.id}`} color="green.500">
                  {subsector.attributes.name}
                </Link>
              </ListItem>
            ))}
          </UnorderedList>
        </FwsmPageHeaderContainer>
      </FwsmPageHeader>
      <Container mb={10}>
        <Grid
          gridTemplateColumns={{
            base: '1fr',
            lg: '80ch 1fr'
          }}
        >
          <GridItem>
            {subsectors.map((subsector) => (
              <Box key={`subsector-${subsector.id}`} mb={10}>
                <Heading as="h2" mb={2} id={String(subsector.id)}>
                  {subsector.attributes.name}
                </Heading>
                <FwsmMarkdown>{subsector.attributes.description}</FwsmMarkdown>
              </Box>
            ))}
          </GridItem>
        </Grid>
      </Container>
    </FwsmTemplate>
  )
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const id = Number(ctx.params?.id)

  const sector = await getSector(id)

  const subsectors = await getSubsectors({
    sectorId: id
  })

  return {
    props: {
      sector: sector.data,
      subsectors: subsectors.data
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const sectors = await getSectors()

  const paths = sectors.data.map((sector) => ({
    params: { id: String(sector.id) }
  }))

  return {
    paths,
    fallback: false
  }
}

export default FwsmThemePage
