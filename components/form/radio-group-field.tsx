"use client"

import { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage, FormItemProps, FormLabelProps } from "../ui/form"

import { RadioGroup, RadioGroupItem, RadioGroupItemProps, RadioGroupProps } from "../ui/radio-group"
import { FormExtendedProps, FormOption } from "@/types/form"

type ExtendedProps = FormExtendedProps & {
  radioGroupProps?: RadioGroupProps
  radioGroupItemProps?: RadioGroupItemProps
  radioGroupFormItemProps?: FormItemProps
  radioGroupFormLabelProps?: FormLabelProps
}

type RadioGroupFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  data: FormOption[]
  isLoading?: boolean
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  extendedProps?: ExtendedProps
  isRequired?: boolean
}

export default function RadioGroupField<T extends FieldValues>({
  data,
  isLoading,
  control,
  name,
  label,
  description,
  extendedProps,
  isRequired,
}: RadioGroupFieldProps<T>) {
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
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className='flex flex-col space-y-1'
                {...extendedProps?.radioGroupProps}
              >
                {!isLoading &&
                  data &&
                  data.length > 0 &&
                  data.map((item, i) => (
                    <FormItem
                      key={`${i}-${item.value}`}
                      className='flex items-center space-x-3 space-y-0'
                      {...extendedProps?.radioGroupFormItemProps}
                    >
                      <FormControl>
                        <RadioGroupItem value={item.value} {...extendedProps?.radioGroupItemProps} />
                      </FormControl>
                      <FormLabel className='font-normal' {...extendedProps?.radioGroupFormLabelProps}>
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  ))}

                {isLoading ? <div className='mx-3 my-2 w-full text-center text-sm'>Loading...</div> : null}
              </RadioGroup>
            </FormControl>
            {description && <FormDescription {...extendedProps?.descriptionProps}>{description}</FormDescription>}
            <FormMessage {...extendedProps?.messageProps} />
          </FormItem>
        )
      }}
    />
  )
}
