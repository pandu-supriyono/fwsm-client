import Head from 'next/head'
import { ReactNode } from 'react'

export interface FwsmHeadProps {
  title?: string
  description?: string
  children?: ReactNode
}

const DEFAULT_TITLE = 'Food Waste Solution Map'
const DEFAULT_DESCRIPTION =
  'Make food waste a thing of the past -- join our network of changemakers in government, non-profits and business and make a difference together.'

export function FwsmHead(props: FwsmHeadProps) {
  const {
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    children
  } = props

  const titleWithWebsiteName =
    title === DEFAULT_TITLE ? title : title + ' - ' + DEFAULT_TITLE

  return (
    <Head>
      <title>{titleWithWebsiteName}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      {children}
    </Head>
  )
}
