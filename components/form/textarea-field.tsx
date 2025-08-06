"use client"

import { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "../ui/form"
import { Textarea, TextareaProps } from "../ui/textarea"
import { FormExtendedProps } from "@/types/form"

type ExtendedProps = FormExtendedProps & { textAreaProps?: TextareaProps }

type TextAreaFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  extendedProps?: ExtendedProps
  isRequired?: boolean
  isHideLabel?: boolean
}

export default function TextAreaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  extendedProps,
  isRequired,
  isHideLabel,
}: TextAreaFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className='space-y-2' {...extendedProps?.itemProps}>
            {!isHideLabel && (
              <FormLabel className='space-x-1' {...extendedProps?.labelProps} isRequired={isRequired}>
                {label}
              </FormLabel>
            )}
            <FormControl>
              <Textarea className='resize-none' {...field} {...extendedProps?.textAreaProps} />
            </FormControl>
            {description && <FormDescription {...extendedProps?.descriptionProps}>{description}</FormDescription>}
            <FormMessage {...extendedProps?.messageProps} />
          </FormItem>
        )
      }}
    />
  )
}
