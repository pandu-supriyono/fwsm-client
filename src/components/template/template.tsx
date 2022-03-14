import { ReactNode } from 'react'
import { FwsmHead, FwsmHeadProps } from '../head'
import { FwsmHeader } from '../header'

interface FwsmTemplateProps extends FwsmHeadProps {
  children?: ReactNode
}

export function FwsmTemplate(props: FwsmTemplateProps) {
  const { children, title, description } = props
  return (
    <>
      <FwsmHead title={title} description={description} />
      <FwsmHeader />
      <main id="main-content">{children}</main>
    </>
  )
}
