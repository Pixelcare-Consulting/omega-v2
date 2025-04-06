import Link from 'next/link'

export function Footer() {
  return (
    <div className='z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='mx-4 flex h-14 items-center md:mx-8'>
        <p className='text-left text-xs leading-loose text-muted-foreground md:text-sm'>
          Omega Portal &copy; Omega Global Technologies, Inc. All Rights Reserved | Powered by{' '}
          <Link
            href='https://pixelcareconsulting.com/'
            target='_blank'
            rel='noopener noreferrer'
            className='font-medium underline underline-offset-4'
          >
            Pixelcare Consulting
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
