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
  Link,
  Text
} from '@chakra-ui/react'
import * as z from 'zod'
import { NextPage } from 'next'
import { FwsmAuthTemplate } from '../components/auth-template'
import { zodResolver } from '@hookform/resolvers/zod'
import NextLink from 'next/link'
import { SubmitHandler, useForm } from 'react-hook-form'
import { setCookie } from 'nookies'
import { useState } from 'react'
import { signIn } from '../endpoints'
import axios from 'axios'
import { Constants } from '../constants'
import { useRouter } from 'next/router'
import { useUser } from '../hooks/use-user'

const TITLE = 'Sign in to continue'
enum SignInErrors {
  INVALID_CREDENTIALS = '400',
  UNKNOWN = 'unknown'
}

const SignInPage: NextPage = () => {
  useUser({
    redirectIfFound: true,
    redirectTo: '/'
  })

  return (
    <FwsmAuthTemplate title={TITLE}>
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
            {TITLE}
          </Heading>
          <SignInForm />
        </Box>
      </Container>
    </FwsmAuthTemplate>
  )
}

function SignInForm() {
  const [signInError, setSignInError] = useState<SignInErrors | null>(null)
  const signInSchema = z.object({
    identifier: z.string().email(),
    password: z.string().nonempty()
  })
  const router = useRouter()

  type SignInSchema = z.infer<typeof signInSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema)
  })

  const onSubmit: SubmitHandler<SignInSchema> = async (data) => {
    try {
      setSignInError(null)
      const result = await signIn(data)
      setCookie(null, Constants.JWT_COOKIE, result.jwt, {
        maxAge: 82800,
        path: '/'
      })
      router.push('/')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setSignInError(SignInErrors.INVALID_CREDENTIALS)
          return
        }
      }
      setSignInError(SignInErrors.UNKNOWN)
    }
  }

  return (
    <>
      {signInError && (
        <Alert status="error" mb={8}>
          <AlertIcon />
          <Box>
            {signInError === SignInErrors.INVALID_CREDENTIALS ? (
              <>
                <Box>
                  <Text fontWeight="bold">Incorrect email or password</Text>
                </Box>
                <Text>
                  The email or password you entered is incorrect. Please try
                  again.
                </Text>
              </>
            ) : (
              <>
                <Box>
                  <Text fontWeight="bold">An unknown error occured</Text>
                </Box>
                <Text>
                  An unknown error occured. Please try again or{' '}
                  <a href="mailto:info@foodwastemap.com">contact us</a> if the
                  problem persists.
                </Text>
              </>
            )}
          </Box>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormControl isInvalid={!!errors.identifier} mb={6}>
          <FormLabel htmlFor="identifier">Email address</FormLabel>
          <Input {...register('identifier')} type="email" />
          <FormErrorMessage>{errors.identifier?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.password} mb={8}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input {...register('password')} type="password" />
          <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
        </FormControl>
        <Button
          isLoading={isSubmitting}
          colorScheme="green"
          width="100%"
          mb={2}
          type="submit"
        >
          Sign in
        </Button>
        <NextLink href="/forgot-password" passHref>
          <Link color="green.500" textDecoration="underline">
            Forgot password?
          </Link>
        </NextLink>
      </form>
    </>
  )
}

export default SignInPage
