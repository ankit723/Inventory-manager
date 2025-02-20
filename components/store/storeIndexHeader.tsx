//store index header file to show the header of the store index page and the create button

import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const StoreIndexHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
        <p className="text-sm text-muted-foreground">
          Manage your store settings and preferences here
        </p>
      </div>

      <Button asChild>
        <Link href="/stores/store">
          <Plus className="mr-2 h-4 w-4" />
          Create Store
        </Link>
      </Button>
    </div>
  )
}

export default StoreIndexHeader