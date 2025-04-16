import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ExtendedUser } from '@/auth'
import { Chart1 } from './dashboard-chart-1'
import { Chart2 } from './dashboard-chart-2'
import { Chart3 } from './dashboard-chart-3'
import { Chart4 } from './dashboard-chart-4'
import { Chart5 } from './dashboard-chart-5'
import { Chart6 } from './dashboard-chart-6'
import { Chart7 } from './dashboard-chart-7'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table1 } from './dashboard-table-1'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Chart9 } from './dashboard-chart-9'
import { Chart10 } from './dashboard-chart-10'
import { Chart11 } from './dashboard-chart-11'
import { Chart12 } from './dashboard-chart-12'

const DashboardContent = ({ user }: { user?: ExtendedUser }) => {
  if (!user) return null

  const renderContent = (role: string | null | undefined) => {
    if (!role) return null

    const SUPPLY_CHAIN_CARD_VALUES = [
      { title: 'In Transit Report - Guage', value: '$332.5K', footerText: 'Target $400.0K' },
      { title: 'MTD Sales Number', value: '$198.6K', footerText: 'Target $1.0M' },
      { title: 'Booked Orders (Current Month)', value: '$3.7M', footerText: '' }
    ]

    const FINANCE_ACCOUNTING_CARD_VALUES = [
      { title: 'Approved - Waiting for Payment', value: '100', footerText: 'Target 0' },
      { title: 'Open - Unapproved Reports', value: '20', footerText: 'Target 0' }
    ]

    switch (role) {
      case 'admin':
        return (
          <div className='grid gap-5 md:grid-cols-12'>
            <div className='col-span-12 md:col-span-6'>
              <Chart1 />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <Chart2 />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <Chart3 />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <Chart4 />
            </div>
          </div>
        )

      case 'sales':
        return (
          <div className='grid gap-5 md:grid-cols-12'>
            <div className='col-span-12 md:col-span-6'>
              <Chart5 />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <Chart6 />
            </div>

            <div className='col-span-12'>
              <Chart7 />
            </div>
          </div>
        )

      case 'supply-chain':
        return (
          <Tabs defaultValue='sales-pipeline-dashboard' className=''>
            <TabsList className='h-fit flex-wrap gap-y-2'>
              <TabsTrigger value='sales-pipeline-dashboard'>Sales Pipeline Dashboard</TabsTrigger>
              <TabsTrigger value='open-opportunities'>Open Opportunities</TabsTrigger>
              <TabsTrigger value='shortcuts'>Shortcuts</TabsTrigger>
              <TabsTrigger value='us-sales-competition-dashboard'>US Sales Competition Dashboard</TabsTrigger>
              <TabsTrigger value='ph-sales-competition-dashboard'>PH Sales Competition Dashboard</TabsTrigger>
              <TabsTrigger value='kp-is'>KPIs</TabsTrigger>
              <TabsTrigger value='business-development'>Business Development</TabsTrigger>
              <TabsTrigger value='monday-metrics'>Monday Metrics</TabsTrigger>
              <TabsTrigger value='purchasing-team'>Purchasing Team</TabsTrigger>
            </TabsList>

            <TabsContent value='sales-pipeline-dashboard' className='py-5'>
              <div className='flex flex-col gap-y-7'>
                <div className='grid gap-5 md:grid-cols-12'>
                  {SUPPLY_CHAIN_CARD_VALUES.map((item, i) => (
                    <Card key={i} className='col-span-12 md:col-span-4'>
                      <CardHeader className='relative'>
                        <CardDescription>{item.title}</CardDescription>
                        <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>{item.value}</CardTitle>
                      </CardHeader>
                      <CardFooter className='flex-col items-start gap-1 text-sm'>
                        <div className='text-muted-foreground'>{item.footerText}</div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                <div className='flex gap-3'>
                  <Button className='w-full'>Open SO w/Stock Details</Button>
                  <Button className='w-full'>Full OOR</Button>
                  <Button className='w-full'>Update Sales Order</Button>
                  <Button className='w-full'>Update Comm Report</Button>
                </div>

                <div>
                  <h1 className='mb-4 inline-block w-full rounded border py-4 text-center text-lg font-bold'>Forcast</h1>
                  <Table1 />
                </div>
              </div>
            </TabsContent>
            <TabsContent value='open-opportunities'></TabsContent>
            <TabsContent value='shortcuts'></TabsContent>
            <TabsContent value='us-sales-competition-dashboard'></TabsContent>
            <TabsContent value='ph-sales-competition-dashboard'></TabsContent>
            <TabsContent value='kp-is'></TabsContent>
            <TabsContent value='business-development'></TabsContent>
            <TabsContent value='monday-metrics'></TabsContent>
            <TabsContent value='purchasing-team'></TabsContent>
          </Tabs>
        )

      case 'finance':
        return (
          <div className='flex flex-col gap-y-7'>
            <div className='grid gap-5 md:grid-cols-12'>
              <div className='col-span-12 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-primary text-white dark:text-slate-800 md:col-span-4'>
                <Icons.plus className='mr-2 size-7' />
                New Expense Report
              </div>

              {FINANCE_ACCOUNTING_CARD_VALUES.map((item, i) => (
                <Card key={i} className='col-span-12 md:col-span-4'>
                  <CardHeader className='relative'>
                    <CardDescription>{item.title}</CardDescription>
                    <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>{item.value}</CardTitle>
                  </CardHeader>
                  <CardFooter className='flex-col items-start gap-1 text-sm'>
                    <div className='text-muted-foreground'>{item.footerText}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className='grid gap-5 md:grid-cols-12'>
              <div className='col-span-12'>
                <Chart9 />
              </div>
            </div>
          </div>
        )

      case 'accounting':
        return (
          <div className='flex flex-col gap-y-7'>
            <div className='grid gap-5 md:grid-cols-12'>
              <div className='col-span-12 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-primary text-white dark:text-slate-800 md:col-span-4'>
                <Icons.plus className='mr-2 size-7' />
                New Expense Report
              </div>

              {FINANCE_ACCOUNTING_CARD_VALUES.map((item, i) => (
                <Card key={i} className='col-span-12 md:col-span-4'>
                  <CardHeader className='relative'>
                    <CardDescription>{item.title}</CardDescription>
                    <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>{item.value}</CardTitle>
                  </CardHeader>
                  <CardFooter className='flex-col items-start gap-1 text-sm'>
                    <div className='text-muted-foreground'>{item.footerText}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className='grid gap-5 md:grid-cols-12'>
              <div className='col-span-12'>
                <Chart9 />
              </div>
            </div>
          </div>
        )

      case 'logistics':
        return (
          <div className='grid gap-5 md:grid-cols-12'>
            <div className='col-span-12 md:col-span-6'>
              <Chart10 />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <Chart11 />
            </div>

            <div className='col-span-12'>
              <Chart12 />
            </div>
          </div>
        )

      //TODO: Supply chain, finance, logistics dashboard charts render

      default:
        return null
    }
  }

  return (
    <Card className='mt-6 rounded-lg border-none'>
      <CardContent className='p-6'>
        <div className='flex min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] min-w-full justify-center'>
          <div className='relative flex h-full w-full flex-col'>{renderContent(user.role)}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardContent
