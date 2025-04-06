import { FormDescriptionProps, FormItemProps, FormLabelProps, FormMessageProps } from '@/components/ui/form'

export type FormExtendedProps = {
  itemProps?: FormItemProps
  labelProps?: FormLabelProps
  descriptionProps?: FormDescriptionProps
  messageProps?: FormMessageProps
}

export type FormOption = { value: string; label: string }
