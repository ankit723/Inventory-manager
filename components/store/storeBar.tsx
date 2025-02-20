//store bar file to show the bar of the store
'use client'
import React, { useState } from 'react'
import { Store } from '@prisma/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Edit, Trash, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteStore } from "./action"
import { QRCodeSVG } from 'qrcode.react'
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface StoreBarProps {
  store: Store;
}

const StoreBar = ({ store }: StoreBarProps) => {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const onDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteStore(store.id)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Store deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm border flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 cursor-pointer" >
      <div className="flex flex-col gap-1" onClick={() => router.push(`/inventory/${store.id}`)}>
        <h2 className="text-lg font-semibold">{store.name}</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <p>Created: {new Date(store.createdAt).toLocaleDateString()}</p>
          <p>Status: Active</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{store.name} Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Store ID</p>
                <p className="text-sm text-muted-foreground">{store.id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Created At</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(store.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Updated At</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(store.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  Active
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Inventory QR Code</p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG 
                    value={`${window.location.origin}/inventory/${store.id}`}
                    size={200}
                    level="H"
                    includeMargin
                    className="border p-2 rounded-lg"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Scan to view inventory
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" asChild>
          <Link href={`/stores/store?storeId=${store.id}`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the store
                &quot;{store.name}&quot; and all of its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Store'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default StoreBar