import { z } from "zod"

//* Zod schema
export const importSchema = z.object({
  data: z.array(z.record(z.string(), z.any())),
  total: z.number(),
  stats: z.object({
    total: z.number(),
    completed: z.number(),
    progress: z.number(),
    error: z.array(z.record(z.string(), z.any())),
    status: z.string(),
  }),
  isLastBatch: z.boolean(),
  metaData: z.record(z.string(), z.any()).nullish(),
})

//* Types
export type ImportSchema = z.infer<typeof importSchema>
