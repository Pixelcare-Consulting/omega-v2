import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AlertTriangle, ChevronLeft } from "lucide-react"

import { getUserById } from "@/actions/user"
import { Button } from "@/components/ui/button"
import DeleteUserForm from "@/app/(protected)/dashboard/admin/users/_components/delete-user-form"

// Using a direct type without naming it
export default async function Page({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center gap-4'>
        <Link href='/dashboard/admin/users'>
          <Button variant='outline' size='icon'>
            <ChevronLeft className='h-4 w-4' />
          </Button>
        </Link>
        <h1 className='text-2xl font-bold'>Delete User</h1>
      </div>

      <div className='flex items-start space-x-3 rounded-md border border-amber-200 bg-amber-50 p-4'>
        <AlertTriangle className='mt-0.5 h-5 w-5 text-amber-600' />
        <div>
          <h3 className='font-medium text-amber-800'>Warning</h3>
          <p className='text-sm text-amber-700'>Are you sure you want to delete this user? This action cannot be undone.</p>
        </div>
      </div>

      <div className='rounded-md bg-white p-6 shadow'>
        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <p className='text-sm font-medium text-gray-500'>Name</p>
            <p className='mt-1'>{user.name || "N/A"}</p>
          </div>
          <div>
            <p className='text-sm font-medium text-gray-500'>Email</p>
            <p className='mt-1'>{user.email}</p>
          </div>
          <div>
            <p className='text-sm font-medium text-gray-500'>Role</p>
            <p className='mt-1 capitalize'>{user.role.code.toLowerCase()}</p>
          </div>
          <div>
            <p className='text-sm font-medium text-gray-500'>Status</p>
            <p className='mt-1'>{user.isActive ? "Active" : "Inactive"}</p>
          </div>
        </div>

        <DeleteUserForm userId={user.id} />
      </div>
    </div>
  )
}
