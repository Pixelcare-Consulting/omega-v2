import { format } from "date-fns"
import { ComponentPropsWithoutRef, memo, useEffect, useState } from "react"
import { ColumnFiltersState, Table } from "@tanstack/react-table"

import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button, ButtonProps } from "../ui/button"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Calendar, CalendarProps } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { toast } from "sonner"

type FilterFieldsOption = { label: string; value: string }

export type FilterFields = {
  label: string
  columnId: string
  type: "text" | "date" | "date-range" | "select" | "multiselect"
  options?: FilterFieldsOption[]
  placeholder?: string
}

type DataTableFilterProps<TData> = {
  table: Table<TData>
  mode?: "dialog" | "popover" | "block"
  filterFields: FilterFields[]
  columnFilters: ColumnFiltersState
  children?: React.ReactNode
  className?: string
  buttonProps?: ButtonProps
}

//TODO: Add data-range & multi select filter type

function DataTableFilterComponent<TData>({
  table,
  mode = "dialog",
  filterFields,
  columnFilters,
  children,
  className,
  buttonProps,
}: DataTableFilterProps<TData>) {
  const [open, setOpen] = useState(false)

  const filterCount = columnFilters?.length || 0

  const getFilterFields = (field: FilterFields, table: Table<TData>) => {
    const column = table.getColumn(field.columnId)
    const columnFilterValue = column?.getFilterValue() as any

    if (!column) {
      console.error(`Column with id of ${field.columnId} not found`)
      return null
    }

    //* add filters type component here...
    switch (field.type) {
      case "text":
        return <FilterInput {...field} type='text' value={columnFilterValue} onChange={(value) => column.setFilterValue(value)} />

      case "select":
        return (
          <FilterSelect {...field} options={field.options} value={columnFilterValue} onChange={(value) => column.setFilterValue(value)} />
        )

      case "date":
        return (
          <FilterDate
            {...field}
            value={columnFilterValue}
            onChange={(value) => column.setFilterValue(value)}
            mode='single'
            fromYear={1800}
            toYear={new Date().getFullYear()}
            captionLayout='dropdown-buttons'
          />
        )
    }
  }

  if (mode === "block") {
    return (
      <div className={cn("w-full", className)}>
        <div className='flex flex-col space-y-1.5 text-center sm:text-left'>
          <h1 className='text-lg font-semibold leading-none tracking-tight'>Advanced Filters</h1>
          <p className='text-muted-foregroun text-sm'>Filter the table by column</p>
        </div>

        <div className='grid gap-4 py-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filterFields.map((field, i) => (
            <div key={i}>{getFilterFields(field, table)}</div>
          ))}

          {children}
        </div>
      </div>
    )
  }

  if (mode === "popover") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button className={cn("flex items-center", className)} variant='outline' {...buttonProps}>
            <Icons.funnel className='mr-2 size-4' />
            Filter
            {filterCount > 0 && <Badge className='text-xs'>{filterCount}</Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align='end' className='md:min-w-4xl lg:min-w-5xl w-full p-6'>
          <div className='flex flex-col space-y-1.5 text-center sm:text-left'>
            <h1 className='text-lg font-semibold leading-none tracking-tight'>Advanced Filters</h1>
            <p className='text-muted-foregroun text-sm'>Filter the table by column</p>
          </div>

          <div className='grid gap-4 py-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {filterFields.map((field, i) => (
              <div key={i}>{getFilterFields(field, table)}</div>
            ))}

            {children}
          </div>

          <Separator />

          <div className='flex flex-col-reverse pt-5 sm:flex-row sm:justify-end sm:space-x-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                table.resetColumnFilters()
                toast.success("Filters cleared")
              }}
            >
              <Icons.x className='mr-2 size-4' /> Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  if (mode == "dialog") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className={cn("flex items-center", className)} variant='outline' {...buttonProps}>
            <Icons.funnel className='mr-2 size-4' />
            Filter
            {filterCount > 0 && <Badge className='text-xs'>{filterCount}</Badge>}
          </Button>
        </DialogTrigger>
        <DialogContent className='w-full md:max-w-3xl lg:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
            <DialogDescription>Filter the table by column</DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {filterFields.map((field, i) => (
              <div key={field.columnId}>{getFilterFields(field, table)}</div>
            ))}

            {children}
          </div>

          <Separator />

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                table.resetColumnFilters()
                toast.success("Filters cleared")
              }}
            >
              <Icons.x className='mr-2 size-4' /> Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return null
}

export const DataTableFilter = memo(
  DataTableFilterComponent,
  (prev, next) => JSON.stringify(prev.columnFilters) === JSON.stringify(next.columnFilters)
) as typeof DataTableFilterComponent

type FilterInputProps = {
  columnId: string
  label: string
  value: string
  onChange: (value: string) => void
  debounce?: number
} & ComponentPropsWithoutRef<"input">

const FilterInput = memo(function FilterInput({ columnId, label, value, onChange, debounce = 500, ...props }: FilterInputProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={columnId}>{label}</Label>
      <Input {...props} value={value || ""} id={columnId} onChange={(e) => onChange(String(e.target.value))} />
    </div>
  )
})

type FilterSelectProps = {
  columnId: string
  options?: FilterFieldsOption[]
  label: string
  value: string | number | boolean
  onChange: (value: string | number | boolean) => void
}

const FilterSelect = memo(function FilterSelect({ columnId, options = [], label, value, onChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const [selectValue, setSelectValue] = useState(value)

  return (
    <div className='space-y-2'>
      <Label htmlFor={columnId}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' role='combobox' className='w-full justify-between'>
            {selectValue ? options.find((framework) => framework.value === value)?.label : `Select ${label.toLowerCase()}...`}
            <Icons.chevUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='z-50 w-full min-w-[var(--radix-popover-trigger-width)] p-0'>
          <Command id={columnId}>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === selectValue ? "" : currentValue)
                      setSelectValue(currentValue === selectValue ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    {option.label}
                    <Icons.check className={cn("ml-auto", selectValue === option.value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
})

type FilterDateProps = {
  columnId: string
  label: string
  value: Date | Date[] | { from: Date | undefined; to: Date | undefined } | undefined
  onChange: (...param: any[]) => void
  disabledFuture?: boolean
} & CalendarProps

const FilterDate = memo(function FilterDate({ columnId, label, value, onChange, ...props }: FilterDateProps) {
  const [open, setOpen] = useState(false)
  const [dateValue, setDateValue] = useState(value)

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

  return (
    <div className='space-y-2'>
      <Label htmlFor={columnId}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn("flex w-full justify-start pl-3 text-left font-normal", !dateValue && "text-muted-foreground")}
          >
            <Icons.calendar className='mr-2 size-4' />
            {dateValue ? renderValue(dateValue) : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            {...props}
            initialFocus
            mode={props.mode as any}
            defaultMonth={dateValue as Date}
            selected={dateValue}
            onSelect={(value: any) => {
              onChange(value)
              setDateValue(value)
              setOpen(false)
            }}
            disabled={props.disabledFuture ? (date: Date) => date > new Date() || date < new Date("1900-01-01") : false}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
})
