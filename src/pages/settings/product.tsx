import {
  Box,
  Container,
  Heading,
  Link,
  HStack,
  AspectRatio,
  Image,
  Text,
  LinkBox,
  LinkOverlay,
  Grid,
  GridItem,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { NextPage } from 'next'
import { FwsmTemplate } from '../../components/template'
import NextLink from 'next/link'
import { useUser } from '../../hooks/use-user'
import { useOrganization } from '../../hooks/use-organization'
import {
  getOrganization,
  OrganizationProfile,
  updateOrganization
} from '../../endpoints'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { SettingsSidebarMenu } from '../../components/sidebar-menu'
import dynamic from 'next/dynamic'
import { FwsmWysiwygProps } from '../../components/wysiwyg'

const EditProductDescriptionPage: NextPage = (props) => {
  useUser({
    redirectTo: '/sign-in'
  })

  const { organization: currentOrganization, invalidateCache } =
    useOrganization()
  const { data: organization } = useQuery(
    ['organizationProfile', currentOrganization?.data.id],
    () => getOrganization(currentOrganization?.data.id as number),
    {
      enabled: !!currentOrganization
    }
  )

  return (
    <FwsmTemplate title="Edit product description">
      <Container pb={8}>
        {organization && (
          <>
            <PageHeader {...organization.data} />

            <Grid
              templateColumns={{
                base: '1fr',
                lg: '1fr 2fr 1fr'
              }}
              gap={8}
            >
              <GridItem>
                <SettingsSidebarMenu active="product" />
              </GridItem>
              <GridItem>
                <EditProductDescriptionForm
                  organizationProfile={organization.data}
                  invalidateCache={invalidateCache}
                />
              </GridItem>
            </Grid>
          </>
        )}
      </Container>
    </FwsmTemplate>
  )
}

function EditProductDescriptionForm(props: {
  organizationProfile: OrganizationProfile
  invalidateCache: () => void
}) {
  const { organizationProfile: organization, invalidateCache } = props
  const [editProfileState, setEditProfileState] = useState<
    'idle' | 'submitting' | 'error' | 'success'
  >('idle')

  const onSave = async (content: string) => {
    setEditProfileState(() => 'submitting')
    try {
      await updateOrganization(organization.id, {
        description: content
      })
      invalidateCache()
      setEditProfileState(() => 'success')
    } catch (err) {
      setEditProfileState(() => 'error')
    }
  }

  useEffect(() => {
    if (!['idle', 'submitting'].includes(editProfileState)) {
      window.scrollTo({ top: 0 })
    }
  }, [editProfileState])

  return (
    <>
      {editProfileState === 'success' && (
        <Alert id="notification" status="success" mb={8}>
          <AlertIcon />
          <Text>Your product description has been successfully updated</Text>
        </Alert>
      )}

      {editProfileState === 'error' && (
        <Alert id="notification" status="error" mb={8}>
          <AlertIcon />
          <Text>
            Something went wrong. Please try again or{' '}
            <a href="mailto:info@foodwastemap.com">contact us</a> if the problem
            persists
          </Text>
        </Alert>
      )}
      <Heading as="h2" size="xl" mb={6}>
        Product description
      </Heading>
      <FwsmDynamicWysiwyg
        isSubmitting={editProfileState === 'submitting'}
        onSave={onSave}
        content={organization.attributes.description}
      />
    </>
  )
}

const FwsmDynamicWysiwyg = dynamic<FwsmWysiwygProps>(
  import('../../components/wysiwyg').then((mod) => mod.FwsmWysiwyg),
  {
    ssr: false
  }
)

function PageHeader(props: OrganizationProfile) {
  return (
    <HStack alignContent="flex-start" mb={10}>
      <AspectRatio
        ratio={1}
        w="55px"
        mr={2}
        bg="gray.100"
        borderColor="gray.200"
        borderWidth="1px"
        borderStyle="solid"
      >
        {props.attributes.logo.data ? (
          <Image
            src={props.attributes.logo.data.attributes.url}
            alt={`The logo of ${props.attributes.name}`}
          />
        ) : (
          <Box></Box>
        )}
      </AspectRatio>
      <LinkBox>
        <Heading as="h1" size="lg">
          {props.attributes.name}
        </Heading>
        <NextLink href={`/platform/organization/${props.id}`} passHref>
          <LinkOverlay as={Link} color="green.500">
            View your public profile
          </LinkOverlay>
        </NextLink>
      </LinkBox>
    </HStack>
  )
}

export default EditProductDescriptionPage
