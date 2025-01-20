import PlaceOrderForm from '@/app/(root)/place-order/place-order-form'
import { auth } from '@/auth'
import CheckoutSteps from '@/components/shared/checkout-steps'
import ItemsTable from '@/components/shared/items-table'
import PriceSummary from '@/components/shared/price-summary'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getMyCart } from '@/lib/actions/cart.actions'
import { getUserById } from '@/lib/actions/user.actions'
import { ShippingAddress } from '@/types'
import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Place Order',
}

const PlaceOrderPage = async () => {
  const cart = await getMyCart()
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) throw new Error('User not found')

  const user = await getUserById(userId)

  if (!cart || cart.items.length === 0) redirect('/cart')
  if (!user.address) redirect('/shipping-address')
  if (!user.paymentMethod) redirect('/payment-method')

  const userAddress = user.address as ShippingAddress

  return (
    <>
      <CheckoutSteps current={3} />
      <h1 className="py-4 text-2xl">Place Order</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="md:col-span-2 overflow-x-auto space-y-4">
          {/* SHIPPING ADDRESS */}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{userAddress.fullName}</p>
              <p>
                {userAddress.streetAddress}, {userAddress.city}{' '}
                {userAddress.postalCode}, {userAddress.country}{' '}
              </p>
              <div className="mt-3">
                <Link href="/shipping-address">
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          {/* PAYMENT METHOD */}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p>{user.paymentMethod}</p>
              <div className="mt-3">
                <Link href="/payment-method">
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          {/* ORDER ITEMS */}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <ItemsTable items={cart.items} />
            </CardContent>
          </Card>
        </div>
        {/* ORDER SUMMARY */}
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <PriceSummary
                cartPrices={{
                  taxPrice: cart.taxPrice,
                  itemsPrice: cart.itemsPrice,
                  shippingPrice: cart.shippingPrice,
                  totalPrice: cart.totalPrice,
                }}
              />
              <PlaceOrderForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default PlaceOrderPage
