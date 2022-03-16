import type { GetStaticProps, NextPage } from 'next'
import { FwsmTemplate } from '../components/template'
import {
  Heading,
  Container,
  Box,
  Text,
  Button,
  Stack,
  useDisclosure,
  Link,
  LinkBox,
  LinkOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  AspectRatio,
  UnorderedList,
  ListItem
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { ChevronDownIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { ReactNode, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import qs from 'qs'

interface Sector {
  id: number
  attributes: {
    name: string
  }
}

interface HomeProps {
  sectors: Sector[]
}

const Home: NextPage<HomeProps> = (props) => {
  const { sectors } = props

  return (
    <FwsmTemplate>
      <Hero />
      <HighlightedOrganizations sectors={sectors} />
      <BlurbSection />
      <SectorOverview />
    </FwsmTemplate>
  )
}

function Hero() {
  return (
    <Box
      pt="2rem"
      pb={{
        base: '2rem',
        lg: '8rem'
      }}
      borderStyle="solid"
      borderBottom="1px"
      borderColor="gray.200"
      marginBottom={8}
    >
      <Container
        textAlign={['left', null, 'center']}
        maxW={{
          lg: '70ch'
        }}
      >
        <Heading as="h1" size="3xl" mb={6}>
          Make food waste a thing of{' '}
          <Box as="span" color="green">
            the past
          </Box>
        </Heading>
        <Text fontSize="xl" color="gray.500" mb={8}>
          Food Waste Solution map is a platform to discover and connect with
          institutions, organizations and companies that work towards ending
          food waste, making it easy to join forces and create an impact.
        </Text>
        <Stack
          justifyContent="center"
          direction={{
            base: 'column',
            lg: 'row'
          }}
        >
          <NextLink href="/sign-up" passHref>
            <Button as="a" size="lg" colorScheme="green">
              Sign up for free
            </Button>
          </NextLink>
          <NextLink href="/platform" passHref>
            <Button as="a" size="lg">
              Discover partners
            </Button>
          </NextLink>
        </Stack>
      </Container>
    </Box>
  )
}

function HighlightedOrganizations(props: { sectors: Sector[] }) {
  interface Organization {
    id: number
    attributes: {
      name: string
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

  const { sectors } = props

  const baseUrl = process.env.NEXT_PUBLIC_API_URL + '/organizations'
  const [sectorFilter, setSectorFilter] = useState<Sector>(sectors[0])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [query, setQuery] = useState('')

  const { data: organizations } = useQuery<Organization[]>(
    ['organizationSpotlight', query],
    () => axios(baseUrl + query).then((res) => res.data.data)
  )

  useEffect(() => {
    if (sectorFilter.id === 0) {
      setQuery(
        () =>
          '?' +
          qs.stringify({
            pagination: {
              start: 0,
              limit: 2
            },
            populate: ['subsector']
          })
      )
    } else {
      setQuery(
        () =>
          '?' +
          qs.stringify({
            pagination: {
              start: 0,
              limit: 2
            },
            populate: ['subsector'],
            filters: {
              subsector: {
                sector: {
                  id: {
                    $eq: sectorFilter.id
                  }
                }
              }
            }
          })
      )
    }
  }, [sectorFilter])

  return (
    <Container mb={10}>
      <Box>
        <Heading as="h2" mb={4}>
          Discover companies in{' '}
          <Button
            onClick={onOpen}
            size="2xl"
            variant="link"
            cursor="pointer"
            colorScheme="green"
          >
            {sectorFilter.attributes.name.toLowerCase()} <ChevronDownIcon />
          </Button>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Discover companies by sector</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <UnorderedList
                  ml={0}
                  mb={6}
                  listStyleType="none"
                  textAlign="center"
                >
                  {sectors.map((sector) => (
                    <ListItem
                      key={`sector-${sector.id}`}
                      _notLast={{
                        mb: 2
                      }}
                    >
                      <Button
                        variant="link"
                        colorScheme="green"
                        fontSize={{
                          base: 'xl',
                          lg: '2xl'
                        }}
                        onClick={(e) => {
                          onClose()
                          setSectorFilter(
                            () =>
                              sectors.find((s) => s.id === sector.id) as Sector
                          )
                        }}
                      >
                        {sector.attributes.name}
                      </Button>
                    </ListItem>
                  ))}
                </UnorderedList>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Heading>
        <SimpleGrid spacing={8} columns={[1, 2, 3]}>
          {organizations && organizations.length >= 1
            ? organizations.map((organization) => (
                <LinkBox key={`organization-${organization.id}`}>
                  <AspectRatio ratio={16 / 9} mb={2}>
                    <Box backgroundColor="gray" borderRadius={6}></Box>
                  </AspectRatio>
                  <Heading as="h3" size="md">
                    <NextLink href="/" passHref>
                      <LinkOverlay color="green.500" as={Link}>
                        {organization.attributes.name}
                      </LinkOverlay>
                    </NextLink>
                  </Heading>
                  <Text>
                    {organization?.attributes?.subsector?.data.attributes.name}
                  </Text>
                </LinkBox>
              ))
            : null}

          <Box>
            <Heading as="h3" size="md">
              Does your organization work against food waste?
            </Heading>
            <Text mb={6}>
              Register for free and get a temporary spotlight on the front page
            </Text>
            <NextLink href="/sign-up" passHref>
              <Button as="a" colorScheme="green">
                Sign up
              </Button>
            </NextLink>
          </Box>
        </SimpleGrid>
      </Box>
    </Container>
  )
}

function BlurbSection() {
  return (
    <Box backgroundColor="gray.100" py={[10, null, '5rem']} pb={10}>
      <Container maxW="80ch">
        <Text textAlign="center" color="gray.500" mb={6}>
          Opportunities from the Food Waste Solution Map
        </Text>
        <Heading as="h2" size="2xl" textAlign="center" mb={8}>
          Create the solution together
        </Heading>
        <Text maxW="60ch" textAlign="center" mx="auto" fontSize="lg" mb={8}>
          Join initiatives and share innovations across the entire production
          chain -- not only are they necessary, but offer benefits for business,
          consumer and environment.
        </Text>
      </Container>
      <Container>
        <SimpleGrid
          columns={{
            base: 1,
            lg: 3
          }}
          spacing={8}
        >
          <BlurbItem heading="Make your product visible" step={1}>
            Create a detailed profile page for your organization. We&apos;ll
            make sure that your profile is searchable and filterable for others.
          </BlurbItem>
          <BlurbItem heading="Find and connect" step={2}>
            Search and filter other organizations and initiatives that are
            registered on our network based on sector and/or region.
          </BlurbItem>
          <BlurbItem heading="Join forces and make impact" step={3}>
            Found a potential partner? Contact them and start working together
            towards a world without food waste.
          </BlurbItem>
        </SimpleGrid>
      </Container>
    </Box>
  )
}

function BlurbItem(props: {
  heading: string
  children?: ReactNode
  step?: number
}) {
  const { heading, children, step } = props

  return (
    <Box
      backgroundColor="white"
      rounded="12px"
      shadow="base"
      py={6}
      pl={{
        base: 16,
        lg: 8
      }}
      pr={{
        base: 8
      }}
      pos="relative"
    >
      {step && (
        <Box
          position="absolute"
          left={{
            base: 8,
            lg: 0
          }}
          backgroundColor="green"
          transform="translateX(-50%) translateY(-50%)"
          width="4ch"
          top="50%"
          height="4ch"
          display="flex"
          justifyContent="center"
          alignItems="center"
          borderRadius="50%"
        >
          <Text color="white">{step}</Text>
        </Box>
      )}

      <Heading as="h3" size="md" color="green" mb={2}>
        {heading}
      </Heading>
      <Text>{children}</Text>
    </Box>
  )
}

function SectorOverview() {
  return (
    <Box backgroundColor="gray.100" pb={12}>
      <Container maxW="80ch">
        <Text textAlign="center" color="gray.500" mb={6}>
          The sectors of the Food Waste Solution Map
        </Text>
        <Heading as="h2" size="2xl" textAlign="center" mb={8}>
          The food chain in 5 sectors
        </Heading>
        <Text maxW="60ch" textAlign="center" mx="auto" fontSize="lg" mb={10}>
          Food Waste Solution Map categorizes the food chain in 5 different
          sectors. Search and find an organization that operates in a specific
          sector or register your own.
        </Text>
      </Container>
      <Container maxW="90ch">
        <UnorderedList listStyleType="none" ml={0}>
          <SimpleGrid
            columns={{
              base: 1,
              lg: 2
            }}
          >
            <SectionOverviewItem title="Production and post harvesting">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Accusantium, obcaecati molestiae veniam sequi laboriosam vitae
              voluptas.
            </SectionOverviewItem>
            <SectionOverviewItem title="Processing">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Accusantium, obcaecati molestiae veniam sequi laboriosam vitae
              voluptas.
            </SectionOverviewItem>
            <SectionOverviewItem title="Packaging, storage and ripening">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Accusantium, obcaecati molestiae veniam sequi laboriosam vitae
              voluptas.
            </SectionOverviewItem>
            <SectionOverviewItem title="Distribution">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Accusantium, obcaecati molestiae veniam sequi laboriosam vitae
              voluptas.
            </SectionOverviewItem>
            <SectionOverviewItem title="Retail">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Accusantium, obcaecati molestiae veniam sequi laboriosam vitae
              voluptas.
            </SectionOverviewItem>
          </SimpleGrid>
        </UnorderedList>
      </Container>
    </Box>
  )
}

function SectionOverviewItem(props: {
  title: string
  children?: ReactNode
  href?: string
}) {
  const { title, children, href } = props
  return (
    <LinkBox
      as={Box}
      borderColor="gray.400"
      borderStyle="solid"
      borderBottomWidth="1px"
      _odd={{
        borderRightWidth: { base: 0, lg: '1px' },
        pr: { base: 0, lg: 6 }
      }}
      _even={{
        pl: { base: 0, lg: 6 }
      }}
      _last={{
        borderBottom: '0'
      }}
      py={6}
    >
      <Heading as="h3" size="md" mb={2}>
        <NextLink href={href || '#'} passHref>
          <LinkOverlay as={Link} color="green.500">
            <Box as="span" mr={2}>
              {title}
            </Box>
            <ArrowForwardIcon />
          </LinkOverlay>
        </NextLink>
      </Heading>
      <Text>{children}</Text>
    </LinkBox>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data: sectors } = await axios(
    process.env.NEXT_PUBLIC_API_URL + '/sectors'
  ).then((res) => res.data)

  return {
    props: {
      sectors: [
        {
          id: 0,
          attributes: {
            name: 'All sectors'
          }
        },
        ...sectors
      ]
    }
  }
}

export default Home
