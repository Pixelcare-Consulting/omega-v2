import * as React from "react"

type UseAutoResizeTextAreaProps = {
  textAreaRef: HTMLTextAreaElement | null
  minHeight?: number
  maxHeight?: number
  triggerAutoResize: string
  enabled?: boolean
}

export const useAutoResizeTextArea = ({
  textAreaRef,
  triggerAutoResize,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight = 0,
}: UseAutoResizeTextAreaProps) => {
  const [init, setInit] = React.useState(true)
  React.useEffect(() => {
    //* We need to reset the height momentarily to get the correct scrollHeight for the textarea
    const offsetBorder = 2
    if (textAreaRef) {
      if (init) {
        textAreaRef.style.minHeight = `${minHeight + offsetBorder}px`
        if (maxHeight > minHeight) {
          textAreaRef.style.maxHeight = `${maxHeight}px`
        }
        setInit(false)
      }
      textAreaRef.style.height = `${minHeight + offsetBorder}px`
      const scrollHeight = textAreaRef.scrollHeight
      //* We then set the height directly, outside of the render loop
      //* Trying to set this with state or a ref will product an incorrect value.
      if (scrollHeight > maxHeight) {
        textAreaRef.style.height = `${maxHeight}px`
      } else {
        textAreaRef.style.height = `${scrollHeight + offsetBorder}px`
      }
    }
  }, [textAreaRef, triggerAutoResize])
}
