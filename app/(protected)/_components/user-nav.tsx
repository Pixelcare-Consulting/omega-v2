'use client'

import Link from 'next/link'
import { LogOut, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ExtendedUser } from '@/auth'
import { getInitials, titleCase } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'

type UserNavProps = {
  user?: ExtendedUser
}

export function UserNav({ user }: UserNavProps) {
  if (!user || !user.name) return null

  const logout = () => {
    signOut()
    window.location.assign('/login')
  }

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='relative h-8 w-8 rounded-full'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage className='object-cover object-center' src={user?.profile?.image ?? ''} alt='Avatar' />
                  <AvatarFallback className='bg-transparent'>{getInitials(user.name ?? '').toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className='absolute -bottom-0.5 start-5 size-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-800' />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side='bottom'>Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col items-center gap-y-2'>
            <Button variant='outline' className='relative size-12 rounded-full'>
              <Avatar className='size-12'>
                <AvatarImage className='object-cover object-center' src={user?.profile?.image ?? ''} alt='Avatar' />
                <AvatarFallback className='bg-transparent'>{getInitials(user.name ?? '').toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className='absolute -bottom-0.5 start-7 size-4 rounded-full border-2 border-white bg-green-500 dark:border-gray-800' />
            </Button>

            <p className='text-sm font-medium leading-none'>{titleCase(user.name)}</p>
            <p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
            <Badge className='w-fit'>{user.role}</Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='hover:cursor-pointer' asChild>
            <Link href='/dashboard' className='flex items-center'>
              <User className='mr-3 h-4 w-4 text-muted-foreground' />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='hover:cursor-pointer' onClick={() => logout()}>
          <LogOut className='mr-3 h-4 w-4 text-muted-foreground' />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
