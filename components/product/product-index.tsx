'use client'

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getProducts, createProduct, updateProduct, deleteProduct, getFilterGroups } from './action'
import { Checkbox } from "@/components/ui/checkbox";

interface FilterOption {
  id: string;
  value: string;
  filterId: string;
}

interface Filter {
  id: string;
  name: string;
  filterOptions: FilterOption[];
}

interface FilterGroup {
  id: string;
  name: string;
  filters: Filter[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  type: 'SIMPLE' | 'CONFIGURABLE';
  filterGroupId: string;
  totalStock: number;
  availableStock: number;
  uniqueFilterOptions: FilterOption[];
}

const ProductIndex = ({ storeId }: { storeId: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [selectedFilterGroup, setSelectedFilterGroup] = useState<string>('');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState<string[]>([]);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'create' | 'edit' | 'view' | null;
    product?: Product;
  }>({
    isOpen: false,
    type: null
  });

  useEffect(() => {
    fetchProducts();
    fetchFilterGroups();
  }, []);

  const fetchProducts = async () => {
    const result = await getProducts(storeId)
    if (result.success) {
      setProducts(result.data || [])
    }
  }

  const fetchFilterGroups = async () => {
    const result = await getFilterGroups()
    if (result.success) {
      setFilterGroups(result.data || [])
    }
  }

  const handleFilterGroupChange = (groupId: string) => {
    setSelectedFilterGroup(groupId);
    setSelectedFilterOptions([]); // Reset selected options when group changes
  };

  const handleFilterOptionSelect = (filterId: string, optionId: string) => {
    const form = document.querySelector('form');
    const typeSelect = form?.querySelector('select[name="type"]') as HTMLSelectElement;
    const isConfigurable = typeSelect?.value === 'CONFIGURABLE';

    setSelectedFilterOptions(prev => {
      if (!isConfigurable) {
        // For simple products, only allow one option per filter
        return prev.filter(id => {
          const option = filterGroups
            .find(g => g.id === selectedFilterGroup)
            ?.filters
            .find(f => f.id === filterId)
            ?.filterOptions
            .find(o => o.id === id);
          return option?.filterId !== filterId;
        }).concat(optionId);
      } else {
        // For configurable products, allow multiple options
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId);
        } else {
          return [...prev, optionId];
        }
      }
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.append('storeId', storeId);
    formData.append('filterGroupId', selectedFilterGroup);
    formData.append('filterOptionIds', JSON.stringify(selectedFilterOptions));

    const result = await createProduct(formData)
    if (result.success) {
      setProducts([...products, result.data as Product])
      setModal({ isOpen: false, type: null })
      setSelectedFilterGroup('')
      setSelectedFilterOptions([])
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modal.product) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    formData.append('id', modal.product.id)
    formData.append('filterGroupId', selectedFilterGroup)
    formData.append('filterOptionIds', JSON.stringify(selectedFilterOptions))

    const result = await updateProduct(formData)
    if (result.success) {
      setProducts(products.map(p => p.id === result.data?.id ? result.data as Product : p))
      setModal({ isOpen: false, type: null })
      setSelectedFilterGroup('')
      setSelectedFilterOptions([])
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const result = await deleteProduct(id, storeId)
    if (result.success) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button
          onClick={() => setModal({ isOpen: true, type: 'create' })}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Product
        </Button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex items-center p-4">
              <div className="flex-1 flex gap-4 items-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">
                    ${(product.price / 100).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModal({ isOpen: true, type: 'view', product })}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModal({ isOpen: true, type: 'edit', product });
                    setSelectedFilterGroup(product.filterGroupId);
                    setSelectedFilterOptions(product.uniqueFilterOptions.map(o => o.id));
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog 
        open={modal.isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setModal({ isOpen: false, type: null });
            setSelectedFilterGroup('');
            setSelectedFilterOptions([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {modal.type === 'create' ? 'Create New Product' :
               modal.type === 'edit' ? 'Edit Product' : 'View Product'}
            </DialogTitle>
          </DialogHeader>
          
          {modal.type === 'view' ? (
            <div className="space-y-4">
              {/* View Product Details */}
            </div>
          ) : (
            <form onSubmit={modal.type === 'create' ? handleCreateProduct : handleEditProduct}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      defaultValue={modal.product?.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      required
                      defaultValue={modal.product?.price}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    defaultValue={modal.product?.description}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalStock">Total Stock</Label>
                    <Input
                      id="totalStock"
                      name="totalStock"
                      type="number"
                      required
                      defaultValue={modal.product?.totalStock}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Product Type</Label>
                    <Select
                      name="type"
                      defaultValue={modal.product?.type || 'SIMPLE'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIMPLE">Simple</SelectItem>
                        <SelectItem value="CONFIGURABLE">Configurable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    type="url"
                    required
                    defaultValue={modal.product?.image}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Filter Group</Label>
                  <Select
                    value={selectedFilterGroup}
                    onValueChange={handleFilterGroupChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select filter group" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedFilterGroup && (
                  <div className="space-y-2">
                    <Label>Filter Options</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {filterGroups
                        .find(g => g.id === selectedFilterGroup)
                        ?.filters.map(filter => (
                          <div key={filter.id} className="space-y-2">
                            <Label>{filter.name}</Label>
                            {modal.type === 'create' || modal.type === 'edit' ? (
                              <div className="space-y-2">
                                {filter.filterOptions.map(option => (
                                  <div key={option.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={option.id}
                                      checked={selectedFilterOptions.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          handleFilterOptionSelect(filter.id, option.id);
                                        } else {
                                          setSelectedFilterOptions(prev => 
                                            prev.filter(id => id !== option.id)
                                          );
                                        }
                                      }}
                                    />
                                    <Label htmlFor={option.id}>{option.value}</Label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <Select
                                value={selectedFilterOptions.find(
                                  id => filter.filterOptions.some(o => o.id === id)
                                )}
                                onValueChange={(value) => handleFilterOptionSelect(filter.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select ${filter.name}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {filter.filterOptions.map(option => (
                                    <SelectItem key={option.id} value={option.id}>
                                      {option.value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  {modal.type === 'create' ? 'Create' : 'Update'} Product
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductIndex;