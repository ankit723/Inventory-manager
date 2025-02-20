import React from 'react'
import { getStores } from '@/components/store/action'
import StoresContainer from '@/components/store/storesContainer'

const page = async () => {
  const stores = await getStores()
  return (
    <div>
        <h1 className='text-2xl font-bold mt-10'>Inventory</h1>
        <p className='text-sm text-muted-foreground'>Manage your inventory</p>
        
        <StoresContainer stores={stores} />
    </div>
  )
}

export default page