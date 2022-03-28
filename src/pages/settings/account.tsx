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
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import { NextPage } from 'next'
import { FwsmTemplate } from '../../components/template'
import NextLink from 'next/link'
import { useUser } from '../../hooks/use-user'
import { useOrganization } from '../../hooks/use-organization'
import {
  getOrganization,
  OrganizationProfile,
  Image as ImageData,
  uploadImages,
  UploadedImage,
  updateOrganization,
  changePassword
} from '../../endpoints'
import { useQuery } from 'react-query'
import { SettingsSidebarMenu } from '../../components/sidebar-menu'
import { useCallback, useEffect, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'

const EditAccountPage: NextPage = (props) => {
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
    <FwsmTemplate title="Edit your account settings">
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
                <SettingsSidebarMenu active="account" />
              </GridItem>
              <GridItem>
                <EditProfileForm
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

function EditProfileForm(props: {
  organizationProfile: OrganizationProfile
  invalidateCache: () => void
}) {
  const { organizationProfile: organization, invalidateCache } = props
  const [status, setStatus] = useState<'success' | 'error' | null>(null)
  const schema = z
    .object({
      currentPassword: z.string(),
      password: z.string().min(8),
      confirmPassword: z.string()
    })
    .refine((values) => values.confirmPassword === values.password, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    })

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      setStatus(null)
      await changePassword(values)
      reset()
      setStatus('success')
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 400) {
        setError('currentPassword', { message: 'The password is incorrect' })
        return
      }
      setStatus('error')
    }
  })

  useEffect(() => {
    if (status !== null) {
      window.scrollTo({ top: 0 })
    }
  }, [status])

  return (
    <>
      <Heading as="h2" size="xl" mb={6}>
        Account settings
      </Heading>
      {status && (
        <Alert status={status} mb={4}>
          <AlertIcon />
          {status === 'error'
            ? 'An unknown error occured. Please try again shortly.'
            : 'Your password has been successfully changed.'}
        </Alert>
      )}
      <form onSubmit={onSubmit}>
        <FormControl as="fieldset">
          <Heading as="legend" size="md" mb={4}>
            Change password
          </Heading>
          <Stack spacing={6} mb={6}>
            <FormControl isInvalid={!!errors.currentPassword}>
              <FormLabel htmlFor="currentPassword">Current password</FormLabel>
              <Input
                {...register('currentPassword')}
                type="password"
                id="currentPassword"
              />
              <FormErrorMessage>
                {errors.currentPassword?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.password}>
              <FormLabel htmlFor="password">New password</FormLabel>
              <Input {...register('password')} type="password" id="password" />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel htmlFor="confirmPassword">
                Confirm new password
              </FormLabel>
              <Input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
              />
              <FormErrorMessage>
                {errors.confirmPassword?.message}
              </FormErrorMessage>
            </FormControl>
          </Stack>
        </FormControl>
        <Button isLoading={isSubmitting} colorScheme="green" type="submit">
          Change password
        </Button>
      </form>
    </>
  )
}

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

export default EditAccountPage
