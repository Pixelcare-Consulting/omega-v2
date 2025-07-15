"use client"

import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminSystemSettingsTab from "./tabs/admin-system-settings-tab"
import AdminUsersPermissionsSettingsTab from "./tabs/admin-users-permissions-settings-tab"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { getSapSettings, getSettingByRoleCode } from "@/actions/settings"
import Alert from "@/components/alert"
import { getRoleByCode } from "@/actions/role"
import UnderDevelopment from "@/components/under-development"

type AdminSettingsFormProps = {
  role: NonNullable<Awaited<ReturnType<typeof getRoleByCode>>>
  settings: Awaited<ReturnType<typeof getSettingByRoleCode>>
  sapSettings: Awaited<ReturnType<typeof getSapSettings>>
}

export default function AdminSettingsForm({ role, settings, sapSettings }: AdminSettingsFormProps) {
  return (
    <PageWrapper title='Admin Settings' description='Manage global system settings and configurations'>
      {!settings && <Alert className='mb-3' variant='error' message='Failed to load settings' />}

      <Tabs defaultValue='1' className='w-full'>
        <TabsList className='mb-2 h-fit flex-wrap'>
          <TabsTrigger value='1'>System</TabsTrigger>
          <TabsTrigger value='2'>Dashboard Management</TabsTrigger>
          <TabsTrigger value='3'>Users & Permissions</TabsTrigger>
          <TabsTrigger value='4'>Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value='1'>
          <AdminSystemSettingsTab role={role} settings={settings} sapSettings={sapSettings} />
        </TabsContent>

        <TabsContent value='2'>
          <Card className='grid grid-cols-12 gap-5 rounded-lg p-6 shadow-md'>
            <UnderDevelopment className='col-span-12 h-[56vh]' />
          </Card>
        </TabsContent>

        <TabsContent value='3'>
          <AdminUsersPermissionsSettingsTab />
        </TabsContent>

        <TabsContent value='4'>
          <Card className='grid grid-cols-12 gap-5 rounded-lg p-6 shadow-md'>
            <UnderDevelopment className='col-span-12 h-[56vh]' />
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  )
}
