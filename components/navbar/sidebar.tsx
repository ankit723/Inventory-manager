'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  Filter,
  ListFilter,
  Store,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const routes = [
  {
    label: 'Products',
    icon: LayoutGrid,
    href: '/inventory/[storeId]/products',
  },
  {
    label: 'Filters',
    icon: Filter,
    href: '/inventory/[storeId]/filters',
  },
  {
    label: 'Filter Groups',
    icon: ListFilter,
    href: '/inventory/[storeId]/filter-groups',
  },
]

interface SidebarProps {
  className?: string;
}

interface SidebarProps {
  className?: string;
  storeId: string;
}

const Sidebar = ({ className, storeId }: SidebarProps) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const SidebarContent = (
    <div className="space-y-4 flex flex-col h-full">
      <div className="space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href.replace('[storeId]', storeId)}
            onClick={() => setIsOpen(false)}
          >
            <div
              className={cn(
                "flex items-center gap-x-2 text-slate-600 text-sm font-medium",
                "px-4 py-3 rounded-lg transition-colors",
                "hover:text-slate-900 hover:bg-slate-100",
                pathname.includes((route.href.split('/')[3])) && "text-slate-900 bg-slate-100"
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {SidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-col md:w-72 md:inset-y-0 h-full border-r bg-white",
        className
      )}>
        {SidebarContent}
      </div>
    </>
  )
}

export default Sidebar 