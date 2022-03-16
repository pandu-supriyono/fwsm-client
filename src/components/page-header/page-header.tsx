import { Box, Container, Heading } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface FwsmPageHeaderProps {
  children?: ReactNode
}

export function FwsmPageHeader(props: FwsmPageHeaderProps) {
  const { children } = props

  return (
    <Box
      borderBottomColor="gray.200"
      borderBottomStyle="solid"
      borderBottomWidth="1px"
      mb={{
        base: 4,
        lg: 10
      }}
      pb={[8, null, '5rem']}
    >
      <Container>{children}</Container>
    </Box>
  )
}

interface FwsmPageHeaderTitleProps {
  children?: ReactNode
}

export function FwsmPageHeaderTitle(props: FwsmPageHeaderTitleProps) {
  const { children } = props
  return (
    <Heading as="h1" size="3xl" mb={4}>
      {children}
    </Heading>
  )
}

interface FwsmPageHeaderContainerProps {
  children: ReactNode
}

export function FwsmPageHeaderContainer(props: FwsmPageHeaderContainerProps) {
  const { children } = props

  return <Box maxW="80ch">{children}</Box>
}
