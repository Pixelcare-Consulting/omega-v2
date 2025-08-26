import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExtendedUser } from "@/auth"
import { Chart1 } from "./dashboard-chart-1"
import { Chart2 } from "./dashboard-chart-2"
import { Chart3 } from "./dashboard-chart-3"
import { Chart4 } from "./dashboard-chart-4"
import { Chart5 } from "./dashboard-chart-5"
import { Chart6 } from "./dashboard-chart-6"
import { Chart7 } from "./dashboard-chart-7"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table1 } from "./dashboard-table-1"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Chart9 } from "./dashboard-chart-9"
import { Chart10 } from "./dashboard-chart-10"
import { Chart11 } from "./dashboard-chart-11"
import { Chart12 } from "./dashboard-chart-12"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  AlertCircle,
  BarChart4,
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  FileDown,
  FileText,
  LayoutDashboard,
  PieChart,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  User2,
} from "lucide-react"
import CanView from "@/components/acl/can-view"

const DashboardContent = ({ user }: { user?: ExtendedUser }) => {
  if (!user) return <DashboardSkeleton />

  const formatGreeting = () => {
    const currentHour = new Date().getHours()
    if (currentHour < 12) return "Good morning"
    if (currentHour < 18) return "Good afternoon"
    return "Good evening"
  }

  const renderWelcomeBanner = () => (
    <Card className='mt-2'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='mb-1 flex items-center gap-2'>
              <div className='h-8 w-1 rounded-full bg-primary'></div>
              <h2 className='text-2xl font-bold'>
                {formatGreeting()}, {user.name}
              </h2>
            </div>
            <p className='ml-3 text-muted-foreground'>
              Welcome to your {user.role || "user"} dashboard. Here, you can monitor system performance and key metrics.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-9 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
            >
              <RefreshCw className='h-4 w-4' />
              Refresh
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-9 gap-1.5 rounded-md px-3 transition-all hover:border-primary hover:text-primary'
            >
              <Calendar className='h-4 w-4' />
              Today
            </Button>
          </div>
        </div>

        <div className='mt-4 flex flex-wrap gap-2'>
          <Badge variant='outline' className='bg-background/80 px-2.5 py-1 text-xs font-medium'>
            <Clock className='mr-1 h-3 w-3' /> Last updated: {new Date().toLocaleTimeString()}
          </Badge>
          {user.role === "admin" && (
            <Badge
              variant='outline'
              className='border-amber-200 bg-amber-100 bg-background/80 px-2.5 py-1 text-xs font-medium text-amber-700'
            >
              <AlertCircle className='mr-1 h-3 w-3' /> 3 alerts need attention
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderQuickActions = () => (
    <div className='mb-6 grid grid-cols-2 gap-3 md:grid-cols-4'>
      <Button
        variant='outline'
        className='h-20 flex-col items-center justify-center rounded-lg border shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md'
      >
        <LayoutDashboard className='mb-1 h-5 w-5 text-blue-500' />
        <span>Overview</span>
      </Button>
      <Button
        variant='outline'
        className='h-20 flex-col items-center justify-center rounded-lg border shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md'
      >
        <FileText className='mb-1 h-5 w-5 text-green-500' />
        <span>Reports</span>
      </Button>
      <Button
        variant='outline'
        className='h-20 flex-col items-center justify-center rounded-lg border shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md'
      >
        <Activity className='mb-1 h-5 w-5 text-purple-500' />
        <span>Analytics</span>
      </Button>
      <Button
        variant='outline'
        className='h-20 flex-col items-center justify-center rounded-lg border shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md'
      >
        <Bell className='mb-1 h-5 w-5 text-orange-500' />
        <span>Notifications</span>
      </Button>
    </div>
  )

  const StatCard = ({
    title,
    value,
    percentage,
    icon: Icon,
    color = "blue",
  }: {
    title: string
    value: string | number
    percentage?: string
    icon: React.ElementType
    color?: "blue" | "green" | "orange" | "purple"
  }) => {
    const borderColors = {
      blue: "border-t-blue-500",
      green: "border-t-green-500",
      orange: "border-t-orange-500",
      purple: "border-t-purple-500",
    }

    const iconColors = {
      blue: "text-blue-500",
      green: "text-green-500",
      orange: "text-orange-500",
      purple: "text-purple-500",
    }

    return (
      <div
        className={`rounded-xl border border-t-4 bg-card ${borderColors[color]} group h-full p-5 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md`}
      >
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='text-sm font-medium text-foreground/80'>{title}</h3>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm ${iconColors[color]} transition-transform duration-200 group-hover:scale-110`}
          >
            <Icon className='h-5 w-5' />
          </div>
        </div>
        <div className='mt-2'>
          <div className='text-3xl font-bold'>{value}</div>
          <p className='mt-2 text-xs text-muted-foreground'>{percentage}</p>
        </div>
      </div>
    )
  }

  const renderContent = (role: string | null | undefined) => {
    // Default to a basic view if role is undefined or null
    const userRole = role?.toLowerCase() || "user"

    const ADMIN_METRICS = [
      { title: "Total Users", value: "9", percentage: "All registered users", icon: User2, color: "blue" as const },
      { title: "Active Users", value: "8", percentage: "88.9% of total users", icon: Activity, color: "green" as const },
      { title: "Sales Performance", value: "$524.8K", percentage: "+12.5% from last month", icon: TrendingUp, color: "purple" as const },
      { title: "Revenue", value: "$1.2M", percentage: "Q2 2025 projection", icon: BarChart4, color: "orange" as const },
    ]

    const SUPPLY_CHAIN_CARD_VALUES = [
      { title: "In Transit Report", value: "$332.5K", percentage: "Target $400.0K", trend: "+2.5%", up: true },
      { title: "MTD Sales Number", value: "$198.6K", percentage: "Target $1.0M", trend: "-1.2%", up: false },
      { title: "Booked Orders (Current Month)", value: "$3.7M", percentage: "43.5% of quarterly goal", trend: "+5.3%", up: true },
      { title: "Logistics Performance", value: "98.2%", percentage: "On-time delivery rate", trend: "+1.8%", up: true },
    ]

    const FINANCE_ACCOUNTING_CARD_VALUES = [
      { title: "Approved - Waiting for Payment", value: "100", percentage: "Target 0", trend: "-5%", up: true },
      { title: "Open - Unapproved Reports", value: "20", percentage: "Target 0", trend: "+2%", up: false },
      { title: "Monthly Revenue", value: "$845.2K", percentage: "84.5% of monthly goal", trend: "+3.2%", up: true },
      { title: "Accounts Receivable", value: "$1.5M", percentage: "30 days outstanding", trend: "-2.1%", up: true },
    ]

    const renderMetricCard = (item: any, index: number) => {
      // Map trend icons
      const trendIcon = item.up ? <span className='text-green-600'>↑</span> : <span className='text-destructive'>↓</span>

      const color = item.up ? "green" : "orange"
      const icon = item.title.includes("Report")
        ? FileText
        : item.title.includes("Sales")
          ? TrendingUp
          : item.title.includes("Order")
            ? Activity
            : item.title.includes("Revenue")
              ? BarChart4
              : item.title.includes("Account")
                ? User2
                : PieChart

      return (
        <StatCard
          key={index}
          title={item.title}
          value={item.value}
          percentage={`${item.percentage || ""} ${item.trend ? `(${item.trend})` : ""}`}
          icon={icon}
          color={color as "blue" | "green" | "orange" | "purple"}
        />
      )
    }

    switch (userRole) {
      case "admin":
        return (
          <>
            <div className='mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
              {ADMIN_METRICS.map((metric, index) => (
                <StatCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  percentage={metric.percentage}
                  icon={metric.icon}
                  color={metric.color}
                />
              ))}
            </div>

            <div className='grid gap-6 md:grid-cols-12'>
              <div className='col-span-12 md:col-span-6'>
                <div className='rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium'>Sales Overview</h3>
                      <p className='text-sm text-muted-foreground'>Monthly performance metrics</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                    >
                      <FileDown className='h-4 w-4' />
                      Export
                    </Button>
                  </div>
                  <Chart1 />
                </div>
              </div>

              <div className='col-span-12 md:col-span-6'>
                <div className='rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium'>Revenue Analysis</h3>
                      <p className='text-sm text-muted-foreground'>Quarterly breakdown</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                    >
                      <FileDown className='h-4 w-4' />
                      Export
                    </Button>
                  </div>
                  <Chart2 />
                </div>
              </div>

              <div className='col-span-12 md:col-span-6'>
                <div className='rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium'>User Activity</h3>
                      <p className='text-sm text-muted-foreground'>Login and system usage</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                    >
                      <FileDown className='h-4 w-4' />
                      Export
                    </Button>
                  </div>
                  <Chart3 />
                </div>
              </div>

              <div className='col-span-12 md:col-span-6'>
                <div className='rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium'>Inventory Status</h3>
                      <p className='text-sm text-muted-foreground'>Current stock levels</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                    >
                      <FileDown className='h-4 w-4' />
                      Export
                    </Button>
                  </div>
                  <Chart4 />
                </div>
              </div>
            </div>
          </>
        )

      case "sales":
        return (
          <>
            <div className='mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
              {SUPPLY_CHAIN_CARD_VALUES.map((value, index) => (
                <StatCard
                  key={index}
                  title={value.title}
                  value={value.value}
                  percentage={`${value.percentage} ${value.trend ? `(${value.trend})` : ""}`}
                  icon={
                    value.title.includes("Transit")
                      ? TrendingUp
                      : value.title.includes("Sales")
                        ? BarChart4
                        : value.title.includes("Orders")
                          ? Activity
                          : value.title.includes("Performance")
                            ? PieChart
                            : FileText
                  }
                  color={value.up ? "green" : "orange"}
                />
              ))}
            </div>

            <div className='grid gap-6 md:grid-cols-12'>
              <div className='col-span-12 md:col-span-6'>
                <div className='rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium'>Sales Performance</h3>
                      <p className='text-sm text-muted-foreground'>Monthly comparison by territory</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                    >
                      <FileDown className='h-4 w-4' />
                      Export
                    </Button>
                  </div>
                  <Chart5 />
                </div>
              </div>

              <div className='col-span-12 md:col-span-6'>
                <div className='rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium'>Lead Conversion</h3>
                      <p className='text-sm text-muted-foreground'>Pipeline and conversion metrics</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                    >
                      <FileDown className='h-4 w-4' />
                      Export
                    </Button>
                  </div>
                  <Chart6 />
                </div>
              </div>

              <div className='col-span-12'>
                <div className='rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium'>Sales Performance</h3>
                      <p className='text-sm text-muted-foreground'>Quarterly goals and achievements</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                    >
                      <FileDown className='h-4 w-4' />
                      Export
                    </Button>
                  </div>
                  <Chart7 />
                </div>
              </div>
            </div>
          </>
        )

      case "supply-chain":
      case "supplychain":
        return (
          <Tabs defaultValue='sales-pipeline-dashboard' className=''>
            <div className='mb-4 flex items-center justify-between'>
              <TabsList className='h-fit flex-wrap gap-y-2 rounded-lg bg-muted/50 p-1'>
                <TabsTrigger value='sales-pipeline-dashboard' className='rounded-md px-4 py-2'>
                  Sales Pipeline
                </TabsTrigger>
                <TabsTrigger value='open-opportunities' className='rounded-md px-4 py-2'>
                  Open Opportunities
                </TabsTrigger>
                <TabsTrigger value='shortcuts' className='rounded-md px-4 py-2'>
                  Shortcuts
                </TabsTrigger>
                <TabsTrigger value='us-sales-competition-dashboard' className='rounded-md px-4 py-2'>
                  US Sales
                </TabsTrigger>
                <TabsTrigger value='ph-sales-competition-dashboard' className='rounded-md px-4 py-2'>
                  PH Sales
                </TabsTrigger>
                <TabsTrigger value='kp-is' className='rounded-md px-4 py-2'>
                  KPIs
                </TabsTrigger>
              </TabsList>
              <Button
                variant='outline'
                size='sm'
                className='h-9 gap-1.5 rounded-md px-3 transition-all hover:border-primary hover:text-primary'
              >
                <ExternalLink className='h-4 w-4' />
                View All
              </Button>
            </div>

            <TabsContent value='sales-pipeline-dashboard' className='py-5 animate-in fade-in-50'>
              <div className='flex flex-col gap-y-7'>
                <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
                  {SUPPLY_CHAIN_CARD_VALUES.map((value, index) => (
                    <StatCard
                      key={index}
                      title={value.title}
                      value={value.value}
                      percentage={`${value.percentage} ${value.trend ? `(${value.trend})` : ""}`}
                      icon={
                        value.title.includes("Transit")
                          ? TrendingUp
                          : value.title.includes("Sales")
                            ? BarChart4
                            : value.title.includes("Orders")
                              ? Activity
                              : value.title.includes("Performance")
                                ? PieChart
                                : FileText
                      }
                      color={value.up ? "green" : "orange"}
                    />
                  ))}
                </div>

                <div className='flex flex-wrap gap-3'>
                  <Button className='min-w-[200px] flex-1 gap-1.5 shadow-sm transition-transform hover:translate-y-[-2px]'>
                    <FileText className='h-4 w-4' />
                    Open SO w/Stock Details
                  </Button>
                  <Button className='min-w-[200px] flex-1 gap-1.5 shadow-sm transition-transform hover:translate-y-[-2px]'>
                    <Activity className='h-4 w-4' />
                    Full OOR
                  </Button>
                  <Button className='min-w-[200px] flex-1 gap-1.5 shadow-sm transition-transform hover:translate-y-[-2px]'>
                    <RefreshCw className='h-4 w-4' />
                    Update Sales Order
                  </Button>
                  <Button className='min-w-[200px] flex-1 gap-1.5 shadow-sm transition-transform hover:translate-y-[-2px]'>
                    <Clock className='h-4 w-4' />
                    Update Comm Report
                  </Button>
                </div>

                <Card className='border shadow-sm transition-all hover:shadow-md'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle>Forecast</CardTitle>
                        <CardDescription>Overview of upcoming sales pipeline</CardDescription>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-9 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                      >
                        <FileDown className='h-4 w-4' />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table1 />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value='open-opportunities' className='animate-in fade-in-50'>
              <Card className='border shadow-sm transition-all hover:shadow-md'>
                <CardContent className='p-6'>
                  <div className='flex min-h-[400px] items-center justify-center text-muted-foreground'>
                    Content for Open Opportunities coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value='shortcuts' className='animate-in fade-in-50'>
              <Card className='border shadow-sm transition-all hover:shadow-md'>
                <CardContent className='p-6'>
                  <div className='flex min-h-[400px] items-center justify-center text-muted-foreground'>
                    Content for Shortcuts coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value='us-sales-competition-dashboard' className='animate-in fade-in-50'>
              <Card className='border shadow-sm transition-all hover:shadow-md'>
                <CardContent className='p-6'>
                  <div className='flex min-h-[400px] items-center justify-center text-muted-foreground'>
                    US Sales Competition dashboard coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value='ph-sales-competition-dashboard' className='animate-in fade-in-50'>
              <Card className='border shadow-sm transition-all hover:shadow-md'>
                <CardContent className='p-6'>
                  <div className='flex min-h-[400px] items-center justify-center text-muted-foreground'>
                    PH Sales Competition dashboard coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value='kp-is' className='animate-in fade-in-50'>
              <Card className='border shadow-sm transition-all hover:shadow-md'>
                <CardContent className='p-6'>
                  <div className='flex min-h-[400px] items-center justify-center text-muted-foreground'>KPIs dashboard coming soon</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )

      case "finance":
      case "accounting":
        return (
          <div className='flex flex-col gap-y-7'>
            <div className='mb-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
              {FINANCE_ACCOUNTING_CARD_VALUES.map((value, index) => (
                <StatCard
                  key={index}
                  title={value.title}
                  value={value.value}
                  percentage={`${value.percentage} ${value.trend ? `(${value.trend})` : ""}`}
                  icon={
                    value.title.includes("Payment")
                      ? FileDown
                      : value.title.includes("Reports")
                        ? FileText
                        : value.title.includes("Revenue")
                          ? BarChart4
                          : value.title.includes("Account")
                            ? User2
                            : PieChart
                  }
                  color={value.up ? "green" : "orange"}
                />
              ))}
            </div>

            <div className='mb-6 flex flex-col gap-5 md:flex-row'>
              <Card className='flex-1 border-t-4 border-primary transition-all duration-200 hover:shadow-md'>
                <CardContent className='flex flex-col items-center justify-center p-6'>
                  <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                    <PlusCircle className='h-6 w-6 text-primary' />
                  </div>
                  <h3 className='mb-2 text-xl font-medium'>New Expense Report</h3>
                  <p className='mb-4 text-center text-muted-foreground'>Create a new expense report for approval</p>
                  <Button className='w-full gap-1.5 shadow-sm transition-transform hover:translate-y-[-2px]'>
                    <PlusCircle className='h-4 w-4' />
                    Create Report
                  </Button>
                </CardContent>
              </Card>

              <Card className='flex-1 border-t-4 border-green-500 transition-all duration-200 hover:shadow-md'>
                <CardContent className='flex flex-col items-center justify-center p-6'>
                  <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10'>
                    <FileText className='h-6 w-6 text-green-500' />
                  </div>
                  <h3 className='mb-2 text-xl font-medium'>Financial Reports</h3>
                  <p className='mb-4 text-center text-muted-foreground'>Access all financial reports and analytics</p>
                  <Button variant='outline' className='w-full gap-1.5 border-green-500/30 text-green-700 hover:bg-green-50'>
                    <FileDown className='h-4 w-4' />
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className='border shadow-sm transition-all hover:shadow-md'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>Year-to-date financial performance</CardDescription>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-9 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                  >
                    <FileDown className='h-4 w-4' />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Chart9 />
              </CardContent>
            </Card>
          </div>
        )

      case "logistics":
        return (
          <>
            <div className='mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
              {SUPPLY_CHAIN_CARD_VALUES.map((value, index) => (
                <StatCard
                  key={index}
                  title={value.title}
                  value={value.value}
                  percentage={`${value.percentage} ${value.trend ? `(${value.trend})` : ""}`}
                  icon={
                    value.title.includes("Transit")
                      ? TrendingUp
                      : value.title.includes("Sales")
                        ? BarChart4
                        : value.title.includes("Orders")
                          ? Activity
                          : value.title.includes("Performance")
                            ? PieChart
                            : FileText
                  }
                  color={value.up ? "green" : "orange"}
                />
              ))}
            </div>

            <div className='grid gap-6 md:grid-cols-12'>
              <div className='col-span-12 md:col-span-6'>
                <div className='rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium'>Logistics Performance</h3>
                      <p className='text-sm text-muted-foreground'>Monthly overview of logistics metrics</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                    >
                      <FileDown className='h-4 w-4' />
                      Export
                    </Button>
                  </div>
                  <Chart10 />
                </div>
              </div>

              <div className='col-span-12 md:col-span-6'>
                <div className='rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium'>Delivery Status</h3>
                      <p className='text-sm text-muted-foreground'>Current status of all deliveries</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                    >
                      <FileDown className='h-4 w-4' />
                      Export
                    </Button>
                  </div>
                  <Chart11 />
                </div>
              </div>

              <div className='col-span-12'>
                <div className='rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium'>Shipment Analytics</h3>
                      <p className='text-sm text-muted-foreground'>Detailed view of all shipments</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 rounded-md border-dashed px-3 transition-all hover:border-primary hover:text-primary'
                    >
                      <FileDown className='h-4 w-4' />
                      Export
                    </Button>
                  </div>
                  <Chart12 />
                </div>
              </div>
            </div>
          </>
        )

      default:
        // Default dashboard for users with unknown roles
        return (
          <div className='grid gap-6'>
            <div className='rounded-lg border bg-card p-5 shadow-sm'>
              <h3 className='mb-4 text-lg font-medium'>Welcome to Your Dashboard</h3>
              <p className='text-muted-foreground'>
                Your personalized view is being configured. Please contact your administrator if you need access to additional features.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className='w-full space-y-8'>
      {renderWelcomeBanner()}
      <div className='w-full'>
        {/* {renderQuickActions()} */}
        <div className='mb-1 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
          <div>
            <div className='flex items-center gap-2'>
              {/* <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h1 className="text-2xl font-bold">Dashboard</h1> */}
            </div>
          </div>

          {/* <div className="flex items-center gap-3 self-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-9 px-3 rounded-md border-dashed transition-all hover:border-primary hover:text-primary"
            >
              <FileDown className="h-4 w-4" />
              Export Data
            </Button>
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 h-9 px-4 rounded-md shadow-sm transition-transform hover:translate-y-[-2px]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div> */}
        </div>
        {renderContent(user.role)}
      </div>
    </div>
  )
}

const DashboardSkeleton = () => (
  <div className='w-full space-y-8'>
    {/* Welcome banner skeleton */}
    <Skeleton className='h-[120px] w-full rounded-lg' />

    {/* Quick actions skeleton */}
    <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
      <Skeleton className='h-20 w-full rounded-md' />
      <Skeleton className='h-20 w-full rounded-md' />
      <Skeleton className='h-20 w-full rounded-md' />
      <Skeleton className='h-20 w-full rounded-md' />
    </div>

    {/* Dashboard title skeleton */}
    <div className='mb-6 flex items-center gap-2'>
      <Skeleton className='h-8 w-1 rounded-full' />
      <div>
        <Skeleton className='mb-2 h-8 w-48 rounded-md' />
        <Skeleton className='h-5 w-72 rounded-md' />
      </div>
    </div>

    {/* Stats cards skeleton */}
    <div className='mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
      <Skeleton className='h-[150px] rounded-lg' />
      <Skeleton className='h-[150px] rounded-lg' />
      <Skeleton className='h-[150px] rounded-lg' />
      <Skeleton className='h-[150px] rounded-lg' />
    </div>

    {/* Main content skeleton */}
    <div className='grid gap-6 md:grid-cols-12'>
      <div className='col-span-12 md:col-span-6'>
        <Skeleton className='h-[300px] w-full rounded-lg' />
      </div>
      <div className='col-span-12 md:col-span-6'>
        <Skeleton className='h-[300px] w-full rounded-lg' />
      </div>
      <div className='col-span-12'>
        <Skeleton className='h-[400px] w-full rounded-lg' />
      </div>
    </div>
  </div>
)

export default DashboardContent
