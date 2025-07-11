import { z } from "zod"

//* Zod schema
export const itemFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  ItemCode: z.string().min(1, { message: "Item code is required" }),
  ItemName: z.string().nullish(),
  ItemsGroupCode: z.string().nullish(),
  CustomsGroupCode: z.string().nullish(),
  Manufacturer: z.string().nullish(),
  ManufacturerPn: z.string().nullish(),
  ManageBatchNumbers: z.boolean().nullish(),
  PurchaseUnit: z.string().nullish(),
  PurchaseItem: z.boolean().nullish(),
  SalesItem: z.boolean().nullish(),
  InventoryItem: z.boolean().nullish(),
  VatLiable: z.boolean().nullish(),
  IncomeAccount: z.string().nullish(),
  DefaultWarehouse: z.string().nullish(),
  ItemCountryOrg: z.string().nullish(),
})

//* Types
export type ItemForm = z.infer<typeof itemFormSchema>
