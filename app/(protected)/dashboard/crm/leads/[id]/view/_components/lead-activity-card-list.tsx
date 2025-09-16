"use client"

import { memo, useMemo } from "react"
import { format } from "date-fns"
import { ColumnFiltersState, Table as TanstackTable } from "@tanstack/react-table"

import { getLeadById } from "@/actions/lead"
import { Icons } from "@/components/icons"
import LeadActivityCard from "./lead-activity-card"
import { getInitials } from "@/lib/utils"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Activity } from "./tabs/lead-activities-tab"

type LeadActivityCardListProps<TData> = {
  table: TanstackTable<TData>
  columnFilters: ColumnFiltersState
  lead?: Awaited<ReturnType<typeof getLeadById>>
  setActivity: (value: Activity | null) => void
  setIsOpen: (value: boolean) => void
}

function LeadActivityCardListComponent<TData>({ table, lead, setActivity, setIsOpen }: LeadActivityCardListProps<TData>) {
  if (!lead) return null

  const user = lead.createdByUser
  const tableRow = table.getRowModel().rows || []
  const activities = tableRow.map((row) => row.original) as Activity[]

  return (
    <ol className='relative border-s border-gray-200 dark:border-gray-700'>
      {activities
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((activity) => (
          <LeadActivityCard key={activity.id} activity={activity} setActivity={setActivity} setIsOpen={setIsOpen} />
        ))}

      <li className='mb-10 ms-6'>
        <span className='absolute -start-3.5 flex size-7 items-center justify-center rounded-full bg-slate-200 ring-8 ring-background dark:bg-slate-600 dark:ring-background'>
          <Icons.filePlus className='size-3.5 text-slate-800 dark:text-slate-300' />
        </span>

        <span className='absolute -start-3.5 bottom-0 flex size-7 items-center justify-center rounded-full bg-slate-200 ring-8 ring-background dark:bg-slate-600 dark:ring-background'>
          <Icons.landPlot className='size-4 text-slate-800 dark:text-slate-300' />
        </span>

        <header className='mb-2 flex flex-col items-center lg:flex-row lg:justify-between'>
          <p className='flex items-center gap-2 text-sm font-medium'>
            <span>Creation:</span>
            <ActionTooltipProvider label='Lead Created'>
              <span className='inline-block max-w-[512px] truncate font-extrabold uppercase'>Lead Created</span>
            </ActionTooltipProvider>
          </p>

          <p className='text-xs text-muted-foreground'>{format(lead.createdAt, "PPpp")}</p>
        </header>

        <div className='flex flex-col'>
          <div className='rounded-lg border p-4'>
            <div className='flex items-center justify-between rounded'>
              <div className='flex flex-1 flex-col items-center gap-2 md:flex-row'>
                <div className='flex size-10 items-center justify-center rounded-full bg-muted'>
                  <span className='text-sm font-medium'>{getInitials(user?.name || "")}</span>
                </div>

                <div className='flex flex-col items-center gap-1 md:items-start'>
                  <h1 className='m-0 text-sm font-bold'>{user?.name || ""}</h1>

                  <div>
                    <span className='inline-flex items-center rounded-md bg-lime-50 px-2 py-1 text-center text-xs font-medium text-lime-600 ring-1 ring-lime-500/10'>
                      Done
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='px-4 pt-4 text-sm'>Addded {lead.name}</div>
          </div>
        </div>
      </li>
    </ol>
  )
}

const LeadActivityCardList = memo(
  LeadActivityCardListComponent,
  (prev, next) => JSON.stringify(prev.lead) === JSON.stringify(next.lead)
) as typeof LeadActivityCardListComponent

export default LeadActivityCardList
