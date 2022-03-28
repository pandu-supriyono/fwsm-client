import type { AppProps } from 'next/app'
import '@fontsource/varela-round'
import { Fonts, theme } from '../../theme'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from 'react-query'
const queryClient = new QueryClient()
import { ReactQueryDevtools } from 'react-query/devtools'

function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Fonts />
        <Component {...pageProps} />
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
