"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Control, FieldPath, FieldValues } from "react-hook-form"

import { Button, ButtonProps } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandEmptyProps,
  CommandInput,
  CommandInputProps,
  CommandItem,
  CommandItemProps,
  CommandList,
  CommandListProps,
  CommandProps,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverContentProps, PopoverTrigger } from "@/components/ui/popover"
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "../ui/form"
import { FormExtendedProps, FormOption } from "@/types/form"
import { cn } from "@/lib/utils"

type ExtendedProps = FormExtendedProps & {
  buttonProps?: ButtonProps
  popoverContentProps?: PopoverContentProps
  commandProps?: CommandProps
  commandInputProps?: CommandInputProps
  commandListProps?: CommandListProps
  commandItemProps?: CommandItemProps
  commandEmptyProps?: CommandEmptyProps
}

type ComboboxFieldData = (FormOption & { [key: string]: any })[]

type ComboboxFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  data: ComboboxFieldData
  isLoading?: boolean
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  extendedProps?: ExtendedProps
  isRequired?: boolean
  isHideLabel?: boolean
  renderItem?: (item: ComboboxFieldData[number], selected: boolean, index: number) => React.ReactNode
  callback?: (...args: any[]) => void
}

//TODO: Add custom command item render
export function ComboboxField<T extends FieldValues>({
  data,
  isLoading,
  control,
  name,
  label,
  description,
  extendedProps,
  isRequired,
  isHideLabel,
  renderItem,
  callback,
}: ComboboxFieldProps<T>) {
  const [open, setOpen] = React.useState(false)

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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant='outline'
                    className='w-full justify-between truncate disabled:bg-muted disabled:opacity-100'
                    {...extendedProps?.buttonProps}
                  >
                    {field.value ? data.find((item) => item.value == field.value)?.label : `Select ${label}`}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className='z-50 w-full min-w-[var(--radix-popover-trigger-width)] p-0'
                {...extendedProps?.popoverContentProps}
              >
                <Command {...extendedProps?.commandProps}>
                  <CommandInput placeholder={`Search ${label}...`} {...extendedProps?.commandInputProps} />

                  {!isLoading ? <CommandEmpty {...extendedProps?.commandEmptyProps}>No {label.toLowerCase()} found.</CommandEmpty> : null}

                  {isLoading ? <CommandEmpty>Loading...</CommandEmpty> : null}

                  <CommandList {...extendedProps?.commandListProps}>
                    {!isLoading && data && data.length > 0
                      ? data.map((item, i) => {
                          const selected = field.value == item.value

                          return (
                            <CommandItem
                              key={`${i}-${item.value}`}
                              value={item.value}
                              onSelect={() => {
                                field.onChange(item.value)
                                setOpen(false)

                                if (callback) callback({ option: item })
                              }}
                              {...extendedProps?.commandItemProps}
                            >
                              {renderItem && renderItem.length > 0 ? (
                                renderItem(item, selected, i)
                              ) : (
                                <>
                                  <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                                  {item.label}
                                </>
                              )}
                            </CommandItem>
                          )
                        })
                      : null}
                  </CommandList>
                </Command>
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
