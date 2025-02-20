import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient(cookies())
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const user =  await prisma.user.findUnique({
        where: {
          id: data.user.id
        }
      })
      console.log("user", data.user)
      if (!user) {
        await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email ||"",
            name: data.user.user_metadata.name || data.user.email?.split("@")[0] || "",
            password: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        })
      }
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}