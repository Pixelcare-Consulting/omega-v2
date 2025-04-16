import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/provider/theme-provider'
import TailwindIndicatorProvider from '@/components/provider/tailwind-indicator-provider'
import ToastProvider from '@/components/provider/toast-provider'
import { auth } from '@/auth'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Omega',
  description: 'Omega PXC Development Build'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html className='h-full scroll-smooth' lang='en' suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={session}>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
            {children}

            <TailwindIndicatorProvider />
          </ThemeProvider>

          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  )
}
