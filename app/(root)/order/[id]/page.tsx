import { getOrderById } from '@/lib/actions/order.actions'
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

  return <>Order: {order.totalPrice}</>
}

export default OrderDetailsPage
