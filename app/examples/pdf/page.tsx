"use client"

import SalesQuotationPdf from "@/components/pdf/sales-qoute-pdf"
import { Card } from "@/components/ui/card"
import dynamic from "next/dynamic"

const PDFViewer = dynamic(() => import("@/components/pdf"), { ssr: false })

function TestPDFPage() {
  const salesQuote = {
    id: "SQ001",
    code: 3210,
    date: new Date("06/17/2025"),
    billTo: `Dell Products L.P., P.O. Box 149257, Austin TX  78714-9257`,
    shipTo: `Dell Products L.P., P.O. Box 149257, Austin TX  78714-9257`,
    customerCode: "C10403",
    contact: "AP Eamil",
    salesRep: "Jayson Alfonso",
    paymentTerms: "NET45",
    fobPoint: "Manila",
    shippingMethod: "Air Freight",
    validUntil: new Date("06/17/2025"),
    approval: "John Doe",
    approvalDate: new Date("06/17/2025"),
    lineItems: [
      {
        code: "BCM84858RB1KFEBR",
        mpn: "BCM84858RB1KFEBR",
        mfr: "Broadcom",
        name: "IC QUAD PORT 28NM 10GBASE-T",
        cpn: "BCM84858RB1KFEBG",
        dateCode: "23+",
        estimatedDeliveryDate: new Date("06/23/2025"),
        unitPrice: 55,
        quantity: 6596,
      },
      {
        code: "SN74HC595N",
        mpn: "SN74HC595N",
        mfr: "Texas Instruments",
        name: "8-BIT SHIFT REGISTER",
        cpn: "TI-SN74HC595N",
        dateCode: "24+",
        estimatedDeliveryDate: new Date("06/26/2025"),
        unitPrice: 0.45,
        quantity: 12000,
      },
      {
        code: "ATMEGA328P-PU",
        mpn: "ATMEGA328P-PU",
        mfr: "Microchip",
        name: "8-BIT AVR MCU, 32KB FLASH",
        cpn: "MC-ATMEGA328P",
        dateCode: "23+",
        estimatedDeliveryDate: new Date("06/28/2025"),
        unitPrice: 2.1,
        quantity: 3000,
      },
    ],
  }

  return (
    <Card className='p-5'>
      <h1 className='mb-4 text-lg font-bold'>Sles Quote PDF</h1>

      <PDFViewer height={800} width='100%'>
        <SalesQuotationPdf salesQuote={salesQuote as any} lineItems={salesQuote.lineItems as any} paymentTerms={[]} />
      </PDFViewer>
    </Card>
  )
}

export default TestPDFPage
