import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { NextPage } from 'next'
import { useForm } from 'react-hook-form'
import { FwsmAuthTemplate } from '../../components/auth-template'
import * as z from 'zod'
import { signUp } from '../../endpoints'
import { setCookie } from 'nookies'
import { Constants } from '../../constants'
import { useUser } from '../../hooks/use-user'
import { useRouter } from 'next/router'
import { useState } from 'react'
import axios from 'axios'

const SignUpPage: NextPage = () => {
  useUser({
    redirectIfFound: true,
    redirectTo: '/'
  })
  return (
    <FwsmAuthTemplate title="Sign up">
      <Container
        maxW={{
          lg: '500px'
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
            Sign up
          </Heading>
          <SignUpForm />
        </Box>
      </Container>
    </FwsmAuthTemplate>
  )
}

function SignUpForm() {
  const [error, setError] = useState<string | null>(null)
  const schema = z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      confirmPassword: z.string()
    })
    .refine((values) => values.confirmPassword === values.password, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    })
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  })

  const router = useRouter()

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(null)
      const result = await signUp(values)

      setCookie(null, Constants.JWT_COOKIE, result.jwt, {
        maxAge: 82800,
        path: '/'
      })

      router.push('/sign-up/organization')
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.error?.message || 'An unknown error occured')
        return
      }
      setError('An unknown error occured')
    }
  })

  return (
    <>
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}
      <form noValidate onSubmit={onSubmit}>
        <Stack spacing={6}>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email">Email address</FormLabel>
            <Input {...register('email')} type="email" id="email" />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input {...register('password')} type="password" id="password" />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormLabel htmlFor="confirmPassword">Confirm password</FormLabel>
            <Input
              {...register('confirmPassword')}
              type="password"
              id="confirmPassword"
            />
            <FormErrorMessage>
              {errors.confirmPassword?.message}
            </FormErrorMessage>
          </FormControl>
          <Button isLoading={isSubmitting} type="submit" colorScheme="green">
            Sign up
          </Button>
        </Stack>
      </form>
    </>
  )
}

export default SignUpPage
