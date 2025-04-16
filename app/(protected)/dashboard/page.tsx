import Link from 'next/link'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

import { ContentLayout } from '../_components/content-layout'
import DashboardContent from './_components/dashboard-content'
import { getCurrentUser } from '@/actions/auth'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <ContentLayout title='Dashboard'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/'>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DashboardContent user={user} />
    </ContentLayout>
  )
}
