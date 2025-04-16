'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
const chartData = [
  { date: '2024-04-01', travel: 222, team: 150 },
  { date: '2024-04-02', travel: 97, team: 180 },
  { date: '2024-04-03', travel: 167, team: 120 },
  { date: '2024-04-04', travel: 242, team: 260 },
  { date: '2024-04-05', travel: 373, team: 290 },
  { date: '2024-04-06', travel: 301, team: 340 },
  { date: '2024-04-07', travel: 245, team: 180 },
  { date: '2024-04-08', travel: 409, team: 320 },
  { date: '2024-04-09', travel: 59, team: 110 },
  { date: '2024-04-10', travel: 261, team: 190 },
  { date: '2024-04-11', travel: 327, team: 350 },
  { date: '2024-04-12', travel: 292, team: 210 },
  { date: '2024-04-13', travel: 342, team: 380 },
  { date: '2024-04-14', travel: 137, team: 220 },
  { date: '2024-04-15', travel: 120, team: 170 },
  { date: '2024-04-16', travel: 138, team: 190 },
  { date: '2024-04-17', travel: 446, team: 360 },
  { date: '2024-04-18', travel: 364, team: 410 },
  { date: '2024-04-19', travel: 243, team: 180 },
  { date: '2024-04-20', travel: 89, team: 150 },
  { date: '2024-04-21', travel: 137, team: 200 },
  { date: '2024-04-22', travel: 224, team: 170 },
  { date: '2024-04-23', travel: 138, team: 230 },
  { date: '2024-04-24', travel: 387, team: 290 },
  { date: '2024-04-25', travel: 215, team: 250 },
  { date: '2024-04-26', travel: 75, team: 130 },
  { date: '2024-04-27', travel: 383, team: 420 },
  { date: '2024-04-28', travel: 122, team: 180 },
  { date: '2024-04-29', travel: 315, team: 240 },
  { date: '2024-04-30', travel: 454, team: 380 },
  { date: '2024-05-01', travel: 165, team: 220 },
  { date: '2024-05-02', travel: 293, team: 310 },
  { date: '2024-05-03', travel: 247, team: 190 },
  { date: '2024-05-04', travel: 385, team: 420 },
  { date: '2024-05-05', travel: 481, team: 390 },
  { date: '2024-05-06', travel: 498, team: 520 },
  { date: '2024-05-07', travel: 388, team: 300 },
  { date: '2024-05-08', travel: 149, team: 210 },
  { date: '2024-05-09', travel: 227, team: 180 },
  { date: '2024-05-10', travel: 293, team: 330 },
  { date: '2024-05-11', travel: 335, team: 270 },
  { date: '2024-05-12', travel: 197, team: 240 },
  { date: '2024-05-13', travel: 197, team: 160 },
  { date: '2024-05-14', travel: 448, team: 490 },
  { date: '2024-05-15', travel: 473, team: 380 },
  { date: '2024-05-16', travel: 338, team: 400 },
  { date: '2024-05-17', travel: 499, team: 420 },
  { date: '2024-05-18', travel: 315, team: 350 },
  { date: '2024-05-19', travel: 235, team: 180 },
  { date: '2024-05-20', travel: 177, team: 230 },
  { date: '2024-05-21', travel: 82, team: 140 },
  { date: '2024-05-22', travel: 81, team: 120 },
  { date: '2024-05-23', travel: 252, team: 290 },
  { date: '2024-05-24', travel: 294, team: 220 },
  { date: '2024-05-25', travel: 201, team: 250 },
  { date: '2024-05-26', travel: 213, team: 170 },
  { date: '2024-05-27', travel: 420, team: 460 },
  { date: '2024-05-28', travel: 233, team: 190 },
  { date: '2024-05-29', travel: 78, team: 130 },
  { date: '2024-05-30', travel: 340, team: 280 },
  { date: '2024-05-31', travel: 178, team: 230 },
  { date: '2024-06-01', travel: 178, team: 200 },
  { date: '2024-06-02', travel: 470, team: 410 },
  { date: '2024-06-03', travel: 103, team: 160 },
  { date: '2024-06-04', travel: 439, team: 380 },
  { date: '2024-06-05', travel: 88, team: 140 },
  { date: '2024-06-06', travel: 294, team: 250 },
  { date: '2024-06-07', travel: 323, team: 370 },
  { date: '2024-06-08', travel: 385, team: 320 },
  { date: '2024-06-09', travel: 438, team: 480 },
  { date: '2024-06-10', travel: 155, team: 200 },
  { date: '2024-06-11', travel: 92, team: 150 },
  { date: '2024-06-12', travel: 492, team: 420 },
  { date: '2024-06-13', travel: 81, team: 130 },
  { date: '2024-06-14', travel: 426, team: 380 },
  { date: '2024-06-15', travel: 307, team: 350 },
  { date: '2024-06-16', travel: 371, team: 310 },
  { date: '2024-06-17', travel: 475, team: 520 },
  { date: '2024-06-18', travel: 107, team: 170 },
  { date: '2024-06-19', travel: 341, team: 290 },
  { date: '2024-06-20', travel: 408, team: 450 },
  { date: '2024-06-21', travel: 169, team: 210 },
  { date: '2024-06-22', travel: 317, team: 270 },
  { date: '2024-06-23', travel: 480, team: 530 },
  { date: '2024-06-24', travel: 132, team: 180 },
  { date: '2024-06-25', travel: 141, team: 190 },
  { date: '2024-06-26', travel: 434, team: 380 },
  { date: '2024-06-27', travel: 448, team: 490 },
  { date: '2024-06-28', travel: 149, team: 200 },
  { date: '2024-06-29', travel: 103, team: 160 },
  { date: '2024-06-30', travel: 446, team: 400 }
]

const chartConfig = {
  travel: {
    label: 'Travel',
    color: 'hsl(var(--chart-4))'
  },
  team: {
    label: 'Team',
    color: 'hsl(var(--chart-5))'
  }
} satisfies ChartConfig

export function Chart9() {
  const [timeRange, setTimeRange] = React.useState('90d')

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date('2024-06-30')
    let daysToSubtract = 90
    if (timeRange === '30d') {
      daysToSubtract = 30
    } else if (timeRange === '7d') {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className='h-full'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1 text-center sm:text-left'>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>Showing total Expenses for the last 3 months</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className='w-[160px] rounded-lg sm:ml-auto' aria-label='Select a value'>
            <SelectValue placeholder='Last 3 months' />
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            <SelectItem value='90d' className='rounded-lg'>
              Last 3 months
            </SelectItem>
            <SelectItem value='30d' className='rounded-lg'>
              Last 30 days
            </SelectItem>
            <SelectItem value='7d' className='rounded-lg'>
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id='fillDesktop' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-travel)' stopOpacity={0.8} />
                <stop offset='95%' stopColor='var(--color-travel)' stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id='fillMobile' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-team)' stopOpacity={0.8} />
                <stop offset='95%' stopColor='var(--color-team)' stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })
                  }}
                  indicator='dot'
                />
              }
            />
            <Area dataKey='travel' type='natural' fill='url(#fillMobile)' stroke='var(--color-travel)' stackId='a' />
            <Area dataKey='team' type='natural' fill='url(#fillDesktop)' stroke='var(--color-team)' stackId='a' />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
