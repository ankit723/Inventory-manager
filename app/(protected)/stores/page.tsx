import React from 'react'
import StoreIndexHeader from '@/components/store/storeIndexHeader'
import { getStores } from '@/components/store/action'
import StoresContainer from '@/components/store/storesContainer'

const page = async () => {
  const stores = await getStores()
  return (
    <div>
        <StoreIndexHeader />
        <StoresContainer stores={stores} />
    </div>
  )
}

export default page