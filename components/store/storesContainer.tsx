//stores container file to show the stores in the dashboard
'use client'
import React from 'react'
import { Store } from '@prisma/client'
import StoreBar from './storeBar'

const StoresContainer = ({ stores }: { stores: Store[] }) => {
  return (
    <div className="flex flex-col gap-4 my-10">
        {stores.map((store) => (
            <StoreBar key={store.id} store={store} />
        ))}
    </div>
  )
}

export default StoresContainer