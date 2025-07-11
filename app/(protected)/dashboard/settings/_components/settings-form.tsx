"use client"

import { getRoleByCode } from "@/actions/role"
import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import AdminSettingsForm from "./admin-settings-form"
import { getSapSettings, getSettingByRoleCode } from "@/actions/settings"

type SettingsFormProps = {
  role: NonNullable<Awaited<ReturnType<typeof getRoleByCode>>>
  settings: Awaited<ReturnType<typeof getSettingByRoleCode>>
  sapSettings: Awaited<ReturnType<typeof getSapSettings>>
}

export default function SettingsForm({ role, settings, sapSettings }: SettingsFormProps) {
  //* render specific settings form based on role, otherwise show access denied page
  if (role.code === "admin") return <AdminSettingsForm role={role} settings={settings} sapSettings={sapSettings} />

  return (
    <div className='flex h-[78vh] items-center justify-center'>
      <div className='flex flex-col items-center justify-center'>
        <Icons.shieldClose className='size-14 text-destructive' />
        <div className='mt-2.5 flex flex-col items-center justify-center gap-1'>
          <h1 className='text-center text-xl font-bold'>Access Denied</h1>
          <p className='text-center text-sm text-slate-500 dark:text-slate-400'>You are not authorized to access this page.</p>
        </div>

        <Link href='/dashboard' className={buttonVariants({ variant: "default", className: "mt-4" })}>
          Go Back
        </Link>
      </div>
    </div>
  )
}
