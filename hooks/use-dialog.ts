import { createStoreWithSelectors } from "@/lib/zustand"
import { createWithEqualityFn } from "zustand/traditional"

type DialogStore = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  title: string
  setTitle: (title: string) => void
  description: string
  setDescription: (description: string) => void
  data: any
  setData: (data: null | Record<string, any>) => void
}

const dialogStore = createWithEqualityFn<DialogStore>((set) => ({
  title: "",
  setTitle: (title: string) => set({ title }),
  description: "",
  setDescription: (description: string) => set({ description }),
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  data: null,
  setData: (data: null | Record<string, any>) => set({ data }),
}))

export const useDialogStore = createStoreWithSelectors(dialogStore)
