"use client"

import { getRequisitionByCode } from "@/actions/requisition"
import { Button } from "@/components/ui/button"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import ShipmentForm from "@/app/(protected)/dashboard/crm/shipments/_components/shipment-form"
import RequisitionShipmentsList from "../requisition-shipments-list"

type RequisitionShipmentsTabProps = {
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionByCode>>>
}

export default function RequisitionShipmentsTab({ requisition }: RequisitionShipmentsTabProps) {
  const requisitionsShipments = requisition?.shipments || []

  const { isOpen, setIsOpen, data, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

  const Actions = () => {
    const handleActionClick = () => {
      setIsOpen(true)
      setData(null)
    }

    return (
      <Button variant='outline-primary' onClick={handleActionClick}>
        Add Shipment
      </Button>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Shipments'
          description="Requisition's related shipments"
          actions={<Actions />}
        />

        <div className='col-span-12'>
          <RequisitionShipmentsList requisition={requisition} shipments={requisitionsShipments} />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add shipment for requisition #{requisition.code}</DialogTitle>
            <DialogDescription>Fill in the form to {data ? "edit" : "create a new"} shipment for this requisition.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            <ShipmentForm isModal disableRequisitionField shipment={data || null} reqCode={requisition.code} />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
