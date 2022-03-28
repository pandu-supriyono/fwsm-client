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
  Stack
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
  updateOrganization
} from '../../endpoints'
import { useQuery } from 'react-query'
import { SettingsSidebarMenu } from '../../components/sidebar-menu'
import { useCallback, useState } from 'react'

const EditProfilePage: NextPage = (props) => {
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
    <FwsmTemplate title="Edit product images">
      <Container pb={8}>
        {organization && (
          <>
            <PageHeader {...organization.data} />

            <Grid
              templateColumns={{
                base: '1fr',
                lg: '1fr 3fr'
              }}
              gap={8}
            >
              <GridItem>
                <SettingsSidebarMenu active="images" />
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
  interface Idle {
    _tag: 'Idle'
  }

  interface Uploading {
    _tag: 'Uploading'
    files: File[]
    queued: UploadedImage[]
  }

  interface Queued {
    _tag: 'Queued'
    queued: UploadedImage[]
  }

  interface Submitting {
    _tag: 'Submitting'
    queued: UploadedImage[]
  }

  const [uploadState, setUploadState] = useState<
    Idle | Uploading | Queued | Submitting
  >({
    _tag: 'Idle'
  })
  const { organizationProfile: organization, invalidateCache } = props
  const [numberOfFilesUploading, setNumberOfFilesUploading] = useState(0)

  const numberOfExistingFiles = organization.attributes.images.data
    ? organization.attributes.images.data.length
    : 0
  const numberOfFilesAllowed = Math.max(
    0,
    5 - numberOfExistingFiles - numberOfFilesUploading
  )

  const onDrop = useCallback(
    async (files: File[]) => {
      setNumberOfFilesUploading((previous) => previous + files.length)
      const alreadyQueued =
        uploadState._tag === 'Queued' ? uploadState.queued : []

      setUploadState(() => ({
        _tag: 'Uploading',
        files,
        queued: alreadyQueued
      }))
      const result = await uploadImages(files)
      setUploadState(() => ({
        _tag: 'Queued',
        queued: [...alreadyQueued, ...result]
      }))
    },
    [uploadState]
  )

  const save = useCallback(async () => {
    if (uploadState._tag === 'Queued') {
      const queued = uploadState.queued.map((image) => image.id)
      const ids = [
        ...(organization.attributes.images.data?.map((image) => image.id) ||
          []),
        ...queued
      ]

      try {
        setUploadState(() => ({
          _tag: 'Submitting',
          queued: uploadState.queued
        }))
        await updateOrganization(organization.id, {
          images: ids
        })
        setNumberOfFilesUploading((prev) => prev - queued.length)
        invalidateCache()
        setUploadState(() => ({ _tag: 'Idle' }))
      } catch (err) {}
    }
  }, [uploadState, organization, invalidateCache])

  const onDelete = useCallback(
    async (id: number) => {
      if (uploadState._tag === 'Queued') {
        const isFromQueue = uploadState.queued.some((item) => item.id === id)
        if (isFromQueue) {
          uploadState.queued.length > 1
            ? setUploadState((prev) => ({
                ...prev,
                queued: uploadState.queued.filter((item) => item.id !== id)
              }))
            : setUploadState(() => ({
                _tag: 'Idle'
              }))
          setNumberOfFilesUploading((prev) => prev - 1)
        }
      }
      const isFromExisting = organization.attributes.images.data?.some(
        (item) => item.id === id
      )
      if (isFromExisting) {
        const ids = (
          organization.attributes.images.data?.map((image) => image.id) || []
        ).filter((existingId) => existingId !== id)

        try {
          await updateOrganization(organization.id, {
            images: ids
          })
          invalidateCache()
        } catch (err) {}
      }
    },
    [uploadState, organization, invalidateCache]
  )

  return (
    <>
      <Heading as="h2" size="xl" mb={6}>
        Product images
      </Heading>
      <Grid
        gridTemplateColumns={{
          base: '1fr',
          lg: '1fr 1fr'
        }}
        gap={8}
      >
        <GridItem>
          <Dropzone
            numberOfFilesAllowed={numberOfFilesAllowed}
            uploadedImages={organization.attributes.images.data}
            onDrop={onDrop}
            isLoading={uploadState._tag === 'Uploading'}
          />
        </GridItem>
        <GridItem>
          <Stack spacing={4}>
            <CurrentImages onDelete={onDelete} organization={organization} />
            {(uploadState._tag === 'Queued' ||
              uploadState._tag === 'Uploading' ||
              uploadState._tag === 'Submitting') && (
              <QueuedImages
                isLoading={uploadState._tag === 'Submitting'}
                save={save}
                onDelete={onDelete}
                images={uploadState.queued}
              />
            )}
          </Stack>
        </GridItem>
      </Grid>
    </>
  )
}

function QueuedImages(props: {
  images: UploadedImage[]
  onDelete: (id: number) => Promise<void>
  isLoading?: boolean
  save: () => Promise<void>
}) {
  return (
    <>
      {props.images.length > 0 && (
        <Heading as="h4" size="sm">
          Images ready for upload
        </Heading>
      )}
      {props.images.map((image) => (
        <PreviewImage key={image.id} image={image} onDelete={props.onDelete} />
      ))}
      {props.images.length > 0 && (
        <Button
          isLoading={props.isLoading}
          onClick={() => props.save()}
          colorScheme="green"
        >
          Upload images
        </Button>
      )}
    </>
  )
}

function PreviewImage(props: {
  image: UploadedImage
  onDelete: (id: number) => Promise<void>
}) {
  const { image, onDelete } = props
  return (
    <HStack>
      <AspectRatio
        borderWidth={1}
        borderColor="gray.200"
        ratio={3 / 2}
        minW="100px"
        mr={4}
      >
        <Image src={image.formats.thumbnail.url} alt="" />
      </AspectRatio>
      <Box>
        <Text>{image.name}</Text>
        <Button onClick={() => onDelete(image.id)} colorScheme="red" size="xs">
          Delete
        </Button>
      </Box>
    </HStack>
  )
}

function CurrentImages(props: {
  organization: OrganizationProfile
  onDelete: (id: number) => void
}) {
  const { organization, onDelete } = props
  const images = organization.attributes.images.data
  if (images === null || images.length === 0) {
    return <></>
  } else {
    return (
      <>
        {images.map((image) => (
          <HStack key={image.id}>
            <AspectRatio
              borderWidth={1}
              borderColor="gray.200"
              ratio={3 / 2}
              minW="100px"
              mr={4}
            >
              <Image src={image.attributes.formats.thumbnail.url} alt="" />
            </AspectRatio>
            <Box>
              <Text>{image.attributes.name}</Text>
              <Button
                onClick={() => onDelete(image.id)}
                colorScheme="red"
                size="xs"
              >
                Delete
              </Button>
            </Box>
          </HStack>
        ))}
      </>
    )
  }
}

function Dropzone(props: {
  uploadedImages: ImageData[] | null
  numberOfFilesAllowed: number
  onDrop: (files: File[]) => void
  isLoading?: boolean
}) {
  const { uploadedImages, numberOfFilesAllowed, onDrop, isLoading } = props

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: 'image/jpeg,image/png,image/jpg',
    maxFiles: numberOfFilesAllowed,
    disabled: numberOfFilesAllowed <= 0 || isLoading,
    maxSize: 5000000,
    onDrop
  })
  return (
    <Box
      {...getRootProps()}
      bg="gray.50"
      borderColor="gray.200"
      borderWidth={3}
      borderStyle="dashed"
      px={8}
      py={{
        base: 8,
        lg: '10.85rem'
      }}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <Text textAlign="center">Loading, please wait...</Text>
      ) : (
        <Text textAlign="center">
          Drag your images here or click to upload
          <br /> ({numberOfFilesAllowed} remaining)
        </Text>
      )}
    </Box>
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
