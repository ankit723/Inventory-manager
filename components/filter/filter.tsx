'use client'

import { createFilter, getFilters, updateFilter, deleteFilter } from './action';
import { useEffect, useState } from 'react';
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
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  PlusCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface Filter {
  id: string;
  name: string;
  createdAt: Date;
  filterOptions: { id: string; value: string }[];
}

const Filter = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterOptions, setFilterOptions] = useState<string[]>(['']);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'create' | 'edit' | 'view' | 'delete' | null;
    filter?: Filter;
  }>({
    isOpen: false,
    type: null
  });

  useEffect(() => {
    const loadFilters = async () => {
      const result = await getFilters();
      if (result.success) {
        setFilters(result.data || []);
      }
    };
    loadFilters();
  }, []);

  const handleCreateFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Create an array of filter options
    const filterOptionsData = filterOptions
      .filter(opt => opt.trim() !== '')
      .map(value => ({ value }));
    
    // Add the filter options to the form data
    formData.append('filterOptions', JSON.stringify(filterOptionsData));
    
    const result = await createFilter(formData);
    console.log(result);
    if (result.success) {
      setFilters([...filters, result.data as Filter]);
      setModal({ isOpen: false, type: null });
      setFilterOptions(['']);
    }
  };

  const handleEditFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.filter) return;
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Create an array of filter options
    const filterOptionsData = filterOptions
      .filter(opt => opt.trim() !== '')
      .map(value => ({ value }));
    
    formData.append('filterOptions', JSON.stringify(filterOptionsData));
    formData.append('id', modal.filter.id);
    
    const result = await updateFilter(formData);
    if (result.success) {
      setFilters(filters.map(f => f.id === result.data.id ? result.data : f));
      setModal({ isOpen: false, type: null });
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    const result = await deleteFilter(filterId);
    if (result.success) {
      setFilters(filters.filter(f => f.id !== filterId));
      setModal({ isOpen: false, type: null });
    }
  };

  const addFilterOption = () => {
    setFilterOptions([...filterOptions, '']);
  };

  const removeFilterOption = (index: number) => {
    setFilterOptions(filterOptions.filter((_, i) => i !== index));
  };

  const updateFilterOption = (index: number, value: string) => {
    const newOptions = [...filterOptions];
    newOptions[index] = value;
    setFilterOptions(newOptions);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Filter Management</h1>
        <Button
          onClick={() => setModal({ isOpen: true, type: 'create' })}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Filter
        </Button>
      </div>

      {/* Filter List */}
      <div className="space-y-4">
        {filters.map((filter) => (
          <Card key={filter.id}>
            <CardContent className="flex justify-between items-center p-4">
              <span className="font-medium">{filter.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModal({ isOpen: true, type: 'view', filter })}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModal({ isOpen: true, type: 'edit', filter });
                    setFilterOptions(filter.filterOptions.map(opt => opt.value));
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteFilter(filter.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog 
        open={modal.isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setModal({ isOpen: false, type: null });
            setFilterOptions(['']);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modal.type === 'create' ? 'Create New Filter' :
               modal.type === 'edit' ? 'Edit Filter' : 'View Filter'}
            </DialogTitle>
          </DialogHeader>
          
          {modal.type === 'view' ? (
            <div className="space-y-4">
              <div>
                <Label>Filter Name</Label>
                <p className="mt-1">{modal.filter?.name}</p>
              </div>
              <div>
                <Label>Filter Options</Label>
                <ul className="mt-2 space-y-2">
                  {modal.filter?.filterOptions.map(option => (
                    <li key={option.id} className="flex items-center gap-2">
                      <span className="text-sm">{option.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <form onSubmit={modal.type === 'create' ? handleCreateFilter : handleEditFilter}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Filter Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={modal.filter?.name}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Filter Options</Label>
                  {filterOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={option}
                        onChange={(e) => updateFilterOption(index, e.target.value)}
                        placeholder="Enter option value"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFilterOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFilterOption}
                    className="mt-2 w-full flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Option
                  </Button>
                </div>
                
                <Button type="submit" className="w-full">
                  {modal.type === 'create' ? 'Create' : 'Update'} Filter
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Filter;