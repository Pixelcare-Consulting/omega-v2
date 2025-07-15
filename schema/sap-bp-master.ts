import { z } from "zod"

export const syncBpMasterSchema = z.object({
  cardType: z.string().min(1, { message: "Card type is required" }),
})
