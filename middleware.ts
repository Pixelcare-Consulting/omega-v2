import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'

import { callbacks } from '@/auth'
import authConfig from './auth.config'
import { authApiPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, protectedRoutes } from './constant/route'

//? The @auth/prisma-adapter version ^2.8.0 is not compatible with next-auth version ^5.0.0-beta.25. To resolve this issue, revert to @auth/prisma-adapter version 2.7.2
//? Current Version of Prisma Adapter: 2.7.2

const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    session: callbacks?.session //* this is a workaround for getting updated session in middleware
  }
})

export default auth((req) => {
  const { nextUrl } = req
  const isAuthenticated = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith(authApiPrefix)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)
  const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route))

  //* if the request is for an API route, pass it to the next handler
  if (isApiAuthRoute) return NextResponse.next()

  //* if the request is for an auth route, check if the user is authenticated, if authenticated redirect to the default login redirect, if not proceed to the next handler
  if (isAuthRoute) {
    if (isAuthenticated) return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    return NextResponse.next()
  }

  //* if the request is not authenticated and is a protected route, redirect to the login page with the callback url
  if (!isAuthenticated && isProtectedRoute) {
    let callbackUrl = nextUrl.pathname

    if (nextUrl.search) callbackUrl += nextUrl.search

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)

    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  //* The following matcher runs middleware on all routes
  //* except static assets.
  //* This matcher is from clerk
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
