"use client"

import { format } from "date-fns"
import { Control, FieldPath, FieldValues } from "react-hook-form"

import { Calendar, CalendarProps } from "../ui/calendar"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Popover, PopoverContent, PopoverContentProps, PopoverTrigger } from "../ui/popover"
import { Button, ButtonProps } from "../ui/button"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { FormExtendedProps } from "@/types/form"

type ExtendedProps = FormExtendedProps & {
  disabledFuture?: boolean
  calendarProps?: CalendarProps
  buttonProps?: ButtonProps
  popoverContentProps?: PopoverContentProps
}

type DatePickerFieldProps<
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

function renderValue(value: Date | Date[] | { from: Date | undefined; to: Date | undefined } | undefined) {
  if (!value) return null

  if (Array.isArray(value)) return <time className='truncate'>{value.map((date) => format(date, "PP")).join(", ")}</time>

  if (typeof value === "object" && "from" in value && "to" in value) {
    const range = value as { from: Date | undefined; to: Date }
    return <time>{`${range.from ? `${format(range.from, "PP")} - ` : ""}${range.to ? format(range.to, "PP") : ""}`}</time>
  }

  if (value instanceof Date) return <time className='truncate'>{format(value, "PP")}</time>

  return null
}

export default function DatePickerField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  extendedProps,
  isRequired,
}: DatePickerFieldProps<T>) {
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
              <PopoverContent className='w-auto p-0' align='start' {...extendedProps?.popoverContentProps}>
                <Calendar
                  {...extendedProps?.calendarProps}
                  initialFocus
                  mode={extendedProps?.calendarProps?.mode}
                  defaultMonth={field.value}
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={extendedProps?.disabledFuture ? (date: Date) => date > new Date() || date < new Date("1900-01-01") : false}
                />
              </PopoverContent>
            </Popover>
            {description && <FormDescription {...extendedProps?.descriptionProps}>{description}</FormDescription>}
            <FormMessage {...extendedProps?.messageProps} />
          </FormItem>
        )
      }}
    />
  )
}
