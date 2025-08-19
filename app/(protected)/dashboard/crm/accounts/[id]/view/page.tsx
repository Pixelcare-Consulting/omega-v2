import { notFound } from "next/navigation"

import { getAccounts, getAccountById } from "@/actions/account"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ViewAccount from "./_components/view-account"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { getLeads } from "@/actions/lead"
import { getContacts } from "@/actions/contacts"
import { getCountries } from "@/actions/master-bp"

export default async function ViewAccountPage({ params }: { params: { id: string } }) {
  const { id } = params

  const [account, accounts, contacts, leads, countries] = await Promise.all([
    id === "add" ? null : await getAccountById(id),
    getAccounts(),
    getContacts(),
    getLeads(),
    getCountries(),
  ])

  if (!account) notFound()

  return (
    <ContentLayout title='Accounts'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Accounts", href: "/dashboard/crm/accounts" },
          { label: account.name },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewAccount account={account} accounts={accounts} contacts={contacts} leads={leads} countries={countries?.value || []} />
      </ContentContainer>
    </ContentLayout>
  )
}
