import { ThemeToggle } from '@/components/theme-toggle'
import { SheetMenu } from './sheet-menu'
import { UserNav } from './user-nav'
import { ExtendedUser } from '@/auth'

interface NavbarProps {
  title: string
  user?: ExtendedUser
}

export function Navbar({ title, user }: NavbarProps) {
  return (
    <header className='sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary'>
      <div className='mx-4 flex h-14 items-center sm:mx-8'>
        <div className='flex items-center space-x-4 lg:space-x-0'>
          <SheetMenu />
          <h1 className='font-bold'>{title}</h1>
        </div>
        <div className='flex flex-1 items-center justify-end'>
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </div>
    </header>
  )
}
