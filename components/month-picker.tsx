import { add, eachMonthOfInterval, endOfYear, format, isEqual, isFuture, parse, startOfMonth, startOfToday } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import { buttonVariants } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"

function getStartOfCurrentMonth() {
  return startOfMonth(startOfToday())
}

export type MonthPickerProps = {
  className?: string
  currentMonth?: Date
  captionLayout?: "text-only" | "dropdown-buttons"
  onMonthChange: (newMonth: Date) => void
} & MonthPickerCaptionLayout

type MonthPickerCaptionLayout =
  | { captionLayout: "text-only" }
  | { captionLayout: "dropdown-buttons"; fromYear: number | undefined; toYear: number | undefined }

export default function MonthPicker({ className, currentMonth, onMonthChange, captionLayout, ...props }: MonthPickerProps) {
  const [currentYear, setCurrentYear] = React.useState(
    currentMonth ? format(new Date(currentMonth), "yyyy") : format(new Date(new Date()), "yyyy")
  )
  const firstDayCurrentYear = parse(currentYear, "yyyy", new Date())

  const months = eachMonthOfInterval({
    start: firstDayCurrentYear,
    end: endOfYear(firstDayCurrentYear),
  })

  function previousYear() {
    const firstDayPreviousYear = add(firstDayCurrentYear, { years: -1 })
    setCurrentYear(format(firstDayPreviousYear, "yyyy"))
  }

  function nextYear() {
    const firstDayNextYear = add(firstDayCurrentYear, { years: 1 })
    setCurrentYear(format(firstDayNextYear, "yyyy"))
  }

  function getYears(start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start)
  }

  React.useEffect(() => {
    if (currentMonth) {
      onMonthChange(new Date(currentMonth))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={cn("flex w-fit flex-col space-y-4 p-3 sm:flex-row sm:space-x-4 sm:space-y-0", className)}>
      <div className='space-y-4'>
        <div className='relative flex items-center justify-center pt-1'>
          <div className='text-sm font-medium' aria-live='polite' role='presentation' id='month-picker'>
            {captionLayout === "text-only" ? format(firstDayCurrentYear, "yyyy") : null}

            {captionLayout === "dropdown-buttons" && "fromYear" in props && "toYear" in props && (
              <Select
                value={currentYear}
                onValueChange={(value) => {
                  setCurrentYear(value)
                }}
              >
                <SelectTrigger className='h-[28px] gap-x-1 pr-1.5 focus:ring-0 focus:ring-offset-0'>
                  <SelectValue>{currentYear}</SelectValue>
                </SelectTrigger>
                <SelectContent position='popper'>
                  <ScrollArea className='h-80 overflow-auto'>
                    {props.fromYear && props.toYear
                      ? getYears(props.fromYear, props.toYear).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))
                      : null}
                  </ScrollArea>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className='flex items-center space-x-1'>
            <button
              name='previous-year'
              aria-label='Go to previous year'
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                "absolute left-1"
              )}
              type='button'
              onClick={previousYear}
            >
              <ChevronLeft className='h-4 w-4' />
            </button>
            <button
              name='next-year'
              aria-label='Go to next year'
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                "absolute right-1 disabled:pointer-events-none disabled:opacity-50"
              )}
              type='button'
              disabled={isFuture(add(firstDayCurrentYear, { years: 1 }))}
              onClick={nextYear}
            >
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        </div>
        <div className='grid w-full grid-cols-3 gap-2' role='grid' aria-labelledby='month-picker'>
          {months.slice(0, 12).map((month) => (
            <div
              key={month.toString()}
              className='relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md dark:[&:has([aria-selected])]:bg-slate-800'
              role='presentation'
            >
              <button
                name='day'
                className={cn(
                  "inline-flex h-9 w-16 items-center justify-center rounded-md p-0 text-sm font-normal ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:opacity-100 dark:ring-offset-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-slate-800",
                  currentMonth &&
                    isEqual(month, currentMonth) &&
                    "bg-primary text-slate-50 hover:bg-primary hover:text-slate-50 focus:bg-primary focus:text-slate-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50 dark:hover:text-slate-900 dark:focus:bg-slate-50 dark:focus:text-slate-900",
                  currentMonth &&
                    !isEqual(month, currentMonth) &&
                    isEqual(month, getStartOfCurrentMonth()) &&
                    "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                )}
                disabled={isFuture(month)}
                role='gridcell'
                tabIndex={-1}
                type='button'
                onClick={() => {
                  onMonthChange(month)
                }}
              >
                <time dateTime={format(month, "yyyy-MM-dd")}>{format(month, "MMM")}</time>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
