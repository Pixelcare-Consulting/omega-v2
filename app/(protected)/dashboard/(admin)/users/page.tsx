'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUsers, getUserById } from '@/actions/user'
import { PlusCircle, RefreshCw, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserTable } from '@/app/(protected)/dashboard/(admin)/users/_components/user-table'
import UserForm from '@/app/(protected)/dashboard/(admin)/users/_components/user-form'
import DeleteUserForm from '@/app/(protected)/dashboard/(admin)/users/_components/delete-user-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'

type ModalType = 'add' | 'edit' | 'delete' | null

export default function UsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isModalLoading, setIsModalLoading] = useState(false)

  const page = searchParams?.get('page') ? parseInt(searchParams.get('page')!) : 1
  const size = searchParams?.get('size') ? parseInt(searchParams.get('size')!) : 10
  const search = searchParams?.get('search') || ''

  // Load users on initial render and when search params change
  React.useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      try {
        const result = await getUsers(page, size, search)
        setUsers(result.users)
        setPagination(result.pagination)
      } catch (error) {
        console.error('Failed to load users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [page, size, search])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchValue = formData.get('search') as string
    
    const params = new URLSearchParams()
    if (searchValue) params.set('search', searchValue)
    if (size !== 10) params.set('size', size.toString())
    
    router.push(`/dashboard/admin/users${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleRefresh = () => {
    router.refresh()
  }

  const handleModalClose = () => {
    setModalType(null)
    setSelectedUserId(null)
    setSelectedUser(null)
  }

  const handleActionSuccess = () => {
    handleModalClose()
    router.refresh()
    // Reload users data
    getUsers(page, size, search).then(result => {
      setUsers(result.users)
      setPagination(result.pagination)
    })
  }

  const openEditModal = async (userId: string) => {
    setSelectedUserId(userId)
    setModalType('edit')
    setIsModalLoading(true)
    
    try {
      const user = await getUserById(userId)
      setSelectedUser(user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setIsModalLoading(false)
    }
  }

  const openDeleteModal = async (userId: string) => {
    setSelectedUserId(userId)
    setModalType('delete')
    setIsModalLoading(true)
    
    try {
      const user = await getUserById(userId)
      setSelectedUser(user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setIsModalLoading(false)
    }
  }

  const isModalOpen = modalType !== null

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setModalType('add')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <form onSubmit={handleSearch}>
            <Input
              type="search"
              name="search"
              placeholder="Search users..."
              className="pl-8"
              defaultValue={search}
            />
          </form>
        </div>
        <Button variant="outline" size="icon" title="Refresh" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
        </div>
      ) : (
        <UserTable 
          users={users} 
          pagination={pagination} 
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      )}

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto [&>button]:hidden">
          {isModalLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>
                    {modalType === 'add' && 'Add New User'}
                    {modalType === 'edit' && 'Edit User'}
                    {modalType === 'delete' && 'Delete User'}
                  </span>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </DialogTitle>
                <DialogDescription>
                  {modalType === 'add' && 'Fill in the details below to add a new user to the system.'}
                  {modalType === 'edit' && 'Update the user details.'}
                  {modalType === 'delete' && 'Are you sure you want to delete this user?'}
                </DialogDescription>
              </DialogHeader>

              {modalType === 'add' && (
                <UserForm 
                  onSuccess={handleActionSuccess} 
                  isModal={true} 
                />
              )}
              
              {modalType === 'edit' && selectedUser && (
                <UserForm 
                  user={selectedUser} 
                  onSuccess={handleActionSuccess} 
                  isModal={true}
                />
              )}
              
              {modalType === 'delete' && selectedUser && (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3 mb-4">
                    <div>
                      <h3 className="font-medium text-amber-800">Warning</h3>
                      <p className="text-amber-700 text-sm">
                        Are you sure you want to delete this user? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="mt-1">{selectedUser.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <p className="mt-1 capitalize">{selectedUser.role.toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="mt-1">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  
                  <DeleteUserForm 
                    userId={selectedUser.id} 
                    onSuccess={handleActionSuccess}
                    isModal={true}
                  />
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 