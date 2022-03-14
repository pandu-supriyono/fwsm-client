import { HTMLAttributes, PropsWithChildren, ReactNode, useState } from 'react'
import {
  Stack,
  Box,
  Container,
  Link,
  UnorderedList,
  ListItem,
  Icon,
  Button,
  StackDirection,
  HStack
} from '@chakra-ui/react'
import NextLink from 'next/link'
import NextImage from 'next/image'
import { GiHamburgerMenu } from 'react-icons/gi'
import { useToggleVisible } from '../../hooks/use-toggle'

interface FwsmHeaderProps
  extends PropsWithChildren<HTMLAttributes<HTMLElement>> {}

const HEADER_PADDING = 4

const LOGO_SIZE = {
  base: '120px',
  lg: '150px'
}

const LOGO_MARGIN_RIGHT = {
  base: 2,
  lg: 4
}

function FwsmListItem(props: { children: ReactNode; href: string }) {
  const { children, href } = props

  return (
    <ListItem
      marginY="auto"
      borderBottomColor="gray.200"
      borderBottomStyle="solid"
      borderBottomWidth={[1, null, 0]}
    >
      <NextLink href={href} passHref>
        <Link mr={4} display="block" paddingY={[2, null, 0]}>
          {children}
        </Link>
      </NextLink>
    </ListItem>
  )
}

const RESPONSIVE_STACK_DIRECTION: StackDirection = {
  base: 'column',
  lg: 'row'
}

export function FwsmHeader(props: FwsmHeaderProps) {
  const toggle = useToggleVisible()

  return (
    <Box
      as="header"
      py={HEADER_PADDING}
      borderColor="gray.200"
      borderStyle="solid"
      borderBottomWidth={1}
    >
      <Container>
        <Stack
          justifyContent="space-between"
          direction={RESPONSIVE_STACK_DIRECTION}
        >
          <Stack direction={RESPONSIVE_STACK_DIRECTION} alignContent="center">
            <HStack justifyContent="space-between">
              <Box width={LOGO_SIZE} mr={LOGO_MARGIN_RIGHT} fontSize={0}>
                <NextLink href="/" passHref>
                  <Link display="block">
                    <NextImage
                      src={require('../../assets/fwsm-logo.png')}
                      alt="FWSM: Food Waste Solution Map"
                    />
                  </Link>
                </NextLink>
              </Box>
              <Button
                display={{
                  base: 'block',
                  lg: 'none'
                }}
                visibility={{
                  base: 'visible',
                  lg: 'hidden'
                }}
                variant="ghost"
                onClick={toggle.setToggle}
              >
                <Icon as={GiHamburgerMenu} />
              </Button>
            </HStack>
            <Box
              as="nav"
              {...toggle.setProps('block', {
                responsive: 'fromDesktop'
              })}
            >
              <UnorderedList
                listStyleType="none"
                height="100%"
                marginLeft={0}
                display={{
                  lg: 'flex'
                }}
              >
                <FwsmListItem href="/sectors">Themes</FwsmListItem>
                <FwsmListItem href="/platform">Platform</FwsmListItem>
                <FwsmListItem href="/about">About</FwsmListItem>
                <FwsmListItem href="/highlighted">Highlighted</FwsmListItem>
              </UnorderedList>
            </Box>
          </Stack>
          <Box
            {...toggle.setProps('block', {
              responsive: 'fromDesktop'
            })}
          >
            <Stack
              direction={RESPONSIVE_STACK_DIRECTION}
              width="100%"
              spacing={2}
            >
              <NextLink href="/sign-in" passHref>
                <Button as={Link} variant="ghost" textAlign="center">
                  Sign in
                </Button>
              </NextLink>
              <NextLink href="/sign-up" passHref>
                <Button colorScheme="green" textAlign="center">
                  Sign up
                </Button>
              </NextLink>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
