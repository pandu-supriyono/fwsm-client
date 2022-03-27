import { Box, Container, Text } from '@chakra-ui/react'
import { GetStaticProps, NextPage } from 'next'
import { FwsmMarkdown } from '../components/markdown'
import {
  FwsmPageHeader,
  FwsmPageHeaderContainer,
  FwsmPageHeaderTitle
} from '../components/page-header'
import { FwsmTemplate } from '../components/template'
import { AboutPageContent, getAboutPageContent } from '../endpoints'

interface AboutPageProps {
  content: AboutPageContent
}

const AboutPage: NextPage<AboutPageProps> = (props) => {
  const { content } = props

  return (
    <FwsmTemplate title={content.attributes.title}>
      <FwsmPageHeader>
        <FwsmPageHeaderContainer>
          <FwsmPageHeaderTitle>{content.attributes.title}</FwsmPageHeaderTitle>
          <Text fontSize="xl">{content.attributes.introduction}</Text>
        </FwsmPageHeaderContainer>
      </FwsmPageHeader>
      <Container
        mb={{
          base: 10,
          lg: '4rem'
        }}
      >
        <Box maxW="80ch">
          <FwsmMarkdown>{content.attributes.content}</FwsmMarkdown>
        </Box>
      </Container>
    </FwsmTemplate>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const content = await getAboutPageContent()

  return {
    props: {
      content: content.data
    }
  }
}

export default AboutPage
