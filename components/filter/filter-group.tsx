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
import { Checkbox } from "@/components/ui/checkbox";
import { getFilterGroups, createFilterGroup, updateFilterGroup, deleteFilterGroup, getAvailableFilters } from './action';

interface Filter {
  id: string;
  name: string;
}

interface FilterGroup {
  id: string;
  name: string;
  filters: Filter[];
}

const FilterGroup = () => {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [availableFilters, setAvailableFilters] = useState<Filter[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'create' | 'edit' | 'view' | null;
    filterGroup?: FilterGroup;
  }>({
    isOpen: false,
    type: null
  });

  useEffect(() => {
    fetchFilterGroups();
    fetchAvailableFilters();
  }, []);

  const fetchFilterGroups = async () => {
    const result = await getFilterGroups();
    if (result.success) {
      setFilterGroups(result.data);
    }
  };

  const fetchAvailableFilters = async () => {
    const result = await getAvailableFilters();
    if (result.success) {
      setAvailableFilters(result.data);
    }
  };

  const handleCreateFilterGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.append('filterIds', JSON.stringify(selectedFilters));

    const result = await createFilterGroup(formData);
    if (result.success) {
      setFilterGroups([...filterGroups, result.data]);
      setModal({ isOpen: false, type: null });
      setSelectedFilters([]);
    }
  };

  const handleEditFilterGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.filterGroup) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.append('filterIds', JSON.stringify(selectedFilters));
    formData.append('id', modal.filterGroup.id);

    const result = await updateFilterGroup(formData);
    if (result.success) {
      setFilterGroups(filterGroups.map(fg => 
        fg.id === result.data.id ? result.data : fg
      ));
      setModal({ isOpen: false, type: null });
      setSelectedFilters([]);
    }
  };

  const handleDeleteFilterGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this filter group?')) return;

    const result = await deleteFilterGroup(id);
    if (result.success) {
      setFilterGroups(filterGroups.filter(fg => fg.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Filter Group Management</h1>
        <Button
          onClick={() => setModal({ isOpen: true, type: 'create' })}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Filter Group
        </Button>
      </div>

      <div className="space-y-4">
        {filterGroups.map((filterGroup) => (
          <Card key={filterGroup.id}>
            <CardContent className="flex justify-between items-center p-4">
              <span className="font-medium">{filterGroup.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModal({ isOpen: true, type: 'view', filterGroup })}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFilters(filterGroup.filters.map(f => f.id));
                    setModal({ isOpen: true, type: 'edit', filterGroup });
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteFilterGroup(filterGroup.id)}
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
            setSelectedFilters([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modal.type === 'create' ? 'Create New Filter Group' :
               modal.type === 'edit' ? 'Edit Filter Group' : 'View Filter Group'}
            </DialogTitle>
          </DialogHeader>
          
          {modal.type === 'view' ? (
            <div className="space-y-4">
              <div>
                <Label>Filter Group Name</Label>
                <p className="mt-1">{modal.filterGroup?.name}</p>
              </div>
              <div>
                <Label>Associated Filters</Label>
                <ul className="mt-2 space-y-2">
                  {modal.filterGroup?.filters.map(filter => (
                    <li key={filter.id}>{filter.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <form onSubmit={modal.type === 'create' ? handleCreateFilterGroup : handleEditFilterGroup}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Filter Group Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={modal.filterGroup?.name}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Select Filters</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {availableFilters.map((filter) => (
                      <div key={filter.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={filter.id}
                          checked={selectedFilters.includes(filter.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFilters([...selectedFilters, filter.id]);
                            } else {
                              setSelectedFilters(selectedFilters.filter(id => id !== filter.id));
                            }
                          }}
                        />
                        <Label htmlFor={filter.id}>{filter.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  {modal.type === 'create' ? 'Create' : 'Update'} Filter Group
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterGroup;
