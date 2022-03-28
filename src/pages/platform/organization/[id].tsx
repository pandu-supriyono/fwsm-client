import {
  AspectRatio,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  Image,
  Link,
  Text
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { GetServerSideProps, NextPage } from 'next'
import { FwsmTemplate } from '../../../components/template'
import { ReactNode } from 'react'
import * as dateFns from 'date-fns'
import { FwsmMarkdown } from '../../../components/markdown'
import Carousel from '../../../components/carousel/carousel'
import { getOrganization, OrganizationProfile } from '../../../endpoints'
import { Image as OrganizationImage } from '../../../endpoints/common'
import { useOrganization } from '../../../hooks/use-organization'

interface OrganizationPageProps {
  organization: OrganizationProfile
}

const OrganizationPage: NextPage<OrganizationPageProps> = (props) => {
  const { organization } = props
  const { organization: currentOrganization, isCurrentOrganization } =
    useOrganization(organization.id)
  return (
    <FwsmTemplate title={'Company profile - ' + organization.attributes.name}>
      <Box
        borderBottomColor="gray.200"
        borderBottomStyle="solid"
        borderBottomWidth="1px"
        mb={{
          base: 4,
          lg: 10
        }}
      >
        <Container>
          <Grid
            gridTemplateColumns={{
              base: '1fr',
              lg: '2fr 1fr'
            }}
          >
            <GridItem
              as={Box}
              maxW={{
                base: '100%',
                lg: '75%'
              }}
              pb={[8, null, '7ch']}
              mb={{
                base: 0,
                lg: 4
              }}
            >
              {organization.attributes.logo && (
                <AspectRatio
                  ratio={1}
                  maxW="120px"
                  borderColor="gray.200"
                  borderWidth="1px"
                  mb={4}
                  borderStyle="solid"
                >
                  {organization.attributes.logo.data ? (
                    <Image
                      src={organization.attributes.logo.data.attributes.url}
                      alt={`The logo of ${organization.attributes.name}`}
                    />
                  ) : (
                    <Box>
                      <Text color="gray.500" textAlign="center">
                        No logo available
                      </Text>
                    </Box>
                  )}
                </AspectRatio>
              )}

              <Heading as="h1" size="3xl" mb={4}>
                {organization.attributes.name}
              </Heading>
              <Text fontSize="xl" mb={4}>
                {organization.attributes.shortDescription}
              </Text>
              {isCurrentOrganization ? (
                <Button
                  mt={2}
                  variant="solid"
                  as="a"
                  href="/settings/profile"
                  cursor="pointer"
                  colorScheme="green"
                  fontSize="xl"
                >
                  Edit public profile
                </Button>
              ) : (
                <Button
                  mt={2}
                  variant="solid"
                  as="a"
                  href={`mailto:${organization.attributes.email}`}
                  cursor="pointer"
                  colorScheme="green"
                  fontSize="xl"
                >
                  Contact organization
                </Button>
              )}
            </GridItem>
            <GridItem
              as={Box}
              borderStyle="solid"
              borderColor="gray.200"
              borderWidth={{
                base: '0',
                lg: '1px'
              }}
              px={{
                base: 0,
                lg: 6
              }}
              py={{
                base: 0,
                lg: 4
              }}
              mb={{
                base: 6,
                lg: 0
              }}
              height="min-content"
              borderRadius="lg"
            >
              <Heading as="h2" size="md" mb={2}>
                Company details
              </Heading>
              <CompanyDetail title="Sector">
                <NextLink
                  href={`/themes/${organization.attributes.subsector.data.attributes.sector.data.id}`}
                  passHref
                >
                  <Link color="green.500">
                    {
                      organization.attributes.subsector.data.attributes.sector
                        .data.attributes.name
                    }
                  </Link>
                </NextLink>
              </CompanyDetail>
              <CompanyDetail title="Subsector">
                <NextLink
                  href={`/themes/${organization.attributes.subsector.data.attributes.sector.data.id}#${organization.attributes.subsector.data.id}`}
                  passHref
                >
                  <Link color="green.500">
                    {organization.attributes.subsector.data.attributes.name}
                  </Link>
                </NextLink>
              </CompanyDetail>
              <CompanyDetail title="Location">
                {organization.attributes.address.city +
                  ', ' +
                  organization.attributes.address.country}
              </CompanyDetail>
              <CompanyDetail title="Registered on">
                {dateFns.format(
                  new Date(organization.attributes.createdAt),
                  'dd MMMM yyyy'
                )}
              </CompanyDetail>
              <CompanyDetail title="Last updated on">
                {dateFns.format(
                  new Date(organization.attributes.updatedAt),
                  'dd MMMM yyyy'
                )}
              </CompanyDetail>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      <Box
        mb={{
          base: 10,
          lg: '4rem'
        }}
      >
        <Container>
          {organization.attributes.description && (
            <Box maxW="80ch">
              <FwsmMarkdown>{organization.attributes.description}</FwsmMarkdown>
            </Box>
          )}
        </Container>

        {organization.attributes.images.data &&
        organization.attributes.images.data?.length > 0 ? (
          <CompanyImages images={organization.attributes.images.data} />
        ) : null}
      </Box>
    </FwsmTemplate>
  )
}

function CompanyImages(props: { images: OrganizationImage[] }) {
  const { images } = props
  return (
    <Box overflowX="hidden" mt={10}>
      <Container>
        <Carousel>
          {images.map((image) => (
            <Image
              maxW={{
                base: '100%',
                lg: '60ch'
              }}
              objectFit="cover"
              key={`profile-img-${image.id}`}
              src={image.attributes.url}
            />
          ))}
        </Carousel>
      </Container>
    </Box>
  )
}

function CompanyDetail(props: { title: string; children: ReactNode }) {
  const { children, title } = props
  return (
    <Box
      _notLast={{
        marginBottom: 2
      }}
    >
      <Heading as="h3" size="xs" fontFamily="body">
        {title}
      </Heading>
      <Text>{children}</Text>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = Number(ctx.params?.id)

  try {
    const organization = await getOrganization(id)

    return {
      props: {
        organization: organization.data
      }
    }
  } catch (err) {
    return {
      notFound: true
    }
  }
}

export default OrganizationPage
