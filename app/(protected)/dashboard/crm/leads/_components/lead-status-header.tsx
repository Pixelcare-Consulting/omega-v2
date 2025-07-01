"use client"

import { getLeadById } from "@/actions/lead"
import { Icons } from "@/components/icons"

import { cn } from "@/lib/utils"

type LeadStatusHeaderProps = {
  className?: string
  lead?: Awaited<ReturnType<typeof getLeadById>>
  leadStatus: string
  isLoading?: boolean
  handleUpdateStatus: (id: string, status: string) => Promise<void>
}

export default function LeadStatusHeader({ className, lead, leadStatus, isLoading, handleUpdateStatus }: LeadStatusHeaderProps) {
  const STEPS = [
    {
      label: "New Lead",
      value: "new-lead",
    },
    {
      label: "Attempted to Contact",
      value: "attempted-to-contact",
    },
    {
      label: "Contacted",
      value: "contacted",
    },
    {
      label: "Closed",
      value: "qualified",
    },
  ]

  if (!lead) return null

  const Step = ({
    status,
    label,
    leadStatus,
    isActive,
    isUnqualified,
  }: {
    status: string
    label: string
    leadStatus: string
    isActive: boolean
    isUnqualified: boolean
  }) => {
    const statusLabel =
      status === "qualified" && leadStatus === "qualified"
        ? "Qualified"
        : status === "qualified" && leadStatus === "unqualified"
          ? "Unqualified"
          : label

    return (
      <>
        <div className='relative z-10'>
          <div
            onClick={() => leadStatus !== status && handleUpdateStatus(lead.id, status)}
            className={cn(
              "flex size-10 cursor-pointer items-center justify-center rounded-full text-white transition-all delay-200 ease-in",
              isActive && !isUnqualified
                ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                : "bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500",
              isUnqualified && "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            )}
          >
            <Icons.check className={cn("size-5", isActive ? "block" : "hidden", isLoading && "hidden")} strokeWidth={3} />
            <Icons.x className={cn("size-5", isActive ? "hidden" : "block", isLoading && "hidden")} strokeWidth={2} />
            {isLoading && <Icons.spinner className={cn("size-5 animate-spin", isLoading ? "block" : "hidden")} strokeWidth={3} />}
          </div>

          <div className='absolute left-1/2 top-16 -translate-x-2/4 -translate-y-2/4'>
            <span className='inline-block w-[200px] text-center text-sm font-semibold'>{statusLabel}</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={cn("hidden md:block", className)}>
      <div className='mx-auto w-full pb-8'>
        <div className='before:transform-y-1/2 relative flex justify-between before:absolute before:left-0 before:top-1/2 before:h-1 before:w-full'>
          {STEPS.map(({ value, label }, i) => {
            const stepperStatusIndex = STEPS.findIndex((item) => item.value === value)
            const leadStatusIndex = STEPS.findIndex((item) => item.value === leadStatus)
            const isUnqualified = leadStatus === "unqualified"
            const isActive = leadStatusIndex >= stepperStatusIndex
            const isLast = i === STEPS.length - 1

            return (
              <div key={i} className='relative flex flex-1 flex-col items-center'>
                <Step status={value} label={label} leadStatus={leadStatus} isActive={isActive} isUnqualified={isUnqualified} />

                {!isLast && (
                  <div
                    className={cn(
                      "absolute right-0 top-1/2 z-0 h-1 w-full -translate-y-1/2 translate-x-1/2",
                      isActive
                        ? "bg-green-500 dark:bg-green-600 dark:hover:bg-green-700"
                        : "bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500",
                      isUnqualified && "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
