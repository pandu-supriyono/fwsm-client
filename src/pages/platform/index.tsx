import { ArrowForwardIcon } from '@chakra-ui/icons'
import qs from 'qs'
import {
  Box,
  Grid,
  GridItem,
  Container,
  Link,
  Heading,
  HStack,
  LinkBox,
  LinkOverlay,
  ListItem,
  RadioProps,
  Stack,
  Text,
  UnorderedList,
  useRadio,
  useRadioGroup,
  Select
} from '@chakra-ui/react'
import { GetStaticProps, NextPage } from 'next'
import NextLink from 'next/link'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { FwsmTemplate } from '../../components/template'
import axios from 'axios'
import { useQuery } from 'react-query'
import {
  FwsmPageHeader,
  FwsmPageHeaderContainer,
  FwsmPageHeaderTitle
} from '../../components/page-header'

interface SectorResponse {
  id: number
  attributes: {
    name: string
  }
}

interface SubsectorResponse {
  id: number
  attributes: {
    name: string
    sector: {
      data: SectorResponse
    }
  }
}

interface Sector {
  id: number
  attributes: {
    name: string
    subsectors: {
      id: number
      attributes: {
        name: string
      }
    }[]
  }
}

type Sectors = Sector[]

type Subsectors = SubsectorResponse[]

interface Organization {
  id: number
  attributes: {
    name: string
    shortDescription?: string
    subsector: {
      data: {
        id: number
        attributes: {
          name: string
        }
      }
    }
  }
}

interface PlatformPageProps {
  sectors: Sectors
  subsectors: Subsectors
}

const getSectorNameFromId = (id: string, sectors: Sectors) => {
  return (
    sectors.find((sector) => String(sector.id) == id)?.attributes.name ||
    'All sectors'
  )
}

const getSubsectorNameFromId = (id: string, subsectors: Subsectors) => {
  return (
    subsectors.find((subsector) => String(subsector.id) == id)?.attributes
      .name || 'All subsectors'
  )
}

const PlatformPage: NextPage<PlatformPageProps> = (props) => {
  return (
    <FwsmTemplate title="Platform">
      <FwsmPageHeader>
        <FwsmPageHeaderContainer>
          <FwsmPageHeaderTitle>The platform</FwsmPageHeaderTitle>
          <Text fontSize="xl">
            Make use of the Food Waste Solution Map platform to find partners
            and explore the landscape in the effort against food waste.
          </Text>
        </FwsmPageHeaderContainer>
      </FwsmPageHeader>

      <PlatformPageContent {...props} />
    </FwsmTemplate>
  )
}

function PlatformPageContent(props: PlatformPageProps) {
  const { sectors, subsectors } = props
  const [sectorFilter, setSectorFilter] = useState('all')
  const [subsectorFilter, setSubsectorFilter] = useState<string | number>('all')
  const baseUrl = process.env.NEXT_PUBLIC_API_URL + '/organizations'
  const [query, setQuery] = useState('')
  const { data: organizations } = useQuery<Organization[]>(
    ['organizations', query],
    () => axios(baseUrl + query).then((res) => res.data.data)
  )

  useEffect(() => {
    setSubsectorFilter(() => 'all')
  }, [sectorFilter])

  useEffect(() => {
    if (subsectorFilter !== 'all') {
      const query = qs.stringify({
        populate: 'subsector',
        filters: {
          subsector: {
            id: {
              $eq: subsectorFilter
            }
          }
        }
      })
      setQuery(() => '?' + query)
    } else if (sectorFilter === 'all') {
      const query = qs.stringify({
        populate: 'subsector'
      })
      setQuery(() => '?' + query)
    } else {
      const query = qs.stringify({
        populate: 'subsector',
        filters: {
          subsector: {
            sector: {
              id: {
                $eq: sectorFilter
              }
            }
          }
        }
      })
      setQuery(() => '?' + query)
    }
  }, [sectorFilter, subsectorFilter])

  const subsectorOptions =
    sectorFilter === 'all'
      ? subsectors.map((subsector) => subsector.id)
      : subsectors
          .filter(
            (subsector) =>
              String(subsector.attributes.sector.data.id) === sectorFilter
          )
          .map((subsector) => subsector.id)

  return (
    <Box pt={6} pb={[10, null, '3rem']}>
      <Container>
        <Grid
          templateColumns={{
            base: '1fr',
            lg: 'max-content 1fr'
          }}
          gap={8}
        >
          <GridItem
            as={Box}
            backgroundColor="green.500"
            color="white"
            px={6}
            py={6}
            borderRadius={10}
          >
            <Heading as="h3" size="sm" mb={4}>
              Filter by sector
            </Heading>
            <SectorFilters
              sectors={sectors}
              sectorFilter={sectorFilter}
              setSectorFilter={setSectorFilter}
            />
            <Heading as="h3" size="sm" mb={4} mt={8}>
              Filter by subsector
            </Heading>
            <Select
              variant="flushed"
              onChange={(e) => setSubsectorFilter(() => e.target.value)}
              defaultValue={subsectorFilter}
            >
              <option value="all" style={{ color: 'black' }}>
                All subsectors
              </option>
              {subsectorOptions?.map((value) => (
                <option
                  key={`filter-${value}`}
                  value={value}
                  style={{ color: 'black' }}
                >
                  {getSubsectorNameFromId(String(value), subsectors)}
                </option>
              ))}
            </Select>
          </GridItem>
          <GridItem as={Box}>
            <Heading as="h2">
              {getSectorNameFromId(sectorFilter, sectors)}
            </Heading>
            <Text fontSize="xl" mb={8} color="gray.600">
              {getSubsectorNameFromId(String(subsectorFilter), subsectors)}
            </Text>
            <Box>
              <LinkBox
                as={HStack}
                backgroundColor="gray.100"
                borderRadius="lg"
                p={4}
                justifyContent="space-between"
              >
                <Box>
                  <Heading as="h3" size="md">
                    <NextLink href="/sign-up" passHref>
                      <LinkOverlay as={Link}>
                        Your organization here?
                      </LinkOverlay>
                    </NextLink>
                  </Heading>
                  <Text>
                    Is your organization involved in one of these activities?
                    <br />
                    Sign up for free today and make yourself known to the
                    network.
                  </Text>
                </Box>
                <ArrowForwardIcon boxSize="12" />
              </LinkBox>
              <UnorderedList listStyleType="none" ml={0}>
                {organizations &&
                  organizations.length > 0 &&
                  organizations.map((organization) => (
                    <OrganizationResult
                      key={`result-${organization.id}`}
                      {...organization}
                    />
                  ))}
              </UnorderedList>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}

function OrganizationResult(props: Organization) {
  const url = '/platform/organization/' + props.id
  return (
    <LinkBox
      as={ListItem}
      p={4}
      borderBottomColor="gray.200"
      borderBottomWidth="1px"
    >
      <HStack justifyContent="space-between">
        <Box>
          <Text>{props.attributes.subsector?.data.attributes.name}</Text>
          <Heading as="h3" size="md">
            <NextLink href={url} passHref>
              <LinkOverlay as={Link}>{props.attributes.name}</LinkOverlay>
            </NextLink>
          </Heading>
          <Text>{props.attributes.shortDescription}</Text>
        </Box>
        <ArrowForwardIcon boxSize="12" />
      </HStack>
    </LinkBox>
  )
}

function SectorFilters(props: {
  sectors: Sectors
  sectorFilter: string
  setSectorFilter: Dispatch<SetStateAction<string>>
}) {
  const { sectors, sectorFilter, setSectorFilter } = props
  const options = ['all', ...sectors.map((sector) => String(sector.id))]

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'sector',
    defaultValue: sectorFilter,
    onChange: (value) => setSectorFilter(() => value)
  })

  const group = getRootProps()

  return (
    <Stack {...group}>
      {options.map((value) => {
        const radio = getRadioProps({ value })
        return (
          <SectorFilter key={value} {...radio}>
            {getSectorNameFromId(value, sectors)}
          </SectorFilter>
        )
      })}
    </Stack>
  )
}

function SectorFilter(props: RadioProps) {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        fontWeight="semibold"
        display="inline-block"
        bg="green.600"
        borderRadius="3xl"
        transition="ease-in-out"
        transitionDuration="0.2s"
        _hover={{
          bg: 'green.700'
        }}
        _checked={{
          bg: 'white',
          color: 'black'
        }}
        _focus={{
          boxShadow: 'outline'
        }}
        px={5}
        py={2}
      >
        {props.children}
      </Box>
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data: sectors }: { data: SectorResponse[] } = await axios(
    process.env.NEXT_PUBLIC_API_URL + '/sectors'
  ).then((res) => res.data)

  const { data: subsectors }: { data: SubsectorResponse[] } = await axios(
    process.env.NEXT_PUBLIC_API_URL + '/subsectors?populate[0]=sector'
  ).then((res) => res.data)

  const sectorsWithSubsectors = sectors.reduce((acc: Sector[], current) => {
    const matchingSubsectors = subsectors
      .filter((subsector) => subsector.attributes.sector.data.id === current.id)
      .map((subsector) => {
        return {
          id: subsector.id,
          attributes: {
            name: subsector.attributes.name
          }
        }
      })
    const newCurrent = {
      ...current,
      attributes: {
        ...current.attributes,
        subsectors: matchingSubsectors
      }
    }

    return [...acc, newCurrent]
  }, [])

  return {
    props: {
      sectors: sectorsWithSubsectors,
      subsectors: subsectors
    }
  }
}

export default PlatformPage
