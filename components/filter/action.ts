'use server'

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function createFilter(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const filterOptionsJson = formData.get('filterOptions') as string;
    const filterOptionValues = JSON.parse(filterOptionsJson);

    // First create the filter
    const filter = await prisma.filter.create({
      data: {
        name,
      }
    });

    console.log("filter", filter);

    // Then create and associate the filter options
    const filterOptionsPromises = filterOptionValues.map((option: { value: string }) => {
      console.log("option", option.value);
      return prisma.filterOption.create({
        data:{
          value: option.value,
          filterId: filter.id
        }
      });
    });

    await Promise.all(filterOptionsPromises);

    // Fetch the complete filter with options
    const completeFilter = await prisma.filter.findUnique({
      where: { id: filter.id },
      include: {
        filterOptions: true
      }
    });

    revalidatePath('/filters');
    return { success: true, data: completeFilter };
  } catch (error) {
    console.error('Error creating filter:', error);
    return { success: false, error: 'Failed to create filter' };
  }
}

export async function updateFilter(formData: FormData) {
  // Similar to create but with update logic
}

export async function deleteFilter(filterId: string) {
  try {
    await prisma.filter.delete({
      where: { id: filterId }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete filter' };
  }
}

export async function getFilters() {
  try {
    const filters = await prisma.filter.findMany({
      include: {
        filterOptions: true
      }
    });
    return { success: true, data: filters };
  } catch (error) {
    return { success: false, error: 'Failed to fetch filters' };
  }
}

export async function getFilterGroups() {
  try {
    const filterGroups = await prisma.filterGroup.findMany({
      include: {
        filters: true
      }
    });
    return { success: true, data: filterGroups };
  } catch (error) {
    console.error('Error fetching filter groups:', error);
    return { success: false, error: 'Failed to fetch filter groups' };
  }
}

export async function createFilterGroup(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const filterIds = JSON.parse(formData.get('filterIds') as string);

    const filterGroup = await prisma.filterGroup.create({
      data: {
        name,
        filters: {
          connect: filterIds.map((id: string) => ({ id }))
        }
      },
      include: {
        filters: true
      }
    });

    revalidatePath('/filter-groups');
    return { success: true, data: filterGroup };
  } catch (error) {
    console.error('Error creating filter group:', error);
    return { success: false, error: 'Failed to create filter group' };
  }
}

export async function updateFilterGroup(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const filterIds = JSON.parse(formData.get('filterIds') as string);

    const filterGroup = await prisma.filterGroup.update({
      where: { id },
      data: {
        name,
        filters: {
          set: filterIds.map((id: string) => ({ id }))
        }
      },
      include: {
        filters: true
      }
    });

    revalidatePath('/filter-groups');
    return { success: true, data: filterGroup };
  } catch (error) {
    console.error('Error updating filter group:', error);
    return { success: false, error: 'Failed to update filter group' };
  }
}

export async function deleteFilterGroup(id: string) {
  try {
    await prisma.filterGroup.delete({
      where: { id }
    });

    revalidatePath('/filter-groups');
    return { success: true };
  } catch (error) {
    console.error('Error deleting filter group:', error);
    return { success: false, error: 'Failed to delete filter group' };
  }
}

export async function getAvailableFilters() {
  try {
    const filters = await prisma.filter.findMany();
    return { success: true, data: filters };
  } catch (error) {
    console.error('Error fetching filters:', error);
    return { success: false, error: 'Failed to fetch filters' };
  }
}