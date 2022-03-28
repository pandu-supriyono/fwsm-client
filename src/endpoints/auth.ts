import * as z from 'zod'
import axios from 'axios'
import { parseCookies } from 'nookies'
import { Constants } from '../constants'

const userDecoder = z.object({
  id: z.number(),
  email: z.string()
})

export type User = z.infer<typeof userDecoder>

const signInDecoder = z.object({
  jwt: z.string(),
  user: userDecoder
})

export const signIn = async (credentials: {
  identifier: string
  password: string
}) => {
  return await axios
    .post(process.env.NEXT_PUBLIC_API_URL + '/auth/local', credentials)
    .then((res) => signInDecoder.parse(res.data))
}

type AuthState =
  | {
      isSignedIn: false
    }
  | (User & {
      isSignedIn: true
    })

export const getCurrentUser = async (): Promise<AuthState> => {
  const cookies = parseCookies()

  if (cookies[Constants.JWT_COOKIE]) {
    return await axios
      .get(process.env.NEXT_PUBLIC_API_URL + '/users/me', {
        headers: {
          Authorization: 'Bearer ' + cookies[Constants.JWT_COOKIE]
        }
      })
      .then((res) => userDecoder.parse(res.data))
      .then((res) => ({
        ...res,
        isSignedIn: true
      }))
  } else {
    return Promise.resolve({
      isSignedIn: false
    })
  }
}

export const changePassword = async (credentials: {
  currentPassword: string
  password: string
}) => {
  const cookies = parseCookies()
  const jwt = cookies[Constants.JWT_COOKIE]

  return await axios
    .post(
      process.env.NEXT_PUBLIC_API_URL + '/auth/change-password',
      credentials,
      {
        headers: {
          Authorization: 'Bearer ' + jwt
        }
      }
    )
    .then((res) => userDecoder.parse(res.data))
}

const signUpDecoder = signInDecoder

export const signUp = async (credentials: {
  email: string
  password: string
}) => {
  const { email, password } = credentials
  const username = email

  return await axios
    .post(process.env.NEXT_PUBLIC_API_URL + '/auth/local/register', {
      email,
      password,
      username
    })
    .then((res) => signUpDecoder.parse(res.data))
}
