"use client"

import { format } from "date-fns"
import { BarLoader } from "react-spinners"
import { toast } from "sonner"

import { getSyncMetaByCode } from "@/actions/sync-meta"
import { Icons } from "@/components/icons"
import LoadingButton from "@/components/loading-button"
import { useAction } from "next-safe-action/hooks"
import { syncBpMaster } from "@/actions/sap-bp-master"

type CustomerListHeaderProps = {
  syncMeta: NonNullable<Awaited<ReturnType<typeof getSyncMetaByCode>>>
}

export default function CustomerListHeader({ syncMeta }: CustomerListHeaderProps) {
  const lastSyncDate = syncMeta?.lastSyncAt || new Date("01/01/2020")

  const { executeAsync, isExecuting } = useAction(syncBpMaster)

  const handleSyncData = async () => {
    try {
      const response = await executeAsync({ cardType: "C" })
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <Icons.clock className='size-5 text-muted-foreground' />
        <span className='font-bold text-muted-foreground'>Last Sync Date:</span>{" "}
        <span className='text-lg font-extrabold'>{format(lastSyncDate, "PP, hh:mm:ss a")}</span>
      </div>

      {isExecuting && <BarLoader color='#d60a2c' width='58%' />}

      <LoadingButton variant='outline' isLoading={isExecuting} loadingText='Syncing' onClick={handleSyncData}>
        <Icons.refreshCw className='size-4' /> Sync
      </LoadingButton>
    </div>
  )
}
