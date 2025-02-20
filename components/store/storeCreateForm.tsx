//store create form file to create a new store
'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store } from '@prisma/client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createStore, updateStore, getStore } from "./action"
import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const formSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
})

const StoreCreateForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeId = searchParams.get('storeId')
  const [store, setStore] = useState<Store | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    const fetchStore = async () => {
      if (storeId) {
        const result = await getStore(storeId)
        if (result.data) {
          setStore(result.data)
          form.reset({
            name: result.data.name
          })
        }
      }
    }
    fetchStore()
  }, [storeId, form])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showQR && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0) {
      router.push('/stores')
    }
    return () => clearTimeout(timer)
  }, [showQR, countdown, router])

  const isLoading = form.formState.isSubmitting

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `store-${store?.id}-qr.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (storeId) {
        const result = await updateStore(storeId, values)
        if (result.error) {
          toast.error(result.error)
          return
        }
        if (result.data) {
          setStore(result.data)
          toast.success('Store updated successfully')
        }
      } else {
        const result = await createStore(values)
        if (result.error) {
          toast.error(result.error)
          return
        }
        if (result.data) {
          setStore(result.data)
          toast.success('Store created successfully')
        }
      }
      setShowQR(true)
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {storeId ? 'Edit Store' : 'Create Store'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {storeId ? 'Update your store details' : 'Add a new store to your account'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input 
                    disabled={isLoading} 
                    placeholder="Enter store name" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-4">
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {storeId ? 'Update Store' : 'Create Store'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading}
              onClick={() => router.push('/stores')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Store QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 p-6">
            <QRCodeSVG 
              id="qr-code"
              value={`${window.location.origin}/inventory/${store?.id}`}
              size={200}
              level="H"
              includeMargin
              className="border p-2 rounded-lg"
            />
            <Button
              onClick={downloadQRCode}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Redirecting to stores in {countdown} seconds...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StoreCreateForm