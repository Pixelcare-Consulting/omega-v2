"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import AsteriskRequired from "../asterisk-required"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

export type FormItemProps = React.HTMLAttributes<HTMLDivElement>

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

export type FormLabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { isRequired?: boolean }

const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, FormLabelProps>(
  ({ className, isRequired, ...props }, ref) => {
    const { error, formItemId } = useFormField()

    if (typeof props.children === "string" && isRequired) {
      props.children = (
        <>
          <span>{props.children}</span> <AsteriskRequired />
        </>
      )
    }

    return <Label ref={ref} className={cn(error && "text-rose-500", className)} htmlFor={formItemId} {...props} />
  }
)
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

export type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return <p ref={ref} id={formDescriptionId} className={cn("text-xs text-muted-foreground", className)} {...props} />
})
FormDescription.displayName = "FormDescription"

export type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p ref={ref} id={formMessageId} className={cn("text-xs font-medium text-rose-500", className)} {...props}>
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }
