import { notFound } from "next/navigation"

import { getAccountById } from "@/actions/account"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import AccountForm from "../_components/account-form"
import ContentContainer from "@/app/(protected)/_components/content-container"

export default async function AccountPage({ params }: { params: { id: string } }) {
  const { id } = params
  const account = id === "add" ? null : await getAccountById(id)

  if (id !== "add" && !account) notFound()

  return (
    <ContentLayout title='Accounts'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Accounts", href: "/dashboard/crm/accounts" },
          { label: id !== "add" && account ? account.name : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <AccountForm account={account} />
      </ContentContainer>
    </ContentLayout>
  )
}
