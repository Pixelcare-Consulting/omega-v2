"use client"

import { Control, FieldPath, FieldValues } from "react-hook-form"

import { ButtonProps } from "../ui/button"
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "../ui/form"
import {
  Select,
  SelectContent,
  SelectContentProps,
  SelectItem,
  SelectProps,
  SelectTrigger,
  SelectTriggerProps,
  SelectValue,
} from "../ui/select"
import { FormExtendedProps, FormOption } from "@/types/form"

type ExtendedProps = FormExtendedProps & {
  buttonProps?: ButtonProps
  selectProps?: SelectProps
  selectTriggerProps?: SelectTriggerProps
  selectContent?: SelectContentProps
}

type SelectFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  data: FormOption[]
  isLoading?: boolean
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  extendedProps?: ExtendedProps
  isRequired?: boolean
}

export default function SelectField<T extends FieldValues>({
  data,
  isLoading,
  control,
  name,
  label,
  description,
  extendedProps,
  isRequired,
}: SelectFieldProps<T>) {
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
            <Select onValueChange={field.onChange} defaultValue={field.value} {...extendedProps?.selectProps}>
              <FormControl>
                <SelectTrigger {...extendedProps?.selectTriggerProps}>
                  <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent {...extendedProps?.selectContent}>
                {isLoading ? <div className='mx-3 my-2 text-center text-sm'>Loading...</div> : null}

                {!isLoading && data && data.length > 0
                  ? data.map((item, i) => (
                      <SelectItem key={`${i}-${item.value}`} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))
                  : null}
              </SelectContent>
            </Select>
            {description && <FormDescription {...extendedProps?.descriptionProps}>{description}</FormDescription>}
            <FormMessage {...extendedProps?.messageProps} />
          </FormItem>
        )
      }}
    />
  )
}
