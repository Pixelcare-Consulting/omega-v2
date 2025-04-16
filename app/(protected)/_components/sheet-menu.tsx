import Link from 'next/link'
import { MenuIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Sheet, SheetHeader, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu } from './menu'
import { Icons } from '@/components/icons'
import { ExtendedUser } from '@/auth'

type SheetMenuProps = {
  user?: ExtendedUser
}

export function SheetMenu({ user }: SheetMenuProps) {
  if (!user) return null

  return (
    <Sheet>
      <SheetTrigger className='lg:hidden' asChild>
        <Button className='h-8' variant='outline' size='icon'>
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className='flex h-full flex-col px-3 sm:w-72' side='left'>
        <SheetHeader>
          <Button className='flex items-center justify-center pb-2 pt-1' variant='link' asChild>
            <Link href='/dashboard' className='flex items-center gap-2'>
              <Icons.watch className='mr-1 h-6 w-6' />
              <SheetTitle className='text-lg font-bold'>Omega</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <Menu user={user} isOpen />
      </SheetContent>
    </Sheet>
  )
}
