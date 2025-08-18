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
  CstGrpCode: z.coerce.number().nullish(),
  VATLiable: z.boolean(),
  PrchseItem: z.boolean(),
  SellItem: z.boolean(),
  InvntItem: z.boolean(),
  IncomeAcct: z.string().nullish(),
  DfltWH: z.string().nullish(),
  CountryOrg: z.string().max(3, { message: "Please enter at most 3 characters" }).nullish(),
  CreateDate: z.string().min(1, { message: "Create date is required" }),
  UpdateDate: z.string().min(1, { message: "Update date is required" }),
  source: z.string().min(1, { message: "Source is required" }),
  syncStatus: z.string().min(1, { message: "Sync status is required" }),
})

export const deleteItemMasterSchema = z.object({
  code: z.string().min(1, { message: "Code is required" }),
})

//* Types
export type ItemForm = z.infer<typeof itemMasterFormSchema>
