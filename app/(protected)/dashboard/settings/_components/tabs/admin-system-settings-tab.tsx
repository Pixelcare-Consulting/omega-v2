import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { useEffect, useMemo, useState } from "react"

import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import {
  SETTINGS_DEFAULT_LOCALE_OPTIONS,
  SETTINGS_DEFAULT_THEME_OPTIONS,
  sapB1SettingsSchema,
  SystemSettings,
  systemSettingsSchema,
  type ViewSensitiveCredentialsForm,
  viewSensitiveCredentialsFormSchema,
} from "@/schema/settings"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import InputField from "@/components/form/input-field"
import { Form } from "@/components/ui/form"
import SwitchField from "@/components/form/switch-field"
import { ComboboxField } from "@/components/form/combobox-field"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"
import Alert from "@/components/alert"
import { Button } from "@/components/ui/button"
import { getSapSettings, getSettingByRoleCode, upsertSettings, viewSensitiveCredentials } from "@/actions/settings"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { Label } from "@/components/ui/label"
import LoadingButton from "@/components/loading-button"
import { useRouter } from "nextjs-toploader/app"
import { getRoleByCode } from "@/actions/role"

type AdminSettingsTabProps = {
  role: NonNullable<Awaited<ReturnType<typeof getRoleByCode>>>
  settings: Awaited<ReturnType<typeof getSettingByRoleCode>>
  sapSettings: Awaited<ReturnType<typeof getSapSettings>>
}

type SapStatus = {
  status: "unknown" | "connected" | "disconnected"
  expirationTime: number | null
  tokenStatus?: string
  tokenInfo?: {
    hasB1Session: boolean
    hasRouteId: boolean
    generatedAt?: number
    b1sessionPreview?: string
    routeidPreview?: string
  } | null
  credentials?: {
    baseUrl: string
    companyDB: string
    username: string
  }
}

//* Helper function to get base URL
const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

export default function AdminSystemSettingsTab({ settings, sapSettings }: AdminSettingsTabProps) {
  const router = useRouter()
  const { setTheme } = useTheme()

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isRefreshingToken, setIsRefreshingToken] = useState(false)
  const [isResettingToken, setIsResettingToken] = useState(false)

  const [sapServiceLayerDialogIsOpen, setSapServiceLayerDialogIsOpen] = useState(false)
  const [passwordDialogIsOpen, setPasswordDialogIsOpen] = useState(false)

  const [sapStatus, setSapStatus] = useState<{ data: SapStatus; isLoading: boolean; error: boolean }>({
    data: { status: "unknown", expirationTime: null },
    isLoading: true,
    error: false,
  })

  const systemSettingsValues = useMemo(() => {
    if (settings) {
      const settingsData = settings.data as any | null | undefined
      return settingsData.systemSettings
    }
  }, [JSON.stringify(settings)])

  const sapB1SettingsValues = useMemo(() => {
    if (sapSettings) return sapSettings

    return {
      serviceLayerUrl: "",
      companyDB: "",
      username: "",
      password: "",
      language: "",
      useTLS: false,
    }
  }, [])

  const systemSettingsForm = useForm({
    mode: "onChange",
    values: systemSettingsValues,
    resolver: zodResolver(systemSettingsSchema),
  })

  const sapB1SettingsForm = useForm({
    mode: "onChange",
    values: sapB1SettingsValues,
    resolver: zodResolver(sapB1SettingsSchema),
  })

  const viewSensitiveCrendentialsForm = useForm({
    mode: "onChange",
    values: { password: "" },
    resolver: zodResolver(viewSensitiveCredentialsFormSchema),
  })

  const { executeAsync: viewSensitiveCredentialsExecuteAsync, isExecuting: viewSensitiveCredentialsIsExecuting } = useAction(viewSensitiveCredentials) // prettier-ignore
  const { executeAsync: upsertSettingsExecuteAsync, isExecuting: upsertSettingsIsExecuting } = useAction(upsertSettings) // prettier-ignore

  const defaultTheme = useWatch({ control: systemSettingsForm.control, name: "defaultTheme" })

  const fetchSapStatus = async () => {
    try {
      const baseUrl = getBaseUrl()
      const response = await fetch(`${baseUrl}/api/integrations/sap-b1/status`)

      if (!response.ok) {
        console.error("Failed to fetch SAP status")
        setSapStatus({ data: { status: "unknown", expirationTime: null }, isLoading: false, error: true })
      }

      const data = await response.json()
      setSapStatus({ data, isLoading: false, error: false })
    } catch (error) {
      console.error("Failed to fetch SAP status:", error)
      toast.error("Failed to fetch SAP status!")
      setSapStatus({ data: { status: "unknown", expirationTime: null }, isLoading: false, error: true })
    }
  }

  const testSapConnection = async () => {
    try {
      setIsTestingConnection(true)

      const baseUrl = getBaseUrl()
      const response = await fetch(`${baseUrl}/api/integrations/sap-b1/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Successfully connected to SAP B1 Service Layer!")
        setIsTestingConnection(false)

        //* Refresh status after successful test
        fetchSapStatus()
      } else {
        setIsTestingConnection(false)

        //*Show detailed error information
        const errorDetails = data.details?.troubleshooting ? `\n\nTroubleshooting: ${data.details.troubleshooting}` : ""

        toast.error(`Connection failed: ${data.error}${errorDetails}`)

        //* Log detailed error for debugging
        console.error("SAP Connection Test Failed:", {
          error: data.error,
          details: data.details,
        })
      }
    } catch (error) {
      setIsTestingConnection(false)
      console.error("Failed to test SAP connection:", error)
      toast.error(error instanceof Error ? error.message : "Failed to connect to SAP B1")
    }
  }

  const refreshSapToken = async () => {
    try {
      setIsRefreshingToken(true)

      const baseUrl = getBaseUrl()
      const response = await fetch(`${baseUrl}/api/integrations/sap-b1/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (data.success) {
        toast.success("SAP token refreshed successfully!")
        setIsRefreshingToken(false)

        //* Refresh status after successful token generation
        fetchSapStatus()
      } else {
        setIsRefreshingToken(false)
        throw new Error(data.error || "Failed to refresh SAP token")
      }
    } catch (error) {
      setIsRefreshingToken(false)
      console.error("Failed to refresh SAP token:", error)
      toast.error(error instanceof Error ? error.message : "Failed to refresh SAP token!")
    }
  }

  const resetSapToken = async () => {
    try {
      setIsResettingToken(true)

      const baseUrl = getBaseUrl()
      const response = await fetch(`${baseUrl}/api/integrations/sap-b1/reset-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (data.success) {
        toast.success("SAP token reset and regenerated successfully!")
        setIsResettingToken(false)

        //* Refresh status after successful token reset
        fetchSapStatus()
      } else {
        setIsResettingToken(false)
        throw new Error(data.error || "Failed to reset SAP token")
      }
    } catch (error) {
      setIsResettingToken(false)
      console.error("Failed to reset SAP token:", error)
      toast.error(error instanceof Error ? error.message : "Failed to reset SAP token!")
    }
  }

  const onSubmit = async (formData: SystemSettings) => {
    try {
      const response = await upsertSettingsExecuteAsync({ roleCode: "admin", data: { systemSettings: formData } })
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error(error)
    }
  }

  const viewSensitiveCredentialsOnSubmit = async (formData: ViewSensitiveCredentialsForm) => {
    try {
      const response = await viewSensitiveCredentialsExecuteAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        viewSensitiveCrendentialsForm.setError("password", { type: "custom", message: result.message })
        return
      }

      toast.success(result?.message)
      setShowCredentials(true)
      handleViewSensitiveCredentialsDialogClose()
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  const handleViewSensitiveCredentialsDialogClose = () => {
    viewSensitiveCrendentialsForm.reset()
    viewSensitiveCrendentialsForm.clearErrors()
    setPasswordDialogIsOpen(false)
  }

  //* fetch SAP status when SAP dialog is opened
  useEffect(() => {
    if (sapServiceLayerDialogIsOpen) {
      fetchSapStatus()
    }
  }, [sapServiceLayerDialogIsOpen])

  //* Countdown timer for token expiration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (sapStatus.data.status === "connected" && sapStatus.data.expirationTime) {
      const calculateTimeRemaining = () => {
        const now = Date.now()
        const expiration = sapStatus.data.expirationTime!
        const remaining = Math.max(0, expiration - now)
        setTimeRemaining(remaining)
      }

      calculateTimeRemaining() //* Calculate initial time
      timer = setInterval(calculateTimeRemaining, 1000) //* Update every second
    } else {
      setTimeRemaining(null)
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [sapStatus.data.status, sapStatus.data.expirationTime])

  //* Update theme when defaultTheme changes
  useEffect(() => {
    if (defaultTheme) {
      setTheme(defaultTheme)
    }
  }, [defaultTheme, setTheme])

  return (
    <>
      <Form {...systemSettingsForm}>
        <Card className='rounded-lg p-6 shadow-md'>
          <form className='grid grid-cols-12 gap-5' onSubmit={systemSettingsForm.handleSubmit(onSubmit)}>
            <ReadOnlyFieldHeader className='col-span-12' title='System Settings' description='Manage global system configurations' />

            <div className='col-span-12 md:col-span-6'>
              <InputField
                control={systemSettingsForm.control}
                name='systemName'
                label='System Name'
                extendedProps={{ inputProps: { placeholder: "Enter system name", type: "text" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <SwitchField
                control={systemSettingsForm.control}
                layout='wide'
                name='activityLogs'
                label='Activity Logs'
                description='Enable or disable activity logs'
              />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <ComboboxField
                data={SETTINGS_DEFAULT_LOCALE_OPTIONS}
                control={systemSettingsForm.control}
                name='defaultLocale'
                label='Default Locale'
              />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <SwitchField
                control={systemSettingsForm.control}
                layout='wide'
                name='debugMode'
                label='Debug Mode'
                description='Enable detailed error messages and logging'
              />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <ComboboxField
                data={SETTINGS_DEFAULT_THEME_OPTIONS}
                control={systemSettingsForm.control}
                name='defaultTheme'
                label='Default Theme'
              />
            </div>

            <Separator className='col-span-12' />

            <ReadOnlyFieldHeader className='col-span-12' title='Developer Tools' description='Manage developer tools' />

            <div
              className='col-span-12 cursor-pointer rounded-md border p-4 hover:border-destructive md:col-span-6'
              onClick={() => setSapServiceLayerDialogIsOpen(true)}
            >
              <div className='flex items-center gap-4'>
                <div className='rounded-full bg-primary/10 p-2'>
                  <Icons.globe className='size-4 text-primary' />
                </div>
                <div>
                  <h3 className='font-medium'>SAP Service Layer</h3>
                  <p className='text-sm text-muted-foreground'>Manage SAP Service Layer endpoints and external service connections</p>
                </div>
              </div>
            </div>

            <div className='col-span-12 mt-2 flex items-center justify-between gap-2'>
              <Button type='button' variant='outline' disabled={upsertSettingsIsExecuting} onClick={() => {}}>
                Restore Defaults
              </Button>
              <LoadingButton isLoading={upsertSettingsIsExecuting} type='submit'>
                Save System Settings
              </LoadingButton>
            </div>
          </form>
        </Card>
      </Form>

      {/* //* SAP Service Layer Dialog*/}
      <Dialog open={sapServiceLayerDialogIsOpen} onOpenChange={setSapServiceLayerDialogIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>SAP Service Layer</DialogTitle>
            <DialogDescription>Information about SAP Service Layer endpoints and services.</DialogDescription>
          </DialogHeader>

          <Card className='grid grid-cols-12 gap-4 p-3'>
            <ReadOnlyFieldHeader
              className='col-span-12'
              title='SAP Business One Service Layer'
              description='This is used for integration with SAP Business One Syncing Omega Portal.'
            />

            <Separator className='col-span-12' />

            <Alert
              className='col-span-12'
              variant='warning'
              message='Please contact the developer if you require any changes to these configurations.'
            />

            {sapStatus.isLoading && <Alert className='col-span-12' variant='loading' message='Loading SAP Service Layer Status...' />}

            {sapStatus.error && <Alert className='col-span-12' variant='error' message='Failed to load SAP Service Layer Status!' />}

            <Form {...sapB1SettingsForm}>
              {!showCredentials ? (
                <div className='col-span-12 flex justify-center'>
                  <Button disabled={isLoading} variant='outline' onClick={() => setPasswordDialogIsOpen(true)}>
                    <Icons.eye className='size-4' /> Show Credentials
                  </Button>
                </div>
              ) : (
                <>
                  <Separator className='col-span-12' />

                  <div className='col-span-12'>
                    <InputField
                      control={sapB1SettingsForm.control}
                      name='serviceLayerUrl'
                      label='Service Layer URL'
                      extendedProps={{ inputProps: { placeholder: "Enter service layer url", type: "text", disabled: true } }}
                    />
                  </div>

                  <div className='col-span-12'>
                    <InputField
                      control={sapB1SettingsForm.control}
                      name='companyDB'
                      label='Company DB'
                      extendedProps={{ inputProps: { placeholder: "Enter company db", type: "text", disabled: true } }}
                    />
                  </div>

                  <div className='col-span-12'>
                    <InputField
                      control={sapB1SettingsForm.control}
                      name='username'
                      label='Username'
                      extendedProps={{ inputProps: { placeholder: "Enter username", type: "text", disabled: true } }}
                    />
                  </div>

                  <Separator className='col-span-12' />
                </>
              )}
            </Form>

            {sapStatus.data.tokenInfo && (
              <div className='col-span-12 space-y-2 rounded-lg bg-muted p-3'>
                <Label className='text-sm font-medium'>Token Information:</Label>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div>
                    <span className='text-muted-foreground'>B1 Session:</span>
                    <p className='font-mono'>{sapStatus.data.tokenInfo.b1sessionPreview || "Not available"}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Route ID:</span>
                    <p className='font-mono'>{sapStatus.data.tokenInfo.routeidPreview || "Not available"}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Generated:</span>
                    <p>
                      {sapStatus.data.tokenInfo.generatedAt
                        ? (() => {
                            const date = new Date(sapStatus.data.tokenInfo.generatedAt)

                            //* Check if the date is valid
                            if (isNaN(date.getTime())) {
                              return "Invalid Date"
                            }

                            //* Check if the date is in a reasonable range (not in the future, not too old)
                            const now = Date.now()
                            const maxAge = 24 * 60 * 60 * 1000 //* 24 hours
                            if (date.getTime() > now || now - date.getTime() > maxAge) {
                              return "Invalid Date"
                            }
                            return date.toLocaleString()
                          })()
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Token Status:</span>
                    <p
                      className={`font-medium ${sapStatus.data.tokenStatus === "valid" ? "text-green-600" : sapStatus.data.tokenStatus === "expired" ? "text-red-600" : "text-yellow-600"}`}
                    >
                      {sapStatus.data.tokenStatus || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator className='col-span-12' />

            <div className='col-span-12 flex items-center justify-between'>
              <div>
                <Label>Status:</Label>
                <div className='flex items-center gap-2'>
                  {sapStatus.data.status === "connected" && <Icons.checkCircle className='size-5 text-green-500' />}
                  {sapStatus.data.status === "disconnected" && <Icons.xCicle className='size-5 text-red-500' />}
                  <p
                    className={`text-sm ${sapStatus.data.status === "connected" ? "text-green-500" : sapStatus.data.status === "disconnected" ? "text-red-500" : "text-muted-foreground"}`}
                  >
                    {sapStatus.data.status === "unknown"
                      ? "Loading..."
                      : sapStatus.data.status === "connected"
                        ? "Connected"
                        : "Disconnected"}
                  </p>
                </div>
              </div>
              <div>
                <Label>Token Expiration:</Label>
                <p className='text-sm text-muted-foreground'>
                  {timeRemaining !== null
                    ? timeRemaining > 0
                      ? `${Math.floor(timeRemaining / 60000)}m ${Math.floor((timeRemaining % 60000) / 1000)}s`
                      : "Expired"
                    : sapStatus.data.expirationTime
                      ? (() => {
                          const expDate = new Date(sapStatus.data.expirationTime)
                          if (isNaN(expDate.getTime())) {
                            return "Invalid expiration time"
                          }
                          const now = Date.now()
                          const remaining = sapStatus.data.expirationTime - now
                          if (remaining <= 0) {
                            return "Expired"
                          }
                          return `${Math.floor(remaining / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s`
                        })()
                      : sapStatus.data.status === "disconnected"
                        ? "N/A"
                        : "Loading..."}
                </p>
              </div>
            </div>

            <div className='col-span-12 flex justify-center gap-2'>
              <LoadingButton
                variant='outline'
                isLoading={isTestingConnection}
                disabled={!showCredentials}
                onClick={testSapConnection}
                loadingText='Testing Connection'
              >
                <Icons.database className='size-4' />
                Test Connection
              </LoadingButton>

              <LoadingButton
                variant='outline'
                isLoading={isRefreshingToken}
                disabled={!showCredentials}
                onClick={refreshSapToken}
                loadingText='Refreshing Token'
              >
                <Icons.checkCircle className='size-4' />
                Refresh Token
              </LoadingButton>

              <LoadingButton
                variant='outline'
                isLoading={isResettingToken}
                disabled={!showCredentials}
                onClick={resetSapToken}
                loadingText='Resetting Token'
              >
                <Icons.alertCircle className='size' />
                Reset Token
              </LoadingButton>
            </div>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogIsOpen} onOpenChange={setPasswordDialogIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Sensitive Credentials Security</DialogTitle>
            <DialogDescription>Enter you user password to view sensitive credentials.</DialogDescription>
          </DialogHeader>

          <Form {...viewSensitiveCrendentialsForm}>
            <Card className='p-3'>
              <form
                className='grid grid-cols-12 gap-4'
                onSubmit={viewSensitiveCrendentialsForm.handleSubmit(viewSensitiveCredentialsOnSubmit)}
              >
                <div className='col-span-12'>
                  <InputField
                    control={viewSensitiveCrendentialsForm.control}
                    name='password'
                    label='Password'
                    extendedProps={{ inputProps: { placeholder: "Enter password", type: "password" } }}
                  />
                </div>

                <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
                  <Button
                    type='button'
                    variant='secondary'
                    disabled={viewSensitiveCredentialsIsExecuting}
                    onClick={handleViewSensitiveCredentialsDialogClose}
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    isLoading={viewSensitiveCredentialsIsExecuting}
                    type='button'
                    onClick={() => viewSensitiveCrendentialsForm.handleSubmit(viewSensitiveCredentialsOnSubmit)()}
                  >
                    Save
                  </LoadingButton>
                </div>
              </form>
            </Card>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
