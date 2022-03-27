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
  Image,
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
import { ReactNode, useState } from 'react'
import { useQuery } from 'react-query'
import {
  getHighlightedOrganizations,
  getSectors,
  HighlightedOrganization,
  sectionHeader,
  Sector,
  getHomePageContent,
  HomePageContent
} from '../endpoints'

interface HomeProps {
  sectors: Sector[]
  content: HomePageContent
}

const Home: NextPage<HomeProps> = (props) => {
  const { sectors, content } = props

  return (
    <FwsmTemplate>
      <Hero {...content} />
      <HighlightedOrganizations sectors={sectors} />
      <BlurbSection {...content} />
      <SectorOverviewBlurb {...content} />
    </FwsmTemplate>
  )
}

function Hero(props: HomePageContent) {
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
          {props.attributes.lead}
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
  const { sectors } = props

  const [sectorFilter, setSectorFilter] = useState<Sector>(sectors[0])
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: organizations } = useQuery(
    ['highlightedOrganizations', sectorFilter.id],
    () =>
      getHighlightedOrganizations(
        sectorFilter.id === 0 ? undefined : sectorFilter.id
      ).then((data) => data.data)
  )

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
            <ModalContent
              maxW={{
                lg: '800px'
              }}
            >
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
            ? organizations.map(
                (organization) =>
                  organization.attributes.subsector && (
                    <LinkBox key={`organization-${organization.id}`}>
                      <AspectRatio ratio={16 / 9} mb={2}>
                        <FeaturedImage {...organization} />
                      </AspectRatio>
                      <Heading as="h3" size="md">
                        <NextLink
                          href={`/platform/organization/${organization.id}`}
                          passHref
                        >
                          <LinkOverlay color="green.500" as={Link}>
                            {organization.attributes.name}
                          </LinkOverlay>
                        </NextLink>
                      </Heading>
                      <Text>
                        {
                          organization?.attributes?.subsector?.data.attributes
                            .name
                        }
                      </Text>
                    </LinkBox>
                  )
              )
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

function FeaturedImage(props: HighlightedOrganization) {
  if (props.attributes.featuredImage.data) {
    return (
      <Image
        src={
          props.attributes.featuredImage.data.attributes.formats.thumbnail.url
        }
        borderRadius={6}
      />
    )
  } else {
    return (
      <Box backgroundColor="gray.200" borderRadius={6}>
        <Text color="gray.500">No image available</Text>
      </Box>
    )
  }
}

function BlurbSection(props: HomePageContent) {
  return (
    <Box backgroundColor="gray.100" py={[10, null, '5rem']} pb={10}>
      <Container maxW="80ch">
        <SectionHeader {...props.attributes.functionalityHighlight.header} />
      </Container>
      <Container>
        <SimpleGrid
          columns={{
            base: 1,
            lg: 3
          }}
          spacing={8}
        >
          {props.attributes.functionalityHighlight.steps?.map((step) => (
            <BlurbItem
              key={`step-${step.id}`}
              heading={step.heading}
              step={step.stepNumber}
            >
              {step.content}
            </BlurbItem>
          ))}
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

function SectionHeader(props: sectionHeader) {
  return (
    <>
      <Text textAlign="center" color="gray.500" mb={6}>
        {props.subtitle}
      </Text>
      <Heading as="h2" size="2xl" textAlign="center" mb={8}>
        {props.heading}
      </Heading>
      <Text maxW="60ch" textAlign="center" mx="auto" fontSize="lg" mb={10}>
        {props.description}
      </Text>
    </>
  )
}

function SectorOverviewBlurb(props: HomePageContent) {
  return (
    <Box backgroundColor="gray.100" pb={12}>
      <Container maxW="80ch">
        <SectionHeader {...props.attributes.sectorOverview.header} />
      </Container>
      <Container maxW="90ch">
        <UnorderedList listStyleType="none" ml={0}>
          <SimpleGrid
            columns={{
              base: 1,
              lg: 2
            }}
          >
            {props.attributes.sectorOverview.cards?.map((card) => (
              <SectionOverviewItem
                key={`sector-card-${card.id}`}
                title={card.title}
                href={`/themes/${card.sector.data.id}`}
              >
                {card.content}
              </SectionOverviewItem>
            ))}
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
  const sectors = await getSectors()

  const homePageContent = await getHomePageContent()

  return {
    props: {
      sectors: [
        {
          id: 0,
          attributes: {
            name: 'All sectors'
          }
        },
        ...sectors.data
      ],
      content: homePageContent.data
    }
  }
}

export default Home
