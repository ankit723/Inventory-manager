'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

interface StoreData {
  name: string
}

export async function getStore(storeId: string) {
  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
  })
  return { data: store }
}

export async function getStores() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const stores = await prisma.store.findMany({
    where: {
      userId: user.id,
    },
  })
  return stores
}

export async function createStore(data: StoreData) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const store = await prisma.store.create({
      data: {
        name: data.name,
        userId: user.id,
      },
    })

    revalidatePath('/stores')
    return { data: store }
  } catch (error) {
    return { error: 'Failed to create store' }
  }
}

export async function updateStore(storeId: string, data: StoreData) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
        userId: user.id,
      },
    })

    if (!store) {
      return { error: 'Store not found' }
    }

    const updatedStore = await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        name: data.name,
      },
    })

    revalidatePath('/stores')
    return { data: updatedStore }
  } catch (error) {
    return { error: 'Failed to update store' }
  }
}

export async function deleteStore(storeId: string) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
        userId: user.id,
      },
    })

    if (!store) {
        return { error: 'Store not found' }
    }

    await prisma.store.delete({
      where: {
        id: storeId,
      },
    })

    revalidatePath('/stores')
    return { success: true }

  } catch (error) {
    return { error: 'Failed to delete store' }
  }
}   