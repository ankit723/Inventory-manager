// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function middleware(request: NextRequest) {
  const supabase = await createClient(cookies())
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { pathname } = request.nextUrl

  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/stores', '/inventory', '/products', '/orders', '/customers', '/reports']
  
  const unauthRoutes = ['/onboarding', '/auth']

  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  if (session && unauthRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/stores', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/shops/:path*',
    '/inventory/:path*',
    '/auth/:path*',
    '/filter-group/:path*',
    '/filter/:path*',
    '/stores/:path*',
    '/products/:path*',
    '/orders/:path*',
    '/customers/:path*',
    '/reports/:path*',
    '/settings/:path*',
    
  ],
}
