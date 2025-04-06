'use client'

import { Control, FieldPath, FieldValues } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from '../ui/form'
import { FormExtendedProps } from '@/types/form'
import { Input, InputProps } from '../ui/input'
import { cn } from '@/lib/utils'

type ExtendedProps = FormExtendedProps & { inputProps?: InputProps }

type InputFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  extendedProps?: ExtendedProps
  isRequired?: boolean
}

export default function InputField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  extendedProps,
  isRequired
}: InputFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={cn('space-y-2', extendedProps?.itemProps?.className)} {...extendedProps?.itemProps}>
            <FormLabel
              className={cn('space-x-1', extendedProps?.labelProps?.className)}
              {...extendedProps?.labelProps}
              isRequired={isRequired}
            >
              {label}
            </FormLabel>
            <FormControl>
              <Input className={cn(extendedProps?.inputProps?.className)} {...field} {...extendedProps?.inputProps} />
            </FormControl>
            {description && <FormDescription {...extendedProps?.descriptionProps}>{description}</FormDescription>}
            <FormMessage {...extendedProps?.messageProps} />
          </FormItem>
        )
      }}
    />
  )
}
