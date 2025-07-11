"use client"

import { useForm } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useMemo } from "react"

import { Icons } from "@/components/icons"
import { Card, CardContent } from "@/components/ui/card"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import InputField from "@/components/form/input-field"
import TextAreaField from "@/components/form/textarea-field"
import { FormDebug } from "@/components/form/form-debug"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { type RoleForm, roleFormSchema } from "@/schema/role"
import { useAction } from "next-safe-action/hooks"
import { getRoleById, upsertRole } from "@/actions/role"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { getPermissions } from "@/actions/permissions"
import { Separator } from "@/components/ui/separator"

// TODO: Stored it in db to easily access and add on demand
//* Actions data
const ACTIONS = [
  { name: "Create", code: "create" },
  { name: "Read", code: "read" },
  { name: "Update", code: "update" },
  { name: "Delete", code: "delete" },
]

type RoleFormProps = {
  role?: Awaited<ReturnType<typeof getRoleById>>
  permissions: Awaited<ReturnType<typeof getPermissions>>
}

export default function RoleForm({ role, permissions }: RoleFormProps) {
  const router = useRouter()

  const defaultValues = useMemo(() => {
    if (!role) return { id: "add", code: "", name: "", description: "", permissions: [] }

    let rolePermissions: { id: string; actions: string[] }[] = []

    if (role?.permissions?.length > 0) {
      rolePermissions = role.permissions.map((p) => ({ id: p.permissionId, actions: p.actions }))
    } else rolePermissions = permissions.map((p) => ({ id: p.id, actions: [] }))

    if (role.code === "admin") rolePermissions = permissions.map((p) => ({ id: p.id, actions: ACTIONS.map((a) => a.code) }))

    return { ...role, permissions: rolePermissions }
  }, [role, permissions])

  const form = useForm<RoleForm>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(roleFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertRole)

  const onSubmit = async (formData: RoleForm) => {
    if (formData.code === "admin") {
      toast.success("Role updated successfully!")
      return
    }

    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        if (result.status === 401) {
          form.setError("code", { type: "custom", message: result.message })
        }

        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result.data.role && "id" in result.data.role) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/settings/roles/${result.data.role.id}`)
        }, 1500)
      }
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  const code = useMemo(() => {
    const value = form.getValues("code")
    const result = value ? value.toLowerCase().replaceAll(" ", "-") : ""
    form.setValue("code", result)
    return result
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("code")])

  const isActionSelected = useCallback(
    (id: string, action: string) => {
      const permissions = form.getValues("permissions")
      if (!permissions || permissions.length === 0) return false

      const index = permissions.findIndex((p) => p.id === id)
      if (index === -1) return false

      const currentActions = permissions?.[index]?.actions || []
      return currentActions.includes(action)
    },
    [JSON.stringify(form.watch("permissions"))]
  )

  const isSelectedAll = useMemo(() => {
    const permissions = form.getValues("permissions")

    if (!permissions || permissions.length === 0) return false

    return permissions.every((p) => {
      const actions = p.actions
      if (!actions || actions.length === 0) return false
      return ACTIONS.every((a) => actions.includes(a.code))
    })
  }, [JSON.stringify(form.watch("permissions"))])

  const isEmpty = useMemo(() => {
    const permissions = form.getValues("permissions")
    if (!permissions || permissions.length === 0) return true
    return permissions.every((p) => {
      const actions = p.actions
      if (!actions || actions.length === 0) return true
      return actions.length === 0
    })
  }, [JSON.stringify(form.watch("permissions"))])

  const toggleAction = useCallback(
    (id: string, action: string) => {
      const permissions = form.getValues("permissions")

      if (!permissions || permissions.length === 0) {
        form.setValue("permissions", [{ id, actions: [action] }])
        return
      }

      const index = permissions.findIndex((p) => p.id === id)

      if (index === -1) {
        permissions.push({ id, actions: [action] })
      } else {
        const currentActions = permissions?.[index]?.actions || []
        const actionIndex = currentActions.indexOf(action)

        if (actionIndex !== -1) currentActions.splice(actionIndex, 1)
        else currentActions.push(action)

        permissions[index].actions = currentActions
      }

      form.setValue("permissions", [...permissions])
    },

    [JSON.stringify(form.watch("permissions"))]
  )

  const toggleSelectAll = useCallback(() => {
    const permissions = form.getValues("permissions")

    if (!permissions || permissions.length === 0) return

    //* de select all
    if (isSelectedAll) {
      const newPermissions = permissions.map((p) => ({ ...p, actions: [] }))
      form.setValue("permissions", newPermissions)
      return
    }

    //* select all
    const newPermissions = permissions.map((p) => ({ ...p, actions: ACTIONS.map((a) => a.code) }))
    form.setValue("permissions", newPermissions)
  }, [JSON.stringify(form.watch("permissions")), isSelectedAll])

  //* Set initial values for role permissions when "add"
  useEffect(() => {
    if (!role) {
      const permissionInitialValues = permissions.map((p) => ({ id: p.id, actions: [] }))
      form.setValue("permissions", permissionInitialValues)
    }
  }, [role, permissions])

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <Form {...form}>
        <form className='grid grid-cols-12 gap-x-6 gap-y-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 space-y-4 lg:col-span-6'>
            <InputField
              control={form.control}
              name='name'
              label='Role Name'
              extendedProps={{ inputProps: { placeholder: "Enter role name" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 space-y-4 lg:col-span-6'>
            <InputField
              control={form.control}
              name='code'
              label='Role Code'
              description='Role code must be unique'
              isRequired
              extendedProps={{ inputProps: { value: code } }}
            />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='description'
              label='Role Description'
              extendedProps={{ textAreaProps: { placeholder: "Enter role description" } }}
            />
          </div>

          <div className='col-span-12 mb-5 mt-2 space-y-4'>
            <Separator />

            <div>
              <h1 className='text-base font-bold'>Permissions</h1>
              <p className='text-xs text-muted-foreground'>Set role permissions</p>
            </div>
          </div>

          <div className='col-span-12 flex flex-col justify-center gap-4'>
            <div className='flex w-full items-center justify-between border-b pb-4'>
              <h2 className='flex items-center gap-1 text-base font-medium'>
                <Icons.shieldCheck className='size-5 shrink-0' /> Administrator Access
              </h2>

              <div className='flex items-center gap-2 text-sm'>
                <Checkbox checked={isSelectedAll ? true : isEmpty ? false : "indeterminate"} onCheckedChange={toggleSelectAll} />
                <Label>Select All</Label>
              </div>
            </div>

            <div className='grid grid-cols-12 divide-y'>
              {permissions.map((p, i) => (
                <div key={p.id} className='text-s col-span-12 grid grid-cols-12 px-3 py-3 hover:bg-muted/75'>
                  <div className='col-span-4 flex flex-col justify-center'>
                    <p className='text-sm font-semibold'>{p.name}</p>
                    <p className='-mt-0.5 text-xs text-muted-foreground'>{p.description}</p>
                  </div>
                  <div className='col-span-8 flex items-center justify-end gap-4'>
                    {ACTIONS.map((action, i) => (
                      <div key={`${action.code}-${i}`} className='flex items-center gap-2 text-sm'>
                        <Checkbox checked={isActionSelected(p.id, action.code)} onCheckedChange={() => toggleAction(p.id, action.code)} />
                        <Label>{action.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
              <Button type='button' variant='secondary' onClick={() => router.push(`/dashboard/settings/roles`)}>
                Cancel
              </Button>
              <LoadingButton isLoading={isExecuting} type='submit'>
                Save
              </LoadingButton>
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}
