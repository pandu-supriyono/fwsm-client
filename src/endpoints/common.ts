import axios from 'axios'
import { parseCookies } from 'nookies'
import * as z from 'zod'
import { Constants } from '../constants'

export const imageDecoder = z.object({
  id: z.number(),
  attributes: z.object({
    name: z.string(),
    url: z.string(),
    formats: z.object({
      thumbnail: z.object({
        url: z.string()
      })
    })
  })
})

export type Image = z.infer<typeof imageDecoder>

const uploadedImage = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  formats: z.object({
    thumbnail: z.object({
      url: z.string()
    })
  })
})

export type UploadedImage = z.infer<typeof uploadedImage>

const uploadImageDecoder = z
  .array(uploadedImage)
  .nonempty()
  .transform((items) => items[0])

export const uploadImage = async (file: File) => {
  const formData = new FormData()
  formData.append('files', file, file.name)

  const cookies = parseCookies()

  return await axios
    .post(process.env.NEXT_PUBLIC_API_URL + '/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + cookies[Constants.JWT_COOKIE]
      }
    })
    .then((res) => uploadImageDecoder.parse(res.data))
}

const uploadImagesDecoder = z.array(uploadedImage).nonempty()

export const uploadImages = async (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file, file.name)
  })

  const cookies = parseCookies()

  const result = await axios
    .post(process.env.NEXT_PUBLIC_API_URL + '/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + cookies[Constants.JWT_COOKIE]
      }
    })
    .then((res) => uploadImagesDecoder.parse(res.data))

  return result
}
