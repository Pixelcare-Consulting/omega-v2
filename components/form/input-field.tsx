"use client"

import { Control, FieldPath, FieldValues } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "../ui/form"
import { FormExtendedProps } from "@/types/form"
import { Input, InputProps } from "../ui/input"
import { cn } from "@/lib/utils"

type ExtendedProps = FormExtendedProps & { inputProps?: InputProps }

type InputFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  extendedProps?: ExtendedProps
  isRequired?: boolean
  isHideLabel?: boolean
}

//? if className is passed among the properties of extendedProps, the specified or default className will be overridden

export default function InputField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  extendedProps,
  isRequired,
  isHideLabel,
}: InputFieldProps<T>) {
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
              <Input {...field} {...extendedProps?.inputProps} />
            </FormControl>
            {description && <FormDescription {...extendedProps?.descriptionProps}>{description}</FormDescription>}
            <FormMessage {...extendedProps?.messageProps} />
          </FormItem>
        )
      }}
    />
  )
}
