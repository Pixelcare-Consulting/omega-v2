"use client"

import MinimalRichTextEditor, { MinimalRichTextEditorProps } from "../minimal-rich-text-editor"

import { Control, FieldPath, FieldValues, useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "../ui/form"
import { FormExtendedProps } from "@/types/form"

type ExtendedProps = FormExtendedProps & { minimalRichTextEditorProps?: Omit<MinimalRichTextEditorProps, "value" | "onChange"> }

type MinimalRichTextEditorFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  showLabel?: boolean
  description?: string
  extendedProps?: ExtendedProps
  isRequired?: boolean
}

export default function MinimalRichTextEditorField<T extends FieldValues>({
  control,
  name,
  label,
  showLabel = true,
  description,
  extendedProps,
  isRequired,
}: MinimalRichTextEditorFieldProps<T>) {
  const { clearErrors } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className='space-y-2' {...extendedProps?.itemProps}>
            {showLabel && (
              <FormLabel className='space-x-1' {...extendedProps?.labelProps} isRequired={isRequired}>
                {label}
              </FormLabel>
            )}
            <FormControl>
              <MinimalRichTextEditor
                value={field.value}
                onChange={(content) => {
                  field.onChange(content)
                  clearErrors(name)
                }}
                {...extendedProps?.minimalRichTextEditorProps}
              />
            </FormControl>
            {description && <FormDescription {...extendedProps?.descriptionProps}>{description}</FormDescription>}
            <FormMessage {...extendedProps?.messageProps} />
          </FormItem>
        )
      }}
    />
  )
}
