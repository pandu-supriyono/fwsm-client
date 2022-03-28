import { Box } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { FwsmHead, FwsmHeadProps } from '../head'

interface FwsmAuthTemplateProps extends FwsmHeadProps {
  children?: ReactNode
}

export function FwsmAuthTemplate(props: FwsmAuthTemplateProps) {
  const { children, title, description } = props
  return (
    <>
      <FwsmHead title={title} description={description} />
      <Box as="main" bg="gray.900" id="main-content" minHeight="100vh">
        {children}
      </Box>
    </>
  )
}
