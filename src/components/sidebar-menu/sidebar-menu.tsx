import { Box, UnorderedList } from '@chakra-ui/react'
import { ReactNode } from 'react'

export function SidebarMenu(props: { children: ReactNode }) {
  return (
    <Box>
      <Box as="nav">
        <UnorderedList listStyleType="none" ml={0} p={0}>
          {props.children}
        </UnorderedList>
      </Box>
    </Box>
  )
}
