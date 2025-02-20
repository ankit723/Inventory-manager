'use server'

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ProductType } from '@prisma/client';

export async function getProducts(storeId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        uniqueFilterOptions: true,
        filterGroup: {
          include: {
            filters: {
              include: {
                filterOptions: true
              }
            }
          }
        }
      }
    });
    return { success: true, data: products };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}

function generateSKU(baseSKU: string, filterOptions: any[]): string {
  const optionCodes = filterOptions
    .map(option => option.value.substring(0, 2).toUpperCase())
    .join('-');
  return `${baseSKU}-${optionCodes}`;
}

function cartesianProduct(arrays: any[]): any[][] {
  return arrays.reduce((acc, curr) => 
    acc.flatMap((x: any) => curr.map((y: any) => [...x, y])),
    [[]]
  );
}

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const price = parseInt(formData.get('price') as string);
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;
    const type = formData.get('type') as ProductType;
    const storeId = formData.get('storeId') as string;
    const filterGroupId = formData.get('filterGroupId') as string;
    const totalStock = parseInt(formData.get('totalStock') as string);
    const filterOptionIds = JSON.parse(formData.get('filterOptionIds') as string);
    const baseSKU = `${name.substring(0, 3).toUpperCase()}-${Date.now().toString(36)}`;

    if (type === 'SIMPLE') {
      // For simple products, only one filter option per filter
      const product = await prisma.product.create({
        data: {
          name,
          sku: baseSKU,
          price,
          description,
          image,
          type,
          storeId,
          filterGroupId,
          totalStock,
          availableStock: totalStock,
          uniqueFilterOptions: {
            connect: filterOptionIds.map((id: string) => ({ id }))
          }
        },
        include: {
          uniqueFilterOptions: true,
          filterGroup: true
        }
      });

      revalidatePath(`/inventory/${storeId}/products`);
      return { success: true, data: product };

    } else {
      // For configurable products, create variants
      // First, create the parent product
      const parentProduct = await prisma.product.create({
        data: {
          name,
          sku: baseSKU,
          price,
          description,
          image,
          type,
          storeId,
          filterGroupId,
          totalStock: 0, // Parent product doesn't hold stock
          availableStock: 0,
          uniqueFilterOptions: {
            connect: []
          }
        }
      });

      // Get all selected filter options
      const filterOptions = await prisma.filterOption.findMany({
        where: {
          id: {
            in: filterOptionIds
          }
        }
      });

      // Group filter options by filter
      const filterGroups = filterOptions.reduce((acc, option) => {
        if (!acc[option.filterId]) {
          acc[option.filterId] = [];
        }
        acc[option.filterId].push(option);
        return acc;
      }, {} as Record<string, typeof filterOptions>);

      // Generate combinations
      const optionCombinations = cartesianProduct(Object.values(filterGroups));

      // Calculate stock per variant
      const stockPerVariant = Math.floor(totalStock / optionCombinations.length);
      const remainingStock = totalStock % optionCombinations.length;

      // Create variant products
      const variantPromises = optionCombinations.map((combination, index) => {
        const variantSKU = generateSKU(baseSKU, combination);
        const variantStock = index === 0 ? stockPerVariant + remainingStock : stockPerVariant;

        return prisma.product.create({
          data: {
            name: `${name} - ${combination.map((o: any) => o.value).join(' - ')}`,
            sku: variantSKU,
            parentProductId: parentProduct.id,
            price,
            description,
            image,
            type: 'SIMPLE', // Variants are always simple
            storeId,
            filterGroupId,
            totalStock: variantStock,
            availableStock: variantStock,
            uniqueFilterOptions: {
              connect: combination.map((option: any) => ({ id: option.id }))
            }
          }
        });
      });

      await Promise.all(variantPromises);

      // Fetch the complete parent product with variants
      const completeParentProduct = await prisma.product.findUnique({
        where: { id: parentProduct.id },
        include: {
          uniqueFilterOptions: true,
          filterGroup: true
        }
      });

      revalidatePath(`/inventory/${storeId}/products`);
      return { success: true, data: completeParentProduct };
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = parseInt(formData.get('price') as string);
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;
    const type = formData.get('type') as ProductType;
    const filterGroupId = formData.get('filterGroupId') as string;
    const totalStock = parseInt(formData.get('totalStock') as string);
    const filterOptionIds = JSON.parse(formData.get('filterOptionIds') as string);

    // Get current product to calculate availableStock difference
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { totalStock: true, availableStock: true }
    });

    if (!currentProduct) {
      throw new Error('Product not found');
    }

    // Calculate new availableStock
    const stockDifference = totalStock - currentProduct.totalStock;
    const newAvailableStock = currentProduct.availableStock + stockDifference;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        description,
        image,
        type,
        filterGroupId,
        totalStock,
        availableStock: newAvailableStock,
        uniqueFilterOptions: {
          set: filterOptionIds.map((id: string) => ({ id }))
        }
      },
      include: {
        uniqueFilterOptions: true,
        filterGroup: true
      }
    });

    revalidatePath(`/inventory/${product.storeId}/products`);
    return { success: true, data: product };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(id: string, storeId: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });

    revalidatePath(`/inventory/${storeId}/products`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function getFilterGroups() {
  try {
    const filterGroups = await prisma.filterGroup.findMany({
      include: {
        filters: {
          include: {
            filterOptions: true
          }
        }
      }
    });
    return { success: true, data: filterGroups };
  } catch (error) {
    console.error('Error fetching filter groups:', error);
    return { success: false, error: 'Failed to fetch filter groups' };
  }
}