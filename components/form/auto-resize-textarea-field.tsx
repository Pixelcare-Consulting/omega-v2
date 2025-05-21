"use client"

import { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "../ui/form"
import AutoResizeTextarea, { AutoResizeTextareaProps } from "../auto-resize-textarea"
import { FormExtendedProps } from "@/types/form"

type ExtendedProps = FormExtendedProps & { autoResizeTextAreaProps?: AutoResizeTextareaProps }

type AutoResizeTextAreaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  extendedProps?: ExtendedProps
  isRequired?: boolean
}

export default function AutoResizeTextAreaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  extendedProps,
  isRequired,
}: AutoResizeTextAreaFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className='space-y-2' {...extendedProps?.itemProps}>
            <FormLabel className='space-x-1' {...extendedProps?.labelProps} isRequired={isRequired}>
              {label}
            </FormLabel>
            <FormControl>
              <AutoResizeTextarea {...field} {...extendedProps?.autoResizeTextAreaProps} />
            </FormControl>
            {description && <FormDescription {...extendedProps?.descriptionProps}>{description}</FormDescription>}
            <FormMessage {...extendedProps?.messageProps} />
          </FormItem>
        )
      }}
    />
  )
}
