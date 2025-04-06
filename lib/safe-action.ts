import { createSafeActionClient } from 'next-safe-action'

function handleServerError(error: Error) {
  console.error(error)
  throw error
}

export const action = createSafeActionClient({ handleServerError })
