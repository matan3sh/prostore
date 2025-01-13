'use server'

import { CartItem } from '@/types'

export const addItemToCart = async (data: CartItem) => {
  console.log({ data })
  return {
    success: true,
    message: 'Item added to cart',
  }
}
