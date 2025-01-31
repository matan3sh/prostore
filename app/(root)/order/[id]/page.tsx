import OrderDetailsTable from '@/app/(root)/order/[id]/order-details-table'
import { getOrderById } from '@/lib/actions/order/order.actions'
import { ShippingAddress } from '@/types'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Order Details',
}

interface Props {
  params: Promise<{
    id: string
  }>
}

const OrderDetailsPage = async (props: Props) => {
  const { id } = await props.params

  const order = await getOrderById(id)
  if (!order) notFound()

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
      isAdmin={false}
    />
  )
}

export default OrderDetailsPage
