'use server'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { convertToPlainObject, formatError, round2 } from '@/lib/utils'
import { cartItemSchema, insertCartSchema } from '@/lib/validators'
import { CartItem } from '@/types'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(itemsPrice * 0.15),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice)

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  }
}

export const addItemToCart = async (data: CartItem) => {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value
    if (!sessionCartId) {
      throw new Error('Cart session not found')
    }

    // Get session and userId
    const session = await auth()
    const userId = session?.user?.id ? (session.user.id as string) : undefined

    // Get cart
    const cart = await getMyCart()

    // Parse and validate item
    const item = cartItemSchema.parse(data)

    // Find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    if (!cart) {
      // Create cart if not found
      const newCart = insertCartSchema.parse({
        userId,
        items: [item],
        sessionCartId,
        ...calcPrice([item]),
      })

      // Add to database
      await prisma.cart.create({ data: newCart })

      // Revalidate product page
      revalidatePath(`/product/${product.slug}`)

      return {
        success: true,
        message: `${product.name} added to cart`,
      }
    } else {
      // Check if item already in cart
      const existingItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      )

      if (existingItem) {
        // Check stock
        if (product.stock < existingItem.quantity + 1) {
          throw new Error('Not enough stock')
        }

        // Increase the quantity
        ;(cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.quantity = existingItem.quantity + 1
      } else {
        // If item does not exist in cart
        // Check stock
        if (product.stock < 1) {
          throw new Error('Not enough stock')
        }

        // Add item to cart.items
        cart.items.push(item)
      }

      // Save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      })

      revalidatePath(`/product/${product.slug}`)

      return {
        success: true,
        message: `${product.name} ${
          existingItem ? 'updated in' : 'added to'
        } cart`,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

export async function getMyCart() {
  // Check for cart cookie
  const sessionCartId = (await cookies()).get('sessionCartId')?.value
  if (!sessionCartId) {
    throw new Error('Cart session not found')
  }

  // Get session and userId
  const session = await auth()
  const userId = session?.user?.id ? (session.user.id as string) : undefined

  // Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId },
  })

  if (!cart) return undefined

  // Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
  })
}
