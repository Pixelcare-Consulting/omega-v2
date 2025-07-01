"use client"

import { getLeadById, updateLeadStatus } from "@/actions/lead"
import { Icons } from "@/components/icons"
import LoadingButton from "@/components/loading-button"
import { cn } from "@/lib/utils"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "nextjs-toploader/app"
import { useState } from "react"
import { toast } from "sonner"

type LeadFormHeaderProps = {
  lead?: Awaited<ReturnType<typeof getLeadById>>
}

export default function LeadStatus({ lead }: LeadFormHeaderProps) {
  const router = useRouter()
  const { executeAsync, isExecuting } = useAction(updateLeadStatus)
  const [isLoading, setLoading] = useState(false)

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

  const leadStatus = lead.status
  const loading = isExecuting || isLoading

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setLoading(true)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const response = await executeAsync({ id, status })
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      setLoading(false)
      toast.success(result?.message)

      if (result?.data && result?.data?.lead && "id" in result?.data?.lead) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/crm/leads/${result.data.lead.id}/view`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
      toast.error("Something went wrong! Please try again later.")
    }
  }

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
              "flex size-12 cursor-pointer items-center justify-center rounded-full text-white transition-all delay-200 ease-in",
              isActive && !isUnqualified
                ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                : "bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500",
              isUnqualified && "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            )}
          >
            <Icons.check className={cn("size-5.5", isActive ? "block" : "hidden", loading && "hidden")} strokeWidth={3} />
            <Icons.x className={cn("size-5", isActive ? "hidden" : "block", loading && "hidden")} strokeWidth={2} />
            {loading && <Icons.spinner className={cn("size-5.5 animate-spin", loading ? "block" : "hidden")} strokeWidth={3} />}
          </div>

          <div className='absolute left-1/2 top-20 -translate-x-2/4 -translate-y-2/4'>
            <span className='inline-block w-[200px] text-center text-sm font-semibold'>{statusLabel}</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className='hidden md:block'>
      <div className='flex justify-end gap-2'>
        {leadStatus === "qualified" || leadStatus === "unqualified" ? (
          <LoadingButton
            disabled={loading}
            isLoading={loading}
            variant='outline'
            loadingText='Updating'
            onClick={() => handleUpdateStatus(lead.id, "new-lead")}
          >
            Reopen
          </LoadingButton>
        ) : (
          <>
            <LoadingButton
              disabled={loading}
              isLoading={loading}
              variant='outline-success'
              loadingText='Updating'
              onClick={() => handleUpdateStatus(lead.id, "qualified")}
            >
              Qualified
            </LoadingButton>
            <LoadingButton
              disabled={loading}
              isLoading={loading}
              variant='outline-destructive'
              loadingText='Updating'
              onClick={() => handleUpdateStatus(lead.id, "unqualified")}
            >
              Unqualified
            </LoadingButton>
          </>
        )}
      </div>

      <div className='mx-auto w-full pb-[70px] pt-5'>
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
