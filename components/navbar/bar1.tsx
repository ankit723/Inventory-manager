'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from '@supabase/supabase-js'
import { ChevronDown, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const navItems = [
  { name: 'Stores', href: '/stores' },
  { name: 'Inventory', href: '/inventory' },
]

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <nav className="border-b">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              <Image src="/assets/logo.webp" alt="Logo" width={52} height={52} />
            </Link>
            
            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex ml-10">
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink 
                        className={cn(
                          navigationMenuTriggerStyle(),
                          pathname.startsWith(item.href) && "bg-accent"
                        )}
                      >
                        {item.name}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user.user_metadata.avatar_url} 
                          alt={user.user_metadata.name} 
                        />
                        <AvatarFallback>
                          {user.user_metadata.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline">
                        {user.user_metadata.name || user.email?.split('@')[0]}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem className="cursor-pointer">
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600" 
                      onClick={handleSignOut}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  {user && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={user.user_metadata.avatar_url} 
                          alt={user.user_metadata.name} 
                        />
                        <AvatarFallback>
                          {user.user_metadata.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.user_metadata.name || user.email?.split('@')[0]}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-2">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            pathname === item.href && "bg-accent"
                          )}
                        >
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-col space-y-2 mt-4">
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start">
                        Profile
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="ghost" className="w-full justify-start">
                        Settings
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}