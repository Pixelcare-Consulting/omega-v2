"use client"

import { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormField, FormItem, FormLabel, FormDescription, FormControl } from "../ui/form"
import { FormExtendedProps } from "@/types/form"
import { Checkbox, CheckboxProps } from "../ui/checkbox"

type ExtendedProps = Omit<FormExtendedProps, "messageProps"> & { checkboxProps?: CheckboxProps }

type CheckboxFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  extendedProps?: ExtendedProps
  isRequired?: boolean
}

export default function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  extendedProps,
  isRequired,
}: CheckboxFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className='space-x-2' {...extendedProps?.itemProps}>
            <div className='flex items-center gap-2'>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} {...extendedProps?.checkboxProps} />
              </FormControl>
              <FormLabel {...extendedProps?.labelProps} isRequired={isRequired}>
                {label}
              </FormLabel>
            </div>
            {description && (
              <FormDescription className='!ml-0' {...extendedProps?.descriptionProps}>
                {description}
              </FormDescription>
            )}
          </FormItem>
        )
      }}
    />
  )
}
