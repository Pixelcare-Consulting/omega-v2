"use client"

import { format } from "date-fns"
import { Control, FieldPath, FieldValues } from "react-hook-form"

import { Icons } from "../icons"
import { Button, ButtonProps } from "../ui/button"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Popover, PopoverContent, PopoverContentProps, PopoverTrigger } from "../ui/popover"

import { FormExtendedProps } from "@/types/form"
import MonthPicker, { MonthPickerProps } from "../month-picker"
import { cn } from "@/lib/utils"

type ExtendedProps = FormExtendedProps & {
  monthPickerProps?: MonthPickerProps
  buttonProps?: ButtonProps
  popoverContentProps?: PopoverContentProps
}

type MonthPickerFieldProps<
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

function renderValue(value: Date | undefined) {
  if (!value) return null

  return <time className='truncate'>{format(value, "MMM yyyy")}</time>
}

export default function MonthPickerField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  extendedProps,
  isRequired,
}: MonthPickerFieldProps<T>) {
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
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant='outline'
                    className={cn(
                      "flex w-full justify-start pl-3 text-left font-normal",

                      !field.value && "text-muted-foreground"
                    )}
                    {...extendedProps?.buttonProps}
                  >
                    <Icons.calendar className='mr-2 size-4' />
                    {field.value ? renderValue(field.value) : <span>Pick a date</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className={cn("w-auto p-0")} align='start' {...extendedProps?.popoverContentProps}>
                <MonthPicker
                  {...extendedProps?.monthPickerProps}
                  captionLayout='dropdown-buttons'
                  fromYear={1800}
                  toYear={new Date().getFullYear()}
                  currentMonth={field.value ? new Date(field.value) : undefined}
                  onMonthChange={field.onChange}
                />
              </PopoverContent>
            </Popover>
            {description && <FormDescription {...extendedProps?.descriptionProps}>{description}</FormDescription>}
            <FormMessage {...extendedProps?.messageProps} />
          </FormItem>
        )
      }}
    ></FormField>
  )
}
