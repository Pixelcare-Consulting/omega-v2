export type Stats = {
  total: number
  completed: number
  progress: number
  error: { [key: string]: any }[]
  status: string //* "processing" | "completed"
}
