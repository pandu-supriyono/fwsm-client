import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import { Heading, Text, UnorderedList } from '@chakra-ui/react'

interface FwsmMarkdownProps {
  children: string
}

export function FwsmMarkdown(props: FwsmMarkdownProps) {
  const { children } = props

  return (
    <ReactMarkdown
      components={ChakraUIRenderer({
        h2: (props) => {
          const { children } = props
          return (
            <Heading as="h2" size="lg" mt={10} mb={4}>
              {children}
            </Heading>
          )
        },
        p: (props) => {
          const { children } = props
          return <Text mb={4}>{children}</Text>
        },
        ul: (props) => {
          const { children } = props
          return <UnorderedList mb={4}>{children}</UnorderedList>
        }
      })}
    >
      {children}
    </ReactMarkdown>
  )
}
