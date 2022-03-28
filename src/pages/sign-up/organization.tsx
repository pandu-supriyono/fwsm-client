import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
  Link
} from '@chakra-ui/react'
import { NextPage } from 'next'
import NextLink from 'next/link'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import { FwsmAuthTemplate } from '../../components/auth-template'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { countries } from '../../country-list'
import {
  createOrganization,
  getSectors,
  getSubsectors,
  Organization
} from '../../endpoints'
import { useQuery, useQueryClient } from 'react-query'

const RegisterOrganization: NextPage = () => {
  return (
    <FwsmAuthTemplate title="Register your organization">
      <Container
        maxW={{
          lg: '600px'
        }}
        pt={{
          base: 4,
          lg: '4rem'
        }}
      >
        <Box
          bg="white"
          py={{
            base: 6,
            lg: 8
          }}
          px={{
            base: 8,
            lg: 10
          }}
          borderRadius="lg"
          shadow="md"
        >
          <Heading as="h1" size="lg" mb={6}>
            Register your organization
          </Heading>
          <RegisterOrganizationMultiStepForm />
        </Box>
      </Container>
    </FwsmAuthTemplate>
  )
}

const organizationNameSchema = z.object({
  name: z.string().nonempty()
})

const organizationDescriptionSchema = z.object({
  description: z.string().nonempty().max(150)
})

const addressSchema = z.object({
  address: z.string().nonempty(),
  postcode: z.string().nonempty(),
  city: z.string().nonempty(),
  province: z.string().nonempty(),
  country: z.string().nonempty()
})

const sectorSchema = z.object({
  sector: z.string().min(1)
})

const subsectorSchema = z.object({
  subsector: z.string().min(1)
})

const formSchema = organizationNameSchema
  .merge(organizationDescriptionSchema)
  .merge(addressSchema)
  .merge(sectorSchema)
  .merge(subsectorSchema)

type FormValues = z.infer<typeof formSchema>

function RegisterOrganizationMultiStepForm() {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<FormValues>({
    name: '',
    description: '',
    address: '',
    postcode: '',
    city: '',
    province: '',
    country: '',
    sector: '',
    subsector: ''
  })
  const [organization, setOrganization] = useState<null | Organization>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const steps = useMemo(
    () => [
      OrganizationNameForm,
      OrganizationDescriptionForm,
      AddressForm,
      SectorForm,
      SubsectorForm
    ],
    []
  )

  const CurrentStep = steps[step]

  const submitForm = useCallback(async () => {
    const sortedValues = {
      name: values.name,
      shortDescription: values.description,
      address: {
        address: values.address,
        postcode: values.postcode,
        city: values.city,
        province: values.province,
        country: values.country
      },
      subsector: Number(values.subsector)
    }

    const result = await createOrganization(sortedValues)
    setOrganization(() => result.data)
    queryClient.invalidateQueries('currentOrganization')
  }, [values, queryClient])

  const completeFormStep = useCallback(() => {
    const isLastStep = step === steps.length - 1

    if (!isLastStep) {
      setStep((prevStep) => prevStep + 1)
    } else {
      setIsCompleted(true)
    }
  }, [steps, step])

  useEffect(() => {
    if (isCompleted) {
      submitForm()
    }
  }, [isCompleted, submitForm])

  useEffect(() => {
    console.log(organization)
  }, [organization])

  return (
    <Box>
      {!isCompleted && (
        <CurrentStep
          currentStep={step}
          completeFormStep={completeFormStep}
          setValues={setValues}
          values={values}
        />
      )}
      {!!organization && <FormComplete {...organization} />}
    </Box>
  )
}

interface FormStepProps<T> {
  completeFormStep: () => void
  setValues: Dispatch<SetStateAction<FormValues>>
  currentStep: number
  values: FormValues
}

type FormStep<T> = (props: FormStepProps<T>) => JSX.Element

const OrganizationNameForm: FormStep<z.infer<typeof organizationNameSchema>> = (
  props
) => {
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<z.infer<typeof organizationNameSchema>>({
    resolver: zodResolver(organizationNameSchema),
    defaultValues: {
      name: props.values.name
    }
  })

  const onSubmit = handleSubmit((values) => {
    props.setValues((existing) => ({
      ...existing,
      ...values
    }))
    props.completeFormStep()
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={6}>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Company name</FormLabel>
          <Input {...register('name')} id="name" />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>
        <Button type="submit" colorScheme="green">
          Continue
        </Button>
      </Stack>
    </form>
  )
}

const OrganizationDescriptionForm: FormStep<
  z.infer<typeof organizationDescriptionSchema>
> = (props) => {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors }
  } = useForm<z.infer<typeof organizationDescriptionSchema>>({
    resolver: zodResolver(organizationDescriptionSchema),
    defaultValues: {
      description: props.values.description
    }
  })

  const onSubmit = handleSubmit((values) => {
    props.setValues((existing) => ({
      ...existing,
      ...values
    }))
    props.completeFormStep()
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={6}>
        <FormControl isInvalid={!!errors.description}>
          <FormLabel htmlFor="description">
            Short description of your company
          </FormLabel>
          <Textarea
            maxLength={150}
            {...register('description')}
            id="description"
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          <FormHelperText>
            {150 - watch('description').length} characters left
          </FormHelperText>
        </FormControl>
        <Button type="submit" colorScheme="green">
          Continue
        </Button>
      </Stack>
    </form>
  )
}

const AddressForm: FormStep<z.infer<typeof addressSchema>> = (props) => {
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: props.values.address,
      city: props.values.city,
      postcode: props.values.postcode,
      province: props.values.province,
      country: props.values.country
    }
  })

  const onSubmit = handleSubmit((values) => {
    props.setValues((existing) => ({
      ...existing,
      ...values
    }))
    props.completeFormStep()
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={6}>
        <FormControl isInvalid={!!errors.address}>
          <FormLabel htmlFor="address">Address</FormLabel>
          <Input {...register('address')} id="address" />
          <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.postcode}>
          <FormLabel htmlFor="postcode">Postcode</FormLabel>
          <Input {...register('postcode')} id="postcode" />
          <FormErrorMessage>{errors.postcode?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.city}>
          <FormLabel htmlFor="city">City</FormLabel>
          <Input {...register('city')} id="city" />
          <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.province}>
          <FormLabel htmlFor="province">Province</FormLabel>
          <Input {...register('province')} id="province" />
          <FormErrorMessage>{errors.province?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.country}>
          <FormLabel htmlFor="country">Country</FormLabel>
          <Select {...register('country')} id="country">
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.country?.message}</FormErrorMessage>
        </FormControl>
        <Button type="submit" colorScheme="green">
          Continue
        </Button>
      </Stack>
    </form>
  )
}

const SectorForm: FormStep<z.infer<typeof sectorSchema>> = (props) => {
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<z.infer<typeof sectorSchema>>({
    resolver: zodResolver(sectorSchema),
    defaultValues: {
      sector: props.values.sector
    }
  })

  const { data: sectors } = useQuery('sectors', getSectors)

  const onSubmit = handleSubmit((values) => {
    props.setValues((existing) => ({
      ...existing,
      ...values
    }))
    props.completeFormStep()
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={6}>
        <FormControl isInvalid={!!errors.sector}>
          <FormLabel htmlFor="sector">
            In which sector does your organization work in?
          </FormLabel>
          <RadioGroup>
            <Stack>
              {sectors?.data &&
                sectors.data.map((sector) => (
                  <Radio
                    key={`sector-${sector.id}`}
                    {...register('sector')}
                    id={String(sector.id)}
                    value={String(sector.id)}
                  >
                    {sector.attributes.name}
                  </Radio>
                ))}
            </Stack>
          </RadioGroup>
          <FormErrorMessage>{errors.sector?.message}</FormErrorMessage>
        </FormControl>
        <Button type="submit" colorScheme="green">
          Continue
        </Button>
      </Stack>
    </form>
  )
}

const SubsectorForm: FormStep<z.infer<typeof subsectorSchema>> = (props) => {
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<z.infer<typeof subsectorSchema>>({
    resolver: zodResolver(subsectorSchema),
    defaultValues: {
      subsector: props.values.subsector
    }
  })

  const { data: subsectors } = useQuery(
    ['subsectors', Number(props.values.sector)],
    () =>
      getSubsectors({
        sectorId: Number(props.values.sector)
      })
  )

  const onSubmit = handleSubmit((values) => {
    props.setValues((existing) => ({
      ...existing,
      ...values
    }))
    props.completeFormStep()
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={6}>
        <FormControl isInvalid={!!errors.subsector}>
          <FormLabel htmlFor="subsector">
            Which activity best describes your organization?
          </FormLabel>
          <RadioGroup>
            <Stack>
              {subsectors?.data &&
                subsectors.data.map((subsector) => (
                  <Radio
                    key={`sector-${subsector.id}`}
                    {...register('subsector')}
                    id={String(subsector.id)}
                    value={String(subsector.id)}
                  >
                    {subsector.attributes.name}
                  </Radio>
                ))}
            </Stack>
          </RadioGroup>
          <FormErrorMessage>{errors.subsector?.message}</FormErrorMessage>
        </FormControl>
        <Button type="submit" colorScheme="green">
          Continue
        </Button>
      </Stack>
    </form>
  )
}

function FormComplete(props: Organization) {
  return (
    <>
      <Stack spacing={6}>
        <Text>
          You have just registered your organization at Food Waste Solution Map.
          Welcome!
        </Text>
        <Text>
          To improve the chances you find potential partners, we suggest
          completing your profile. You can expand your organization&apos;s
          description and upload images to help illustrate your organization.
        </Text>
        <NextLink href={`/platform/organization/${props.id}`} passHref>
          <Button as={Link} colorScheme="green">
            Go to your profile
          </Button>
        </NextLink>
      </Stack>
    </>
  )
}

export default RegisterOrganization
