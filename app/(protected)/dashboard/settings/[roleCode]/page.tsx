import { getCurrentUser } from "@/actions/auth"
import { getRoleByCode } from "@/actions/role"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import React from "react"
import SettingsForm from "../_components/settings-form"
import { getSapSettings, getSettingByRoleCode } from "@/actions/settings"

export default async function SettingsByRole({ params }: { params: { roleCode: string } }) {
  const user = await getCurrentUser()

  const [role, settings, sapSettings] = await Promise.all([
    !user?.role ? null : await getRoleByCode(user.role),
    !user?.role ? null : await getSettingByRoleCode(user.role),
    !user ? null : await getSapSettings(),
  ])

  if (!user || !role) notFound()

  return (
    <ContentLayout title='Settings'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/dashboard/settings", isPage: true },
        ]}
      />

      <ContentContainer>
        <SettingsForm role={role} settings={settings} sapSettings={sapSettings} />
      </ContentContainer>
    </ContentLayout>
  )
}
