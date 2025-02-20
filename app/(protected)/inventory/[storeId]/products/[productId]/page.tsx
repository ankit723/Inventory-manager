import React from 'react'
import {prisma} from '@/lib/db'
import ProductShow from '@/components/product/product-show'

const page = async ({params}: {params: {productId: string}}) => {
    const product = await prisma.product.findUnique({
        where: {
            id: params.productId
        },
        include: {
            filterGroup: {
                include: {
                    filters: {
                        include: {
                            filterOptions: true
                        }
                    }
                }
            },
        }
    })
    return (
        <div>
            <ProductShow product={product} />
        </div>
    )
}

export default page