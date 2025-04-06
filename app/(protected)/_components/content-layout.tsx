import { getCurrentUser } from '@/actions/auth'
import { Navbar } from './navbar'

interface ContentLayoutProps {
  title: string
  children: React.ReactNode
}

export async function ContentLayout({ title, children }: ContentLayoutProps) {
  const user = await getCurrentUser()

  return (
    <div>
      <Navbar title={title} user={user} />
      <div className='container px-4 pb-8 pt-8 sm:px-8'>{children}</div>
    </div>
  )
}
