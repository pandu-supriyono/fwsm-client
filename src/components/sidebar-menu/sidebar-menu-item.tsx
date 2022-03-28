import { ListItem, Link } from '@chakra-ui/react'
import { ReactNode } from 'react'
import NextLink from 'next/link'

export function SidebarMenuItem(props: {
  href: string
  isActive?: boolean
  children?: ReactNode
}) {
  const { href, isActive = false, children } = props

  return (
    <ListItem>
      <NextLink href={href} passHref>
        <Link
          borderRadius="md"
          py={2}
          px={3}
          display="block"
          bg={isActive ? 'gray.100' : 'transparent'}
          fontWeight={isActive ? 'bold' : 'normal'}
          borderLeftStyle="solid"
          borderLeftColor={isActive ? 'green.500' : 'transparent'}
          borderLeftWidth={4}
          borderLeftRadius={0}
        >
          {children}
        </Link>
      </NextLink>
    </ListItem>
  )
}
