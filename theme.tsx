import { extendTheme } from '@chakra-ui/react'

const Container = {
  baseStyle: {
    maxW: '120ch'
  }
}

export const theme = extendTheme({
  components: {
    Container
  }
})
