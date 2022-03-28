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
  UnorderedList,
  ListItem,
  Grid,
  GridItem,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  Textarea,
  Button,
  Alert,
  AlertIcon,
  FormErrorMessage,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import { GetStaticProps, NextPage } from 'next'
import { FwsmTemplate } from '../../components/template'
import NextLink from 'next/link'
import { useUser } from '../../hooks/use-user'
import { useOrganization } from '../../hooks/use-organization'
import {
  getOrganization,
  OrganizationProfile,
  updateOrganization,
  UploadedImage,
  uploadImage
} from '../../endpoints'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { Countries, countries } from '../../country-list'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { SettingsSidebarMenu } from '../../components/sidebar-menu'

interface EditProfilePageProps {
  countryList: Countries
}

const EditProfilePage: NextPage<EditProfilePageProps> = (props) => {
  const { countryList } = props
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
    <FwsmTemplate title="Edit profile">
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
                <SettingsSidebarMenu active="profile" />
              </GridItem>
              <GridItem>
                <EditProfileForm
                  organizationProfile={organization.data}
                  countryList={countryList}
                  invalidateCache={invalidateCache}
                />
              </GridItem>
              <GridItem>
                <EditLogo {...organization.data} />
              </GridItem>
            </Grid>
          </>
        )}
      </Container>
    </FwsmTemplate>
  )
}

function UploadLogoModal(props: {
  isOpen: boolean
  onClose: () => void
  organizationId: number
}) {
  interface Idle {
    _tag: 'Idle'
  }
  interface Uploading {
    _tag: 'Uploading'
    file: File
  }
  interface Uploaded {
    _tag: 'Uploaded'
    file: UploadedImage
  }
  interface UploadError {
    _tag: 'UploadError'
  }
  const [uploadState, setUploadState] = useState<
    Idle | Uploading | Uploaded | UploadError
  >({
    _tag: 'Idle'
  })
  const { isOpen, onClose, organizationId } = props
  const queryClient = useQueryClient()

  const setLogo = async (logo: UploadedImage) => {
    const id = logo.id

    try {
      await updateOrganization(organizationId, {
        logo: id
      })

      queryClient.invalidateQueries('currentOrganization')
      queryClient.invalidateQueries(['organizationProfile', organizationId])
      onClose()
      setUploadState(() => ({
        _tag: 'Idle'
      }))
    } catch (err) {
      setUploadState(() => ({
        _tag: 'UploadError'
      }))
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const lastIdx = Math.max(0, acceptedFiles.length - 1)
    const toUpload = acceptedFiles[lastIdx]
    setUploadState(() => ({
      _tag: 'Uploading',
      file: toUpload
    }))
  }, [])

  useEffect(() => {
    const upload = async (file: File) => {
      try {
        const result = await uploadImage(file)
        setUploadState(() => ({
          _tag: 'Uploaded',
          file: result
        }))
      } catch (e) {
        setUploadState(() => ({
          _tag: 'UploadError'
        }))
      }
    }
    if (uploadState._tag === 'Uploading') {
      upload(uploadState.file)
    }
  }, [uploadState])

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: 'image/jpeg,image/png,image/jpg',
    maxFiles: 1,
    maxSize: 5000000,
    onDrop
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setUploadState(() => ({ _tag: 'Idle' }))
        onClose()
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {uploadState._tag === 'Uploaded' || uploadState._tag === 'UploadError'
            ? 'Preview your uploaded logo'
            : 'Upload organization logo'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {(uploadState._tag === 'Idle' ||
            uploadState._tag === 'UploadError') && (
            <>
              {uploadState._tag === 'UploadError' && (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  An error occured. Please try again.
                </Alert>
              )}
              <Text>
                To show your organization logo publicly, make sure that your
                logo is:
              </Text>
              <UnorderedList mb={8}>
                <ListItem>A square (close to 1:1 ratio)</ListItem>
                <ListItem>In a .png, .jpg or .jpeg format</ListItem>
                <ListItem>No larger than 5MB</ListItem>
              </UnorderedList>
              <Box
                {...getRootProps()}
                bg="gray.50"
                borderColor="gray.200"
                borderWidth={3}
                borderStyle="dashed"
                py={8}
                mb={8}
              >
                <input {...getInputProps()} />
                <Text textAlign="center">
                  Drag an image here or click to upload
                </Text>
              </Box>
            </>
          )}
          {uploadState._tag === 'Uploading' && (
            <Box mb={6}>
              <Text textAlign="center">Uploading, please wait...</Text>
            </Box>
          )}
          {uploadState._tag === 'Uploaded' && (
            <Box>
              <AspectRatio
                ratio={1}
                maxW="180px"
                mx="auto"
                borderWidth={1}
                borderColor="gray.100"
              >
                <Image
                  src={uploadState.file.formats.thumbnail.url}
                  alt="Your uploaded logo"
                />
              </AspectRatio>
            </Box>
          )}
        </ModalBody>
        {uploadState._tag === 'Uploaded' && (
          <>
            <Divider mt={2} />
            <ModalFooter>
              <Stack
                w={{
                  base: '100%',
                  lg: 'inherit'
                }}
                direction={{
                  base: 'column',
                  lg: 'row'
                }}
                spacing={2}
              >
                <Button
                  display={{
                    base: 'block',
                    lg: 'inline-block'
                  }}
                  colorScheme="green"
                  onClick={() => setLogo(uploadState.file)}
                >
                  Continue
                </Button>
                <Button
                  onClick={() => setUploadState(() => ({ _tag: 'Idle' }))}
                  display={{
                    base: 'block',
                    lg: 'inline-block'
                  }}
                >
                  Choose another logo
                </Button>
              </Stack>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

function EditLogo(props: OrganizationProfile) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <UploadLogoModal
        organizationId={props.id}
        isOpen={isOpen}
        onClose={onClose}
      />
      <Heading as="h3" size="md" mb={6}>
        Organization logo
      </Heading>
      <Box pos="relative">
        <Button
          pos="absolute"
          onClick={onOpen}
          zIndex={10}
          variant="solid"
          bottom={3}
          left={3}
          borderWidth={1}
          borderColor="gray.400"
        >
          Edit
        </Button>
        <AspectRatio
          ratio={1}
          w="100%"
          bg="gray.100"
          borderColor="gray.200"
          borderWidth="1px"
          borderStyle="solid"
        >
          <>
            {props.attributes.logo.data ? (
              <Image
                src={props.attributes.logo.data.attributes.url}
                alt={`The logo of ${props.attributes.name}`}
              />
            ) : (
              <Box></Box>
            )}
          </>
        </AspectRatio>
      </Box>
    </>
  )
}

function EditProfileForm(props: {
  organizationProfile: OrganizationProfile
  countryList: Countries
  invalidateCache: () => void
}) {
  const {
    organizationProfile: organization,
    countryList,
    invalidateCache
  } = props
  const [editProfileState, setEditProfileState] = useState<
    'idle' | 'error' | 'succes'
  >('idle')
  const [shortDescriptionLength, setShortDescriptionLength] = useState(
    organization.attributes.shortDescription.length
  )
  const countryCodes = countryList.map((country) => country.code)
  const editProfileSchema = z.object({
    name: z.string().nonempty(),
    email: z.string().email(),
    website: z.string().nullable(),
    shortDescription: z.string().max(150),
    address: z.string(),
    province: z.string(),
    postcode: z.string(),
    city: z.string(),
    //@ts-ignore
    country: z.enum(countryCodes as const)
  })

  const {
    register,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm({
    defaultValues: {
      name: organization.attributes.name,
      email: organization.attributes.email,
      website: organization.attributes.website,
      shortDescription: organization.attributes.shortDescription,
      address: organization.attributes.address.address,
      province: organization.attributes.address.province,
      postcode: organization.attributes.address.postcode,
      city: organization.attributes.address.city,
      country: organization.attributes.address.country
    },
    resolver: zodResolver(editProfileSchema)
  })

  const onSubmit = handleSubmit(async (values) => {
    setEditProfileState(() => 'idle')
    try {
      const updated = {
        name: values.name,
        email: values.email,
        website: values.website,
        shortDescription: values.shortDescription,
        address: {
          address: values.address,
          postcode: values.postcode,
          city: values.city,
          country: values.country,
          province: values.province
        }
      }

      await updateOrganization(organization.id, updated)
      invalidateCache()

      setEditProfileState('succes')
    } catch (err) {
      setEditProfileState('error')
    }
  })

  const handleShortDescriptionChange = (
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    setShortDescriptionLength(e.target.value.length)
    if (shortDescriptionLength >= 150) {
      setValue('shortDescription', e.target.value.slice(0, 149))
    }
  }

  useEffect(() => {
    if (editProfileState != 'idle') {
      window.scrollTo({ top: 0 })
    }
  }, [editProfileState])

  return (
    <>
      {editProfileState === 'succes' && (
        <Alert id="notification" status="success" mb={8}>
          <AlertIcon />
          <Text>Your profile has been successfully updated</Text>
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
        Public profile
      </Heading>
      <form noValidate onSubmit={onSubmit}>
        <FormControl isInvalid={!!errors.name} mb={6}>
          <FormLabel htmlFor="name">Company name</FormLabel>
          <Input {...register('name')} id="name" />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email} mb={6}>
          <FormLabel htmlFor="email">Public email</FormLabel>
          <Input {...register('email')} id="email" type="email" />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.website} mb={6}>
          <FormLabel htmlFor="website">Website</FormLabel>
          <Input {...register('website')} id="website" />
          <FormErrorMessage>{errors.website?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.shortDescription} mb={6}>
          <FormLabel htmlFor="shortDescription">Short description</FormLabel>
          <Textarea
            {...register('shortDescription')}
            id="shortDescription"
            onChange={handleShortDescriptionChange}
            maxLength={150}
          />
          <FormErrorMessage>
            {errors.shortDescription?.message}
          </FormErrorMessage>
          <FormHelperText>
            {150 - shortDescriptionLength} characters left
          </FormHelperText>
        </FormControl>

        <Divider mb={6} />
        <FormControl as="fieldset">
          <FormLabel
            fontWeight="bold"
            fontFamily="heading"
            fontSize="2xl"
            as="legend"
          >
            Address details
          </FormLabel>
          <FormControl isInvalid={!!errors.address} mb={6}>
            <FormLabel htmlFor="address">Address</FormLabel>
            <Input {...register('address')} id="address" />
            <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.postcode} mb={6}>
            <FormLabel htmlFor="postcode">Postcode</FormLabel>
            <Input {...register('postcode')} id="postcode" />
            <FormErrorMessage>{errors.postcode?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.city} mb={6}>
            <FormLabel htmlFor="city">City</FormLabel>
            <Input {...register('city')} id="city" />
            <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.province} mb={6}>
            <FormLabel htmlFor="province">Province</FormLabel>
            <Input {...register('province')} id="province" />
            <FormErrorMessage>{errors.province?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.country} mb={6}>
            <FormLabel htmlFor="country">Country</FormLabel>
            <Select {...register('country')}>
              {countryList.map((country) => (
                <option value={country.code} key={country.code}>
                  {country.name}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.country?.message}</FormErrorMessage>
          </FormControl>
        </FormControl>
        <Button isLoading={isSubmitting} type="submit" colorScheme="green">
          Update profile
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

export default EditProfilePage

export const getStaticProps: GetStaticProps = () => {
  return {
    props: {
      countryList: countries
    }
  }
}
