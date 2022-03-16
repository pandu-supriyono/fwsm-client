import { Box, Container, Text } from '@chakra-ui/react'
import axios from 'axios'
import { GetStaticProps, NextPage } from 'next'
import { FwsmMarkdown } from '../components/markdown'
import {
  FwsmPageHeader,
  FwsmPageHeaderContainer,
  FwsmPageHeaderTitle
} from '../components/page-header'
import { FwsmTemplate } from '../components/template'

interface AboutPageData {
  id: number
  attributes: {
    title: string
    introduction: string
    content: string
  }
}

interface AboutPageProps {
  aboutPageData: AboutPageData
}

const AboutPage: NextPage<AboutPageProps> = (props) => {
  const { aboutPageData } = props

  return (
    <FwsmTemplate title={aboutPageData.attributes.title}>
      <FwsmPageHeader>
        <FwsmPageHeaderContainer>
          <FwsmPageHeaderTitle>
            {aboutPageData.attributes.title}
          </FwsmPageHeaderTitle>
          <Text fontSize="xl">{aboutPageData.attributes.introduction}</Text>
        </FwsmPageHeaderContainer>
      </FwsmPageHeader>
      <Container
        mb={{
          base: 10,
          lg: '4rem'
        }}
      >
        <Box maxW="80ch">
          <FwsmMarkdown>{aboutPageData.attributes.content}</FwsmMarkdown>
        </Box>
      </Container>
    </FwsmTemplate>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data: aboutPageData } = await axios(
    process.env.NEXT_PUBLIC_API_URL + '/about'
  ).then((res) => res.data)

  return {
    props: {
      aboutPageData
    }
  }
}

export default AboutPage
