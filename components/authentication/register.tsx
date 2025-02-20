'use client'
import { useState } from 'react'
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
import OTPInput from '@/components/ui/otp-input'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'
import { createUser, checkUser } from './action'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showOTP, setShowOTP] = useState(false)
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      const user = await checkUser(formData.email)
      if (user) {
        toast.error('User already exists')
        return
      }
      
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          data: {
            name: formData.name,
          },
        },
      })
      
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('User created successfully')  
      toast.success('A verification email has been sent to your email address')  

    } catch (error) {
      console.log(error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async() => {
    // Add your Google registration logic here
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

  const handleGithubRegister = async() => {
    // Add your GitHub registration logic here
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
      return
    }
  }

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Sign up to get started with our service
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showOTP ? (
          <div className="space-y-6">
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword.password ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    {showPassword.password ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword.confirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {showPassword.confirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    <MdEmail className="mr-2" />
                    Sign up with Email
                  </>
                )}
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
              <Button variant="outline" onClick={handleGoogleRegister}>
                <FaGoogle className="mr-2" />
                Google
              </Button>
              <Button variant="outline" onClick={handleGithubRegister}>
                <FaGithub className="mr-2" />
                GitHub
              </Button>
            </div>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <a href="/auth/login" className="text-primary hover:underline">
                Sign in
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium">Verify your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a code to your email
              </p>
            </div>
            <OTPInput
              length={6}
              className="justify-center"
            />
            <Button
              variant="link"
              className="w-full"
              onClick={() => setShowOTP(false)}
            >
              Back to registration
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RegisterPage
