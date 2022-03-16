import {
  Heading,
  Container,
  HStack,
  Box,
  Text,
  Button,
  Stack,
  useDisclosure,
  Link,
  Icon,
  LinkBox,
  LinkOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  AspectRatio,
  UnorderedList,
  ListItem
} from '@chakra-ui/react'
import NextLink from 'next/link'
import NextImage from 'next/image'
import { ChevronDownIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { ReactNode } from 'react'
import { GiHamburgerMenu } from 'react-icons/gi'
import { FaLinkedinIn, FaTwitter } from 'react-icons/fa'
import { AiFillInstagram } from 'react-icons/ai'
import { useToggleVisible } from '../../hooks/use-toggle'

const LOGO_SIZE = {
  base: '120px',
  lg: '150px'
}

const FOOTER_PADDING = {
  base: 8
}

export function FwsmFooter() {
  return (
    <Box
      as="footer"
      py={FOOTER_PADDING}
      borderTopColor="gray.200"
      borderTopStyle="solid"
      borderTopWidth="1px"
    >
      <Container>
        <FwsmSocials />
        <Stack
          direction={{
            base: 'column',
            lg: 'row'
          }}
          justifyContent="space-between"
        >
          <Box>
            <Box width={LOGO_SIZE} fontSize={0} mb={4}>
              <NextLink href="/" passHref>
                <Link display="block">
                  <NextImage
                    src={require('../../assets/fwsm-logo.png')}
                    alt="FWSM: Food Waste Solution Map"
                  />
                </Link>
              </NextLink>
            </Box>
            <Text>
              Created by{' '}
              <Link
                fontWeight="bold"
                color="green"
                href="https://www.in-me.nl/"
              >
                In-me
              </Link>
            </Text>
          </Box>
          <Box>
            <UnorderedList listStyleType="none" margin={0}>
              <Stack
                spacing={[2, null, 6]}
                borderTopColor="gray.200"
                borderTopStyle="solid"
                borderTopWidth={['1px', null, 0]}
                pt={[4, null, 0]}
                mt={[2, null, 0]}
                direction={{
                  base: 'column',
                  lg: 'row'
                }}
              >
                <FooterMenuItem href="/themes">Themes</FooterMenuItem>
                <FooterMenuItem href="/platform">Platform</FooterMenuItem>
                <FooterMenuItem href="/about">About us</FooterMenuItem>
                <FooterMenuItem href="/highlighted">Highlighted</FooterMenuItem>
              </Stack>
            </UnorderedList>
          </Box>
        </Stack>
        <Box mt={10}>
          <Text color="gray.500" fontSize="sm">
            Copyright Food Waste Solution Map
          </Text>
        </Box>
      </Container>
    </Box>
  )
}

function FooterMenuItem(props: { children?: ReactNode; href: string }) {
  const { children, href } = props

  return (
    <ListItem>
      <NextLink href={href} passHref>
        <Link>{children}</Link>
      </NextLink>
    </ListItem>
  )
}

function FwsmSocials() {
  return (
    <HStack
      spacing={4}
      pb={6}
      mb={6}
      borderBottomColor="gray.200"
      borderBottomStyle="solid"
      borderBottomWidth="1px"
    >
      <Text>Follow us on social media</Text>
      <HStack spacing={5} mr={2}>
        <Link color="gray.500" href="https://twitter.com/in_me20">
          <Icon
            as={FaTwitter}
            display="block"
            transition="color 0.2s"
            w="5"
            h="5"
            _hover={{ color: 'gray.800' }}
          />
        </Link>
        <Link color="gray.500" href="https://www.instagram.com/inme_magazine/">
          <Icon
            as={AiFillInstagram}
            display="block"
            transition="color 0.2s"
            w="5"
            h="5"
            _hover={{ color: 'gray.800' }}
          />
        </Link>
        <Link color="gray.500" href="https://nl.linkedin.com/company/in-me">
          <Icon
            as={FaLinkedinIn}
            display="block"
            transition="color 0.2s"
            w="5"
            h="5"
            _hover={{ color: 'gray.800' }}
          />
        </Link>
      </HStack>
    </HStack>
  )
}
