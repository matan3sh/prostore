'use client'

import ItemsTable from '@/components/shared/items-table'
import PriceSummary from '@/components/shared/price-summary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  deliverOrder,
  updateCODOrderToPaid,
} from '@/lib/actions/order/order.actions'
import {
  approvePayPalOrder,
  createPayPalOrder,
} from '@/lib/actions/order/paypal.order.actions'
import { formatDateTime, formatId } from '@/lib/utils'
import { Order } from '@/types'
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js'
import { startTransition, useTransition } from 'react'

interface Props {
  order: Omit<Order, 'paymentResult'>
  isAdmin: boolean
  paypalClientId: string
}

const OrderDetailsTable = ({ order, isAdmin, paypalClientId }: Props) => {
  const { toast } = useToast()
  const {
    id,
    shippingAddress,
    orderitems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt,
  } = order

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer()
    let status = ''

    if (isPending) {
      status = 'Loading PayPal...'
    } else if (isRejected) {
      status = 'Failed to load PayPal'
    }

    return status
  }

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id)

    if (!res.success) {
      toast({
        variant: 'destructive',
        description: res.message,
      })
    }

    return res.data
  }

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data)

    toast({
      variant: res.success ? 'default' : 'destructive',
      description: res.message,
    })
  }

  // Button to mark order as paid
  const MarkAsPaidButton = () => {
    const [isPending] = useTransition()

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateCODOrderToPaid(id)

            toast({
              variant: res.success ? 'default' : 'destructive',
              description: res.message,
            })
          })
        }
      >
        {isPending ? 'processing...' : 'Mark As Paid'}
      </Button>
    )
  }

  // Button to mark order as delivered
  const MarkAsDeliveredButton = () => {
    const [isPending] = useTransition()

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={async () => {
          const res = await deliverOrder(id)

          toast({
            variant: res.success ? 'default' : 'destructive',
            description: res.message,
          })
        }}
      >
        {isPending ? 'processing...' : 'Mark As Delivered'}
      </Button>
    )
  }

  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-4-y overlow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p className="mb-2">{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-2">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p className="mb-2">
                {shippingAddress.streetAddress}, {shippingAddress.city}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant="secondary">
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not Delivered</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <ItemsTable items={orderitems} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <PriceSummary
                cartPrices={{
                  taxPrice,
                  itemsPrice,
                  shippingPrice,
                  totalPrice,
                }}
              />

              {/* PayPal Payment */}
              {!isPaid && paymentMethod === 'PayPal' && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {/* Stripe Payment */}

              {/* Cash On Delivery */}
              {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                <MarkAsPaidButton />
              )}

              {isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default OrderDetailsTable
