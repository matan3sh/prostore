'use server'

import { LATEST_PRODUCTS_LIMIT } from '@/lib/constants'
import { convertToPlainObject } from '@/lib/utils'
import { PrismaClient } from '@prisma/client'

// Get latest products
export async function getLatestProducts() {
  const prisma = new PrismaClient()

  const products = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return convertToPlainObject(products)
}
