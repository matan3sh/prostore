'use server'

import { prisma } from '@/db/prisma'
import { LATEST_PRODUCTS_LIMIT } from '@/lib/constants'
import { convertToPlainObject } from '@/lib/utils'

// Get latest products
export async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return convertToPlainObject(products)
}

// Get product by it's slug
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
    },
  })

  return product
}
