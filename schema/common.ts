import { z } from "zod"

export const paramsFormSchema = z.object({
  id: z.string().min(1, { message: "Please enter an id." }),
})

export type ParamsForm = z.infer<typeof paramsFormSchema>
