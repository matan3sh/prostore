'use server'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { getMyCart } from '@/lib/actions/cart.actions'
import { getUserById } from '@/lib/actions/user.actions'
import { formatError } from '@/lib/utils'
import { insertOrderSchema } from '@/lib/validators'
import { CartItem } from '@/types'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

// Create order and create order items
export async function createOrder() {
  try {
    const session = await auth()
    if (!session) {
      throw new Error(' User is not authenticated')
    }

    const cart = await getMyCart()
    const userId = session?.user?.id
    if (!userId) {
      throw new Error('User not found')
    }

    const user = await getUserById(userId)

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        error: 'Your cart is empty',
        redirectTo: '/cart',
      }
    }

    if (!user.address) {
      return {
        success: false,
        error: 'No shipping address found',
        redirectTo: '/shipping-address',
      }
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        error: 'No payment method found',
        redirectTo: '/payment-method',
      }
    }

    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrise: cart.itemsPrice,
      taxPrice: cart.taxPrice,
      shippingPrice: cart.shippingPrice,
      totalPrice: cart.totalPrice,
    })

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order })
      // Create order items from the cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
            qty: item.quantity,
          },
        })
      }
      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      })

      return insertedOrder.id
    })

    if (!insertedOrderId) throw new Error('Order not created')

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${insertedOrderId}`,
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    return { success: false, error: formatError(error) }
  }
}
