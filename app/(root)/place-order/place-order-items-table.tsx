import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Cart } from '@/types'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  cart: Cart
}

const PlaceOrderItemsTable = ({ cart }: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cart.items.map((item) => (
          <TableRow key={item.slug}>
            <TableCell>
              <Link
                href={`/product/${item.slug}`}
                className="flex items-center"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={50}
                  height={50}
                />
                <span className="px-2">{item.name}</span>
              </Link>
            </TableCell>
            <TableCell>
              <span className="px-2">{item.quantity}</span>
            </TableCell>
            <TableCell>${item.price}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default PlaceOrderItemsTable
