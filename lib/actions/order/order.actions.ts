'use server'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { getMyCart } from '@/lib/actions/cart.actions'
import { getUserById } from '@/lib/actions/user.actions'
import { PAGE_SIZE } from '@/lib/constants'
import { convertToPlainObject, formatError } from '@/lib/utils'
import { insertOrderSchema } from '@/lib/validators'
import { CartItem, PaymentResult } from '@/types'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

// Create order and create the order items
export async function createOrder() {
  try {
    const session = await auth()
    if (!session) throw new Error('User is not authenticated')

    const cart = await getMyCart()
    const userId = session?.user?.id
    if (!userId) throw new Error('User not found')

    const user = await getUserById(userId)

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: 'Your cart is empty',
        redirectTo: '/cart',
      }
    }

    if (!user.address) {
      return {
        success: false,
        message: 'No shipping address',
        redirectTo: '/shipping-address',
      }
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: 'No payment method',
        redirectTo: '/payment-method',
      }
    }

    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
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
    if (isRedirectError(error)) throw error
    return { success: false, message: formatError(error) }
  }
}

// Get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  })
  return convertToPlainObject(data)
}

// Update order to paid
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string
  paymentResult?: PaymentResult
}) {
  // Get order from database
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
    },
  })

  if (!order) throw new Error('Order not found')

  if (order.isPaid) throw new Error('Order is already paid')

  // Transaction to update order and account for product stock
  await prisma.$transaction(async (tx) => {
    // Iterate over products and update stock
    for (const item of order.orderitems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      })
    }

    // Set the order to paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    })
  })

  // Get updated order after transaction
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  })

  if (!updatedOrder) throw new Error('Order not found')

  // sendPurchaseReceipt({
  //   order: {
  //     ...updatedOrder,
  //     shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
  //     paymentResult: updatedOrder.paymentResult as PaymentResult,
  //   },
  // });
}

// Get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number
  page: number
}) {
  const session = await auth()
  if (!session) throw new Error('User is not authenticated')

  const userId = session?.user?.id
  if (!userId) throw new Error('User not found')

  const data = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  })

  const dataCount = await prisma.order.count({ where: { userId } })

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  }
}
