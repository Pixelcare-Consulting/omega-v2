import Link from "next/link"

import { Icons } from "@/components/icons"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"

export default function AdminUsersPermissionsSettingsTab() {
  return (
    <Card className='grid grid-cols-12 gap-5 rounded-lg p-6 shadow-md'>
      <ReadOnlyFieldHeader className='col-span-12' title='Users & Permissions' description='Manage user access and permissions' />

      <div className='col-span-12 divide-y overflow-hidden rounded-md border'>
        <div>
          <Link href='/dashboard/settings/users'>
            <Card className='cursor-pointer p-4 transition-colors hover:bg-muted/50'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='rounded-full bg-primary/10 p-2'>
                    <Icons.users className='size-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-medium'>User Management</h3>
                    <p className='text-sm text-muted-foreground'>Manage system users</p>
                  </div>
                </div>
                <Icons.chevRight className='size-5 text-muted-foreground' />
              </div>
            </Card>
          </Link>
        </div>

        <div>
          <Link href='/dashboard/settings/roles'>
            <Card className='cursor-pointer p-4 transition-colors hover:bg-muted/50'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='rounded-full bg-primary/10 p-2'>
                    <Icons.shield className='size-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-medium'>Roles & Permissions</h3>
                    <p className='text-sm text-muted-foreground'>Configure user roles and access rights</p>
                  </div>
                </div>
                <Icons.chevRight className='size-5 text-muted-foreground' />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </Card>
  )
}
