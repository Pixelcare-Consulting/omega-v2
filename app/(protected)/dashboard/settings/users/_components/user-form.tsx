"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "nextjs-toploader/app"

import { getUserById, upsertUser } from "@/actions/user"
import { useParams } from "next/navigation"
import { getRoles } from "@/actions/role"
import { useForm, useWatch } from "react-hook-form"
import { type UserForm, userFormSchema } from "@/schema/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { ComboboxField } from "@/components/form/combobox-field"
import SwitchField from "@/components/form/switch-field"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { FormDebug } from "@/components/form/form-debug"

type UserFormProps = {
  user?: Awaited<ReturnType<typeof getUserById>>
  roles: Awaited<ReturnType<typeof getRoles>>
}

export default function UserForm({ user, roles }: UserFormProps) {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const isCreate = id === "add" || !user

  const rolesOptions = useMemo(() => {
    if (!roles) return []
    return roles.map((role) => ({ label: role.name, value: role.id }))
  }, [JSON.stringify(roles)])

  const values = useMemo(() => {
    if (user)
      return {
        ...user,
        name: user.name || "",
        roleId: user.role.id,
        password: "",
        confirmPassword: "",
        newPassword: "",
        newConfirmPassword: "",
      }

    if (id === "add" || !user)
      return {
        id: "add",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        roleId: "",
        isActive: true,
        oldPassword: null,
        newConfirmPassword: null,
        newPassword: null,
      }

    return undefined
  }, [id, JSON.stringify(user)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(userFormSchema),
  })

  const oldPassword = useWatch({ control: form.control, name: "oldPassword" })

  const { executeAsync, isExecuting } = useAction(upsertUser)

  const onSubmit = async (formData: UserForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        if (result.status === 409) {
          form.setError("oldPassword", { type: "custom", message: result.message })
        }

        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.user && "id" in result?.data?.user) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/settings/users/${result.data.user.id}`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  useEffect(() => {
    if (!oldPassword) {
      form.setValue("newPassword", "")
      form.setValue("newConfirmPassword", "")
      form.clearErrors(["newPassword", "newConfirmPassword"])
    }
  }, [oldPassword])

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <InputField
              control={form.control}
              name='name'
              label='Name'
              extendedProps={{ inputProps: { placeholder: "Enter name" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <InputField
              control={form.control}
              name='email'
              label='Email'
              extendedProps={{ inputProps: { placeholder: "Enter email" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField data={rolesOptions} control={form.control} name='roleId' label='Role' isRequired />
          </div>

          {isCreate ? (
            <>
              <div className='col-span-12 md:col-span-6 lg:col-span-4'>
                <InputField
                  control={form.control}
                  name='password'
                  label='Password'
                  extendedProps={{ inputProps: { placeholder: "Enter password", type: "password" } }}
                  isRequired
                />
              </div>

              <div className='col-span-12 md:col-span-6 lg:col-span-4'>
                <InputField
                  control={form.control}
                  name='confirmPassword'
                  label='Confirm Password'
                  extendedProps={{ inputProps: { placeholder: "Enter confirm password", type: "password" } }}
                  isRequired
                />
              </div>
            </>
          ) : (
            <>
              <div className='col-span-12 md:col-span-6 lg:col-span-4'>
                <InputField
                  control={form.control}
                  name='oldPassword'
                  label='Old Password'
                  extendedProps={{ inputProps: { placeholder: "Enter old password", type: "password" } }}
                  description='Leave blank to keep current password or enter old password to change password'
                />
              </div>

              <div className='col-span-12 md:col-span-6 lg:col-span-4'>
                <InputField
                  control={form.control}
                  name='newPassword'
                  label='New Password'
                  extendedProps={{ inputProps: { placeholder: "Enter new password", type: "password" } }}
                />
              </div>

              <div className='col-span-12 md:col-span-6 lg:col-span-4'>
                <InputField
                  control={form.control}
                  name='newConfirmPassword'
                  label='New Confirm Password'
                  extendedProps={{ inputProps: { placeholder: "Enter new confirm password", type: "password" } }}
                />
              </div>
            </>
          )}

          <div className={cn("col-span-12 md:col-span-4 md:mt-5 lg:col-span-4")}>
            <SwitchField
              control={form.control}
              layout='default'
              name='isActive'
              label='Active'
              description='Is this user active?'
              extendedProps={{ switchProps: { disabled: isCreate } }}
            />
          </div>

          <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
            <Button type='button' variant='secondary' disabled={isExecuting} onClick={() => router.push(`/dashboard/settings/users`)}>
              Cancel
            </Button>
            <LoadingButton isLoading={isExecuting} type='submit'>
              Save
            </LoadingButton>
          </div>
        </form>
      </Form>
    </>
  )
}
