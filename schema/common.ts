import { z } from "zod"

export const paramsSchema = z.object({
  id: z.string().min(1, { message: "Please enter an id." }),
})

export type Params = z.infer<typeof paramsSchema>
