import React from 'react'

const page = ({params}: {params: {storeId: string}}) => {
  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Organize and manage your store products efficiently</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Products</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage your product listings. Add detailed descriptions,
            pricing, and inventory levels for each item in your store.
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Filter Groups</h2>
          <p className="text-muted-foreground">
            Organize your products with custom filter groups to help customers find
            items easily. Create categories, tags, and attributes for better
            product organization.
          </p>
        </div>
      </div>

      <div className="p-6 border rounded-lg shadow-sm bg-muted/50">
        <h2 className="text-xl font-semibold mb-3">Getting Started</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Create product categories and filter groups</li>
          <li>• Add your first product with detailed information</li>
          <li>• Set up inventory tracking and stock alerts</li>
          <li>• Organize products using custom filters</li>
        </ul>
      </div>
    </div>
  )
}

export default page