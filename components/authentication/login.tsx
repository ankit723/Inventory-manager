'use client'
import { useEffect, useState } from 'react'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { checkUser, createUser } from './action'



const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleEmailLogin = async(e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient() 
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Login successful')
    router.push('/stores')
  }

  const handleGoogleLogin = async() => {
    // Add your Google login logic here
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
      return
    }
  }

  const handleGithubLogin = async() => {
    // Add your GitHub login logic here
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              <MdEmail className="mr-2" />
              Sign in with Email
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleGoogleLogin}>
              <FaGoogle className="mr-2" />
              Google
            </Button>
            <Button variant="outline" onClick={handleGithubLogin}>
              <FaGithub className="mr-2" />
              GitHub
            </Button>
          </div>

          <div className="space-y-2 text-center text-sm">
            <div>
              <a 
                href="/auth/forgot-password" 
                className="text-primary hover:underline"
              >
                Forgot your password?
              </a>
            </div>

            <div>
              Don't have an account?{' '}
              <a 
                href="/auth/register" 
                className="text-primary hover:underline"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginPage
