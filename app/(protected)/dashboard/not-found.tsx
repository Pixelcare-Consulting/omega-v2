import { Icons } from '@/components/icons'
import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import { ContentLayout } from '../_components/content-layout'
import BackButton from '@/components/back-button'

export default function Dashboard404() {
  return (
    <ContentLayout title='Page Not Found'>
      <Card className='m-auto rounded-lg border-none'>
        <CardContent className='p-6'>
          <div className='flex min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] justify-center align-middle'>
            <div className='flex max-w-[480px] flex-col items-center justify-center gap-y-4'>
              <h1 className='w-fit text-7xl font-extrabold text-primary dark:text-slate-200'>404</h1>
              <div className='flex flex-col items-center justify-center gap-y-2'>
                <h2 className='w-fit text-2xl font-semibold'>Page Not Found</h2>
                <p className='text-center text-base text-muted-foreground text-slate-400'>
                  Oops!. We couldn’t find the page that <br />
                  you’re looking for.
                </p>
              </div>

              <BackButton>
                <Icons.arrowLeft className='mr-2 size-4' /> Go Back
              </BackButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </ContentLayout>
  )
}
