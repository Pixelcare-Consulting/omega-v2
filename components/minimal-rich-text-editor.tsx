"use client"

import "../components/minimal-tiptap/styles/index.css"

import { EditorContent, type Editor } from "@tiptap/react"
import { forwardRef } from "react"

import useMinimalTiptapEditor from "./minimal-tiptap/hooks/use-minimal-tiptap"
import SectionTwo from "./minimal-tiptap/components/section/two"
import SectionFour from "./minimal-tiptap/components/section/four"
import SectionFive from "./minimal-tiptap/components/section/five"
import { MeasuredContainer } from "./minimal-tiptap/components/measured-container"
import { LinkBubbleMenu } from "./minimal-tiptap/components/bubble-menu/link-bubble-menu"
import { cn } from "@/lib/utils"
import { MinimalTiptapProps } from "./minimal-tiptap"
import { Separator } from "./ui/separator"

//* Note:
//* To inlcude features just add use Section - 1 - 2 - 3 - 4 - 5, and specify the active actions
//* mainActionCount - how many actions should be shown in the main section
//* activeActions - which actions should be shown in the main section
const Toolbar = ({ editor }: { editor: Editor }) => (
  <div className='shrink-0 overflow-x-auto border-b border-border p-2'>
    <div className='flex w-max items-center gap-px'>
      <SectionTwo editor={editor} activeActions={["bold", "italic", "underline", "strikethrough", "clearFormatting"]} mainActionCount={6} />

      <Separator orientation='vertical' className='mx-2 h-7 shrink-0' />

      <SectionFour editor={editor} activeActions={["orderedList", "bulletList"]} mainActionCount={0} />

      <Separator orientation='vertical' className='mx-2 h-7 shrink-0' />

      <SectionFive editor={editor} activeActions={[]} mainActionCount={0} />
    </div>
  </div>
)

export type MinimalRichTextEditorProps = MinimalTiptapProps

export const MinimalRichTextEditor = forwardRef<HTMLDivElement, MinimalTiptapProps>(
  ({ value, onChange, className, editorContentClassName, ...props }, ref) => {
    const editor = useMinimalTiptapEditor({
      value,
      onUpdate: onChange,
      enablePasteRules: false, //* disable format on paste
      ...props,
    })

    if (!editor) {
      return null
    }

    return (
      <MeasuredContainer
        as='div'
        name='editor'
        ref={ref}
        className={cn(
          "flex h-auto min-h-72 w-full flex-col rounded-md border border-input shadow-sm focus-within:border-primary",
          className
        )}
      >
        <Toolbar editor={editor} />
        <EditorContent
          editor={editor}
          className={cn("minimal-tiptap-editor prose prose-sm prose-slate max-w-full dark:prose-invert", editorContentClassName)}
        />
        <LinkBubbleMenu editor={editor} />
      </MeasuredContainer>
    )
  }
)

MinimalRichTextEditor.displayName = "MinimalRichTextEditor"

export default MinimalRichTextEditor
