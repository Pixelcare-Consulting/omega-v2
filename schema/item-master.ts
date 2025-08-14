import { z } from "zod"

//* Zod schema
export const itemMasterFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  BuyUnitMsr: z.string().nullish(),
  FirmCode: z.coerce.number().nullish(),
  FirmName: z.string().nullish(),
  ItemCode: z.string().min(1, { message: "Code is required" }),
  ItemName: z.string().min(1, { message: "Description is required" }),
  ItmsGrpCod: z.coerce.number().min(1, { message: "Group is required" }),
  ItmsGrpNam: z.string().nullish(),
  ManBtchNum: z.boolean(),
  CreateDate: z.string().min(1, { message: "Create date is required" }),
  UpdateDate: z.string().min(1, { message: "Update date is required" }),
  source: z.string().min(1, { message: "Source is required" }),
  syncStatus: z.string().min(1, { message: "Sync status is required" }),
  // ItemsGroupCode: z.string().nullish(),
  // CustomsGroupCode: z.string().nullish(),
  // Manufacturer: z.string().nullish(),
  // ManufacturerPn: z.string().nullish(),
  // ManageBatchNumbers: z.boolean().nullish(),
  // PurchaseUnit: z.string().nullish(),
  // PurchaseItem: z.boolean().nullish(),
  // SalesItem: z.boolean().nullish(),
  // InventoryItem: z.boolean().nullish(),
  // VatLiable: z.boolean().nullish(),
  // IncomeAccount: z.string().nullish(),
  // DefaultWarehouse: z.string().nullish(),
  // ItemCountryOrg: z.string().nullish(),
})

export const deleteItemMasterSchema = z.object({
  code: z.string().min(1, { message: "Code is required" }),
})

//* Types
export type ItemForm = z.infer<typeof itemMasterFormSchema>
