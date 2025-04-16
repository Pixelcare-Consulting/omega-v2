'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'

type ModalType = 'add' | 'edit' | 'delete' | null

// Storage keys for caching
const USERS_CACHE_KEY = 'users_data_cache'
const USERS_CACHE_TIMESTAMP_KEY = 'users_data_timestamp'
const USERS_CACHE_PARAMS_KEY = 'users_params_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

// Helper to safely use sessionStorage (handles SSR)
const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const value = sessionStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Error reading from sessionStorage:', error)
      return null
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to sessionStorage:', error)
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from sessionStorage:', error)
    }
  }
}

// Empty user table skeleton for fast initial render
const UserTableSkeleton = React.memo(() => {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <div className="bg-primary-50 h-12 flex items-center px-4 border-b">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1">
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white flex items-center px-4 py-3 border-b last:border-b-0">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex-1">
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-20" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  )
});
UserTableSkeleton.displayName = 'UserTableSkeleton';

function UserContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isModalLoading, setIsModalLoading] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)
  const initialLoadCompleted = useRef(false)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentSearchParamsRef = useRef({ page: 1, size: 10, search: '' })
  const cacheInitializedRef = useRef(false)

  // Extract search params once to avoid recreation during renders
  const pageParam = searchParams?.get('page')
  const sizeParam = searchParams?.get('size')
  const searchParam = searchParams?.get('search')

  // Memoize these values to prevent recalculation on each render
  const page = useMemo(() => 
    pageParam ? parseInt(pageParam) : 1
  , [pageParam])
  
  const size = useMemo(() => 
    sizeParam ? parseInt(sizeParam) : 10
  , [sizeParam])
  
  const search = useMemo(() => 
    searchParam || ''
  , [searchParam])

  // Update the ref when params change
  useEffect(() => {
    currentSearchParamsRef.current = { page, size, search }
  }, [page, size, search])

  // Check cache for valid data on initial render
  useEffect(() => {
    if (cacheInitializedRef.current || typeof window === 'undefined') return;
    
    cacheInitializedRef.current = true;
    
    const cachedTimestamp = storage.get(USERS_CACHE_TIMESTAMP_KEY);
    const now = Date.now();
    
    // Only use cache if it's fresh (within TTL)
    if (cachedTimestamp && (now - cachedTimestamp) < CACHE_TTL) {
      const cachedParams = storage.get(USERS_CACHE_PARAMS_KEY);
      const cachedData = storage.get(USERS_CACHE_KEY);
      
      // Only use cache if parameters match current request
      if (cachedParams && 
          cachedParams.page === page && 
          cachedParams.size === size && 
          cachedParams.search === search &&
          cachedData) {
        
        setUsers(cachedData.users || []);
        setPagination(cachedData.pagination || {});
        setIsLoading(false);
        initialLoadCompleted.current = true;
        return;
      }
    }
    
    // If we get here, cache wasn't used, ensure we'll load data
    initialLoadCompleted.current = false;
  }, [page, size, search]);

  // Load users function that can be called when needed
  const loadUsers = useCallback(async () => {
    // Reference current values from ref to avoid dependency changes
    const { page, size, search } = currentSearchParamsRef.current
    
    // Skip if we're already loading
    if (isLoading && users.length > 0) return;
    
    // Clear any pending load timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    
    setIsLoading(true)
    try {
      const result = await getUsers(page, size, search)
      
      // Save to state
      setUsers(result.users)
      setPagination(result.pagination)
      initialLoadCompleted.current = true
      
      // Cache the results and parameters
      storage.set(USERS_CACHE_KEY, result)
      storage.set(USERS_CACHE_PARAMS_KEY, { page, size, search })
      storage.set(USERS_CACHE_TIMESTAMP_KEY, Date.now())
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, users.length]) 

  // Effect for initializing data loading
  useEffect(() => {
    // Skip if we've already loaded from cache
    if (cacheInitializedRef.current && initialLoadCompleted.current && users.length > 0) {
      // This effect should only run when relevant URL params change
      const shouldRefresh = 
        page !== currentSearchParamsRef.current.page || 
        size !== currentSearchParamsRef.current.size || 
        search !== currentSearchParamsRef.current.search;
      
      if (shouldRefresh) {
        // Update the ref first
        currentSearchParamsRef.current = { page, size, search }
        // Then trigger a refresh
        setDataVersion(prev => prev + 1)
      }
    } else if (!initialLoadCompleted.current) {
      // For initial load, set a very short timeout to prioritize UI rendering first
      loadTimeoutRef.current = setTimeout(() => {
        loadUsers()
      }, 10);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    }
  }, [page, size, search, loadUsers, users.length]);

  // This effect handles data version changes - separate from URL param changes
  useEffect(() => {
    if (dataVersion > 0) {
      loadUsers()
    }
  }, [dataVersion, loadUsers])

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchValue = formData.get('search') as string
    
    // Don't navigate if the search value is the same
    if (searchValue === search && page === 1) {
      return;
    }
    
    const params = new URLSearchParams()
    if (searchValue) params.set('search', searchValue)
    if (size !== 10) params.set('size', size.toString())
    params.set('page', '1') // Reset to first page on new search
    
    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      const url = `/dashboard/admin/users${params.toString() ? `?${params.toString()}` : ''}`
      router.push(url)
    }, 0)
  }, [router, search, page, size])

  const handleRefresh = useCallback(() => {
    // Clear cache on manual refresh
    storage.remove(USERS_CACHE_KEY);
    storage.remove(USERS_CACHE_TIMESTAMP_KEY);
    storage.remove(USERS_CACHE_PARAMS_KEY);
    
    setDataVersion(prev => prev + 1)
  }, [])

  const handleModalClose = useCallback(() => {
    setModalType(null)
    setSelectedUserId(null)
    setSelectedUser(null)
  }, [])

  const handleActionSuccess = useCallback(() => {
    // Clear cache when data changes
    storage.remove(USERS_CACHE_KEY);
    storage.remove(USERS_CACHE_TIMESTAMP_KEY);
    storage.remove(USERS_CACHE_PARAMS_KEY);
    
    handleModalClose()
    // Increment version to trigger a refresh
    setDataVersion(prev => prev + 1)
  }, [handleModalClose])

  const openEditModal = useCallback(async (userId: string) => {
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
  }, [])

  const openDeleteModal = useCallback(async (userId: string) => {
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
  }, [])

  const isModalOpen = modalType !== null
  
  // Memoize the user table to prevent unnecessary re-renders
  const memoizedUserTable = useMemo(() => (
    <UserTable 
      users={users} 
      pagination={pagination} 
      onEdit={openEditModal}
      onDelete={openDeleteModal}
    />
  ), [users, pagination, openEditModal, openDeleteModal])

  return (
    <div className='relative flex h-full w-full flex-col'>
      <div className="space-y-6">
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

        {isLoading && users.length === 0 ? (
          <UserTableSkeleton />
        ) : (
          memoizedUserTable
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
    </div>
  )
}

// Add displayName to the exported component at the end of the file
const MemoizedUserContent = React.memo(UserContent);
MemoizedUserContent.displayName = 'UserContent';
export default MemoizedUserContent;
