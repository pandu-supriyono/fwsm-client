import React, { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { marked } from 'marked'
import TurnDownService from 'turndown'
import { Button } from '@chakra-ui/react'

export interface FwsmWysiwygProps {
  content?: string
  onSave: (content: string) => void
  isSubmitting?: boolean
}

export function FwsmWysiwyg(props: FwsmWysiwygProps) {
  const turnDown = new TurnDownService({
    headingStyle: 'atx'
  })
  const editorRef = useRef(null)
  const initialValue = props.content ? marked.parse(props.content) : ''
  return (
    <>
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
        //@ts-ignore
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue={initialValue}
        init={{
          height: 500,
          menubar: false,
          plugins: 'lists advlist',
          toolbar:
            'h1 h2 h3 | ' +
            'bold italic |' +
            'bullist numlist | ' +
            'removeformat',
          content_style:
            'body { font-family:Varela Round,Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      />

      <Button
        mt={8}
        colorScheme="green"
        onClick={() => {
          //@ts-ignore
          const content = turnDown.turndown(editorRef.current.getContent())
          props.onSave(content)
        }}
        isLoading={props.isSubmitting}
      >
        Update product description
      </Button>
    </>
  )
}
