import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import AccountList from "./_components/account-list"
import { getAccounts } from "@/actions/account"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"

export default async function AccountsPage() {
  const accounts = await getAccounts()

  return (
    <ContentLayout title='Accounts'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Accounts", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Accounts'
          description='Manage and track your accounts effectively'
          defaultAction={{
            label: "Add Account",
            href: "/dashboard/crm/accounts/add",
            icon: Icons.plus,
          }}
        >
          <AccountList accounts={accounts} />
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
