import { Card, CardContent } from '@/components/ui/card'
import { Chart1 } from './dashboard-chart-1'
import { Chart2 } from './dashboard-chart-2'
import { Chart3 } from './dashboard-chart-3'

const DashboardContent = () => {
  return (
    <Card className='mt-6 rounded-lg border-none'>
      <CardContent className='p-6'>
        <div className='flex min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] min-w-full items-center justify-center'>
          <div className='relative flex h-full w-full flex-col'>
            <div className='grid gap-5 md:grid-cols-12'>
              <div className='col-span-12 md:col-span-6'>
                <Chart1 />
              </div>

              <div className='col-span-12 md:col-span-6'>
                <Chart2 />
              </div>

              <div className='col-span-12'>
                <Chart3 />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardContent
