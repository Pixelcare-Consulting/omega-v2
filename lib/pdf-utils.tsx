import { Text } from "@react-pdf/renderer"
import { format, isValid } from "date-fns"

type TextValue = string | number | boolean | null | undefined | Date

export const renderValue = (value: TextValue, formatString: string | undefined = "MM/dd/yyyy") => {
  //* return empty string if value is null or undefined
  if (!value && value !== 0) return ""

  //* if value is a date, then format it using date-fns
  if (value instanceof Date) {
    //* check if value is a valid date
    const isValidDate = isValid(value)

    if (!isValidDate) return ""
    return format(value, formatString)
  }

  //* convert value to string, and .split("") to to resolve text wrap issue of @react-pdf/renderer
  return String(value).split("")
}

export const prewrap = (value: TextValue) => {
  //* return empty string if value is null or undefined
  if (!value && value !== 0) return ""

  //* split string by new line
  let output = null
  const lines = String(value).split("\n")

  //* map each line to a Text component
  output = lines.map((line, index) => {
    return <Text key={`line_${index}`}>{line || <>&nbsp;</>}</Text>
  })

  return output
}
